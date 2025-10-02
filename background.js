/**
 * Single Tab Manager - Background Service Worker
 * 同じURLパターンに一致するタブを1つだけに制御
 */

const STORAGE_KEY = "urlPatterns";
const LOG_PREFIX = "[Single Tab Manager]";

/**
 * 設定から正規表現パターンを取得
 * @returns {Promise<RegExp[]>} 有効な正規表現パターンの配列
 */
const getUrlPatterns = async () => {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    const patternsText = result[STORAGE_KEY] || "";

    if (!patternsText.trim()) {
      console.log(LOG_PREFIX, "No patterns configured");
      return [];
    }

    // 改行で分割してパターンを取得
    const lines = patternsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const patterns = [];

    for (const pattern of lines) {
      try {
        patterns.push(new RegExp(pattern));
        console.log(LOG_PREFIX, `Loaded pattern: ${pattern}`);
      } catch (error) {
        console.warn(LOG_PREFIX, `Invalid regex pattern: ${pattern}`, error);
      }
    }

    return patterns;
  } catch (error) {
    console.error(LOG_PREFIX, "Error loading patterns:", error);
    return [];
  }
};

/**
 * URLに一致する最初のパターンを返す
 * @param {string} url - チェックするURL
 * @param {RegExp[]} patterns - 正規表現パターンの配列
 * @returns {RegExp|null} 一致したパターン、または null
 */
const findMatchingPattern = (url, patterns) => {
  if (!url || patterns.length === 0) {
    return null;
  }

  return patterns.find((pattern) => pattern.test(url)) || null;
};

/**
 * 指定URLと同じパターンに一致する既存タブを検索
 * @param {string} targetUrl - 対象URL
 * @param {number} excludeTabId - 除外するタブID（新しいタブ）
 * @param {RegExp[]} patterns - 正規表現パターンの配列
 * @returns {Promise<chrome.tabs.Tab[]>} 一致するタブの配列
 */
const findMatchingTabs = async (targetUrl, excludeTabId, patterns) => {
  try {
    // targetUrl が一致するパターンを特定
    const matchedPattern = findMatchingPattern(targetUrl, patterns);
    if (!matchedPattern) {
      return [];
    }

    const allTabs = await chrome.tabs.query({});
    const matchingTabs = [];

    for (const tab of allTabs) {
      // 新しいタブは除外
      if (tab.id === excludeTabId) {
        continue;
      }

      // 同じパターンに一致するタブのみを抽出
      if (tab.url && matchedPattern.test(tab.url)) {
        matchingTabs.push(tab);
      }
    }

    return matchingTabs;
  } catch (error) {
    console.error(LOG_PREFIX, "Error finding matching tabs:", error);
    return [];
  }
};

/**
 * 古いタブを閉じて新しいタブをアクティブにする
 * @param {number} newTabId - 新しいタブのID
 * @param {chrome.tabs.Tab[]} oldTabs - 閉じる既存タブの配列
 */
const closeOldTabsAndActivateNew = async (newTabId, oldTabs) => {
  try {
    // 古いタブを閉じる
    const oldTabIds = oldTabs.map((tab) => tab.id);
    if (oldTabIds.length > 0) {
      await chrome.tabs.remove(oldTabIds);
      console.log(
        LOG_PREFIX,
        `Closed ${oldTabIds.length} old tab(s):`,
        oldTabIds,
      );
    }

    // 新しいタブをアクティブにする
    await chrome.tabs.update(newTabId, { active: true });
    console.log(LOG_PREFIX, `Activated new tab: ${newTabId}`);
  } catch (error) {
    console.error(LOG_PREFIX, "Error managing tabs:", error);
  }
};

/**
 * タブのURL変更を処理
 * @param {number} tabId - タブID
 * @param {string} url - 新しいURL
 */
const handleTabUrl = async (tabId, url) => {
  if (!url || url.startsWith("chrome://") || url.startsWith("edge://")) {
    return;
  }

  console.log(LOG_PREFIX, `Checking tab ${tabId}: ${url}`);

  // 設定からパターンを取得
  const patterns = await getUrlPatterns();
  if (patterns.length === 0) {
    return;
  }

  // URLがパターンに一致するかチェック
  const matchedPattern = findMatchingPattern(url, patterns);
  if (!matchedPattern) {
    console.log(LOG_PREFIX, `URL does not match any pattern: ${url}`);
    return;
  }

  console.log(LOG_PREFIX, `URL matches pattern: ${matchedPattern.source}`);

  // 同じパターンに一致する既存タブを検索
  const matchingTabs = await findMatchingTabs(url, tabId, patterns);

  if (matchingTabs.length > 0) {
    console.log(
      LOG_PREFIX,
      `Found ${matchingTabs.length} existing matching tab(s)`,
    );
    await closeOldTabsAndActivateNew(tabId, matchingTabs);
  } else {
    console.log(LOG_PREFIX, "No existing matching tabs found");
  }
};

/**
 * タブ作成イベントリスナー
 */
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    console.log(LOG_PREFIX, "Tab created:", tab.id, tab.url);
    handleTabUrl(tab.id, tab.url);
  }
});

/**
 * タブ更新イベントリスナー
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // URLが変更された場合のみ処理
  if (changeInfo.url) {
    console.log(LOG_PREFIX, "Tab updated:", tabId, changeInfo.url);
    handleTabUrl(tabId, changeInfo.url);
  }
});

/**
 * 拡張機能インストール時の初期化
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log(LOG_PREFIX, "Extension installed/updated");
});

console.log(LOG_PREFIX, "Service Worker initialized");
