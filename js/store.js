/*
  localStorage-backed persistence, mirroring the native app's
  data/OneDriveLocationStore.kt and data/MostRecentFileStore.kt. Neither is
  scoped per-account, same reasoning as the native versions: a freshly
  signed-in account with nothing cached yet is detected by the caller
  (checking whether an account is already cached before honoring these),
  not by these stores clearing themselves.
*/
window.BB = window.BB || {};
BB.store = (() => {
  const FOLDER_STACK_KEY = "bb_onedrive_folder_stack";
  const MOST_RECENT_FILE_KEY = "bb_most_recent_file";

  function saveFolderStack(stack) {
    try {
      localStorage.setItem(FOLDER_STACK_KEY, JSON.stringify(stack));
    } catch (e) {
      // Storage can be unavailable (private browsing, quota) -- losing the
      // remembered location isn't fatal, so fail silently like a cache miss.
    }
  }

  /** The last-saved folder stack (array of {id, name}), or null if none was ever saved (or it failed to parse). */
  function loadFolderStack() {
    try {
      const raw = localStorage.getItem(FOLDER_STACK_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function saveMostRecentFile(file) {
    try {
      localStorage.setItem(
        MOST_RECENT_FILE_KEY,
        JSON.stringify({ id: file.id, name: file.name, webUrl: file.webUrl })
      );
    } catch (e) {
      // See saveFolderStack -- non-fatal.
    }
  }

  /** The last-saved file ({id, name, webUrl}), or null if none was ever saved (or it failed to parse). */
  function loadMostRecentFile() {
    try {
      const raw = localStorage.getItem(MOST_RECENT_FILE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.id && parsed.name ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  return { saveFolderStack, loadFolderStack, saveMostRecentFile, loadMostRecentFile };
})();
