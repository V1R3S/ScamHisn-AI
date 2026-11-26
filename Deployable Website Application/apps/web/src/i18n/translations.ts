import type { Locale, ScanMode, VerdictLevel } from '@scamhisn/shared';

export interface Translations {
  brandName: string;
  brandSubtitle: string;
  heroTitle: string;
  /** Home hero: two heading lines, the last word carries the scribble underline. */
  hero: {
    line1: string;
    line2: string;
    scribbleWord: string;
    sub: string;
  };
  /** Short labels for the four mode tabs. */
  tabs: Record<ScanMode | 'image', string>;
  /** Short placeholder for the input, per link mode. */
  inputPlaceholder: Record<ScanMode, string>;
  checkBtn: string;
  evidence: {
    title: string;
    /** "{count}" is replaced with the number of findings. */
    showAll: string;
    showFewer: string;
  };
  checkedLink: {
    title: string;
    copy: string;
    copied: string;
  };
  updateBannerBadge: string;
  updateBannerText: string;
  modePrompt: string;
  modes: Record<
    ScanMode,
    {
      label: string;
      shortDesc: string;
      placeholder: string;
    }
  >;
  imageMode: {
    label: string;
    shortDesc: string;
    newBadge: string;
    uploadTitle: string;
    uploadHint: string;
    chooseFileBtn: string;
    previewLabel: string;
    changeBtn: string;
    removeBtn: string;
    inspectBtn: string;
    inspectingBtn: string;
    optimizedTag: string;
    cachedTag: string;
    authenticityLabel: string;
    authenticity: Record<'genuine' | 'suspicious' | 'forged_or_scam', string>;
    authenticityAnalysisTitle: string;
    extractedUrlsTitle: string;
    extractedPhonesTitle: string;
    deepScanBtn: string;
    visualInjectionAlert: string;
    errUnsupported: string;
    errTooLarge: string;
    errFailedRead: string;
  };
  urlLabel: string;
  pasteBtn: string;
  scanBtn: string;
  scanningBtn: string;
  trySampleLabel: string;
  samples: Array<{ label: string; url: string; mode: ScanMode; tone?: 'danger' }>;
  /** Plain statement of how much of the analysis actually ran. */
  coverage: {
    incompleteLabel: string;
    full: string;
    partialBackup: string;
    partialPageNotLoaded: string;
    rulesOnly: string;
    officialNoAi: string;
    addressOnly: string;
  };
  /** Features that need Gemini are paused while every Gemini key is cooling down. */
  availability: {
    pausedTag: string;
    coolingDown: string;
    notConfigured: string;
    backIn: string;
    backSoon: string;
    generalStillWorks: string;
  };
  nav: {
    check: string;
    watch: string;
    impact: string;
    pitch: string;
    back: string;
  };
  progressTitle: string;
  progressSteps: string[];
  scamLikelihoodLabel: string;
  verdicts: Record<VerdictLevel, { label: string; desc: string }>;
  smokingGunTitle: string;
  promptInjectionTitle: string;
  promptInjectionSubtitle: string;
  groundingSourcesTitle: string;
  redFlagsTitle: string;
  noRedFlagsText: string;
  technicalChecksTitle: string;
  cards: {
    sslTitle: string;
    domainTitle: string;
    redirectTitle: string;
    headersDnsTitle: string;
    domFormsTitle: string;
    injectionShieldTitle: string;
  };
  actions: {
    showDetails: string;
    hideDetails: string;
    generateReport: string;
    downloadReport: string;
    generatingReport: string;
    sendToPolice: string;
    conceptBadge: string;
    policeConceptNotice: string;
    amanTitle: string;
    amanPhoneLabel: string;
    amanSmsLabel: string;
    amanEmailLabel: string;
    amanWebLabel: string;
    amanNote: string;
    reportError: string;
  };
  labels: {
    finalDestination: string;
    valid: string;
    invalid: string;
    noHttps: string;
    issuer: string;
    expiresIn: string;
    days: string;
    selfSigned: string;
    expired: string;
    mismatch: string;
    domainAge: string;
    registrar: string;
    created: string;
    unavailable: string;
    newlyRegistered: string;
    hops: string;
    crossDomain: string;
    sameDomain: string;
    httpStatus: string;
    sensitiveForms: string;
    yes: string;
    no: string;
    externalFormPost: string;
    hiddenElements: string;
    impersonatedBrand: string;
    punycodeHomograph: string;
    cleanShield: string;
    attackDetected: string;
    channelsDetected: string;
    zeroWidthChars: string;
    jobAuthenticityTitle: string;
    jobConfidenceLabel: string;
    linkLegitimacyLabel: string;
    companyVerificationLabel: string;
    legitimate: string;
    suspiciousOrFake: string;
    verified: string;
    unverified: string;
    mapVerificationTitle: string;
    placeExistsLabel: string;
    contactHijackLabel: string;
    reviewAuditLabel: string;
    coordinatesLabel: string;
    clean: string;
    flagged: string;
    rawMetadataTitle: string;
    copyJson: string;
    copiedJson: string;
  };
  footer: {
    teamTitle: string;
    teamName: string;
    membersLabel: string;
    notesTitle: string;
    apiNoteLabel: string;
    apiNoteDesc: string;
    sandboxNote: string;
    privacyNote: string;
    downloadExtensionBtn: string;
    extensionDesktopOnly: string;
    extensionBriefSteps: string;
  };
  severity: Record<'critical' | 'high' | 'medium' | 'low' | 'info', string>;
}

export const TEAM_MEMBERS = [
  'Mohammed Ahmed Abdulnoor',
  'Abdulrhman Ahmed Drizi',
  'Khalid Ahmed Al Khawaldah',
  'Ahmed Al Hashmi',
  'Yousef Mohammed',
] as const;

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    brandName: 'ScamHisn AI',
    brandSubtitle: 'Digital Fraud Inspector',
    heroTitle: 'Inspect Any Link Before You Click',
    hero: {
      line1: 'Check before',
      line2: 'you',
      scribbleWord: 'click.',
      sub: 'A UAE-focused AI tool to detect scam links, fake websites, and misleading messages.',
    },
    tabs: {
      general: 'Link',
      job: 'Job post',
      map: 'Map listing',
      image: 'Screenshot',
    },
    inputPlaceholder: {
      general: 'Paste a link or the whole message',
      job: 'Paste a job post link',
      map: 'Paste a map or location link',
    },
    checkBtn: 'Check',
    evidence: {
      title: 'Evidence',
      showAll: 'Show all {count}',
      showFewer: 'Show fewer',
    },
    checkedLink: {
      title: 'Checked link',
      copy: 'Copy link',
      copied: 'Copied',
    },
    updateBannerBadge: 'NEW',
    updateBannerText: 'Screenshot & Image Authenticity Check is now live',
    modePrompt: 'What would you like to inspect?',
    modes: {
      general: {
        label: 'General Link',
        shortDesc: 'Phishing & brand spoofing',
        placeholder: 'Paste any suspicious link... e.g. https://example.com/verify',
      },
      job: {
        label: 'Job Post',
        shortDesc: 'Fake employers & job fees',
        placeholder: 'Paste a job posting URL... e.g. https://careers.company.com/role',
      },
      map: {
        label: 'Map Link',
        shortDesc: 'Fake places & review attacks',
        placeholder: 'Paste a Google Maps or location link... e.g. https://maps.app.goo.gl/...',
      },
    },
    imageMode: {
      label: 'Image Check',
      shortDesc: 'Screenshots & genuineness',
      newBadge: 'NEW',
      uploadTitle: 'Upload or paste a screenshot / image',
      uploadHint: 'JPG, PNG, or WebP — auto-compressed to save API quota',
      chooseFileBtn: 'Choose Image',
      previewLabel: 'Uploaded Image Preview',
      changeBtn: 'Change',
      removeBtn: 'Remove',
      inspectBtn: 'Inspect Image',
      inspectingBtn: 'Inspecting Image...',
      optimizedTag: 'Optimized',
      cachedTag: 'Cached · 0 tokens',
      authenticityLabel: 'Authenticity',
      authenticity: {
        genuine: 'Genuine',
        suspicious: 'Suspicious',
        forged_or_scam: 'Scam / Forged',
      },
      authenticityAnalysisTitle: 'Authenticity & Visual Forgery Analysis',
      extractedUrlsTitle: 'Links Spotted Inside Image',
      extractedPhonesTitle: 'Phone Numbers Spotted',
      deepScanBtn: 'Deep-Scan Link',
      visualInjectionAlert: 'Visual Prompt-Injection Attempt Detected Inside Image!',
      errUnsupported: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.',
      errTooLarge: 'Image is larger than 12 MB. Please choose a smaller screenshot.',
      errFailedRead: 'Could not process that image. Please try another file.',
    },
    urlLabel: 'Target URL',
    pasteBtn: 'Paste',
    scanBtn: 'Inspect Link',
    scanningBtn: 'Inspecting...',
    trySampleLabel: 'Quick test:',
    samples: [
      { label: 'UAE Portal (u.ae)', url: 'https://u.ae/en', mode: 'general' },
      {
        label: 'Fake fine link',
        url: 'https://adpolice-fines-pay.top/verify',
        mode: 'general',
        tone: 'danger',
      },
      {
        label: 'Scam SMS',
        url: 'Abu Dhabi Police: you have an unpaid traffic fine of AED 150. Pay within 24 hours at tamm-login.xyz/pay to avoid court.',
        mode: 'general',
        tone: 'danger',
      },
    ],
    coverage: {
      incompleteLabel: 'Incomplete check',
      full: 'Full check: page opened, AI analysis, live sources.',
      partialBackup: 'AI analysis ran, but live Google sources were not checked.',
      partialPageNotLoaded: 'The page could not be opened. This result uses the address, registry data and AI lookups.',
      rulesOnly: 'AI analysis was unavailable. This result uses technical checks only, so treat it as incomplete.',
      officialNoAi: 'This is an official domain on our verified list, and the technical checks are clean. AI analysis was unavailable.',
      addressOnly: 'This address is offline. The result is based on the address itself.',
    },
    availability: {
      pausedTag: 'Paused',
      coolingDown: 'This check is paused: Gemini is over its limit or not answering.',
      notConfigured: 'This check needs a Gemini key, and none is set on this server.',
      backIn: 'Back in about {time}.',
      backSoon: 'Back shortly.',
      generalStillWorks: 'General link checks still work.',
    },
    nav: {
      check: 'Check',
      watch: 'Watchtower',
      impact: 'Impact',
      pitch: 'Watch the pitch',
      back: 'Back to the inspector',
    },
    progressTitle: 'Running Isolated Forensic Pipeline',
    progressSteps: [
      'Validating URL & blocking SSRF private IP ranges',
      'Rendering inside ephemeral Playwright Chromium headless shell',
      'Inspecting SSL/TLS certificate, RDAP domain age & DNS auth',
      'Scanning hidden DOM & reviews for prompt-injection attacks',
      'Running AI grounded verification & hybrid risk scoring',
    ],
    scamLikelihoodLabel: 'Scam Likelihood',
    verdicts: {
      safe: {
        label: 'Likely Safe',
        desc: 'No significant phishing, impersonation, or technical scam indicators were found.',
      },
      caution: {
        label: 'Proceed with Caution',
        desc: 'Minor anomalies or unverified details detected. Double-check before sharing data.',
      },
      suspicious: {
        label: 'Suspicious',
        desc: 'Multiple warning signals detected. Avoid entering credentials or payment details.',
      },
      high_risk: {
        label: 'High Scam Risk',
        desc: 'Strong evidence of deception, impersonation, or unsafe technical indicators.',
      },
      confirmed_scam: {
        label: 'Confirmed Scam',
        desc: 'Fatal smoking-gun evidence detected. Do NOT interact with or trust this link.',
      },
    },
    smokingGunTitle: 'Fatal Smoking-Gun Triggers (Auto-Escalated to 95–100%)',
    promptInjectionTitle: 'Prompt-Injection Attack Intercepted!',
    promptInjectionSubtitle:
      'Hostile instructions attempting to manipulate AI security scanners were embedded in this link.',
    groundingSourcesTitle: 'Verified Grounding Sources (Google Search & Maps)',
    redFlagsTitle: 'Detected Findings & Red Flags',
    noRedFlagsText: 'No red flags or critical anomalies were triggered on this link.',
    technicalChecksTitle: 'Technical Security Forensics',
    cards: {
      sslTitle: 'SSL / TLS Certificate',
      domainTitle: 'Domain Age & Registration',
      redirectTitle: 'Redirects & Destination',
      headersDnsTitle: 'Security Headers & DNS',
      domFormsTitle: 'DOM, Forms & Anomalies',
      injectionShieldTitle: 'Prompt-Injection Shield',
    },
    actions: {
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      generateReport: 'Generate Report',
      downloadReport: 'Download evidence report',
      generatingReport: 'Generating PDF...',
      sendToPolice: 'Report to Abu Dhabi Police',
      conceptBadge: 'Aman',
      policeConceptNotice:
        'ScamHisn does not send anything for you. Download the report with "Download evidence report" and share it through one of these official Aman channels.',
      amanTitle: 'Aman service, Abu Dhabi Police (free, 24/7, confidential)',
      amanPhoneLabel: 'Call',
      amanSmsLabel: 'SMS',
      amanEmailLabel: 'Email',
      amanWebLabel: 'Website',
      amanNote:
        'Aman receives information. If you lost money, also file a police report and tell your bank at once.',
      reportError: 'Could not generate the PDF report. Please try again.',
    },
    labels: {
      finalDestination: 'Final Destination',
      valid: 'Valid & Trusted',
      invalid: 'Invalid / Untrusted',
      noHttps: 'No HTTPS (Plain HTTP)',
      issuer: 'Issuer',
      expiresIn: 'Expires in',
      days: 'days',
      selfSigned: 'Self-Signed',
      expired: 'Expired',
      mismatch: 'Hostname Mismatch',
      domainAge: 'Domain Age',
      registrar: 'Registrar',
      created: 'Created',
      unavailable: 'Unavailable',
      newlyRegistered: 'Newly Registered (<30d)',
      hops: 'Redirect Hops',
      crossDomain: 'Cross-Domain Redirect',
      sameDomain: 'Same Domain',
      httpStatus: 'HTTP Status',
      sensitiveForms: 'Sensitive Inputs (Pass/OTP/Card)',
      yes: 'Yes',
      no: 'No',
      externalFormPost: 'External Form Action',
      hiddenElements: 'Hidden DOM Nodes',
      impersonatedBrand: 'Impersonated Brand',
      punycodeHomograph: 'IDN Homograph Spoof',
      cleanShield: 'No Injection Detected',
      attackDetected: 'Attack Intercepted',
      channelsDetected: 'Channels',
      zeroWidthChars: 'Zero-Width Chars',
      jobAuthenticityTitle: 'Job Post Authenticity Breakdown',
      jobConfidenceLabel: 'Job Authenticity Confidence',
      linkLegitimacyLabel: 'Link & Domain',
      companyVerificationLabel: 'Company Verification',
      legitimate: 'Legitimate',
      suspiciousOrFake: 'Suspicious / Unofficial',
      verified: 'Verified',
      unverified: 'Unverified',
      mapVerificationTitle: 'Map & Location Authenticity Audit',
      placeExistsLabel: 'External Place Verification',
      contactHijackLabel: 'Contact Hijacking Check',
      reviewAuditLabel: 'Reviews & Links Audit',
      coordinatesLabel: 'Parsed Coordinates',
      clean: 'Clean',
      flagged: 'Flagged',
      rawMetadataTitle: 'Raw Technical Metadata (API v1 JSON)',
      copyJson: 'Copy JSON',
      copiedJson: 'Copied!',
    },
    footer: {
      teamTitle: 'Developed By',
      teamName: 'Team Cybersound',
      membersLabel: 'Team Members',
      notesTitle: 'Important Application Notes',
      apiNoteLabel: 'REST API v1 Ready',
      apiNoteDesc: 'Versioned endpoint ready for web clients and future browser extensions.',
      sandboxNote:
        'Links are opened for you in a throwaway headless browser on our server: downloads are blocked, nothing is kept after the scan, and internal network addresses are refused.',
      privacyNote:
        'Automated scores are decision-support forensics—never enter passwords, OTP codes, or card details on unverified links.',
      downloadExtensionBtn: 'Download Chrome Extension (.zip)',
      extensionDesktopOnly: 'Desktop browsers only (Chrome, Edge, Brave, Arc)',
      extensionBriefSteps:
        'Unzip → open chrome://extensions (Developer mode ON) → click Load unpacked.',
    },
    severity: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      info: 'Info',
    },
  },

  ar: {
    brandName: 'حصن الاحتيال',
    brandSubtitle: 'فاحص الروابط والاحتيال الرقمي',
    heroTitle: 'افحص الرابط وتأكد قبل ما تضغط',
    hero: {
      line1: 'افحص قبل',
      line2: 'أن',
      scribbleWord: 'تضغط.',
      sub: 'أداة ذكاء اصطناعي مخصّصة للإمارات تكشف الروابط الاحتيالية والمواقع المزيّفة والرسائل المضلّلة.',
    },
    tabs: {
      general: 'رابط',
      job: 'إعلان وظيفة',
      map: 'رابط خريطة',
      image: 'لقطة شاشة',
    },
    inputPlaceholder: {
      general: 'الصق الرابط أو الرسالة كاملة',
      job: 'الصق رابط إعلان الوظيفة',
      map: 'الصق رابط الخريطة أو الموقع',
    },
    checkBtn: 'افحص',
    evidence: {
      title: 'الأدلة',
      showAll: 'عرض الكل ({count})',
      showFewer: 'عرض أقل',
    },
    checkedLink: {
      title: 'الرابط المفحوص',
      copy: 'نسخ الرابط',
      copied: 'تم النسخ',
    },
    updateBannerBadge: 'جديد',
    updateBannerText: 'تمت إضافة ميزة فحص الصور ولقطات الشاشة للتحقق من مصداقيتها',
    modePrompt: 'شو حاب تفحص؟',
    modes: {
      general: {
        label: 'رابط عام',
        shortDesc: 'روابط مشبوهة وتصيّد',
        placeholder: 'الصق الرابط المشبوه هني... مثلاً https://example.com/verify',
      },
      job: {
        label: 'إعلان وظيفة',
        shortDesc: 'مصداقية الشركة والوظيفة',
        placeholder: 'الصق رابط إعلان الوظيفة هني... مثلاً https://careers.company.com/role',
      },
      map: {
        label: 'رابط خريطة',
        shortDesc: 'المكان والتقييمات المخترقة',
        placeholder: 'الصق رابط خرائط جوجل أو الموقع هني... مثلاً https://maps.app.goo.gl/...',
      },
    },
    imageMode: {
      label: 'فحص صورة',
      shortDesc: 'لقطات شاشة وكشف التزوير',
      newBadge: 'جديد',
      uploadTitle: 'ارفع أو الصق صورة أو لقطة شاشة',
      uploadHint: 'JPG أو PNG أو WebP — يتم ضغطها تلقائياً لتوفير رصيد الفحص',
      chooseFileBtn: 'اختر صورة',
      previewLabel: 'معاينة الصورة المرفوعة',
      changeBtn: 'تغيير',
      removeBtn: 'إزالة',
      inspectBtn: 'افحص الصورة الحين',
      inspectingBtn: 'جاري فحص الصورة...',
      optimizedTag: 'محسّنة الحجم',
      cachedTag: 'من الذاكرة · 0 توكن',
      authenticityLabel: 'الأصالة',
      authenticity: {
        genuine: 'أصلية وسليمة',
        suspicious: 'مشبوهة',
        forged_or_scam: 'احتيال أو مزوّرة',
      },
      authenticityAnalysisTitle: 'تحليل الأصالة وكشف التزوير البصري',
      extractedUrlsTitle: 'روابط مرصودة داخل الصورة',
      extractedPhonesTitle: 'أرقام هواتف مرصودة',
      deepScanBtn: 'فحص الرابط بعمق',
      visualInjectionAlert: 'تم رصد محاولة حقن أوامر خفية داخل الصورة!',
      errUnsupported: 'صيغة الملف غير مدعومة. يرجى رفع صورة JPG أو PNG أو WebP.',
      errTooLarge: 'حجم الصورة أكبر من 12 ميغابايت. اختر صورة أصغر.',
      errFailedRead: 'تعذّرت معالجة هذه الصورة. حاول برفع صورة أخرى.',
    },
    urlLabel: 'الرابط المطلوب فحصه',
    pasteBtn: 'لصق',
    scanBtn: 'افحص الرابط الحين',
    scanningBtn: 'جاري الفحص...',
    trySampleLabel: 'جرّب رابط سريع:',
    samples: [
      { label: 'حكومة الإمارات (u.ae)', url: 'https://u.ae/ar', mode: 'general' },
      {
        label: 'رابط مخالفة مزيّف',
        url: 'https://adpolice-fines-pay.top/verify',
        mode: 'general',
        tone: 'danger',
      },
      {
        label: 'رسالة احتيال',
        url: 'شرطة أبوظبي: لديك مخالفة مرورية غير مدفوعة بقيمة 150 درهماً. ادفع خلال 24 ساعة عبر tamm-login.xyz/pay لتجنب الإحالة للمحكمة.',
        mode: 'general',
        tone: 'danger',
      },
    ],
    coverage: {
      incompleteLabel: 'فحص غير مكتمل',
      full: 'فحص كامل: فتحنا الصفحة، وحلّلها الذكاء الاصطناعي، وتحققنا من المصادر المباشرة.',
      partialBackup: 'تم التحليل الذكي، لكن لم يتم التحقق من مصادر جوجل المباشرة.',
      partialPageNotLoaded: 'تعذّر فتح الصفحة. النتيجة مبنية على العنوان وبيانات التسجيل وبحث الذكاء الاصطناعي.',
      rulesOnly: 'التحليل الذكي غير متاح حالياً. النتيجة مبنية على الفحوصات التقنية فقط، فاعتبرها غير مكتملة.',
      officialNoAi: 'هذا نطاق رسمي ضمن قائمتنا الموثّقة، والفحوصات التقنية سليمة. التحليل الذكي غير متاح حالياً.',
      addressOnly: 'هذا العنوان متوقف. النتيجة مبنية على العنوان نفسه فقط.',
    },
    availability: {
      pausedTag: 'متوقف',
      coolingDown: 'هذا الفحص متوقف مؤقتاً: Gemini تجاوز حدّه أو لا يستجيب.',
      notConfigured: 'هذا الفحص يحتاج مفتاح Gemini، ولا يوجد مفتاح مفعّل على هذا الخادم.',
      backIn: 'يرجع خلال {time} تقريباً.',
      backSoon: 'يرجع بعد قليل.',
      generalStillWorks: 'فحص الروابط العامة شغّال.',
    },
    nav: {
      check: 'الفحص',
      watch: 'المراقبة',
      impact: 'الأثر',
      pitch: 'شاهد العرض',
      back: 'رجوع إلى الفاحص',
    },
    progressTitle: 'جاري تشغيل منظومة الفحص المعزول',
    progressSteps: [
      'التحقق من سلامة الرابط وحظر العناوين الداخلية (SSRF)',
      'فتح الرابط داخل متصفح Chromium معزول بدون ملفات أو كوكيز',
      'فحص شهادة الأمان (SSL/TLS) وعمر النطاق (RDAP) وسجلات DNS',
      'تدقيق العناصر المخفية والتقييمات لكشف أي حقن أوامر',
      'تشغيل التحليل الذكي وحساب نسبة الاحتيال النهائية',
    ],
    scamLikelihoodLabel: 'نسبة الاحتيال',
    verdicts: {
      safe: {
        label: 'آمن على الأرجح',
        desc: 'ما رصدنا أي مؤشرات احتيال أو انتحال أو مخاطر تقنية واضحة على هذا الرابط.',
      },
      caution: {
        label: 'خلك حذر وتأكد أكثر',
        desc: 'في ملاحظات بسيطة أو تفاصيل غير موثّقة، تأكد زين قبل ما تشارك أي بيانات.',
      },
      suspicious: {
        label: 'رابط مشبوه — انتبه!',
        desc: 'رصدنا عدة علامات تحذيرية، لا تدخل كلمات سر أو بيانات بطاقة على هالصفحة.',
      },
      high_risk: {
        label: 'انتبه! احتمال احتيال عالي',
        desc: 'في أدلة قوية على تضليل أو انتحال هوية أو مؤشرات تقنية خطيرة جداً.',
      },
      confirmed_scam: {
        label: 'احتيال مؤكد',
        desc: 'تم كشف دليل قاطع على الاحتيال أو التلاعب! لا تضغط أي شي ولا تدخل بياناتك أبداً.',
      },
    },
    smokingGunTitle: 'أدلة قاطعة تم رصدها (تصعيد تلقائي إلى 95–100%)',
    promptInjectionTitle: 'تم إحباط هجوم حقن أوامر (Prompt Injection)!',
    promptInjectionSubtitle:
      'الموقع أو التقييمات تحتوي على أوامر مخفية تحاول خداع الذكاء الاصطناعي وتغيير النتيجة إلى "آمن".',
    groundingSourcesTitle: 'مصادر التحقق الموثّقة (بحث وخرائط جوجل)',
    redFlagsTitle: 'الملاحظات والتنبيهات المرصودة',
    noRedFlagsText: 'ما تم رصد أي علامات احتيال أو تنبيهات حرجة على هذا الرابط.',
    technicalChecksTitle: 'التفاصيل التقنية والأمنية',
    cards: {
      sslTitle: 'حالة شهادة الأمان (SSL/TLS)',
      domainTitle: 'عمر النطاق والتسجيل',
      redirectTitle: 'التحويلات والوجهة النهائية',
      headersDnsTitle: 'ترويسات الحماية و DNS',
      domFormsTitle: 'النماذج والعناصر المخفية',
      injectionShieldTitle: 'درع صد حقن الأوامر',
    },
    actions: {
      showDetails: 'عرض التفاصيل التقنية',
      hideDetails: 'إخفاء التفاصيل التقنية',
      generateReport: 'إنشاء تقرير (PDF)',
      downloadReport: 'تنزيل تقرير الأدلة',
      generatingReport: 'جاري تجهيز التقرير...',
      sendToPolice: 'بلّغ شرطة أبوظبي',
      conceptBadge: 'أمان',
      policeConceptNotice:
        'حصن الاحتيال لا يرسل أي شيء بالنيابة عنك. حمّل التقرير من زر "تنزيل تقرير الأدلة" وشاركه عبر إحدى قنوات «أمان» الرسمية.',
      amanTitle: 'خدمة «أمان» من شرطة أبوظبي (مجانية، على مدار الساعة، بسرية تامة)',
      amanPhoneLabel: 'اتصال',
      amanSmsLabel: 'رسالة نصية',
      amanEmailLabel: 'بريد إلكتروني',
      amanWebLabel: 'الموقع',
      amanNote:
        '«أمان» قناة لاستقبال المعلومات. إذا خسرت مالاً فافتح بلاغاً لدى الشرطة أيضاً وأبلغ بنكك فوراً.',
      reportError: 'تعذّر إنشاء تقرير الـ PDF حالياً. حاول مرة ثانية.',
    },
    labels: {
      finalDestination: 'الوجهة النهائية',
      valid: 'صالحة وموثوقة',
      invalid: 'غير صالحة / مشبوهة',
      noHttps: 'بدون تشفير (HTTP)',
      issuer: 'الجهة المصدّرة',
      expiresIn: 'تنتهي خلال',
      days: 'يوم',
      selfSigned: 'موقّعة ذاتياً',
      expired: 'منتهية الصلاحية',
      mismatch: 'عدم تطابق النطاق',
      domainAge: 'عمر النطاق',
      registrar: 'المسجّل',
      created: 'تاريخ التسجيل',
      unavailable: 'غير متوفر',
      newlyRegistered: 'مسجّل حديثاً (أقل من 30 يوم)',
      hops: 'عدد التحويلات',
      crossDomain: 'تحويل لنطاق مختلف',
      sameDomain: 'نفس النطاق',
      httpStatus: 'حالة الاستجابة',
      sensitiveForms: 'حقول حساسة (باسوورد/OTP/بطاقة)',
      yes: 'نعم',
      no: 'لا',
      externalFormPost: 'إرسال لنطاق خارجي',
      hiddenElements: 'عناصر DOM مخفية',
      impersonatedBrand: 'جهة منتحَلة',
      punycodeHomograph: 'تزوير أحرف متشابهة',
      cleanShield: 'سليم — لا يوجد حقن أوامر',
      attackDetected: 'تم رصد محاولة هجوم!',
      channelsDetected: 'القنوات المرصودة',
      zeroWidthChars: 'أحرف مخفية (Zero-Width)',
      jobAuthenticityTitle: 'تقييم مصداقية إعلان الوظيفة',
      jobConfidenceLabel: 'ثقة مصداقية الوظيفة',
      linkLegitimacyLabel: 'شرعية الرابط والنطاق',
      companyVerificationLabel: 'التحقق من الشركة',
      legitimate: 'رسمي وموثوق',
      suspiciousOrFake: 'مشبوه / غير رسمي',
      verified: 'شركة موثّقة',
      unverified: 'غير موثّقة',
      mapVerificationTitle: 'تدقيق مصداقية الموقع على الخريطة',
      placeExistsLabel: 'وجود المكان بمصادر خارجية',
      contactHijackLabel: 'فحص اختراق أرقام التواصل',
      reviewAuditLabel: 'تدقيق التقييمات والروابط',
      coordinatesLabel: 'الإحداثيات المرصودة',
      clean: 'سليم',
      flagged: 'تنبيه خطير',
      rawMetadataTitle: 'البيانات التقنية الكاملة (API v1 JSON)',
      copyJson: 'نسخ JSON',
      copiedJson: 'تم النسخ!',
    },
    footer: {
      teamTitle: 'تطوير فريق',
      teamName: 'Team Cybersound',
      membersLabel: 'أعضاء الفريق',
      notesTitle: 'ملاحظات مهمة حول التطبيق',
      apiNoteLabel: 'واجهة برمجية v1 جاهزة',
      apiNoteDesc: 'نقطة فحص برمجية موحّدة وجاهزة للربط مع تطبيقات الويب وإضافات المتصفح مستقبلاً.',
      sandboxNote:
        'نفتح الرابط بدلاً منك في متصفح مؤقت على خادمنا: التحميل ممنوع، ولا يُحفظ شيء بعد الفحص، وتُرفض عناوين الشبكات الداخلية.',
      privacyNote:
        'نتائج الفحص مساعدة تقنية للتحقق — لا تدخل أبداً كلمات السر أو رموز OTP أو بيانات البطاقة في صفحات غير موثّقة.',
      downloadExtensionBtn: 'تحميل إضافة كروم (.zip)',
      extensionDesktopOnly: 'لمتصفحات الحاسوب فقط (Chrome / Edge / Brave / Arc)',
      extensionBriefSteps:
        'فك الضغط ← افتح chrome://extensions (فعّل وضع المطوّر) ← اختر Load unpacked.',
    },
    severity: {
      critical: 'حرج',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
      info: 'معلومة',
    },
  },
};
