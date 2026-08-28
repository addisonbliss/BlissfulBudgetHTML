/*
  Frame 8 -- the "expense logged" confirmation shown right after a
  successful spreadsheet write. Mirrors the native app's
  ui/screens/ExpenseLoggedScreen.kt: the rocking smiley (CSS animation
  instead of a Compose infiniteRepeatable), "Open Spreadsheet in Excel",
  and the START OVER / CLOSE / NEW EXPENSE buttons.

  "Open Spreadsheet in Excel" on the native app pins an ACTION_VIEW intent
  to the Excel package so Android routes it straight there. There's no
  equivalent "pin to an app" concept on the web -- this just opens the
  file's own webUrl in a new tab, which OneDrive/Excel's own web handlers
  already know how to route correctly (Excel Online, or a prompt to open
  the desktop app if the browser's registered a protocol handler for it).
*/
window.BB = window.BB || {};
BB.screens = BB.screens || {};
BB.screens.expenseLogged = (() => {
  let container = null;

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function render(spreadsheetWebUrl, callbacks) {
    container.innerHTML = `
      <div class="el-content">
        <div class="el-smiley">${BB.icons.smileyFace()}</div>
        <div class="el-headline">YAY!\nEXPENSE HAS BEEN LOGGED!</div>
        ${
          spreadsheetWebUrl
            ? `<button class="el-excel-link" id="el-excel-link" type="button">Open Spreadsheet in Excel</button>`
            : ""
        }
        <div class="el-spacer"></div>
        <img class="el-logo" src="icons/logo_bb.png" alt="Blissful Budget"/>
        <div class="el-secondary-row">
          <button class="bb-button bb-button--secondary" id="el-start-over" type="button">START OVER</button>
          <button class="bb-button bb-button--secondary" id="el-close" type="button">CLOSE</button>
        </div>
        <button class="bb-button bb-button--next el-new-expense" id="el-new-expense" type="button">NEW EXPENSE</button>
      </div>
    `;

    const excelLink = document.getElementById("el-excel-link");
    if (excelLink) {
      excelLink.addEventListener("click", () => {
        window.open(spreadsheetWebUrl, "_blank", "noopener");
      });
    }
    document.getElementById("el-start-over").addEventListener("click", () => callbacks.onStartOver && callbacks.onStartOver());
    document.getElementById("el-close").addEventListener("click", () => callbacks.onClose && callbacks.onClose());
    document.getElementById("el-new-expense").addEventListener("click", () => callbacks.onNewExpense && callbacks.onNewExpense());
  }

  /** Mounts this screen. `props`: { spreadsheetWebUrl, onNewExpense, onStartOver, onClose }. */
  function mount(containerEl, props) {
    container = containerEl;
    render(props.spreadsheetWebUrl || "", props);
  }

  return { mount };
})();
