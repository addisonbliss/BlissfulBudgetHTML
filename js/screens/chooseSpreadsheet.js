/*
  Frame 1 (empty) / Frame 2 (file selected), mirroring the native app's
  ui/screens/ChooseSpreadsheetScreen.kt -- same OneDrive picker, including
  the "Most Recent File:" shortcut and recursive filename search added in
  later native rounds.
*/
window.BB = window.BB || {};
BB.screens = BB.screens || {};
BB.screens.chooseSpreadsheet = (() => {
  const MAX_VISIBLE_ROWS = 8;

  // ---- Screen-level state ----------------------------------------------
  let container = null;
  let onCallbacks = {};
  let selectedFile = null; // {id, name, webUrl}

  // ---- Dialog-level state ------------------------------------------------
  let folderStack = [{ id: null, name: "OneDrive" }];
  let signedInEmail = null;
  let mostRecentFile = null;
  let pickerState = { kind: "hidden" }; // hidden | loading | loaded({folders,files}) | error(message)
  let searchQuery = "";
  let searchState = { kind: "inactive" }; // inactive | loading | loaded(files) | error(message)

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ---- Screen body (Frame 1/2) --------------------------------------------
  function renderScreen() {
    const isFilled = !!selectedFile;
    container.innerHTML = `
      <div class="frame-content">
        <div class="frame-top-region">
          <div class="frame-top">
            <div style="font-family:var(--font-family); font-weight:700; font-style:italic; font-size:var(--header-title-size); color:var(--app-black); text-align:center;">WELCOME!</div>
            <div style="height:12px;"></div>
            <div style="font-family:var(--font-family); font-weight:700; font-style:italic; font-size:var(--section-title-size); color:var(--app-black); text-align:center;">TO GET STARTED<br/>CLICK THE FOLDER BELOW</div>
          </div>
          <div class="frame-top-spacer"></div>
        </div>
        <div class="frame-bottom-group">
          <label class="bb-field-label">CHOOSE SPREADSHEET FILE:</label>
          <div class="file-field-row">
            <div class="file-field-box">
              <div class="bb-field-box" id="cs-file-field-box" role="button" tabindex="0" aria-label="Choose spreadsheet file">
                ${
                  isFilled
                    ? `<span class="bb-field-value" style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(selectedFile.name)}</span>`
                    : `<span class="bb-field-placeholder" style="flex:1;">OneDrive File</span>`
                }
                <div style="width:20px; height:20px; flex:0 0 auto;">${BB.icons.folder()}</div>
              </div>
            </div>
            <div class="file-field-checkmark">${isFilled ? BB.icons.checkCircle() : ""}</div>
          </div>
          <div style="height:43px;"></div>
          <div style="display:flex; justify-content:flex-end; gap:20px; padding-right:33px;">
            ${
              isFilled
                ? `<button class="bb-button bb-button--secondary" id="cs-clear-button" type="button">CLEAR</button>
                   <button class="bb-button bb-button--next" id="cs-next-button" type="button">NEXT</button>`
                : `<button class="bb-button bb-button--disabled" type="button" disabled>NEXT</button>`
            }
          </div>
        </div>
      </div>
    `;
    const fileFieldBox = document.getElementById("cs-file-field-box");
    fileFieldBox.addEventListener("click", openPicker);
    fileFieldBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    });
    const clearButton = document.getElementById("cs-clear-button");
    if (clearButton) clearButton.addEventListener("click", handleClear);
    const nextButton = document.getElementById("cs-next-button");
    if (nextButton) nextButton.addEventListener("click", () => onCallbacks.onNext && onCallbacks.onNext());
  }

  function handleClear() {
    selectedFile = null;
    if (onCallbacks.onClear) onCallbacks.onClear();
    renderScreen();
  }

  // ---- OneDrive picker dialog ---------------------------------------------
  const backdrop = () => document.getElementById("onedrive-dialog-backdrop");
  const card = () => document.getElementById("onedrive-dialog-card");

  async function openPicker() {
    // A cached account already existing means this open won't need an
    // interactive sign-in -- safe to jump back to wherever the user last
    // picked a file from. A freshly signed-in account (no cached account
    // yet) skips this, since that remembered folder could belong to an
    // entirely different account.
    const hasCachedAccount = BB.auth.currentAccountEmail() !== null;
    const rememberedStack = hasCachedAccount ? BB.store.loadFolderStack() : null;
    mostRecentFile = hasCachedAccount ? BB.store.loadMostRecentFile() : null;
    searchState = { kind: "inactive" };
    searchQuery = "";
    folderStack = rememberedStack || [{ id: null, name: "OneDrive" }];
    backdrop().classList.add("is-open");
    BB.ui.scrollLock.lock();
    await loadFolder(folderStack[folderStack.length - 1].id);
  }

  function closeDialog() {
    backdrop().classList.remove("is-open");
    pickerState = { kind: "hidden" };
    BB.ui.scrollLock.unlock();
  }

  async function loadFolder(folderId) {
    pickerState = { kind: "loading" };
    renderDialog();
    try {
      const token = await BB.auth.getAccessToken();
      signedInEmail = BB.auth.currentAccountEmail();
      const listing = await BB.graph.listFolder(token, folderId);
      pickerState = { kind: "loaded", listing };
    } catch (e) {
      pickerState = { kind: "error", message: e.message || "Something went wrong signing in." };
    }
    renderDialog();
  }

  async function runSearch() {
    const query = searchQuery;
    if (!query.trim()) return;
    document.activeElement && document.activeElement.blur(); // dismiss the on-screen keyboard
    searchState = { kind: "loading" };
    renderDialog();
    try {
      const token = await BB.auth.getAccessToken();
      const files = await BB.graph.searchFiles(token, folderStack[folderStack.length - 1].id, query);
      searchState = { kind: "loaded", files };
    } catch (e) {
      searchState = { kind: "error", message: e.message || "Something went wrong searching." };
    }
    renderDialog();
  }

  function exitSearch() {
    searchState = { kind: "inactive" };
    searchQuery = "";
    renderDialog();
  }

  function handleFileChosen(file) {
    // Remembers the file itself (for "Most Recent File:") and, for non-
    // search picks, the folder it came from (so the picker can jump
    // straight back there next time).
    BB.store.saveMostRecentFile(file);
    if (searchState.kind === "inactive") {
      BB.store.saveFolderStack(folderStack);
    }
    selectedFile = file;
    closeDialog();
    renderScreen();
    if (onCallbacks.onFileChosen) onCallbacks.onFileChosen(file);
  }

  function handleOpenFolder(folder) {
    folderStack = [...folderStack, { id: folder.id, name: folder.name }];
    loadFolder(folder.id);
  }

  function handleNavigateTo(index) {
    folderStack = folderStack.slice(0, index + 1);
    loadFolder(folderStack[folderStack.length - 1].id);
  }

  async function handleSignOut() {
    await BB.auth.signOut();
    // signOut() redirects away; nothing after this runs.
  }

  function entryRowHtml(icon, label, colorClass, dataAttrs) {
    return `<button class="entry-row" ${dataAttrs}>
      <div class="entry-row__icon">${icon}</div>
      <span class="entry-row__label ${colorClass}">${escapeHtml(label)}</span>
    </button>`;
  }

  function renderEntryList(rows, emptyMessage) {
    if (rows.length === 0) {
      return `<div class="entry-status-message">${escapeHtml(emptyMessage)}</div>`;
    }
    const rowsHtml = rows
      .map((row, index) => {
        const isFolder = row.type === "folder";
        const html = entryRowHtml(
          isFolder ? BB.icons.folder() : BB.icons.spreadsheetFile(),
          row.name,
          isFolder ? "entry-row__label--folder" : "entry-row__label--file",
          `data-index="${index}"`
        );
        const divider = index < rows.length - 1 ? '<div class="bb-divider"></div>' : "";
        return html + divider;
      })
      .join("");
    return `<div class="entry-list">${rowsHtml}</div>`;
  }

  function wireEntryRows(rows, wrapperId, onFolder, onFile) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    wrapper.querySelectorAll(".entry-row").forEach((el) => {
      const row = rows[Number(el.dataset.index)];
      el.addEventListener("click", () => {
        if (row.type === "folder") onFolder(row.data);
        else onFile(row.data);
      });
    });
  }

  function renderDialog() {
    const isSearching = searchState.kind !== "inactive";

    const mostRecentHtml = mostRecentFile
      ? entryRowHtml(BB.icons.spreadsheetFile(), mostRecentFile.name, "entry-row__label--file", 'id="cs-most-recent-row"')
      : `<div class="most-recent-empty">No files just yet!</div>`;

    const breadcrumbHtml = isSearching
      ? `<div class="breadcrumb-row">
          <div class="breadcrumb-arrow-slot"><button id="cs-exit-search" type="button">${BB.icons.arrowLeft()}</button></div>
          <span class="search-results-label">Search Results</span>
        </div>`
      : `<div class="breadcrumb-row">
          <div class="breadcrumb-arrow-slot">
            ${
              folderStack.length > 1
                ? `<button id="cs-up-folder" type="button">${BB.icons.arrowLeft()}</button>`
                : ""
            }
          </div>
          ${folderStack
            .map((entry, index) => {
              const isCurrent = index === folderStack.length - 1;
              const segment = isCurrent
                ? `<span class="breadcrumb-segment is-current">${escapeHtml(entry.name)}</span>`
                : `<button class="breadcrumb-segment" data-index="${index}" type="button">${escapeHtml(entry.name)}</button>`;
              const sep = isCurrent ? "" : `<span class="breadcrumb-sep">/</span>`;
              return segment + sep;
            })
            .join("")}
        </div>`;

    let listAreaHtml;
    if (isSearching) {
      if (searchState.kind === "loading") {
        listAreaHtml = `<div class="entry-status-message">Loading…</div>`;
      } else if (searchState.kind === "error") {
        listAreaHtml = `<div class="entry-empty-message">${escapeHtml(searchState.message)}<br/><button class="link-button" id="cs-retry-search">Try again</button></div>`;
      } else {
        const rows = searchState.files.map((file) => ({ type: "file", name: file.name, data: file }));
        listAreaHtml = renderEntryList(rows, "No spreadsheet files matched that search.");
      }
    } else if (pickerState.kind === "loading") {
      listAreaHtml = `<div class="entry-status-message">Loading…</div>`;
    } else if (pickerState.kind === "error") {
      listAreaHtml = `<div class="entry-empty-message">${escapeHtml(pickerState.message)}<br/><button class="link-button" id="cs-retry">Try again</button></div>`;
    } else if (pickerState.kind === "loaded") {
      const rows = [
        ...pickerState.listing.folders.map((f) => ({ type: "folder", name: f.name, data: f })),
        ...pickerState.listing.files.map((f) => ({ type: "file", name: f.name, data: f })),
      ];
      listAreaHtml = renderEntryList(rows, "This folder is empty — no subfolders or Excel files here.");
    } else {
      listAreaHtml = "";
    }

    card().innerHTML = `
      <div class="bb-dialog-title">CHOOSE A OneDrive</div>
      <div class="bb-dialog-title">SPREADSHEET FILE</div>
      <div class="bb-dialog-gap-8"></div>
      <div class="most-recent-label">Most Recent File:</div>
      <div id="cs-most-recent-wrap">${mostRecentHtml}</div>
      <div class="bb-divider"></div>
      <div class="bb-dialog-gap-8"></div>
      <div class="search-bar">
        <input class="search-bar__input" id="cs-search-input" type="text" enterkeyhint="search" placeholder="Search this folder" value="${escapeHtml(searchQuery)}" />
        <button class="search-bar__submit" id="cs-search-submit" type="button">${BB.icons.arrowRight()}</button>
      </div>
      <div class="bb-dialog-gap-8"></div>
      ${breadcrumbHtml}
      <div class="bb-dialog-gap-8"></div>
      <div class="entry-list-wrap" id="cs-entry-list-wrap">${listAreaHtml}</div>
      <div class="bb-dialog-footer">
        <span class="bb-dialog-footer__signed-in">${signedInEmail ? `Signed in as ${escapeHtml(signedInEmail)}` : ""}</span>
        <div class="bb-dialog-footer__buttons">
          ${signedInEmail ? `<button class="bb-button bb-button--secondary" id="cs-sign-out" type="button">SIGN OUT</button>` : "<span></span>"}
          <button class="bb-button bb-button--secondary" id="cs-cancel" type="button">CANCEL</button>
        </div>
      </div>
    `;

    // Wire events -----------------------------------------------------------
    if (mostRecentFile) {
      document.getElementById("cs-most-recent-row").addEventListener("click", () => handleFileChosen(mostRecentFile));
    }
    const searchInput = document.getElementById("cs-search-input");
    searchInput.addEventListener("input", (e) => (searchQuery = e.target.value));
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runSearch();
    });
    document.getElementById("cs-search-submit").addEventListener("click", runSearch);

    if (isSearching) {
      document.getElementById("cs-exit-search").addEventListener("click", exitSearch);
    } else {
      const upFolder = document.getElementById("cs-up-folder");
      if (upFolder) upFolder.addEventListener("click", () => handleNavigateTo(folderStack.length - 2));
      card()
        .querySelectorAll(".breadcrumb-segment[data-index]")
        .forEach((el) => el.addEventListener("click", () => handleNavigateTo(Number(el.dataset.index))));
    }

    if (isSearching && searchState.kind === "loaded") {
      wireEntryRows(
        searchState.files.map((f) => ({ type: "file", data: f })),
        "cs-entry-list-wrap",
        () => {},
        handleFileChosen
      );
    } else if (!isSearching && pickerState.kind === "loaded") {
      const rows = [
        ...pickerState.listing.folders.map((f) => ({ type: "folder", data: f })),
        ...pickerState.listing.files.map((f) => ({ type: "file", data: f })),
      ];
      wireEntryRows(rows, "cs-entry-list-wrap", handleOpenFolder, handleFileChosen);
    }

    const retry = document.getElementById("cs-retry");
    if (retry) retry.addEventListener("click", () => loadFolder(folderStack[folderStack.length - 1].id));
    const retrySearch = document.getElementById("cs-retry-search");
    if (retrySearch) retrySearch.addEventListener("click", runSearch);

    const signOutButton = document.getElementById("cs-sign-out");
    if (signOutButton) signOutButton.addEventListener("click", handleSignOut);
    document.getElementById("cs-cancel").addEventListener("click", closeDialog);
  }

  /** Mounts this screen into `containerEl`. `callbacks`: { onNext, onClear, onFileChosen }. */
  function mount(containerEl, callbacks) {
    container = containerEl;
    onCallbacks = callbacks || {};
    renderScreen();
  }

  function getSelectedFile() {
    return selectedFile;
  }

  return { mount, getSelectedFile };
})();
