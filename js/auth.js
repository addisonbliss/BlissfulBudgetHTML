/*
  Thin wrapper around MSAL.js (window.msal, loaded via <script> in
  index.html), mirroring the native app's auth/GraphAuthManager.kt: same
  client ID, same "personal Microsoft accounts only" audience, same
  silent-then-interactive token acquisition shape. Uses the *redirect* flow
  rather than popups -- popups are unreliable on mobile Safari, especially
  once the page has been "Added to Home Screen" (standalone PWAs often
  can't spawn a real popup window at all).

  IMPORTANT: before this works anywhere but localhost, this app's redirect
  URI needs to be registered as a "Single-page application" platform on the
  Azure app registration below -- see README.md.
*/
window.BB = window.BB || {};
BB.auth = (() => {
  const CLIENT_ID = "2f5c273f-a3f5-4570-a271-dcd9dac47afe";
  const SCOPES = ["Files.ReadWrite"];

  let msalInstance = null;
  let initialized = false;

  // Built lazily (not at module-load time) so a slow/blocked/offline MSAL.js
  // CDN request can't throw before window.msal even exists and take the
  // rest of the app down with it -- the app shell and file-browsing UI
  // should still render even if sign-in itself isn't available yet.
  function client() {
    if (msalInstance) return msalInstance;
    if (typeof msal === "undefined") {
      throw new Error("Sign-in isn't available right now -- couldn't load Microsoft's sign-in library.");
    }
    msalInstance = new msal.PublicClientApplication({
      auth: {
        clientId: CLIENT_ID,
        // "consumers" = personal Microsoft accounts only, matching the
        // native app's PersonalMicrosoftAccount audience.
        authority: "https://login.microsoftonline.com/consumers",
        redirectUri: window.location.origin + window.location.pathname,
      },
      cache: {
        // localStorage (not the default sessionStorage) so a sign-in
        // survives the redirect flow's full page navigation away and back,
        // and so the user doesn't have to sign in again every time they
        // reopen the tab.
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
      },
    });
    return msalInstance;
  }

  /** Must be called once before anything else here -- processes a pending redirect response, if any. */
  async function init() {
    if (initialized) return;
    if (typeof msal === "undefined") {
      // Leaves `initialized` false so a later call (once/if the script
      // finishes loading) can still try again, rather than being
      // permanently stuck unauthenticated for the rest of this page load.
      console.warn("MSAL.js hasn't loaded -- sign-in will be unavailable until it does.");
      return;
    }
    const app = client();
    await app.initialize();
    const response = await app.handleRedirectPromise();
    if (response && response.account) {
      app.setActiveAccount(response.account);
    } else {
      const accounts = app.getAllAccounts();
      if (accounts.length > 0) app.setActiveAccount(accounts[0]);
    }
    initialized = true;
  }

  /** The signed-in account's username (email/UPN), or null if no account is cached yet -- never triggers sign-in. */
  function currentAccountEmail() {
    if (typeof msal === "undefined" || !msalInstance) return null;
    const account = msalInstance.getActiveAccount();
    return account ? account.username : null;
  }

  /**
   * Returns a valid Graph access token, redirecting to Microsoft's sign-in
   * page if there's no cached account yet or the cached token needs
   * re-authentication. NOTE: since this is a real page navigation (not a
   * popup), a call here that needs interactive sign-in never actually
   * returns -- the page navigates away and this promise never resolves.
   * Callers that might trigger sign-in should not rely on code after this
   * call running in that case.
   */
  async function getAccessToken() {
    const app = client();
    const account = app.getActiveAccount();
    if (account) {
      try {
        const result = await app.acquireTokenSilent({ scopes: SCOPES, account });
        return result.accessToken;
      } catch (e) {
        // Falls through to interactive below.
      }
    }
    // Redirects away from the page -- see the doc comment above.
    await app.acquireTokenRedirect({ scopes: SCOPES });
    return new Promise(() => {}); // never resolves; the page is navigating away
  }

  async function signOut() {
    const app = client();
    const account = app.getActiveAccount();
    await app.logoutRedirect({ account });
  }

  return { init, currentAccountEmail, getAccessToken, signOut };
})();
