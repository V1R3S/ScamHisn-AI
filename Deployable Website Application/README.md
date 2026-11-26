# ScamHisn AI web app and API

This folder is the product itself: the bilingual website people use, and the API behind it that opens a suspicious page safely, inspects it, and returns a verdict with the reasons.

One Node.js process serves both. In production it runs in a single Docker container (see the `Dockerfile` at the repository root).

## What is in this folder

| Path | What it is |
|---|---|
| `apps/web/` | The website: React 19, Vite, Tailwind CSS. Arabic (right to left) and English. |
| `apps/api/` | The API: Express and TypeScript. Opens pages in a throwaway Chromium (Playwright), runs the technical checks, asks the AI models, and scores the result. |
| `apps/api/src/__tests__/` | 149 automated tests. |
| `apps/api/eval/` | The scripts that produced the measured accuracy in [`docs/eval/`](../docs/eval/address-layer.md). |
| `packages/shared/` | The data shapes the website, the API and the extension all agree on. |
| `scripts/start-falcon-live.ps1` | Starts the self-hosted judge model and a tunnel so a deployed site can reach it. |
| `.env.example` | Every setting, explained. Copy it to `.env`. |

## Run it on your computer

You need Node.js 20 or newer and a Gemini API key from Google AI Studio.

```bash
npm install
npm run install:browser      # a small headless Chromium for the scanner
cp .env.example .env         # then put your key in GEMINI_API_KEY
npm run dev                  # website on http://localhost:5173, API on http://localhost:3001
```

Without any AI key the app still runs: link checks use the rule engine alone and say so, and the Job, Map and Screenshot checks show as paused. With `ANTHROPIC_API_KEY` set, Claude takes over whenever Gemini is missing or busy, and Check Everything in the extension uses Claude first.

```bash
npm test                     # the 149 tests
npm run typecheck
npm run build && npm start   # production build, served on port 3001
```

## How a check works

1. **Open safely.** The page loads in an isolated browser session that is thrown away afterwards. Private and internal addresses are refused.
2. **Inspect.** Certificate, domain age, look-alike names of UAE brands and government bodies, where forms send their data, and text hidden in the page that tries to instruct an AI.
3. **Research and judge.** Gemini reads the page and any screenshot; a self-hosted model (Falcon-H1) makes the call. Either can be missing and the check still completes.
4. **Score.** Our own rules decide first and can overrule both models. The result says how much of the analysis actually ran.

The models, keys, fallbacks and cool-downs are set with environment variables: [`docs/AI_FALLBACK_SETUP.md`](../docs/AI_FALLBACK_SETUP.md).

## The API

| Method and path | What it does |
|---|---|
| `GET /api/v1/health` | Status, and which checks are available right now. |
| `POST /api/v1/scan` | Checks a link. Body: `{ "url": "...", "mode": "general" \| "job" \| "map", "locale": "en" \| "ar" }`. |
| `POST /api/v1/scan-image` | Checks a screenshot. |
| `POST /api/v1/report/pdf` | Turns a result into a PDF evidence report. |

Requests and responses are typed in `packages/shared/src/schemas.ts`.

## Deploy it

[`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) has the steps for Render, the settings to paste, and what to check afterwards.
