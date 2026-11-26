import { Router } from 'express';
import { getWatchStatus, listFindings, runWatchCycle } from '../watch/watchService.js';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import {
  ImageScanRequestSchema,
  LocaleSchema,
  ScanRequestSchema,
  ScanResponseSchema,
  type HealthResponse,
} from '@scamhisn/shared';
import { config } from '../config.js';
import { SsrfError } from '../security/ssrfGuard.js';
import { runUrlScan } from '../services/scanOrchestrator.js';
import { generateForensicPdf } from '../services/pdfReportGenerator.js';
import { inspectUploadedImage } from '../ai/geminiImageAnalyzer.js';
import { FeatureUnavailableError } from '../ai/availability.js';
import { getAiCapabilities } from '../ai/geminiHealth.js';

/** 503 with a Retry-After header: the feature is paused until Gemini's cool-down ends. */
function sendFeatureUnavailable(res: import('express').Response, err: FeatureUnavailableError): void {
  if (err.retryAt) {
    const seconds = Math.max(1, Math.ceil((Date.parse(err.retryAt) - Date.now()) / 1000));
    res.setHeader('Retry-After', String(seconds));
  }
  res.status(err.statusCode).json({
    error: {
      code: err.code,
      message: err.message,
      messageAr: err.messageAr,
      retryAt: err.retryAt,
    },
  });
}

const PdfReportRequestSchema = z.object({
  report: ScanResponseSchema,
  locale: LocaleSchema.optional().default('en'),
});

export function createV1Router(): Router {
  const router = Router();

  const scanLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many scan requests. Please wait a moment and try again.',
        messageAr: 'وصلت للحد المسموح من الفحوصات مؤقتاً، تريّث شوي وحاول مرة ثانية.',
      },
    },
  });

  // Dedicated stricter limiter for multimodal image uploads to protect shared Gemini API quota
  const imageScanLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: Math.min(config.rateLimitMax, 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'IMAGE_RATE_LIMIT_EXCEEDED',
        message: 'Image scan rate limit reached to protect API quota. Please wait a minute and try again.',
        messageAr: 'تم الوصول للحد المؤقت لفحص الصور لحماية رصيد الخدمة، انتظر دقيقة وحاول مرة ثانية.',
      },
    },
  });

  router.get('/health', (_req, res) => {
    const payload: HealthResponse = {
      status: 'ok',
      service: 'ScamHisn AI API',
      version: '1.0.0',
      model: config.geminiModel,
      aiConfigured: Boolean(config.geminiApiKey) || Boolean(config.localLlm),
      timestamp: new Date().toISOString(),
      capabilities: getAiCapabilities(),
    };
    res.json(payload);
  });

  router.post('/scan', scanLimiter, async (req, res) => {
    const parsed = ScanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid scan request payload.',
          messageAr: 'البيانات المرسلة غير صالحة. تأكد من إدخال رابط ونوع فحص صحيح.',
          details: parsed.error.flatten(),
        },
      });
      return;
    }

    try {
      const result = await runUrlScan(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof FeatureUnavailableError) {
        sendFeatureUnavailable(res, err);
        return;
      }
      if (err instanceof SsrfError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
            messageAr: err.messageAr,
          },
        });
        return;
      }

      console.error('[ScamHisn API] Unexpected scan error:', err);
      res.status(500).json({
        error: {
          code: 'SCAN_INTERNAL_ERROR',
          message: 'An unexpected error occurred while inspecting the URL.',
          messageAr: 'صار خطأ غير متوقع أثناء فحص الرابط. حاول مرة ثانية.',
        },
      });
    }
  });

  router.post('/scan-image', imageScanLimiter, async (req, res) => {
    const parsed = ImageScanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid image upload payload.',
          messageAr: 'صيغة الصورة أو حجمها غير صالح. يُسمح بملفات JPG و PNG و WebP فقط.',
        },
      });
      return;
    }

    try {
      const result = await inspectUploadedImage(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof FeatureUnavailableError) {
        sendFeatureUnavailable(res, err);
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'AI_NOT_CONFIGURED') {
        res.status(503).json({
          error: {
            code: 'AI_UNAVAILABLE',
            message: 'GEMINI_API_KEY is not configured on the server for image inspection.',
            messageAr: 'مفتاح GEMINI_API_KEY غير مفعّل على الخادم لفحص الصور.',
          },
        });
        return;
      }
      if (msg === 'IMAGE_TOO_LARGE' || msg === 'INVALID_IMAGE_DATA') {
        res.status(400).json({
          error: {
            code: msg,
            message: 'Please upload a valid JPG, PNG, or WebP image (under 1.5 MB compressed).',
            messageAr: 'يرجى رفع صورة صالحة بصيغة JPG أو PNG أو WebP.',
          },
        });
        return;
      }
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: {
            code: 'AI_RATE_LIMITED',
            message: 'API rate limit reached temporarily. Please wait a minute and try again.',
            messageAr: 'تم الوصول للحد المؤقت لاستخدام الذكاء الاصطناعي، يرجى الانتظار دقيقة والمحاولة مرة أخرى.',
          },
        });
        return;
      }
      if (/\b503\b|UNAVAILABLE|high demand|overloaded|timed out|timeout/i.test(msg)) {
        res.status(503).json({
          error: {
            code: 'AI_BUSY',
            message:
              'The image-reading AI is busy right now (all backup options were tried). Please try again in a minute.',
            messageAr:
              'نموذج قراءة الصور مشغول حالياً (جرّبنا كل البدائل). حاول مرة ثانية بعد دقيقة.',
          },
        });
        return;
      }
      console.error('[ScamHisn API] Image scan error:', err);
      res.status(500).json({
        error: {
          code: 'IMAGE_SCAN_ERROR',
          message: 'Could not inspect the uploaded image. Please try again.',
          messageAr: 'تعذّر فحص الصورة المرفوعة. حاول مرة ثانية.',
        },
      });
    }
  });

  // Check Everything (server side): look-alikes of protected brands found in newly issued certificates
  router.get('/watch', (_req, res) => {
    res.json({ status: getWatchStatus(), findings: listFindings().slice(0, 200) });
  });

  // Starts one pass now. A pass already under way is not started twice.
  router.post('/watch/run', scanLimiter, (_req, res) => {
    const status = getWatchStatus();
    if (!status.running) void runWatchCycle();
    res.status(202).json({ status: { ...status, running: true } });
  });

  router.post('/report/pdf', scanLimiter, async (req, res) => {
    const parsed = PdfReportRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report payload for PDF generation.',
          messageAr: 'بيانات التقرير غير صالحة لإنشاء ملف PDF.',
        },
      });
      return;
    }

    try {
      const pdfBuffer = await generateForensicPdf(parsed.data.report, parsed.data.locale);
      const shortId = parsed.data.report.scanId.slice(0, 8).replace(/[^a-zA-Z0-9-]/g, '');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="ScamHisn-Report-${shortId || 'forensic'}.pdf"`,
      );
      res.status(200).send(pdfBuffer);
    } catch (err) {
      console.error('[ScamHisn API] PDF generation error:', err);
      res.status(500).json({
        error: {
          code: 'PDF_GENERATION_ERROR',
          message: 'Could not generate PDF forensic report.',
          messageAr: 'تعذّر إنشاء تقرير الـ PDF. حاول مرة ثانية.',
        },
      });
    }
  });

  return router;
}
