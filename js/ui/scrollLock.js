/*
  Locks the page's own scroll (and, on iOS Safari in particular, the
  address-bar show/hide animation and keyboard-driven auto-scroll that
  come with it) while a dropdown, the calculator, or the OneDrive picker
  modal is open -- these are all absolutely-positioned overlays anchored
  to specific on-screen elements, and any background scroll or browser-
  chrome resize while one is open is what was making them drift out of
  place. Reference-counted so two overlays that happen to be requested in
  overlapping succession (e.g. one closing right as another opens) don't
  unlock the page prematurely.

  Plain `overflow:hidden` on the body does NOT reliably stop scrolling/
  bounce on iOS Safari; pinning it with `position:fixed` at its current
  scroll offset is the standard, robust workaround.
*/
window.BB = window.BB || {};
BB.ui = window.BB.ui || {};
BB.ui.scrollLock = (() => {
  let lockCount = 0;
  let savedScrollY = 0;

  function lock() {
    lockCount++;
    if (lockCount > 1) return;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  }

  function unlock() {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0) return;
    const body = document.body;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    window.scrollTo(0, savedScrollY);
  }

  return { lock, unlock };
})();
