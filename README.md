> **This is version 2 of ScamHisn AI, built after the hackathon submission deadline (8:00 AM, 25 November 2026).**
> The version that was submitted and judged is at [MohmedQaid/ScamHisn-AI](https://github.com/MohmedQaid/ScamHisn-AI) and runs at [scamhisn-ai-v1.onrender.com](https://scamhisn-ai-v1.onrender.com/). Nothing here changes that submission.
>
> **New in version 2**
> - **Watchtower:** reads the public certificate logs and finds new addresses that imitate UAE brands, before anyone reports them. No AI and no key needed. See [`apps/api/src/watch/`](<./Deployable Website Application/apps/api/src/watch/>).
> - **Check Everything in the public extension:** when switched on, the first outside links on each page, search results included, are checked and badged.

<div align="center">

<sub><strong>42 ABU DHABI × ABU DHABI POLICE — SCAMSHIELD AI HACKATHON</strong></sub>

<br /><br />

<img src="./assets/logo.svg" alt="ScamHisn AI Logo" width="80" height="80" />

# ScamHisn AI · حصن الاحتيال

*AI-Powered Link, Image & Scam Inspector — Web App & Chrome Extension*

<br />

<a href="https://scamhisn-ai-v1.onrender.com/">
  <img src="./assets/badge-live.svg" alt="Live Demo: scamhisn-ai-v1.onrender.com" />
</a>

<br />

<a href="https://scamhisn-ai-v1.onrender.com/scamhisn-extension.zip">
  <img src="./assets/badge-extension.svg" alt="Download Chrome Extension (.zip)" />
</a>

<br />

<img src="./assets/badge-team.svg" alt="Built by Team Cybersound" />

<br /><br />

**[English (EN)](#en)** &nbsp;·&nbsp; **[العربية (AR)](#ar)**

<br />

<img src="./assets/divider.svg" alt="" width="480" />

<br /><br />

<img src="./assets/screenshot-home.png" alt="The ScamHisn AI home screen: Check before you click, one box to paste a link or a whole message, and four kinds of check" width="860" />

</div>

<br />

<a id="en"></a>

## EN — Overview

> **Welcome, and thank you for taking the time to look at our work.** Everything here is meant to be tried, read and questioned. If you have five minutes, start with one of these.

| Start here | |
|---|---|
| **Watch** | [The one-minute video](./docs/pitch/ScamHisn-AI-Pitch-Video.mp4) · [Arabic version](./docs/pitch/ScamHisn-AI-Pitch-Video-AR.mp4) |
| **Try** | [scamhisn-ai-v1.onrender.com](https://scamhisn-ai-v1.onrender.com/): paste `https://adpolice-fines-pay.top/verify` and press **Check** |
| **Read** | [The pitch deck (PDF)](./docs/pitch/ScamHisn-AI-Pitch.pdf) |
| **Explore** | [What's in this repository](#whats-in-this-repository) |

**ScamHisn AI** is a **Web Application** and **Chrome Extension** that protects users from fraudulent links and forged screenshots—including scams impersonating **UAE PASS**, **TAMM**, **Abu Dhabi Police**, local banks, fake jobs, and hijacked **Google Maps** listings.

It supports **passive checking** (manual inspection on demand) and **proactive checking** (automatic link scanning on open web pages).

> [!IMPORTANT]
> **Why only the passive version is deployed live:** Both versions are built (the public one is in `Chrome Extension/deployable/`; the proactive one is built from `Chrome Extension/source/`), but proactive scanning is locked to *"Developers only"* in production to prevent runaway public API costs.

> [!NOTE]
> **Live Demo Rate Limits (`https://scamhisn-ai-v1.onrender.com/`):** **15 req/min · 500 req/day · 50k tokens/min.**
> That is plenty for trying it out. If the site has been idle, the first visit takes 30 to 50 seconds to wake up; after that it is quick.

---

### What It Delivers

#### Four Inspection Modes
Check **General Links**, **Job Posts**, **Map Links**, or upload **Screenshots & Images** with a live preview to verify whether an image is genuine or forged.

#### Decisive 0–100% Scam Score
Fatal red flags immediately score **95–100%** instead of being diluted, while legitimate lookalike organizations (such as ADIB vs. DIB) are not falsely penalized.

#### Simple View + Investigator Details
Everyday users get a clear verdict at a glance; **"Show Details"** reveals technical findings for deeper investigation.

#### Forensic PDF & Police Escalation Concept
Export an investigation-ready **PDF report** in one click. The **"Report to Abu Dhabi Police"** button lists the official **Aman** channels (800 2626, SMS 2828, aman@adpolice.gov.ae); it does not submit anything for you.

---

### What It Looks Like

<table align="center">
<tr>
<td align="center" width="68%">
<strong>A scam verdict, with the evidence</strong><br /><br />
<img src="./assets/screenshot-verdict.png" alt="A fake fine link rated 84% High Scam Risk, with three pieces of evidence and buttons to download a report or report to Abu Dhabi Police" width="100%" />
</td>
<td align="center" width="32%">
<strong>The same verdict in Arabic, on a phone</strong><br /><br />
<img src="./assets/screenshot-arabic-phone.png" alt="The same verdict shown in Arabic on a phone" width="230" />
</td>
</tr>
</table>

---

### How to Use It

<table>
<tr>
<td width="50%" valign="top">

**Web App (Phone & Laptop)**

1. Open **[scamhisn-ai-v1.onrender.com](https://scamhisn-ai-v1.onrender.com/)**.
2. Choose **Link**, **Job post**, **Map listing** or **Screenshot**, then paste a link (or the whole message) or upload an image.
3. Click **Check** to see the verdict and the evidence, or download a PDF report.

*Phone Chrome tip:* Tap menu → **Add to Home screen** to use it like an app.

</td>
<td width="50%" valign="top">

**Chrome Extension (Desktop Browsers Only)**

1. **[Download Chrome Extension (.zip)](https://scamhisn-ai-v1.onrender.com/scamhisn-extension.zip)** *(also linked at the very bottom of the web app)* and unzip it.
2. Open `chrome://extensions` → enable **Developer mode** → click **Load unpacked**.
3. Click the toolbar icon or right-click any link → **Inspect link with ScamHisn AI**.

</td>
</tr>
</table>

---

### How It Works

Every scan blends **Deterministic Checks** *(SSL certificates, domain age, safety guards, and isolated sandbox inspection)* with **Semantic AI Checks** *(suspicious similarities, scam red flags, visual forgery detection, and anti-prompt-injection defense)*.

#### 1. Live Website (Links & Images)

<p align="center">
  <img src="./assets/diagram-webapp.svg" alt="Live Website — How It Works" width="100%" />
</p>

#### 2. Chrome Extension (Desktop Browsers)

<p align="center">
  <img src="./assets/diagram-extension.svg" alt="Chrome Extension — How It Works" width="100%" />
</p>

---

### Future Vision: TAMM Ecosystem Integration

Bringing **ScamHisn AI** into Abu Dhabi's **TAMM** ecosystem unlocks personalized scam protection inside the services residents already trust.

<p align="center">
  <img src="./assets/diagram-tamm.svg" alt="Future Vision — TAMM Ecosystem Integration How It Works" width="100%" />
</p>

<table align="center">
<tr>
<td align="center" width="50%">
<strong>Current TAMM Experience</strong><br /><br />
<img src="./assets/tamm-current.jpg" alt="Current TAMM App Screen" width="270" />
</td>
<td align="center" width="50%">
<strong>Concept: TAMM with ScamHisn AI</strong><br /><br />
<img src="./assets/tamm-with-scamhisn.png" alt="Concept TAMM App Screen with ScamHisn AI" width="270" />
</td>
</tr>
</table>

#### Personalized Fact-Checking
Cross-check scam messages against a resident's real TAMM records—instantly catching fake *"unpaid fine"* claims when their account shows *"All good, no fines."*

#### Native TAMM App Service
Embed one-tap link and screenshot verification directly inside **TAMM** with authenticated escalation to **Abu Dhabi Police**.

> [!NOTE]
> **Architecture Scope:** The exact integration design and which specific TAMM tools or services ScamHisn AI connects to are intentionally left for **TAMM experts and system architects** to design.

---

### Engineering Notes

#### Why we built it this way

| Choice | Why | Trade-off |
|---|---|---|
| **Open the link in a real headless browser** | Phishing pages hide behind redirects and scripts. Only rendering shows the real forms. | Takes seconds, not milliseconds. |
| **Rules decide first, AI second** | A clear red flag, such as a card form posting to another domain, must never be averaged away. Every point has a stated reason. | Rules need upkeep and miss lures that name no brand. |
| **Gemini Flash-Lite as the AI layer** | Reads Arabic and English, reads images, and checks Google Search and Maps live. The free tier fits a prototype. | A third-party service with rate limits and outages. |
| **Two AI roles, no single point of failure** | Gemini researches live sources; a self-hosted UAE-built model (TII Falcon-H1 7B) makes the judgment. Either can be missing: Gemini judges alone, or the local model does, or the rules do. | Job, Map and Image checks need Gemini, so they pause for a cool-down when every key is exhausted. |
| **Never "safe" on an incomplete check** | If the AI or the page is unavailable, the result reads "Incomplete check". | More cautious results during outages. |
| **A verdict for dead links** | Scam domains die within days. The address itself often names the brand it imitates. | An address-only verdict cannot see the page. |

#### Measured, not claimed

On a blind holdout of 141 addresses (76 real sites, 65 synthetic look-alikes), the address-analysis layer alone scored **91.5% accuracy** with **0 false alarms** on real sites and caught **53 of 65** look-alikes. The 12 misses and the limits are listed in [`docs/eval/address-layer.md`](./docs/eval/address-layer.md). The API has 144 unit tests (`npm test`).

The problem figures, cost model and savings estimate are on the in-app **Impact** page (`#/impact`) and in [`docs/IMPACT.md`](./docs/IMPACT.md). All 67 references are in [`docs/research/sources.md`](./docs/research/sources.md); the UAE open-data files we used are in [`data/open-data/`](./data/open-data/). The pitch deck and the one-minute pitch video, with its storyboard, are in [`docs/pitch/`](./docs/pitch/).

#### Privacy

- No accounts, no database, no analytics. Nothing you scan is written to disk.
- Links, page excerpts and screenshots are sent to Google's Gemini API for analysis. Screenshots are shrunk in your browser first.
- Image results, not the images, are cached in memory for 30 minutes by SHA-256 fingerprint.
- Each page opens in a throwaway browser context that is discarded after the scan.
- Server logs record errors only.

#### What we left out

- A police-side dashboard that groups reports into campaigns.
- Direct submission to the police. The report button lists the official Aman channels; the user sends the report.
- The TAMM claim-check. It is a concept and needs a government integration.
- On-device text reading for screenshots, so screenshots currently leave the device.
- Public threat feeds, user accounts, and Chrome Web Store publication.

#### What we would do differently with more time

- Judge private content (messages, screenshots) on a self-hosted model first, and send only public names to Gemini for lookups.
- Build a labelled Arabic and Emirati-dialect scam corpus and measure the full pipeline, not one layer.
- Fine-tune a small Arabic model on that corpus.
- Sign the PDF reports so they cannot be forged.
- Run Chromium as a non-root user with its own sandbox enabled.

#### Run it locally

```bash
cd "Deployable Website Application"
npm install
npm run install:browser      # headless Chromium for the scanner
cp .env.example .env         # then set GEMINI_API_KEY
npm run dev                  # web on :5173, API on :3001
npm test                     # 144 API unit tests
```

The AI pipeline (hybrid mode, fallbacks, cool-down, running the local model) is configured with environment variables; see [`docs/AI_FALLBACK_SETUP.md`](./docs/AI_FALLBACK_SETUP.md).

---

### Hosting & Deployment (Not Required — Already Live!)

**You do not need to host or deploy anything yourself** — the live app is already running at **[scamhisn-ai-v1.onrender.com](https://scamhisn-ai-v1.onrender.com/)**.

If you ever want to deploy your own free copy on **Render**:

1. On Render choose **New → Blueprint** (or a Docker Web Service) and connect this repository. The `render.yaml` and `Dockerfile` at the repository root are all it needs; no root directory setting.
2. Add `GEMINI_API_KEY` (see `.env.example`) in Render's Environment Variables and deploy.
3. Open `/api/v1/health` on the new address: `"status": "ok"` with a `capabilities` block means the current version is running.

The full guide, including what to check when the live site does not update, is in [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

---

### What's in this repository

| Where | What you will find |
|---|---|
| [`Deployable Website Application/`](<./Deployable Website Application/>) | The product: the bilingual website and the API behind it, with 144 automated tests. |
| [`Chrome Extension/`](<./Chrome Extension/>) | The browser extension, ready to load, and its source. |
| [`docs/`](./docs/) | The evidence behind this page: measured accuracy, the AI setup, impact and cost, research with 67 sources, and how to deploy. |
| [`docs/pitch/`](./docs/pitch/) | The pitch deck and the one-minute video, in English and Arabic. |
| [`data/open-data/`](./data/open-data/) | The UAE government open-data files our figures draw on. |
| [`assets/`](./assets/) | The images used on this page. |
| `Dockerfile`, `render.yaml` | One-step deployment of the whole app. |

Each folder opens with a short guide of its own.

---

### Team Cybersound

`Mohammed Ahmed Abdulnoor` · `Abdulrhman Ahmed Drizi` · `Khalid Ahmed Al Khawaldah` · `Ahmed Al Hashmi` · `Yousef Mohammed`

<br />

<div align="center">
  <img src="./assets/divider.svg" alt="" width="480" />
</div>

<br />

<a id="ar"></a>

<div dir="rtl">

## AR — نظرة عامة

> **أهلاً بك، وشكراً لوقتك في الاطلاع على عملنا.** كل ما هنا متاح للتجربة والقراءة والنقاش. إن كان لديك خمس دقائق فابدأ بأحد هذه الخيارات.

| ابدأ من هنا | |
|---|---|
| **شاهد** | [الفيديو في دقيقة واحدة](./docs/pitch/ScamHisn-AI-Pitch-Video-AR.mp4) · [النسخة الإنجليزية](./docs/pitch/ScamHisn-AI-Pitch-Video.mp4) |
| **جرّب** | [scamhisn-ai-v1.onrender.com](https://scamhisn-ai-v1.onrender.com/): الصق `https://adpolice-fines-pay.top/verify` واضغط **افحص** |
| **اقرأ** | [عرض التقديم (PDF)](./docs/pitch/ScamHisn-AI-Pitch.pdf) |
| **تصفّح** | [محتويات المستودع](#محتويات-المستودع) |

**حصن الاحتيال (ScamHisn AI)** هو **تطبيق ويب** و**إضافة لمتصفح كروم** لحماية المستخدمين من الروابط الاحتيالية والصور المزوّرة، بما في ذلك عمليات الانتحال التي تستهدف **الهوية الرقمية (UAE PASS)** و**منظومة تم (TAMM)** و**شرطة أبوظبي** والبنوك المحلية وإعلانات التوظيف الوهمية و**خرائط جوجل**.

يدعم النظام **الفحص اليدوي (السلبي)** عند الطلب، و**الفحص الاستباقي (النشط)** لمراقبة الروابط تلقائياً في صفحات الويب المفتوحة.

> **تنويه مهم — لماذا نُشرت النسخة اليدوية فقط؟**
>
> تم تطوير النسختين معاً، غير أن وضع الفحص الاستباقي مقفل بعبارة **«للمطورين فقط»** في النسخة الرسمية، لأن تشغيل الفحص التلقائي للعامة دون مصادقة قد يؤدي إلى استهلاك مرتفع لمفتاح واجهة البرمجة وتكاليف غير متوقعة.

<br />

> **حدود الاستخدام للنسخة المباشرة (`scamhisn-ai-v1.onrender.com`):**
>
> **15 طلباً/دقيقة · 500 طلب/يوم · 50 ألف رمز/دقيقة.**
>
> هذه الحدود كافية تماماً للتجربة الاعتيادية ما لم يختبر عدد كبير من المستخدمين الموقع في اللحظة نفسها، لذا يُرجى الاستخدام باعتدال. *(قد يستغرق تشغيل الخادم المجاني على Render نحو 30–50 ثانية بعد فترة خمول).*

---

### أبرز ما يقدمه التطبيق

#### أربعة أوضاع للفحص
افحص **الروابط العامة** أو **إعلانات الوظائف** أو **روابط الخرائط** أو ارفع **الصور ولقطات الشاشة** مع معاينة فورية للتحقق من أصالتها وكشف التزوير.

#### نسبة احتمال احتيال حاسمة (0–100%)
تصل النتيجة فوراً إلى **95–100%** عند وجود أدلة قاطعة دون تمييع، مع تجنّب الإنذارات الكاذبة للجهات الشرعية متشابهة الأسماء (مثل ADIB وDIB).

#### عرض بسيط وتفاصيل للمحققين
يظهر ملخص واضح وسريع للمستخدم العادي، مع زر **«عرض التفاصيل التقنية»** لعرض الأدلة المعمّقة عند الحاجة.

#### تقرير PDF ومفهوم الإبلاغ للشرطة
إمكانية تصدير **تقرير أدلة بصيغة PDF** بضغطة زر. وزر **«بلّغ شرطة أبوظبي»** يعرض قنوات خدمة **«أمان»** الرسمية (8002626، رسالة نصية 2828، aman@adpolice.gov.ae) ولا يرسل شيئاً بالنيابة عنك.

---

### شكل التطبيق

<table align="center">
<tr>
<td align="center" width="68%">
<strong>نتيجة فحص رابط احتيالي مع الأدلة</strong><br /><br />
<img src="./assets/screenshot-verdict.png" alt="رابط مخالفة مزيّف بنتيجة 84% احتمال احتيال عالي مع ثلاثة أدلة وزرّي تحميل التقرير وإبلاغ شرطة أبوظبي" width="100%" />
</td>
<td align="center" width="32%">
<strong>النتيجة نفسها بالعربية على الهاتف</strong><br /><br />
<img src="./assets/screenshot-arabic-phone.png" alt="النتيجة نفسها معروضة بالعربية على الهاتف" width="230" />
</td>
</tr>
</table>

---

### طريقة الاستخدام

<table>
<tr>
<td width="50%" valign="top">

**تطبيق الويب (الهاتف والحاسوب)**

1. افتح **[scamhisn-ai-v1.onrender.com](https://scamhisn-ai-v1.onrender.com/)**.
2. اختر **رابط** أو **إعلان وظيفة** أو **رابط خريطة** أو **لقطة شاشة**، ثم الصق الرابط (أو الرسالة كاملة) أو ارفع الصورة.
3. اضغط **افحص** لعرض النتيجة أو التفاصيل أو تحميل تقرير PDF.

*لمستخدمي كروم على الهاتف:* من القائمة اختر **إضافة إلى الشاشة الرئيسية** لاستخدامه كتطبيق.

</td>
<td width="50%" valign="top">

**إضافة كروم (لمتصفحات الحاسوب فقط)**

1. **[تحميل إضافة كروم (.zip)](https://scamhisn-ai-v1.onrender.com/scamhisn-extension.zip)** *(كما يتوفر رابط التحميل في نهاية صفحة تطبيق الويب)* ثم فك الضغط عن الملف.
2. افتح `chrome://extensions` ← فعّل **وضع مطوّر البرامج** ← اضغط **Load unpacked** واختر المجلد.
3. اضغط أيقونة الإضافة أو انقر بزر الفأرة الأيمن على أي رابط لفحصه فوراً.

</td>
</tr>
</table>

---

### آلية العمل

يجمع كل فحص بين **الفحوصات الحتمية** *(شهادات SSL، عمر النطاق، ضوابط الأمان، والبيئة المعزولة)* وبين **الفحص الدلالي بالذكاء الاصطناعي** *(التشابه المشبوه، علامات الاحتيال، كشف تزوير الصور، وصد حقن الأوامر)*.

#### 1. تطبيق الويب المباشر (الروابط والصور)

<p align="center">
  <img src="./assets/diagram-webapp.svg" alt="آلية عمل تطبيق الويب — حصن الاحتيال" width="100%" />
</p>

#### 2. إضافة متصفح كروم (للحاسوب)

<p align="center">
  <img src="./assets/diagram-extension.svg" alt="آلية عمل إضافة كروم — حصن الاحتيال" width="100%" />
</p>

---

### الرؤية المستقبلية: التكامل مع منظومة «تم» (TAMM)

يتيح دمج **حصن الاحتيال** ضمن **منظومة «تم» (TAMM)** حماية استباقية مخصّصة للمستخدم داخل الخدمات الحكومية التي يثق بها يومياً.

<p align="center">
  <img src="./assets/diagram-tamm.svg" alt="الرؤية المستقبلية — آلية التكامل مع منظومة تم" width="100%" />
</p>

<table align="center">
<tr>
<td align="center" width="50%">
<strong>تطبيق «تم» الحالي</strong><br /><br />
<img src="./assets/tamm-current.jpg" alt="واجهة تطبيق تم الحالية" width="270" />
</td>
<td align="center" width="50%">
<strong>تصوّر مستقبلي: «تم» مع حصن الاحتيال</strong><br /><br />
<img src="./assets/tamm-with-scamhisn.png" alt="تصور دمج حصن الاحتيال داخل تطبيق تم" width="270" />
</td>
</tr>
</table>

#### كشف مخصّص للاحتيال عبر بيانات المستخدم
التحقق الفوري من ادعاءات الرسائل المشبوهة (مثل *"مخالفة مرورية غير مدفوعة"*) مقارنةً بحالة المستفيد الفعلية في «تم» (مثل ظهور *"لا توجد مخالفات"*).

#### خدمة مدمجة داخل تطبيق «تم»
توفير فحص الروابط والصور بضغطة واحدة داخل التطبيق مع إمكانية رفع البلاغات الموثّقة مباشرةً إلى **شرطة أبوظبي**.

> **نطاق التصميم المعماري:**
>
> تُترك تفاصيل آلية التكامل التقني والأدوات أو الخدمات المحددة التي يتصل بها «حصن الاحتيال» داخل منظومة «تم» **للخبراء ومهندسي الأنظمة المختصين** لتصميمها وفق أعلى معايير الأمان والخصوصية.

---

### ملاحظات هندسية

#### لماذا بنيناه بهذه الطريقة

| الاختيار | السبب | المقابل |
|---|---|---|
| **فتح الرابط في متصفح حقيقي معزول** | صفحات التصيّد تختبئ خلف التحويلات والسكربتات، ولا تظهر نماذجها الحقيقية إلا عند فتحها. | يستغرق ثواني لا أجزاء من الثانية. |
| **القواعد أولاً ثم الذكاء الاصطناعي** | الدليل القاطع، مثل نموذج بطاقة يرسل البيانات لنطاق آخر، لا يجوز أن يذوب في المتوسطات. ولكل نقطة سبب معلن. | القواعد تحتاج صيانة ولا تلتقط الطُعم الذي لا يذكر اسم جهة. |
| **Gemini Flash-Lite للتحليل الذكي** | يقرأ العربية والإنجليزية والصور، ويتحقق مباشرةً من بحث وخرائط جوجل، والباقة المجانية تكفي لنموذج أولي. | خدمة خارجية لها حدود استخدام وانقطاعات. |
| **دوران للذكاء الاصطناعي بلا نقطة فشل واحدة** | Gemini يبحث في المصادر المباشرة، ونموذج إماراتي مستضاف ذاتياً (Falcon-H1 7B من TII) يصدر الحكم. يمكن غياب أي منهما: يحكم Gemini وحده، أو النموذج المحلي، أو القواعد. | فحص الوظائف والخرائط والصور يحتاج Gemini، فيتوقف مؤقتاً لفترة تهدئة عند استنفاد كل المفاتيح. |
| **لا نقول «آمن» في فحص غير مكتمل** | إذا تعذّر الذكاء الاصطناعي أو فتح الصفحة تظهر النتيجة «فحص غير مكتمل». | نتائج أكثر تحفظاً وقت الانقطاع. |
| **حُكم على الروابط المتوقفة** | نطاقات الاحتيال تختفي خلال أيام، والعنوان نفسه كثيراً ما يكشف الجهة المنتحَلة. | الحكم من العنوان فقط لا يرى الصفحة. |

#### قياس لا ادّعاء

على مجموعة اختبار محجوبة من 141 عنواناً (76 موقعاً حقيقياً و65 عنواناً مقلّداً مصطنعاً) حققت طبقة تحليل العنوان وحدها **دقة 91.5%** مع **صفر إنذارات كاذبة** على المواقع الحقيقية، وكشفت **53 من 65** عنواناً مقلّداً. الحالات الـ12 التي لم تُكشف وحدود القياس موثّقة في [`docs/eval/address-layer.md`](./docs/eval/address-layer.md). وللواجهة البرمجية 144 اختباراً آلياً (`npm test`).

أرقام المشكلة ونموذج التكلفة وتقدير التوفير معروضة في صفحة **الأثر** داخل التطبيق (`#/impact`) وفي [`docs/IMPACT.md`](./docs/IMPACT.md). المراجع الـ67 كلها في [`docs/research/sources.md`](./docs/research/sources.md)، وملفات البيانات المفتوحة الإماراتية المستخدمة في [`data/open-data/`](./data/open-data/). عرض التقديم وفيديو العرض (دقيقة واحدة) مع لوحة القصة في [`docs/pitch/`](./docs/pitch/).

#### الخصوصية

- لا حسابات ولا قاعدة بيانات ولا تتبّع، ولا يُحفظ أي شيء تفحصه على القرص.
- تُرسل الروابط ومقتطفات الصفحات ولقطات الشاشة إلى واجهة Gemini من جوجل للتحليل، وتُصغَّر اللقطات داخل متصفحك أولاً.
- تُحفظ نتائج فحص الصور، لا الصور نفسها، في الذاكرة 30 دقيقة ببصمة SHA-256.
- تُفتح كل صفحة في جلسة متصفح مؤقتة تُحذف بعد الفحص.
- سجلات الخادم تدوّن الأخطاء فقط.

#### ما لم ننفّذه

- لوحة للشرطة تجمع البلاغات في حملات.
- إرسال البلاغ مباشرةً للشرطة؛ فزر الإبلاغ يعرض قنوات «أمان» الرسمية والمستخدم هو من يرسل.
- التحقق من الادعاء عبر «تم»؛ وهو تصوّر يحتاج تكاملاً حكومياً.
- قراءة نص اللقطات على الجهاز نفسه، ولذلك تغادر اللقطات الجهاز حالياً.
- قوائم التهديدات العامة، وحسابات المستخدمين، والنشر في متجر كروم.

#### ما كنا سنغيّره لو توفر وقت أكثر

- تحليل المحتوى الخاص (الرسائل واللقطات) على نموذج مستضاف ذاتياً أولاً، وإرسال الأسماء العامة فقط إلى Gemini للتحقق.
- بناء مجموعة بيانات عربية وإماراتية مصنّفة لرسائل الاحتيال، وقياس المنظومة كاملة لا طبقة واحدة.
- تدريب نموذج عربي صغير على تلك المجموعة.
- توقيع تقارير PDF رقمياً حتى لا تُزوَّر.
- تشغيل Chromium بمستخدم محدود الصلاحيات مع تفعيل عزله الداخلي.

#### التشغيل محلياً

<div dir="ltr">

```bash
cd "Deployable Website Application"
npm install
npm run install:browser      # headless Chromium for the scanner
cp .env.example .env         # then set GEMINI_API_KEY
npm run dev                  # web on :5173, API on :3001
npm test                     # 144 API unit tests
```

</div>

إعداد سلسلة البدائل يتم بمتغيرات البيئة؛ انظر [`docs/AI_FALLBACK_SETUP.md`](./docs/AI_FALLBACK_SETUP.md).

---

### الاستضافة والنشر (غير مطلوب — التطبيق منشور وجاهز!)

**لا حاجة لاستضافة التطبيق أو نشره بنفسك**؛ فالنسخة المباشرة جاهزة للاستخدام الفوري عبر **[scamhisn-ai-v1.onrender.com](https://scamhisn-ai-v1.onrender.com/)**.

ومع ذلك، إذا رغبت في نشر نسختك الخاصة مجاناً على **Render**:

1. في Render اختر **New ← Blueprint** (أو Docker Web Service) واربطه بهذا المستودع. يكفي ملفا `render.yaml` و`Dockerfile` الموجودان في جذر المستودع، ولا حاجة لتحديد مجلد جذر.
2. أضف `GEMINI_API_KEY` (انظر `.env.example`) في متغيرات البيئة ثم ابدأ النشر.
3. افتح `/api/v1/health` على العنوان الجديد: ظهور `"status": "ok"` مع قسم `capabilities` يعني أن النسخة الحالية تعمل.

الدليل الكامل، ومنه ما يجب فحصه إذا لم يتحدّث الموقع المباشر، في [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

---

### محتويات المستودع

| المكان | ما ستجده |
|---|---|
| [`Deployable Website Application/`](<./Deployable Website Application/>) | المنتج نفسه: الموقع بالعربية والإنجليزية والواجهة البرمجية خلفه، مع 144 اختباراً آلياً. |
| [`Chrome Extension/`](<./Chrome Extension/>) | إضافة المتصفح جاهزة للتحميل مع شيفرتها المصدرية. |
| [`docs/`](./docs/) | الأدلة وراء هذه الصفحة: الدقة المقيسة، إعداد نماذج الذكاء الاصطناعي، الأثر والتكلفة، البحث مع 67 مرجعاً، وطريقة النشر. |
| [`docs/pitch/`](./docs/pitch/) | عرض التقديم والفيديو في دقيقة واحدة، بالعربية والإنجليزية. |
| [`data/open-data/`](./data/open-data/) | ملفات البيانات المفتوحة الحكومية الإماراتية التي تستند إليها أرقامنا. |
| [`assets/`](./assets/) | الصور المستخدمة في هذه الصفحة. |
| `Dockerfile` و `render.yaml` | نشر التطبيق كاملاً بخطوة واحدة. |

في بداية كل مجلد دليل قصير خاص به.

---

### فريق العمل — Team Cybersound

`Mohammed Ahmed Abdulnoor` · `Abdulrhman Ahmed Drizi` · `Khalid Ahmed Al Khawaldah` · `Ahmed Al Hashmi` · `Yousef Mohammed`

</div>
