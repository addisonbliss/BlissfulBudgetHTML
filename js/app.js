/*
  Nav host + shell bootstrap: fills in the persistent chrome's icons,
  initializes MSAL, and mounts the active screen -- mirrors the native
  app's navigation/BlissfulBudgetNavHost.kt (chrome rendered once, screens
  swap inside it). There's no router library here, just a small state
  machine: `currentScreen` plus the handful of values that need to outlive
  any one screen (selectedFile, selectedMonth, cachedMonths, isLogging).
*/
(function () {
  let selectedFile = null; // {id, name, webUrl}
  let selectedMonth = null;
  // Outlives SelectMonthScreen across a BACK-then-forward round trip, so
  // returning to Frame 3 after already loading a file's months skips the
  // reload -- only forgotten when a different file is chosen or CLEAR is
  // pressed on Frame 1/2.
  let cachedMonths = null;

  function renderProgressStage(stage) {
    const accessFileIcon = stage === "done" ? "accessFileGreen" : "accessFileDark";
    const chooseMonthIcon = stage === "done" ? "chooseMonthGreen" : stage === "accessFile" ? "chooseMonthLight" : "chooseMonthDark";
    const logExpenseIcon = stage === "done" ? "logExpenseGreen" : stage === "logExpense" ? "logExpenseDark" : "logExpenseLight";

    document.getElementById("progress-icon-access-file").innerHTML = BB.icons[accessFileIcon]();
    document.getElementById("progress-icon-choose-month").innerHTML = BB.icons[chooseMonthIcon]();
    document.getElementById("progress-icon-log-expense").innerHTML = BB.icons[logExpenseIcon]();
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

  function setLogging(isLogging) {
    const band = document.getElementById("footer-band");
    band.innerHTML = isLogging ? `<span class="footer-logging-text">Logging Expense to Spreadsheet...</span>` : "";
  }

  function newScreenContainer() {
    const container = document.getElementById("screen-container");
    container.innerHTML = "";
    const screenEl = document.createElement("div");
    screenEl.className = "screen is-active";
    container.appendChild(screenEl);
    return screenEl;
  }

  function showChooseSpreadsheet() {
    renderProgressStage("accessFile");
    setLogging(false);
    const screenEl = newScreenContainer();
    BB.screens.chooseSpreadsheet.mount(screenEl, {
      onFileChosen: (file) => {
        selectedFile = file;
        // A (re-)picked file always gets a fresh months load, even if it
        // happens to be the same file.
        cachedMonths = null;
      },
      onClear: () => {
        selectedFile = null;
        selectedMonth = null;
        cachedMonths = null;
      },
      onNext: () => showSelectMonth(),
    });
  }

  function showSelectMonth() {
    renderProgressStage("chooseMonth");
    setLogging(false);
    const screenEl = newScreenContainer();
    BB.screens.selectMonth.mount(screenEl, {
      spreadsheetFileName: selectedFile ? selectedFile.name : "",
      spreadsheetFileId: selectedFile ? selectedFile.id : "",
      selectedMonth,
      onSelectMonth: (month) => {
        selectedMonth = month;
      },
      onBack: () => {
        // Forget any in-progress month selection so returning here later
        // always starts fresh at Frame 3, not a stale Frame 5. The loaded
        // months list is deliberately NOT cleared -- it's still valid for
        // this file and shouldn't force a reload if the user comes back.
        selectedMonth = null;
        showChooseSpreadsheet();
      },
      onNext: () => showExpenseInformation(),
      cachedMonths,
      onMonthsLoaded: (months) => {
        cachedMonths = months;
      },
    });
  }

  function showExpenseInformation() {
    renderProgressStage("logExpense");
    const screenEl = newScreenContainer();
    BB.screens.expenseInformation.mount(screenEl, {
      spreadsheetFileName: selectedFile ? selectedFile.name : "",
      spreadsheetFileId: selectedFile ? selectedFile.id : "",
      month: selectedMonth || "",
      onBack: () => showSelectMonth(),
      onExpenseLogged: () => showExpenseLogged(),
      onLoggingChanged: (isLogging) => setLogging(isLogging),
    });
  }

  function showExpenseLogged() {
    renderProgressStage("done");
    setLogging(false);
    const screenEl = newScreenContainer();
    BB.screens.expenseLogged.mount(screenEl, {
      spreadsheetWebUrl: selectedFile ? selectedFile.webUrl : "",
      onNewExpense: () => {
        // A fresh Frame 6 instance for the same file/month -- expense
        // Information resets all its own local state on every mount, so
        // simply re-mounting it discards the just-logged values.
        showExpenseInformation();
      },
      onStartOver: () => {
        // Only the in-progress month/expense selection is forgotten -- the
        // loaded file and its cached month options are deliberately left
        // alone, per spec.
        selectedMonth = null;
        showChooseSpreadsheet();
      },
      onClose: () => {
        // Same no-op as the header's own close button -- see wireHeader().
      },
    });
  }

  async function main() {
    wireHeader();
    renderProgressStage("accessFile");
    await BB.auth.init();
    showChooseSpreadsheet();
  }

  main();
})();
