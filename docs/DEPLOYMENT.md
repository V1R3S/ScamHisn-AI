# Deploying ScamHisn AI (حصن الاحتيال) to Render

One Docker container serves the bilingual web app and the `/api/v1` REST API, with a Chromium headless shell inside for opening suspicious pages safely.

The repository is ready to deploy as it is: there is a `Dockerfile`, a `.dockerignore` and a `render.yaml` at the repository root, so Render needs no "root directory" setting.

---

## The live site is not updating

Merging to `main` only redeploys if the Render service is connected to this repository with auto-deploy on. If the site still shows the old version:

1. Open the service in the [Render dashboard](https://dashboard.render.com) and look at **Events**. A failed build shows there with its log.
2. In **Settings → Build & Deploy**, check that **Repository** is this repository and **Branch** is `main`.
3. Leave **Root Directory** empty and set **Dockerfile Path** to `./Dockerfile` (the one at the repository root).
4. Turn **Auto-Deploy** on, then press **Manual Deploy → Deploy latest commit**.
5. When it says **Live**, check it as described under [Verify](#verify) below.

---

## A new service from this repository

**Blueprint (recommended).** Dashboard → **New +** → **Blueprint** → choose this repository. Render reads `render.yaml` from the repository root, asks for the secret values, and builds. If the name `scamhisn-ai` is taken, Render adds a suffix and the address changes with it.

**By hand.** Dashboard → **New +** → **Web Service** → choose this repository → Runtime **Docker**, branch `main`, health check path `/api/v1/health`, then add the environment variables below.

---

## Environment variables

| Name | Value | Needed |
|---|---|---|
| `GEMINI_API_KEY` | your Gemini API key | yes, for any AI analysis |
| `GEMINI_API_KEY_2` | a second key, tried when the first is rate limited | optional |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.1-flash-lite,gemini-3.6-flash` | recommended |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | yes |
| `NODE_ENV` | `production` | yes |
| `PLAYWRIGHT_HEADLESS` | `true` | yes |
| `MAX_CONCURRENT_SCANS` | `2` | yes on the free plan |
| `CORS_ALLOW_EXTENSIONS` | `true` | yes, for the Chrome extension |
| `CORS_ALLOWED_ORIGINS` | `*`, or a comma-separated list of other sites allowed to call the API | optional |
| `LOCAL_LLM_BASE_URL`, `LOCAL_LLM_MODEL`, `LOCAL_LLM_API_KEY` | the self-hosted judge model (Falcon-H1) | optional, see below |
| `AI_PIPELINE` | `auto` | optional |

The site can always load its own pages whatever `CORS_ALLOWED_ORIGINS` says; that setting only governs other websites.

Without any AI key the app still runs: link checks use the rule engine alone and say so, and the Job, Map and Screenshot checks show as paused. Add `ANTHROPIC_API_KEY` so Claude takes over when Gemini is missing or busy; Check Everything in the extension uses Claude first.

### The self-hosted judge (Falcon-H1)

Render's free plan cannot run a 7B model, so the judge runs elsewhere and Render calls it over the internet. `LOCAL_LLM_BASE_URL` must therefore be a public HTTPS address: a tunnel to the PC that runs the model, or a hosted GPU machine. Protect it with a key and put the same key in `LOCAL_LLM_API_KEY`. Setup is in [`AI_FALLBACK_SETUP.md`](./AI_FALLBACK_SETUP.md). If the address is empty or unreachable, the app carries on with Gemini and the rules.

---

## Verify

The first build takes several minutes because Chromium is installed into the image.

- `https://<your-service>.onrender.com/api/v1/health` returns `"status": "ok"` **and a `capabilities` block**. No `capabilities` block means the old version is still running.
- `https://<your-service>.onrender.com/` shows the paper-coloured page with "Check before you click."
- Check `https://adpolice-fines-pay.top/verify`: it should come back around 84%, High Scam Risk, with "This address is offline."

On the free plan the service sleeps when idle; the first request after a pause takes 30 to 50 seconds.

---

## What was and was not tested

- **Tested on 26 November 2026:** version 2 runs at `https://scamhisn-ai-o2k9.onrender.com`, built from the root `Dockerfile`. On the live service all four kinds of check are switched on, the Claude engine researches with the self-hosted Falcon-H1 judging through a tunnel, and Check Everything in the extension replaced a fake police address with the report.
- **Not tested:** other hosts than Render.
- A service connected to your own GitHub account redeploys by itself after every push. One created from a public repository address does not: press **Manual Deploy** after a change.
- The address Render gives a service is fixed when it is created. If yours differs from `scamhisn-ai-o2k9.onrender.com`, change `DEFAULT_API_BASE` in `Chrome Extension/scripts/build.mjs` and run it, so the extension talks to your copy.
