/*
  Frame 3 (dropdown closed, nothing chosen), Frame 4 (dropdown expanded),
  Frame 5 (dropdown closed, month chosen) -- mirrors the native app's
  ui/screens/SelectMonthScreen.kt.

  The dropdown is populated with the real sheet names read from the chosen
  workbook via Microsoft Graph. `cachedMonths` (owned by app.js, which
  outlives this screen across a BACK-then-forward round trip) is used
  immediately instead of re-fetching when present; a fresh load is
  reported back via `onMonthsLoaded` so app.js can cache it for next time.
*/
window.BB = window.BB || {};
BB.screens = BB.screens || {};
BB.screens.selectMonth = (() => {
  const CALENDAR_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const FIELD_ID = "sm-month";

  let container = null;
  let props = {};
  let dropdownExpanded = false;
  let selectedMonth = null;
  let sheetsState = { kind: "loading" }; // loading | loaded({names}) | error({message})
  // See expenseInformation.js's own scrollLocked for why this is tracked
  // centrally in render() rather than at each open/close/select call site.
  let scrollLocked = false;

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Keeps only sheets whose name exactly matches a 3-letter month
  // abbreviation (case-insensitive), ordered Jan-Dec regardless of the
  // sheets' original order, skipping any month that isn't present.
  function monthSheetNamesInCalendarOrder(sheetNames) {
    return CALENDAR_MONTHS.map((abbr) => sheetNames.find((n) => n.toLowerCase() === abbr.toLowerCase())).filter(
      (n) => n !== undefined
    );
  }

  async function loadMonths() {
    if (props.cachedMonths) {
      sheetsState = { kind: "loaded", names: props.cachedMonths };
      render();
      return;
    }
    sheetsState = { kind: "loading" };
    render();
    try {
      const token = await BB.auth.getAccessToken();
      const names = await BB.graph.listWorksheetNames(token, props.spreadsheetFileId);
      const months = monthSheetNamesInCalendarOrder(names);
      if (props.onMonthsLoaded) props.onMonthsLoaded(months);
      sheetsState = { kind: "loaded", names: months };
    } catch (e) {
      sheetsState = { kind: "error", message: e.message || "Couldn't read sheet names from this file." };
    }
    render();
  }

  function render() {
    const isFilled = !!selectedMonth;

    let fieldHtml;
    if (sheetsState.kind === "loading") {
      fieldHtml = `<div class="field-loading">Loading available months...</div>`;
    } else if (sheetsState.kind === "error") {
      fieldHtml = `<div class="field-error-block"><div class="field-error">${escapeHtml(sheetsState.message)}</div><button class="link-button" id="sm-retry" type="button">Try again</button></div>`;
    } else {
      fieldHtml = BB.ui.dropdown.fieldHtml({
        id: FIELD_ID,
        selected: selectedMonth,
        placeholder: "<Month>",
        options: sheetsState.names,
        expanded: dropdownExpanded,
        reserveCheckmarkSlot: false,
        width: 169,
      });
    }

    const disabledLook = dropdownExpanded;
    if (dropdownExpanded && !scrollLocked) {
      BB.ui.scrollLock.lock();
      scrollLocked = true;
    } else if (!dropdownExpanded && scrollLocked) {
      BB.ui.scrollLock.unlock();
      scrollLocked = false;
    }

    container.innerHTML = `
      <div class="frame-content">
        <div class="frame-top-region">
          <div class="frame-top">
            <div style="height:16px;"></div>
            <div class="locked-info-row">
              <label class="locked-info-row__label">SPREADSHEET FILE:</label>
              <span class="locked-info-row__value">${escapeHtml(props.spreadsheetFileName)}</span>
            </div>
          </div>
          <div class="frame-top-spacer"></div>
        </div>
        <div class="frame-bottom-group">
          <label class="bb-field-label" style="display:block;">CHOOSE MONTH:</label>
          <div style="height:4px;"></div>
          <div>${fieldHtml}</div>
          <div style="height:43px;"></div>
          <div style="display:flex; justify-content:flex-end; gap:20px; padding-right:33px;">
            <button class="bb-button ${disabledLook ? "bb-button--disabled" : "bb-button--secondary"}" id="sm-back-button" type="button" ${disabledLook ? "disabled" : ""}>BACK</button>
            ${
              isFilled
                ? `<button class="bb-button ${disabledLook ? "bb-button--disabled" : "bb-button--next"}" id="sm-next-button" type="button" ${disabledLook ? "disabled" : ""}>NEXT</button>`
                : `<button class="bb-button bb-button--disabled" type="button" disabled>NEXT</button>`
            }
          </div>
        </div>
      </div>
    `;

    document.getElementById("sm-back-button").addEventListener("click", () => {
      if (!dropdownExpanded && props.onBack) props.onBack();
    });
    const nextButton = document.getElementById("sm-next-button");
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (!dropdownExpanded && props.onNext) props.onNext();
      });
    }
    const retry = document.getElementById("sm-retry");
    if (retry) retry.addEventListener("click", loadMonths);

    if (sheetsState.kind === "loaded") {
      BB.ui.dropdown.wire({
        id: FIELD_ID,
        options: sheetsState.names,
        expanded: dropdownExpanded,
        onToggle: (value) => {
          dropdownExpanded = value;
          render();
        },
        onSelect: (month) => {
          selectedMonth = month;
          dropdownExpanded = false;
          if (props.onSelectMonth) props.onSelectMonth(month);
          render();
        },
      });
    }

    // Closes the popup on any click outside it -- mirrors Compose Popup's
    // own onDismissRequest behavior for a tap outside the dropdown. Always
    // cleared first: a previous render's listener may still be pending
    // (e.g. the dropdown was closed by picking an option rather than by an
    // outside click), and leaving it registered would let it fire against
    // a stale/detached `container` on some later, unrelated click.
    document.removeEventListener("click", handleOutsideClick);
    if (dropdownExpanded) {
      document.addEventListener("click", handleOutsideClick);
    }
  }

  function handleOutsideClick(e) {
    if (e.target.closest(`[data-dropdown-id="${FIELD_ID}"]`)) return;
    dropdownExpanded = false;
    render();
  }

  /** Mounts this screen. `p`: { spreadsheetFileName, spreadsheetFileId, selectedMonth, onSelectMonth, onBack, onNext, cachedMonths, onMonthsLoaded }. */
  function mount(containerEl, p) {
    // Defensive: the dropdown should never still be open when this screen
    // goes away (BACK/NEXT are disabled while it is), but a leaked lock
    // would silently break scrolling on every screen after this one.
    if (scrollLocked) {
      BB.ui.scrollLock.unlock();
      scrollLocked = false;
    }
    container = containerEl;
    props = p || {};
    dropdownExpanded = false;
    selectedMonth = props.selectedMonth || null;
    sheetsState = { kind: "loading" };
    render();
    loadMonths();
  }

  return { mount };
})();
