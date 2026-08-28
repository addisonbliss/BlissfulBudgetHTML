/*
  Minimal Microsoft Graph REST client, mirroring the native app's
  data/GraphApiClient.kt call-for-call: browse OneDrive folders, search
  filenames recursively, list/read/write workbook cells. Plain fetch()
  rather than a generated SDK, same reasoning as the native version -- only
  a handful of endpoints are in play.
*/
window.BB = window.BB || {};
BB.graph = (() => {
  const BASE_URL = "https://graph.microsoft.com/v1.0";

  async function get(url, accessToken) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Graph API error ${response.status}: ${body}`);
    }
    return response.json();
  }

  async function patch(url, accessToken, body) {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Graph API error ${response.status}: ${errorBody}`);
    }
  }

  function isSpreadsheetName(name) {
    const lower = name.toLowerCase();
    return lower.endsWith(".xlsx") || lower.endsWith(".xlsm");
  }

  /**
   * Lists the contents of a OneDrive folder -- its subfolders, and any
   * .xlsx/.xlsm files directly inside it. Pass folderId = null for the
   * root of the user's OneDrive. Returns { folders: [{id,name}],
   * files: [{id,name,webUrl}] }, both sorted alphabetically.
   */
  async function listFolder(accessToken, folderId) {
    const path = folderId
      ? `${BASE_URL}/me/drive/items/${folderId}/children`
      : `${BASE_URL}/me/drive/root/children`;
    const json = await get(`${path}?$select=id,name,file,folder,webUrl&$top=200`, accessToken);
    const folders = [];
    const files = [];
    for (const item of json.value) {
      if (item.folder) {
        folders.push({ id: item.id, name: item.name });
      } else if (item.file && isSpreadsheetName(item.name)) {
        files.push({ id: item.id, name: item.name, webUrl: item.webUrl });
      }
    }
    const byName = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    folders.sort(byName);
    files.sort(byName);
    return { folders, files };
  }

  /**
   * Finds every .xlsx/.xlsm file whose name contains query (case-
   * insensitive), searching folderId (or the OneDrive root, if null) and
   * all of its subfolders -- Graph's own search endpoint is already
   * recursive over the item's subtree. Graph's search also matches file
   * *content*, not just the name, so results are filtered down to a real
   * name-contains check here.
   */
  async function searchFiles(accessToken, folderId, query) {
    const root = folderId ? `items/${folderId}` : "root";
    const encodedQuery = encodeURIComponent(query.replace(/'/g, "''"));
    const json = await get(
      `${BASE_URL}/me/drive/${root}/search(q='${encodedQuery}')?$select=id,name,file,folder,webUrl&$top=200`,
      accessToken
    );
    const files = (json.value || [])
      .filter((item) => item.file && isSpreadsheetName(item.name) && item.name.toLowerCase().includes(query.toLowerCase()))
      .map((item) => ({ id: item.id, name: item.name, webUrl: item.webUrl }));
    files.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    return files;
  }

  async function listWorksheetNames(accessToken, itemId) {
    const json = await get(
      `${BASE_URL}/me/drive/items/${itemId}/workbook/worksheets?$select=name`,
      accessToken
    );
    return json.value.map((sheet) => sheet.name);
  }

  /**
   * Reads a rectangular cell range (e.g. "CA8:CL8" or "CD9:CD19") from a
   * named sheet and returns every cell's value as a string, flattened
   * row-major. Blank cells come back as empty strings rather than being
   * dropped, since callers that correlate a value back to its original
   * column (e.g. category options) rely on that positioning.
   */
  async function readRange(accessToken, itemId, sheetName, address) {
    const encodedSheet = encodeURIComponent(sheetName);
    const json = await get(
      `${BASE_URL}/me/drive/items/${itemId}/workbook/worksheets('${encodedSheet}')/range(address='${address}')?$select=values`,
      accessToken
    );
    const result = [];
    for (const row of json.values) {
      for (const cell of row) {
        result.push(cell === null || cell === undefined ? "" : String(cell));
      }
    }
    return result;
  }

  /**
   * Writes a single cell (e.g. "C305") on a named sheet. Deliberately a
   * single-cell write rather than a wider range -- writing a multi-column
   * range would replace every cell in that range, clobbering neighboring
   * columns this app has no business touching.
   */
  async function writeCell(accessToken, itemId, sheetName, address, value) {
    const encodedSheet = encodeURIComponent(sheetName);
    await patch(
      `${BASE_URL}/me/drive/items/${itemId}/workbook/worksheets('${encodedSheet}')/range(address='${address}')`,
      accessToken,
      { values: [[value]] }
    );
  }

  return { listFolder, searchFiles, listWorksheetNames, readRange, writeCell };
})();
