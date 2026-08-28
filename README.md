# Blissful Budget Expense Log — Web

A browser-based sibling to the native Android app in `../BlissfulBudgetApp` —
same Figma design, same Microsoft Graph/OneDrive integration, same feature
set — built so it also runs on iOS (and any other device with a browser)
without needing Xcode, code signing, or an App Store submission. This is a
**separate app that runs alongside** the native Android app, not a
replacement for it.

## Why plain HTML/CSS/JS, no build step

This dev machine has no Node.js or Python installed, so there's no bundler,
package manager, or local dev server available. Every file here is loaded
directly by the browser as-is:

- Plain `<script>` tags (not ES modules) — modules are blocked from loading
  over `file://` by browser CORS rules, and a project with no build tooling
  and no local server needs to still be openable directly from disk for
  quick iteration. Each `js/*.js` file attaches its exports to a single
  global `BB` namespace object instead of using `import`/`export`.
- [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js)
  is loaded from Microsoft's own CDN via a `<script>` tag in `index.html`
  (`window.msal` global), the same way Microsoft's own docs show it for a
  plain script tag setup.
- Fonts are the real Open Sans family via Google Fonts
  (`https://fonts.googleapis.com`), matching the native app's bundled
  `res/font/` files.

## One-time setup this project needs from you

### 1. Register this app as a Single-Page Application in Azure

The native Android app already has an Azure AD app registration (client ID
`2f5c273f-a3f5-4570-a271-dcd9dac47afe`, "Personal Microsoft accounts only").
MSAL.js can reuse that *same* app registration, but browser-based auth needs
its own redirect URI registered under a "Single-page application" platform
(mobile apps and web apps use different token-redemption flows, so Azure
tracks their redirect URIs separately even under one app registration):

1. Sign in to [entra.microsoft.com](https://entra.microsoft.com) (or
   [portal.azure.com](https://portal.azure.com) → Azure Active
   Directory/Microsoft Entra ID) with the account that owns this app
   registration.
2. **App registrations** → find the app with client ID
   `2f5c273f-a3f5-4570-a271-dcd9dac47afe` → **Authentication**.
3. **Add a platform** → **Single-page application**.
4. Add a redirect URI for wherever this site ends up hosted, e.g.
   `https://<your-github-username>.github.io/<repo-name>/` (GitHub Pages) —
   add `http://localhost:<port>/` too if you ever want to test from a local
   server. Save.

`js/auth.js` already points at this same client ID and the `consumers`
authority (personal accounts only, matching the native app's
`PersonalMicrosoftAccount` audience) — no code changes needed once the
redirect URI is registered, as long as `redirectUri` in `js/auth.js` matches
where you actually host it.

### 2. Deploy somewhere with HTTPS

OAuth redirects (and most of what a real device needs to treat this as an
installable app) require serving over `https://`, not opening the HTML file
directly (`file://`) and not a bare `http://`. The natural fit given the
existing GitHub-based workflow: push this folder to a GitHub repo and enable
**GitHub Pages** (Settings → Pages → serve from the branch/folder) — no
build step, no Actions workflow needed, since these are already the final
static files. That gives a permanent `https://…github.io/…` URL you can open
on the iPhone (or any device) and optionally "Add to Home Screen" for an
app-like icon and full-screen window.

## What's implemented so far

- App shell (header, "EXPENSE LOG" title + logo, progress icon row, footer)
  — persistent chrome matching `BlissfulBudgetNavHost.kt`.
- Sign-in via MSAL.js (redirect flow — more reliable than popups on mobile
  Safari, especially once "Added to Home Screen").
- Frame 1/2 (Choose Spreadsheet): the OneDrive picker, including the Most
  Recent File shortcut and recursive filename search, matching the native
  app's latest design.

## Still to come

Select Month, Expense Information (including the arithmetic calculator
drop-up), and the Expense Logged confirmation screen — these will be added
in follow-up passes, the same way the native app was built up over many
rounds.

## Project layout

```
index.html            Single page; all screens are shown/hidden by app.js
css/tokens.css         Design tokens (colors, type) ported from Color.kt/Type.kt
css/styles.css         Component and layout styles
js/icons.js            Inline SVG markup, ported 1:1 from the native VectorDrawables
js/store.js            localStorage wrappers (mirrors OneDriveLocationStore/MostRecentFileStore)
js/auth.js             MSAL.js wrapper (mirrors GraphAuthManager.kt)
js/graph.js            Microsoft Graph REST calls (mirrors GraphApiClient.kt)
js/calculator.js       Arithmetic expression evaluator (mirrors ArithmeticEvaluator.kt)
js/screens/*.js        One file per frame/screen
js/app.js              Shell chrome + router that shows the active screen
```
