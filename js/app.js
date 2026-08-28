/*
  Shell bootstrap: fills in the persistent chrome's icons, initializes
  MSAL, and mounts the active screen -- mirrors the native app's
  navigation/BlissfulBudgetNavHost.kt (chrome rendered once, screens swap
  inside it).
*/
(function () {
  function renderProgressStage(stage) {
    // Only the "access-file" stage (Frame 1/2) has its icon set wired up so
    // far -- Select Month/Expense Information will bring their own
    // dark/green variants when those screens are built.
    document.getElementById("progress-icon-access-file").innerHTML = BB.icons.accessFileDark();
    document.getElementById("progress-icon-choose-month").innerHTML = BB.icons.chooseMonthLight();
    document.getElementById("progress-icon-log-expense").innerHTML = BB.icons.logExpenseLight();
    document.getElementById("progress-arrow-1").innerHTML = BB.icons.progressArrow();
    document.getElementById("progress-arrow-2").innerHTML = BB.icons.progressArrow();
  }

  function wireHeader() {
    document.getElementById("header-close-button").innerHTML = BB.icons.closeCircle();
    document.getElementById("header-close-button").addEventListener("click", () => {
      // There's no exact web equivalent of "finish the Activity" -- a
      // script can only close a tab it opened itself. Standalone/PWA
      // installs on iOS and Android both offer their own native way to
      // leave the app (swipe away / home button), so this is a no-op for
      // now rather than a misleading action.
    });
  }

  function mountChooseSpreadsheet() {
    const screenEl = document.createElement("div");
    screenEl.className = "screen is-active";
    document.getElementById("screen-container").appendChild(screenEl);
    BB.screens.chooseSpreadsheet.mount(screenEl, {
      onNext: () => {
        // Select Month (Frame 3/4/5) hasn't been built yet.
        alert("Select Month isn't built yet in the web version -- coming in a follow-up pass.");
      },
      onClear: () => {},
    });
  }

  async function main() {
    wireHeader();
    renderProgressStage("access-file");
    await BB.auth.init();
    mountChooseSpreadsheet();
  }

  main();
})();
