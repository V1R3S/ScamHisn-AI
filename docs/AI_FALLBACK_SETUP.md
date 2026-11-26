# AI pipeline: setup

ScamHisn has two AI roles, and neither is a single point of failure.

- **Researcher: Gemini.** Checks live Google Search and Maps, and reads images.
- **Judge: a self-hosted model** (Jais 2 or Falcon-H1, both UAE-built). Reads our technical
  checks, the page text and Gemini's research, and makes the judgment.

## What happens on each scan

| Situation | Link check | Job, Map and Image checks |
|---|---|---|
| Gemini and the local model both up | Gemini researches, local model judges | Gemini researches, local model judges (images: Gemini only) |
| Local model down | Gemini judges alone | Gemini judges alone |
| Gemini down on every key, Claude configured | Claude researches, local model judges | Claude researches or reads the image, local model judges |
| Gemini down on every key, no Claude | Local model judges alone, marked "live sources not checked" | **Paused** for a cool-down, then switched back on automatically |
| All down | Rules only, shown as "Incomplete check", never "safe" | Paused |

Without Claude, Job, Map and Image checks are paused rather than degraded because they depend on
things the local model cannot do: research and reading images. Claude does both, so with
`ANTHROPIC_API_KEY` set they keep working; Claude is asked without live Google lookups, and the
result says so.

**Check Everything** (the extension toggle) runs on every site the user opens, so it asks Claude
first, then Gemini, with the local model judging. Manual checks keep Gemini first.

## Settings

| Variable | Purpose | Default |
|---|---|---|
| `GEMINI_API_KEY` | First Gemini key | none |
| `GEMINI_API_KEY_2` (or `GEMINI_API_KEYS=a,b`) | Second key, used when the first fails | none |
| `GEMINI_MODEL` | Primary Gemini model | `gemini-3.5-flash-lite` |
| `GEMINI_FALLBACK_MODEL` | Backup Gemini models, comma-separated, tried in order; limits are counted per model | none |
| `GEMINI_COOLDOWN_MS` | How long a failed key+model is left alone | `120000` (2 min) |
| `LOCAL_LLM_BASE_URL` | The local model server, ending in `/v1` | none |
| `LOCAL_LLM_MODEL` | Model name sent to that server | `jais-2-8b-chat` |
| `LOCAL_LLM_API_KEY` | Secret the local server requires | none |
| `LOCAL_LLM_TIMEOUT_MS` | Time allowed for the local model | `45000` |
| `LOCAL_LLM_MAX_PROMPT_CHARS` | Prompt budget for small context windows | `12000` |
| `AI_PIPELINE` | `hybrid`, `gemini_first`, or `auto` | `auto`: hybrid when a local model is set |
| `AI_REQUEST_TIMEOUT_MS` | Time allowed for one Gemini attempt | `25000` |

In `gemini_first` mode Gemini judges and the local model is only a fallback.

Keys are entered in Render only. Never commit them.

> Using two people's free keys to get past one account's limit may conflict with Google's API
> terms on circumventing quotas. A backup model or a paid key avoids the question.

## Cool-down

When a Gemini key+model returns an error (limit reached, overloaded, invalid key), it is left
alone for `GEMINI_COOLDOWN_MS`. No calls are made to it during that time. When every key+model is
cooling down:

- `GET /api/v1/health` reports `capabilities.features.job|map|image.available = false` with the
  time they will be retried.
- `POST /api/v1/scan` in Job or Map mode, and `POST /api/v1/scan-image`, return
  `503 FEATURE_UNAVAILABLE` with a `Retry-After` header.
- The web app shows those tabs as "Paused" with a countdown, and switches them back on by itself.

## Running the local model on your own PC

Tested on an RTX 3080 with 12 GB. Falcon-H1 7B uses about 9 GB while answering.

1. Install the runner. The NVIDIA (CUDA) build from the llama.cpp releases page is the faster
   one on an NVIDIA card; the `winget` package is the Vulkan build and also works.

   ```powershell
   winget install ggml.llamacpp
   ```

2. Get a model file.
   - **Falcon-H1 7B** (TII, Abu Dhabi): `Falcon-H1-7B-Instruct-Q4_K_M.gguf`, 4.6 GB, from
     `tiiuae/Falcon-H1-7B-Instruct-GGUF` on Hugging Face. No login needed. **This is the model
     to use today.**
   - **Jais 2 8B** (Inception and MBZUAI, Abu Dhabi): `Q4_K_M.gguf`, 5.1 GB, from
     `inception42/Jais-2-8B-Chat-GGUF` (gated: sign in and accept the terms).
     **Not usable on a GPU with llama.cpp yet.** See "Jais 2 status" below.

3. Start it with a secret key:

   ```powershell
   llama-server -m C:\Users\<you>\models\falcon-h1\Falcon-H1-7B-Instruct-Q4_K_M.gguf --port 8080 -ngl 99 -c 8192 --alias falcon-h1-7b-instruct --api-key <your-secret>
   ```

4. Check it answers, then run the nine-case smoke test:

   ```powershell
   cd "Deployable Website Application\apps\api"
   $env:LOCAL_LLM_BASE_URL="http://127.0.0.1:8080/v1"; $env:LOCAL_LLM_MODEL="falcon-h1-7b-instruct"; $env:LOCAL_LLM_API_KEY="<your-secret>"; npx tsx eval/localModelSmoke.ts
   ```

5. Let Render reach it through a tunnel (Cloudflare Tunnel is free), then set
   `LOCAL_LLM_BASE_URL` to the tunnel's `https://…/v1` address and `LOCAL_LLM_API_KEY` to the same
   secret.

Steps 3 to 5 in one command (Windows, with `cloudflared` installed, e.g. `winget install Cloudflare.cloudflared`):

```powershell
powershell -ExecutionPolicy Bypass -File "Deployable Website Application\scripts\start-falcon-live.ps1"
```

It starts the model server locked with a key (made once and kept in `.env`), opens a Cloudflare quick tunnel, and writes the three values for Render to `Deployable Website Application/.env.render-falcon` (not in git). Paste them into Render's Environment page. Add `-Stop` to shut both down.

The quick tunnel needs no account, and its address is new every time it starts: after a restart, copy `LOCAL_LLM_BASE_URL` into Render again. Cloudflare gives quick tunnels no uptime guarantee. For an address that never changes, use a named tunnel on a Cloudflare account with your own domain.

Your PC and home internet must stay on, and the PC awake, while judges test. If they drop, Gemini judges alone.

## Checking which model answered

Every scan response carries a `coverage` block:

```json
{ "level": "full", "pageLoaded": true, "aiProvider": "hybrid", "aiModel": "falcon-h1-7b-instruct (judge) + gemini-3.5-flash-lite (research)", "liveSourcesChecked": true }
```

| `aiProvider` | Meaning |
|---|---|
| `hybrid` | Gemini researched, the local model judged |
| `gemini`, `gemini_backup` | Gemini judged alone |
| `local` | The local model judged alone; live sources were not checked |
| `none` | Rules only |

Server logs print one line per failed step, for example
`[ScamHisn AI chain] gemini:key1:gemini-3.5-flash-lite failed: 503 UNAVAILABLE`.

## How the two opinions are combined in hybrid mode

- The judge's score is used.
- If the two scores differ by 40 points or more, the more cautious one wins and confidence is
  marked low.
- If both call the page low risk and Gemini checked live sources, the lower score stands.
- Either model spotting a confirmed scam or a prompt-injection attempt is enough to flag it.
- Verified facts about an employer or a map listing always come from Gemini's research.

## What was tested, and what was not

Tested on 24 Nov 2026 with Falcon-H1 7B (Q4_K_M) on an RTX 3080 through llama.cpp:

- Nine-case smoke test (five Arabic and English scam lures, three genuine pages, one case with
  research notes): 9 of 9 judged as expected, valid JSON every time. About 6.5 seconds per check
  on the CUDA build (b12680), about 10 seconds on the Vulkan build (b12669).
- The screenshot judge on two messages: a fake fine SMS scored 95, a genuine bank OTP notice 0,
  under 2 seconds each.
- End to end with Gemini failing for real (an invalid key): the local model judged a real page
  alone, Job, Map and Image paused with a countdown, and they came back after the cool-down.
- 149 unit tests cover the chain, the hybrid merge rules, the cool-down, the availability logic, the Claude engine choice and the instant address check.

Tested late on 24 Nov 2026 with two real free-tier Gemini keys, a list of backup models and
Falcon-H1 as judge (a local production build):

| Check | Result |
|---|---|
| `adpolice.gov.ae`, link mode | 0% safe, hybrid, about 13 s |
| `tamm.abudhabi`, link mode | 0% safe, hybrid, about 19 s |
| `github.com`, link mode | 0% safe, hybrid, about 10 s |
| `amazon.jobs`, job mode | 0% safe, job authenticity 98, hybrid, about 11 s |
| A Google Maps search link, map mode | 0% safe, hybrid, about 13 s |
| Screenshot of a fake Arabic fine SMS | 100% confirmed scam, link extracted, about 8 s |
| Screenshot of a genuine bank code SMS | 10% safe, about 5 s |

What those runs taught us (all fixed in code):

- **Free-tier keys get no allowance for live Google Search or Maps lookups on the newer Gemini
  models.** Google answers such a call with "quota exceeded". The app now reads that as "this
  lookup is not available on this key", remembers it, and continues without the lookup. Every
  result above therefore says "live sources not checked". Real live lookups need a paid key.
- **Some models refuse lookups together with a structured answer.** For those the app makes the
  lookup call in text mode and parses the JSON out of the reply.
- **A model a key may not use at all** (Google returned 404 "no longer available to new users"
  for one key) is switched off for six hours instead of being retried.
- **A long Arabic reply from the local model can be cut off.** The complete fields are kept and
  the half-written one is dropped.
- **A verified official domain is not doubted on a model's vague unease.** Before this rule the
  local model rated `adpolice.gov.ae` 45% for missing security headers.
- The primary model returned "high demand" (503) several times; a backup model answered instead.

Not tested:

- Live Google Search and Maps lookups actually returning sources (needs a paid key).
- The app deployed on Render with these settings. The tunnel itself was tested on 25 Nov 2026 from the
  PC: the public address answered 401 without the key and 200 with it, and the production build,
  pointed at that address, returned a hybrid verdict for `adpolice.gov.ae` (0%, 16 s). Render calling
  the tunnel has not been tried.
- Falcon-H1's Arabic is understandable but rough, and it sometimes mixes in a few non-Arabic
  characters. The app strips those, and in hybrid mode shows Gemini's Arabic instead.
  Nine cases is a sanity check, not an accuracy measurement.

## Jais 2 status

Tried on 24 Nov 2026 with the official `Q4_K_M.gguf` on the RTX 3080:

| Setup | Result |
|---|---|
| llama.cpp Vulkan build (b12669), all layers on the GPU | Loads, but every reply is garbage (`&&&&…`) |
| llama.cpp CUDA 12.4 build (b12680), all layers on the GPU | Same garbage, at about 66 tokens a second |
| CUDA build with flash attention off, KV cache on the CPU, or only 16 layers on the GPU | Same garbage |
| Processor only (`-ngl 0`) | Correct answers, about 8 tokens a second |

So the model file is fine and llama.cpp can run it, but any GPU offload breaks it in these two
builds. At 8 tokens a second a single check takes over a minute, which is too slow for live use.
Jais 2 therefore is not wired into the demo. To use it later, either wait for llama.cpp to fix
GPU support for its architecture, or serve it with a runtime that supports it (for example vLLM
or Transformers) behind the same OpenAI-compatible address. Nothing in the app needs to change:
set `LOCAL_LLM_MODEL` and `LOCAL_LLM_BASE_URL`.
