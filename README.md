# Blissful Budget Expense Log — Web

**Live:** https://addisonbliss.github.io/BlissfulBudgetHTML/

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
  is loaded via a `<script>` tag in `index.html` (`window.msal` global) from
  jsdelivr, pinned to a specific version. (Microsoft's own CDN,
  `alcdn.msauth.net`, turned out to 404 on the pinned version this app
  originally used — it appears to only keep a rolling window of recent
  versions rather than every version indefinitely — so this uses jsdelivr's
  npm mirror instead, which keeps every published version permanently.)
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
4. Add this exact redirect URI (this is now live on GitHub Pages):
   `https://addisonbliss.github.io/BlissfulBudgetHTML/`
   Add `http://localhost:<port>/` too if you ever want to test from a local
   server. Save.

`js/auth.js` already points at this same client ID and the `consumers`
authority (personal accounts only, matching the native app's
`PersonalMicrosoftAccount` audience) — no code changes needed once the
redirect URI is registered, as long as `redirectUri` in `js/auth.js` matches
where you actually host it.

### 2. Deploy somewhere with HTTPS — done

This is already live on GitHub Pages, served directly from this repo's
`master` branch with no build step or Actions workflow (these are already
the final static files):

**https://addisonbliss.github.io/BlissfulBudgetHTML/**

Open that on the iPhone (or any device) and optionally "Add to Home Screen"
for an app-like icon and full-screen window. Any push to `master` redeploys
automatically within a minute or two.

## What's implemented so far

The full flow, matching the native app's latest implementation:

- App shell (header, "EXPENSE LOG" title + logo, progress icon row, footer)
  — persistent chrome matching `BlissfulBudgetNavHost.kt`, including the
  "Logging Expense to Spreadsheet..." footer pulse while a LOG write is in
  flight.
- Sign-in via MSAL.js (redirect flow — more reliable than popups on mobile
  Safari, especially once "Added to Home Screen").
- Frame 1/2 (Choose Spreadsheet): the OneDrive picker, including the Most
  Recent File shortcut and recursive filename search.
- Frame 3/4/5 (Select Month): sheet names read via Graph, filtered/ordered
  to calendar months.
- Frame 6+ (Expense Information): Category/Sub-Category (read from the
  month sheet's own cells, Sub-Category depending on which Category was
  picked) and Who Dunnit? dropdowns, the Amount field with its full
  arithmetic-calculator drop-up, Expense Details, and LOG writing the five
  values into the first open row of the sheet's expense log range. The
  scrim that darkens the field/button area while a dropdown or the
  calculator is open (while keeping the title and the open field's own
  label undimmed) is a from-scratch port of the native app's
  measure-and-redraw technique, using `getBoundingClientRect()` instead of
  Compose's `LayoutCoordinates`.
- Frame 8 (Expense Logged): the rocking smiley, "Open Spreadsheet in
  Excel" (opens the file's `webUrl` directly — there's no web equivalent
  of pinning an intent to a specific app package), and Start Over / Close
  / New Expense.

One intentional simplification vs. the native app: the dropdown option
lists (Category, Sub-Category, Who Dunnit?, Month) use the browser's own
scrollbar past 5 visible rows, rather than reproducing the native app's
custom 8px scrollbar-thumb component.

## Still to come

Nothing functionally — this covers the full Frame 1→8 flow. Future passes
will be visual polish/bugfixes reported from actually using it on a phone.

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
js/ui/dropdown.js       Shared markup/wiring for the labeled dropdown field (Category, Sub-Category, Who Dunnit?, Month)
js/screens/*.js        One file per frame/screen (chooseSpreadsheet, selectMonth, expenseInformation, expenseLogged)
js/app.js              Nav host: shell chrome + the state machine that swaps the active screen
```
