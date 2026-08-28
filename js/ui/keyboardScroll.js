/*
  Scrolls a focused text field back into view above the on-screen
  keyboard. Browsers normally do this automatically, but pinning the
  app's own height to a fixed value (see index.html's inline script,
  which keeps the footer from rising with the keyboard) also removes the
  page-level scroll the browser would otherwise use to do it -- so this
  reimplements just that part.

  A subtlety pinning the height creates: .frame-content's clientHeight is
  based on that pinned (keyboard-oblivious) height, so on a screen whose
  content already fits within it, .frame-content never actually overflows
  -- scrollHeight === clientHeight -- even once the keyboard is covering
  part of it. There's nothing to scroll natively in that state. So this
  first grows the container with temporary bottom padding equal to the
  keyboard's own height (genuinely creating overflow to scroll into), THEN
  scrolls the focused field above the now-covered area, removing the
  padding again once nothing needs it.
*/
window.BB = window.BB || {};
BB.ui = window.BB.ui || {};
BB.ui.keyboardScroll = (() => {
  let spacer = null; // { el, originalPaddingBottom }

  function isTextEntry(el) {
    if (!el) return false;
    if (el.tagName === "TEXTAREA") return true;
    if (el.tagName === "INPUT") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      return !["button", "checkbox", "radio", "range", "submit", "reset", "file", "color", "image"].includes(type);
    }
    return el.isContentEditable === true;
  }

  /** Nearest ancestor styled to scroll -- regardless of whether it currently has any overflow to scroll, since applySpacer() may be about to create some. */
  function findOverflowAutoAncestor(el) {
    let node = el.parentElement;
    while (node && node !== document.body) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) return node;
      node = node.parentElement;
    }
    return null;
  }

  function appHeightPx() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--app-height");
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : window.innerHeight;
  }

  function keyboardCoveredHeight() {
    const vv = window.visualViewport;
    const visible = vv ? vv.height : window.innerHeight;
    return Math.max(0, appHeightPx() - visible);
  }

  function applySpacer(container, height) {
    if (spacer && spacer.el !== container) removeSpacer();
    if (!spacer) spacer = { el: container, originalPaddingBottom: container.style.paddingBottom || "" };
    container.style.paddingBottom = `${height}px`;
    // Forces a synchronous reflow so scrollHeight reflects the new
    // padding immediately -- otherwise the scrollBy() right after this
    // call can still read the pre-padding (non-scrollable) layout and
    // silently clamp to a no-op.
    void container.offsetHeight;
  }

  function removeSpacer() {
    if (!spacer) return;
    spacer.el.style.paddingBottom = spacer.originalPaddingBottom;
    spacer = null;
  }

  function ensureVisible(el) {
    if (!el || !document.contains(el)) return;
    const keyboardHeight = keyboardCoveredHeight();
    if (keyboardHeight <= 0) {
      removeSpacer();
      return;
    }
    const scrollable = findOverflowAutoAncestor(el);
    if (!scrollable) return;
    // A little extra beyond the keyboard's own height so the field lands
    // with some breathing room above it, not flush against the edge.
    applySpacer(scrollable, keyboardHeight + 24);

    const vv = window.visualViewport;
    const visibleBottom = vv ? vv.height : window.innerHeight;
    const rect = el.getBoundingClientRect();
    const overlap = rect.bottom - visibleBottom;
    if (overlap > 0) {
      // Instant, not smooth: an animated scroll here can get interrupted
      // and restarted mid-flight by the follow-up correction below (or by
      // visualViewport settling in another step), which on some browsers
      // cancels the animation before it reaches its target and leaves the
      // field only partially scrolled into view.
      scrollable.scrollBy({ top: overlap + 16, behavior: "auto" });
    }
  }

  function handleFocusIn(e) {
    const el = e.target;
    if (!isTextEntry(el)) return;
    // The keyboard's own show animation (and so visualViewport's final,
    // settled size) doesn't land the instant focus fires, and how long it
    // actually takes varies by device/OS/keyboard -- a single fixed delay
    // is a guess that's wrong on some of them. Polled instead: rechecked
    // every 100ms for up to ~1.2s or until focus moves elsewhere,
    // settling naturally once the keyboard (and visualViewport) actually
    // finish animating, however long that takes on this device. Cheap
    // and idempotent once the field is already visible, so the extra
    // checks cost nothing once it's caught up. window.visualViewport's
    // own resize listener below still covers a later keyboard-height
    // change (e.g. an autofill/predictive-text bar appearing) after this
    // window ends.
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (document.activeElement !== el || attempts > 12) {
        clearInterval(poll);
        return;
      }
      ensureVisible(el);
    }, 100);
  }

  function handleFocusOut() {
    // A moment for a newly-focused field (if any) to claim the spacer
    // before tearing it down, so tabbing between two fields on the same
    // screen doesn't flicker the padding closed and immediately back open.
    setTimeout(() => {
      if (!isTextEntry(document.activeElement)) removeSpacer();
    }, 50);
  }

  function handleViewportResize() {
    if (keyboardCoveredHeight() <= 0) {
      removeSpacer();
      return;
    }
    if (isTextEntry(document.activeElement)) ensureVisible(document.activeElement);
  }

  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportResize);
  }

  return {};
})();
