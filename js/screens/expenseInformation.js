/*
  Frame 6 and beyond -- Expense Information entry. Mirrors the native app's
  ui/screens/ExpenseInformationScreen.kt: Category (from the selected
  month's sheet, cells CA8:CL8), Sub-Category (from {column}9:{column}19,
  where `column` is whichever of CA-CL the chosen category came from),
  Who Dunnit? (BQ15:BQ18), Amount (with its own arithmetic-calculator
  drop-up), and Expense Details. LOG finds the first open row in
  C299:AD433 and writes the five values into it, then hands off to
  onExpenseLogged.

  The Category/Sub-Category/Who Dunnit? dropdowns and the calculator
  drop-up darken the field/button area behind them while keeping the
  "EXPENSE INFORMATION" title and the open field's own label at full
  brightness -- achieved by measuring those two real elements' positions
  (getBoundingClientRect relative to the scrim root) and rendering fresh
  copies of just that text in a layer above the scrim, mirroring the
  native app's LayoutCoordinates/localPositionOf technique.
*/
window.BB = window.BB || {};
BB.screens = BB.screens || {};
BB.screens.expenseInformation = (() => {
  const LOG_RANGE_FIRST_ROW = 299;
  const LOG_RANGE_LAST_ROW = 433;
  const CATEGORY_COLUMN_LETTER = "C";
  const SUBCATEGORY_COLUMN_LETTER = "L";
  const AMOUNT_COLUMN_LETTER = "X";
  const WHODUNNIT_COLUMN_LETTER = "AA";
  const DETAILS_COLUMN_LETTER = "AD";
  const CATEGORY_PLACEHOLDER = "<Select Category>";
  const SUBCATEGORY_PLACEHOLDER = "<Select Sub-Category>";
  const CATEGORY_COLUMNS = ["CA", "CB", "CC", "CD", "CE", "CF", "CG", "CH", "CI", "CJ", "CK", "CL"];
  const CALCULATOR_BOX_HEIGHT = 115;
  const MAX_AMOUNT_DIGITS = 9;

  let container = null;
  let props = {}; // { spreadsheetFileName, spreadsheetFileId, month, onBack, onExpenseLogged, onLoggingChanged }

  let category = null; // {label, column}
  let subCategory = null;
  let amount = ""; // raw digits, no separators
  let whoDunnit = null;
  let details = "";

  let categoryState = { kind: "loading" };
  let subCategoryState = { kind: "idle" };
  let whoDunnitState = { kind: "loading" };

  let categoryExpanded = false;
  let subCategoryExpanded = false;
  let whoDunnitExpanded = false;

  let logState = { kind: "idle" };

  let calculatorOpen = false;
  let calculatorFormula = "";
  let calculatorPhase = "editing"; // editing | result | error
  let amountBeforeCalculator = "";

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function formatAmountDigits(rawDigits) {
    if (!rawDigits) return "";
    const padded = rawDigits.padStart(3, "0");
    const cents = padded.slice(-2);
    const whole = padded.slice(0, -2).replace(/^0+/, "") || "0";
    return `${whole}.${cents}`;
  }

  function groupThousands(digits) {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatAmountDisplay(rawDigits) {
    if (!rawDigits) return "";
    const [whole, cents] = formatAmountDigits(rawDigits).split(".");
    return `${groupThousands(whole)}.${cents}`;
  }

  function categoryOptionsFrom(rawRowValues) {
    return CATEGORY_COLUMNS.map((column, i) => ({ column, label: rawRowValues[i] || "" })).filter((o) => o.label.trim() !== "");
  }

  async function loadCategories() {
    categoryState = { kind: "loading" };
    render();
    try {
      const token = await BB.auth.getAccessToken();
      const raw = await BB.graph.readRange(token, props.spreadsheetFileId, props.month, "CA8:CL8");
      categoryState = { kind: "loaded", options: categoryOptionsFrom(raw) };
    } catch (e) {
      categoryState = { kind: "error", message: e.message || "Couldn't read categories from this sheet." };
    }
    render();
  }

  async function loadSubCategories() {
    const column = category && category.column;
    if (!column) return;
    subCategoryState = { kind: "loading" };
    render();
    try {
      const token = await BB.auth.getAccessToken();
      const raw = await BB.graph.readRange(token, props.spreadsheetFileId, props.month, `${column}9:${column}19`);
      subCategoryState = { kind: "loaded", options: raw.filter((v) => v.trim() !== "") };
    } catch (e) {
      subCategoryState = { kind: "error", message: e.message || "Couldn't read sub-categories for this category." };
    }
    render();
  }

  async function loadWhoDunnit() {
    whoDunnitState = { kind: "loading" };
    render();
    try {
      const token = await BB.auth.getAccessToken();
      const raw = await BB.graph.readRange(token, props.spreadsheetFileId, props.month, "BQ15:BQ18");
      whoDunnitState = { kind: "loaded", options: raw.filter((v) => v.trim() !== "") };
    } catch (e) {
      whoDunnitState = { kind: "error", message: e.message || "Couldn't read spender names from this sheet." };
    }
    render();
  }

  function clearAll() {
    category = null;
    subCategory = null;
    amount = "";
    whoDunnit = null;
    details = "";
    subCategoryState = { kind: "idle" };
    render();
  }

  function openCalculator() {
    amountBeforeCalculator = amount;
    calculatorFormula = "";
    calculatorPhase = "editing";
    calculatorOpen = true;
    render();
  }

  function closeCalculator() {
    calculatorOpen = false;
    calculatorFormula = "";
    calculatorPhase = "editing";
    render();
  }

  function evaluateCalculatorFormula() {
    let evaluated = null;
    try {
      evaluated = BB.calculator.evaluate(calculatorFormula);
    } catch (e) {
      evaluated = null;
    }
    const cents = evaluated !== null && Number.isFinite(evaluated) ? Math.round(evaluated * 100) : null;
    if (cents !== null && cents >= 0 && cents <= 999999999) {
      amount = String(cents);
      calculatorPhase = "result";
    } else {
      calculatorPhase = "error";
    }
    render();
  }

  function clearCalculator() {
    calculatorFormula = "";
    amount = "";
    calculatorPhase = "editing";
    render();
  }

  function cancelCalculator() {
    amount = amountBeforeCalculator;
    closeCalculator();
  }

  function allFieldsFilled() {
    return !!category && !!subCategory && amount !== "" && !!whoDunnit && details.trim() !== "";
  }

  async function logExpense() {
    if (!category || !subCategory || !whoDunnit) return;
    logState = { kind: "logging" };
    if (props.onLoggingChanged) props.onLoggingChanged(true);
    render();
    try {
      const token = await BB.auth.getAccessToken();
      const range = (letter) => `${letter}${LOG_RANGE_FIRST_ROW}:${letter}${LOG_RANGE_LAST_ROW}`;
      const [categoryColumn, subCategoryColumn, amountColumn] = await Promise.all([
        BB.graph.readRange(token, props.spreadsheetFileId, props.month, range(CATEGORY_COLUMN_LETTER)),
        BB.graph.readRange(token, props.spreadsheetFileId, props.month, range(SUBCATEGORY_COLUMN_LETTER)),
        BB.graph.readRange(token, props.spreadsheetFileId, props.month, range(AMOUNT_COLUMN_LETTER)),
      ]);
      let openIndex = -1;
      for (let i = 0; i < categoryColumn.length; i++) {
        if (categoryColumn[i] === CATEGORY_PLACEHOLDER && subCategoryColumn[i] === SUBCATEGORY_PLACEHOLDER && !(amountColumn[i] || "").trim()) {
          openIndex = i;
          break;
        }
      }
      if (openIndex === -1) {
        logState = { kind: "error", message: "This sheet's expense log is full -- there's no open row left to record this expense." };
      } else {
        const row = LOG_RANGE_FIRST_ROW + openIndex;
        await BB.graph.writeCell(token, props.spreadsheetFileId, props.month, `${CATEGORY_COLUMN_LETTER}${row}`, category.label);
        await BB.graph.writeCell(token, props.spreadsheetFileId, props.month, `${SUBCATEGORY_COLUMN_LETTER}${row}`, subCategory);
        await BB.graph.writeCell(token, props.spreadsheetFileId, props.month, `${AMOUNT_COLUMN_LETTER}${row}`, formatAmountDigits(amount));
        await BB.graph.writeCell(token, props.spreadsheetFileId, props.month, `${WHODUNNIT_COLUMN_LETTER}${row}`, whoDunnit);
        await BB.graph.writeCell(token, props.spreadsheetFileId, props.month, `${DETAILS_COLUMN_LETTER}${row}`, details);
        logState = { kind: "idle" };
        if (props.onLoggingChanged) props.onLoggingChanged(false);
        if (props.onExpenseLogged) props.onExpenseLogged();
        return;
      }
    } catch (e) {
      logState = { kind: "error", message: e.message || "Couldn't save this expense to the spreadsheet." };
    }
    if (props.onLoggingChanged) props.onLoggingChanged(false);
    render();
  }

  function loadingFieldHtml(label, message) {
    return `<div><label class="bb-field-label">${escapeHtml(label)}</label><div style="height:4px;"></div><div class="field-loading">${escapeHtml(message)}</div></div>`;
  }

  function errorFieldHtml(label, message, retryId) {
    return `<div><label class="bb-field-label">${escapeHtml(label)}</label><div style="height:4px;"></div><div class="field-error-block"><div class="field-error">${escapeHtml(message)}</div><button class="link-button" id="${retryId}" type="button">Try again</button></div></div>`;
  }

  function labeledDropdownHtml(id, label, placeholder, options, selected, expanded, enabled) {
    return `
      <div id="${id}-wrap">
        <label class="bb-field-label">${escapeHtml(label)}</label>
        <div style="height:4px;"></div>
        ${BB.ui.dropdown.fieldHtml({ id, selected, placeholder, options, expanded, enabled })}
      </div>
    `;
  }

  function render() {
    let categoryHtml;
    if (categoryState.kind === "loading") categoryHtml = loadingFieldHtml("CATEGORY", "Loading categories...");
    else if (categoryState.kind === "error") categoryHtml = errorFieldHtml("CATEGORY", categoryState.message, "ei-category-retry");
    else categoryHtml = labeledDropdownHtml("ei-category", "CATEGORY", CATEGORY_PLACEHOLDER, categoryState.options.map((o) => o.label), category && category.label, categoryExpanded, true);

    let subCategoryHtml;
    if (subCategoryState.kind === "idle") {
      subCategoryHtml = labeledDropdownHtml("ei-subcategory", "SUB-CATEGORY", SUBCATEGORY_PLACEHOLDER, [], null, false, !!category);
    } else if (subCategoryState.kind === "loading") {
      subCategoryHtml = loadingFieldHtml("SUB-CATEGORY", "Loading Sub-Categories...");
    } else if (subCategoryState.kind === "error") {
      subCategoryHtml = errorFieldHtml("SUB-CATEGORY", subCategoryState.message, "ei-subcategory-retry");
    } else {
      subCategoryHtml = labeledDropdownHtml("ei-subcategory", "SUB-CATEGORY", SUBCATEGORY_PLACEHOLDER, subCategoryState.options, subCategory, subCategoryExpanded, true);
    }

    let whoDunnitHtml;
    if (whoDunnitState.kind === "loading") whoDunnitHtml = loadingFieldHtml("WHO DUNNIT?", "Loading spenders...");
    else if (whoDunnitState.kind === "error") whoDunnitHtml = errorFieldHtml("WHO DUNNIT?", whoDunnitState.message, "ei-whodunnit-retry");
    else whoDunnitHtml = labeledDropdownHtml("ei-whodunnit", "WHO DUNNIT?", "<Select Spender>", whoDunnitState.options, whoDunnit, whoDunnitExpanded, true);

    const overlayText = calculatorOpen ? (calculatorPhase === "error" ? "ERROR" : calculatorPhase === "editing" ? "Calculating..." : null) : null;
    const amountHtml = `
      <div id="ei-amount-wrap">
        <label class="bb-field-label">AMOUNT</label>
        <div style="height:4px;"></div>
        <div style="display:flex; align-items:center;">
          <div class="bb-field-box amount-field-row" id="ei-amount-box" style="width:157px;">
            ${
              overlayText
                ? `<span class="amount-field-overlay ${calculatorPhase === "error" ? "is-error" : ""}">${escapeHtml(overlayText)}</span>`
                : `${amount ? '<span class="amount-field-prefix">$</span>' : ""}<input class="amount-field-input" id="ei-amount-input" type="text" inputmode="numeric" placeholder="Enter Amount" value="${escapeHtml(formatAmountDisplay(amount))}" ${calculatorOpen ? "disabled" : ""}/>`
            }
          </div>
          <div style="width:6px;"></div>
          <div class="amount-calculator-icon" id="ei-calculator-icon">${BB.icons.calculator()}</div>
          <div style="width:6px;"></div>
          <div class="file-field-checkmark">${amount ? BB.icons.checkCircle() : ""}</div>
        </div>
      </div>
    `;

    const detailsHtml = `
      <div id="ei-details-wrap">
        <label class="bb-field-label">EXPENSE DETAILS</label>
        <div style="height:4px;"></div>
        <div class="file-field-row">
          <div class="file-field-box">
            <div class="bb-field-box">
              <input class="text-field-input" id="ei-details-input" type="text" placeholder="Enter notes describing expense" value="${escapeHtml(details)}"/>
            </div>
          </div>
          <div class="file-field-checkmark">${details ? BB.icons.checkCircle() : ""}</div>
        </div>
      </div>
    `;

    const filled = allFieldsFilled();
    const logButtonHtml = `<button class="bb-button ${filled ? "bb-button--green" : "bb-button--disabled"}" id="ei-log-button" type="button" ${filled && logState.kind !== "logging" ? "" : "disabled"}>LOG</button>`;

    const logErrorHtml =
      logState.kind === "error"
        ? `<div style="padding:12px 33px 0 34px; text-align:center;"><div class="field-error">${escapeHtml(logState.message)}</div><button class="link-button" id="ei-log-retry" type="button">Try again</button></div>`
        : "";

    const anyOverlay = categoryExpanded || subCategoryExpanded || whoDunnitExpanded || calculatorOpen;

    container.innerHTML = `
      <div class="frame-content">
        <div class="frame-top">
          <div style="height:16px;"></div>
          <div class="locked-info-row">
            <label class="locked-info-row__label">SPREADSHEET FILE:</label>
            <span class="locked-info-row__value">${escapeHtml(props.spreadsheetFileName)}</span>
          </div>
          <div class="locked-info-row">
            <label class="locked-info-row__label">MONTH:</label>
            <span class="locked-info-row__value">${escapeHtml(props.month)}</span>
          </div>
        </div>
        <div id="ei-scrim-root" style="position:relative; flex:0 0 auto;">
          <div style="height:11px;"></div>
          <div class="section-title" id="ei-title">EXPENSE INFORMATION</div>
          <div style="height:10px;"></div>
          <div style="padding:0 34px; display:flex; flex-direction:column; gap:16px;">
            ${categoryHtml}
            ${subCategoryHtml}
            ${amountHtml}
            ${whoDunnitHtml}
            ${detailsHtml}
          </div>
          <div style="height:20px;"></div>
          <div style="padding:0 33px 0 34px; display:flex; align-items:center;">
            <div style="display:flex; gap:12px;">
              <button class="bb-button bb-button--secondary" id="ei-back-button" type="button" style="width:95px;">BACK</button>
              <button class="bb-button bb-button--secondary" id="ei-clear-button" type="button" style="width:95px;">CLEAR</button>
            </div>
            <div style="flex:1;"></div>
            ${logButtonHtml}
          </div>
          ${logErrorHtml}
          <div style="height:40px;"></div>
          ${anyOverlay ? `<div class="ei-scrim" id="ei-scrim"></div>` : ""}
          ${categoryExpanded ? `<span class="ei-scrim-label" id="ei-scrim-category-label">CATEGORY</span>` : ""}
          ${subCategoryExpanded ? `<span class="ei-scrim-label" id="ei-scrim-subcategory-label">SUB-CATEGORY</span>` : ""}
          ${whoDunnitExpanded ? `<span class="ei-scrim-label" id="ei-scrim-whodunnit-label">WHO DUNNIT?</span>` : ""}
          ${anyOverlay ? `<span class="ei-scrim-title" id="ei-scrim-title">EXPENSE INFORMATION</span>` : ""}
          ${
            calculatorPhase !== "editing" && calculatorOpen
              ? `<div class="bb-field-box amount-field-row" id="ei-scrim-amount-box" style="position:absolute; left:34px; width:196px; z-index:41;">${
                  calculatorPhase === "error"
                    ? `<span class="amount-field-overlay is-error">ERROR</span>`
                    : `${amount ? '<span class="amount-field-prefix">$</span>' : ""}<span class="amount-field-input" style="text-align:right; flex:1;">${escapeHtml(formatAmountDisplay(amount))}</span>`
                }</div>`
              : ""
          }
          ${calculatorOpen ? renderCalculatorPopup() : ""}
        </div>
      </div>
    `;

    wireEvents();
    if (anyOverlay) positionOverlay();
  }

  function renderCalculatorPopup() {
    const isEditing = calculatorPhase === "editing";
    const secondRowHtml = isEditing
      ? `<div class="calculator-popup__second-row is-editing">
           <button class="calculator-action-button" id="calc-cancel" type="button" style="color:var(--calculator-cancel-red);">CANCEL</button>
           <span class="calculator-popup__caption">Enter formula to calculate</span>
         </div>`
      : `<div class="calculator-popup__second-row is-result">
           <button class="calculator-action-button" id="calc-cancel" type="button" style="color:var(--calculator-cancel-red);">CANCEL</button>
           <button class="calculator-action-button" id="calc-clear" type="button" style="color:var(--app-black);">CLEAR</button>
           <button class="calculator-action-button ${calculatorPhase === "error" ? "is-disabled" : ""}" id="calc-accept" type="button" style="color:${calculatorPhase === "result" ? "var(--calculator-accept-green)" : "var(--chrome-dark-gray)"};" ${calculatorPhase === "error" ? "disabled" : ""}>ACCEPT</button>
         </div>`;
    return `
      <div class="calculator-popup" id="ei-calculator-popup" style="left:34px; right:34px; width:auto;">
        <div class="calculator-popup__formula-row">
          <div class="calculator-popup__formula-box">
            <input class="calculator-popup__formula-input" id="calc-formula-input" type="text" placeholder="Ex: (5*2+4)/3" value="${escapeHtml(calculatorFormula)}"/>
          </div>
          <button class="calculator-popup__equals" id="calc-equals" type="button">=</button>
        </div>
        ${secondRowHtml}
      </div>
    `;
  }

  function positionOverlay() {
    const root = document.getElementById("ei-scrim-root");
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const offsetOf = (el) => (el ? el.getBoundingClientRect().top - rootRect.top : 0);

    const titleEl = document.getElementById("ei-scrim-title");
    if (titleEl) titleEl.style.top = `${offsetOf(document.getElementById("ei-title"))}px`;

    const categoryLabelEl = document.getElementById("ei-scrim-category-label");
    if (categoryLabelEl) categoryLabelEl.style.top = `${offsetOf(document.getElementById("ei-category-wrap"))}px`;

    const subCategoryLabelEl = document.getElementById("ei-scrim-subcategory-label");
    if (subCategoryLabelEl) subCategoryLabelEl.style.top = `${offsetOf(document.getElementById("ei-subcategory-wrap"))}px`;

    const whoDunnitLabelEl = document.getElementById("ei-scrim-whodunnit-label");
    if (whoDunnitLabelEl) whoDunnitLabelEl.style.top = `${offsetOf(document.getElementById("ei-whodunnit-wrap"))}px`;

    const amountBox = document.getElementById("ei-amount-box");
    const scrimAmountBox = document.getElementById("ei-scrim-amount-box");
    if (scrimAmountBox && amountBox) scrimAmountBox.style.top = `${offsetOf(amountBox)}px`;

    const calcPopup = document.getElementById("ei-calculator-popup");
    if (calcPopup && amountBox) {
      const top = Math.max(0, offsetOf(amountBox) - CALCULATOR_BOX_HEIGHT);
      calcPopup.style.top = `${top}px`;
    }
  }

  function handleOutsideClick(e) {
    let changed = false;
    if (categoryExpanded && !e.target.closest('[data-dropdown-id="ei-category"]')) {
      categoryExpanded = false;
      changed = true;
    }
    if (subCategoryExpanded && !e.target.closest('[data-dropdown-id="ei-subcategory"]')) {
      subCategoryExpanded = false;
      changed = true;
    }
    if (whoDunnitExpanded && !e.target.closest('[data-dropdown-id="ei-whodunnit"]')) {
      whoDunnitExpanded = false;
      changed = true;
    }
    if (changed) render();
  }

  function wireEvents() {
    document.getElementById("ei-back-button").addEventListener("click", () => props.onBack && props.onBack());
    document.getElementById("ei-clear-button").addEventListener("click", clearAll);
    const logButton = document.getElementById("ei-log-button");
    if (logButton) logButton.addEventListener("click", logExpense);
    const logRetry = document.getElementById("ei-log-retry");
    if (logRetry) logRetry.addEventListener("click", logExpense);

    const categoryRetry = document.getElementById("ei-category-retry");
    if (categoryRetry) categoryRetry.addEventListener("click", loadCategories);
    const subCategoryRetry = document.getElementById("ei-subcategory-retry");
    if (subCategoryRetry) subCategoryRetry.addEventListener("click", loadSubCategories);
    const whoDunnitRetry = document.getElementById("ei-whodunnit-retry");
    if (whoDunnitRetry) whoDunnitRetry.addEventListener("click", loadWhoDunnit);

    if (categoryState.kind === "loaded") {
      BB.ui.dropdown.wire({
        id: "ei-category",
        options: categoryState.options.map((o) => o.label),
        expanded: categoryExpanded,
        onToggle: (v) => {
          categoryExpanded = v;
          render();
        },
        onSelect: (pickedLabel) => {
          const picked = categoryState.options.find((o) => o.label === pickedLabel);
          if (picked && (!category || picked.column !== category.column)) {
            subCategory = null;
            category = picked;
            categoryExpanded = false;
            loadSubCategories();
            return;
          }
          category = picked;
          categoryExpanded = false;
          render();
        },
      });
    }
    if (subCategoryState.kind === "loaded") {
      BB.ui.dropdown.wire({
        id: "ei-subcategory",
        options: subCategoryState.options,
        expanded: subCategoryExpanded,
        onToggle: (v) => {
          subCategoryExpanded = v;
          render();
        },
        onSelect: (v) => {
          subCategory = v;
          subCategoryExpanded = false;
          render();
        },
      });
    }
    if (whoDunnitState.kind === "loaded") {
      BB.ui.dropdown.wire({
        id: "ei-whodunnit",
        options: whoDunnitState.options,
        expanded: whoDunnitExpanded,
        onToggle: (v) => {
          whoDunnitExpanded = v;
          render();
        },
        onSelect: (v) => {
          whoDunnit = v;
          whoDunnitExpanded = false;
          render();
        },
      });
    }

    const amountInput = document.getElementById("ei-amount-input");
    if (amountInput) {
      amountInput.addEventListener("input", (e) => {
        amount = e.target.value.replace(/\D/g, "").slice(0, MAX_AMOUNT_DIGITS);
        render();
        const el = document.getElementById("ei-amount-input");
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      });
    }
    const calculatorIcon = document.getElementById("ei-calculator-icon");
    if (calculatorIcon) calculatorIcon.addEventListener("click", openCalculator);

    const detailsInput = document.getElementById("ei-details-input");
    if (detailsInput) {
      detailsInput.addEventListener("input", (e) => {
        details = e.target.value;
      });
    }

    if (calculatorOpen) {
      const formulaInput = document.getElementById("calc-formula-input");
      if (formulaInput) {
        formulaInput.addEventListener("input", (e) => {
          calculatorFormula = e.target.value;
        });
        formulaInput.addEventListener("focus", () => {
          if (calculatorPhase !== "editing") {
            calculatorPhase = "editing";
            render();
          }
        });
        formulaInput.focus();
        formulaInput.setSelectionRange(formulaInput.value.length, formulaInput.value.length);
      }
      const equalsButton = document.getElementById("calc-equals");
      if (equalsButton) equalsButton.addEventListener("click", evaluateCalculatorFormula);
      const cancelButton = document.getElementById("calc-cancel");
      if (cancelButton) cancelButton.addEventListener("click", cancelCalculator);
      const clearButton = document.getElementById("calc-clear");
      if (clearButton) clearButton.addEventListener("click", clearCalculator);
      const acceptButton = document.getElementById("calc-accept");
      if (acceptButton) acceptButton.addEventListener("click", closeCalculator);
    }

    // Always cleared first: a previous render's listener may still be
    // pending (e.g. a dropdown was closed by picking an option rather than
    // by an outside click), and leaving it registered would let it fire
    // against stale/detached elements on some later, unrelated click.
    document.removeEventListener("click", handleOutsideClick);
    if (categoryExpanded || subCategoryExpanded || whoDunnitExpanded) {
      document.addEventListener("click", handleOutsideClick);
    }
  }

  /** Mounts this screen. `p`: { spreadsheetFileName, spreadsheetFileId, month, onBack, onExpenseLogged, onLoggingChanged }. */
  function mount(containerEl, p) {
    container = containerEl;
    props = p || {};
    category = null;
    subCategory = null;
    amount = "";
    whoDunnit = null;
    details = "";
    categoryState = { kind: "loading" };
    subCategoryState = { kind: "idle" };
    whoDunnitState = { kind: "loading" };
    categoryExpanded = false;
    subCategoryExpanded = false;
    whoDunnitExpanded = false;
    logState = { kind: "idle" };
    calculatorOpen = false;
    calculatorFormula = "";
    calculatorPhase = "editing";
    render();
    loadCategories();
    loadWhoDunnit();
  }

  return { mount };
})();
