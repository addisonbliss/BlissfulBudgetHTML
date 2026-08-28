/*
  Shared markup/wiring for the "Menu 2" labeled dropdown field (Category,
  Sub-Category, Who Dunnit?, and Select Month's own Month field), mirroring
  LabeledDropdownField/MonthDropdownField in
  ui/components/BlissfulBudgetComponents.kt. Factored out here because
  ExpenseInformationScreen alone needs three of these with identical
  behavior -- only the options/selection/enabled state differ per field.
*/
window.BB = window.BB || {};
BB.ui = window.BB.ui || {};
BB.ui.dropdown = (() => {
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * `reserveCheckmarkSlot` (default true) matches LabeledDropdownField,
   * which always reserves the trailing checkmark slot whether or not it's
   * filled (Category/Sub-Category/Who Dunnit?). Pass false for
   * MonthDropdownField's own behavior, where the checkmark (and the extra
   * width it takes) only appears once a month is actually selected.
   * `width` (px) pins the field to a fixed width (Month); omitted, it
   * fills its container's width (Category/Sub-Category/Who Dunnit?).
   */
  function fieldHtml({ id, selected, placeholder, options, expanded, enabled = true, reserveCheckmarkSlot = true, width }) {
    const disabledClass = enabled ? "" : "is-disabled";
    const chevronColor = enabled ? "#000000" : "#b5b5b5";
    const widthStyle = width ? `width:${width}px;` : "";
    const label = selected || placeholder;
    const checkmark = selected ? BB.icons.checkCircle() : "";
    const checkmarkSlotHtml = reserveCheckmarkSlot
      ? `<div class="file-field-checkmark">${checkmark}</div>`
      : selected
        ? `<div class="file-field-checkmark" style="margin-left:6px;">${checkmark}</div>`
        : "";

    return `
      <div class="file-field-row">
        <div class="dropdown-field-wrap ${width ? "" : "file-field-box"}" style="${widthStyle}" data-dropdown-id="${id}">
          <div class="bb-field-box dropdown-field-box ${disabledClass}" id="${id}-trigger" style="${widthStyle}">
            <span class="bb-field-value" style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(label)}</span>
            <div style="width:18px; height:18px; flex:0 0 auto;">${expanded ? BB.icons.chevronUp(chevronColor) : BB.icons.chevronDown(chevronColor)}</div>
          </div>
          ${expanded && options.length > 0 ? popupHtml(id, options) : ""}
        </div>
        ${checkmarkSlotHtml}
      </div>
    `;
  }

  function popupHtml(id, options) {
    const rows = options
      .map((opt, i) => `<button class="dropdown-option-row" type="button" data-index="${i}">${escapeHtml(opt)}</button>`)
      .join("");
    return `<div class="dropdown-popup" id="${id}-popup"><div class="dropdown-popup__list">${rows}</div></div>`;
  }

  /** Wires the trigger's click (toggles via onToggle) and, if expanded, each option row's click (via onSelect). */
  function wire({ id, options, enabled = true, expanded, onToggle, onSelect }) {
    const trigger = document.getElementById(`${id}-trigger`);
    if (trigger && enabled) {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        onToggle(!expanded);
      });
    }
    if (expanded) {
      const popup = document.getElementById(`${id}-popup`);
      if (popup) {
        popup.querySelectorAll(".dropdown-option-row").forEach((el) => {
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            onSelect(options[Number(el.dataset.index)]);
          });
        });
      }
    }
  }

  return { fieldHtml, wire, escapeHtml };
})();
