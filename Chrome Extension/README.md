# ScamHisn AI for Chrome

Check a link without leaving the page you are on, or switch on **Check Everything** and have every site checked as you open it. The extension uses the same engine as the website, so the verdict, the evidence and the Aman reporting channels are identical.

Works in Chrome, Edge, Brave, Arc and Opera (any Chromium browser, Manifest V3).

## Install it in two minutes

1. [Download the extension (.zip)](https://scamhisn-ai-o2k9.onrender.com/scamhisn-extension.zip) and unzip it. If you cloned this repository, you can use the `deployable/` folder instead.
2. Open `chrome://extensions`, switch on **Developer mode**, click **Load unpacked** and choose the folder.
3. Click the ScamHisn AI icon in the toolbar, or right-click any link and choose **Inspect link with ScamHisn AI**.

The ⚙ button in the popup sets which server the extension talks to. It starts on `https://scamhisn-ai-o2k9.onrender.com`; use `http://localhost:3001` when you run the app yourself.

## Two ways to use it

### Check Manually

Paste a link, a job post or a map link in the popup, or right-click a link on any page. Nothing is sent anywhere until you ask.

### Check Everything

A toggle in the popup, **off until you switch it on**. While it is on:

1. **Every site you open goes through the ScamHisn AI engine first.** The address is judged at once (look-alikes of UAE brands, risky endings). Then the full check runs: our server opens the page in a throwaway browser, follows its redirects, Claude researches it and the self-hosted Falcon-H1 model makes the call.
2. **Redirects are checked too.** If a page sends you on to another site, that site is checked as well. This is what stops a trusted page that has been tampered with from quietly handing you to a malicious one (a watering-hole attack).
3. **If a site is not legitimate, the report opens instead of the site.** It is the same report as on the website, with **Download evidence report** and **Report to Abu Dhabi Police**, plus **Go back** and **Open the site anyway**.

The toolbar icon shows where a tab stands: `…` checking, `OK` cleared, `!` stopped, `?` the engine could not be reached. A site is checked once and remembered for 30 minutes.

**What to know before you switch it on**

- The address of every site you open is sent to the ScamHisn server while the toggle is on. Nothing is sent while it is off.
- The address check answers in a fraction of a second. The full check takes 10 to 40 seconds, and the page stays usable during it; if the verdict is bad the page is replaced by the report.
- A site that redirects to an address that does not exist never opens, so there is nothing to stop.
- If the engine cannot be reached the icon shows `?`. A site is never marked as cleared without an answer.
- Sites on your own machine and local network are left alone.
- Each full check costs AI calls on the server. For a team install, use a key with enough allowance.

**Why Claude and Falcon here.** A manual check asks Gemini to research and Falcon to judge. Check Everything asks Claude first, with Falcon still judging, because it runs on every site and must not pause when Google's free service is busy. If Claude cannot answer, Gemini is tried, then Falcon alone.

## What is in this folder

| Path | What it is |
|---|---|
| `deployable/` | The public build, ready to load. This is what the download above contains. |
| `source/` | The code to edit. `src/guard.js` is Check Everything; `src/bridge.js` carries the report page's buttons back to the extension. |
| `scripts/build.mjs` | Builds everything from `source/`. |

## Two builds

- **Public (`deployable/`)** talks to the hosted server.
- **Developer (`dev/`)** talks to `http://localhost:3001`. It is created by the build script and is not kept in git.

Both have the same features. Permissions: the active tab, storage for your settings, the right-click menu, and navigation events (needed to see which site a tab is opening). The extension reads no page content.

## Rebuild after a change

```bash
node "Chrome Extension/scripts/build.mjs"
```

This rewrites `deployable/`, creates `dev/`, and updates the download the website serves.

## Tested

On 26 November 2026, in Microsoft Edge with a fresh profile and the developer build against a local server:

| Case | Result |
|---|---|
| Toggle off, open a site | Nothing is checked |
| Open `adpolice-fines-pay.top` | The report opens instead: 84%, High Scam Risk, with both buttons |
| Open an ordinary site | Stays open; full check returns "safe" |
| Open `http://wikipedia.org`, which redirects to `www.wikipedia.org` | Both addresses are checked |
| Press **Go back** on the report | Returns to the last cleared page |

Not tested: a real redirect from a legitimate site to a live malicious one (we had none to point at), Chrome itself, and "Open the site anyway".
