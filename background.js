/**
 * Single Tab Manager - Background Service Worker
 * 同じURLパターンに一致するタブを1つだけに制御
 */

const STORAGE_KEY = 'urlPatterns'

// レースコンディション対策: 処理中のタブIDを記録
const processingTabs = new Set()

// デバウンス用のタイマー
const debounceTimers = new Map()

// グローバル処理フラグ: 同時処理を完全に防止
let isProcessing = false

/**
 * 設定から正規表現パターンを取得
 * @returns {Promise<RegExp[]>} 有効な正規表現パターンの配列
 */
const getUrlPatterns = async () => {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY)
    const patternsText = result[STORAGE_KEY] || ''

    if (!patternsText.trim()) {
      return []
    }

    // 改行で分割してパターンを取得
    const lines = patternsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
    const patterns = []

    for (const pattern of lines) {
      try {
        patterns.push(new RegExp(pattern))
      } catch (_error) {
        // 無効な正規表現はスキップ
      }
    }

    return patterns
  } catch (_error) {
    return []
  }
}

/**
 * URLに一致する最初のパターンを返す
 * @param {string} url - チェックするURL
 * @param {RegExp[]} patterns - 正規表現パターンの配列
 * @returns {RegExp|null} 一致したパターン、または null
 */
const findMatchingPattern = (url, patterns) => {
  if (!url || patterns.length === 0) return null
  return patterns.find((pattern) => pattern.test(url)) || null
}

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
    const matchedPattern = findMatchingPattern(targetUrl, patterns)
    if (!matchedPattern) return []

    const allTabs = await chrome.tabs.query({})
    const matchingTabs = []

    for (const tab of allTabs) {
      // 新しいタブは除外
      if (tab.id === excludeTabId) continue

      // 同じパターンに一致するタブのみを抽出
      if (tab.url && matchedPattern.test(tab.url)) {
        matchingTabs.push(tab)
      }
    }

    return matchingTabs
  } catch (_error) {
    return []
  }
}

/**
 * 古いタブを閉じて新しいタブをアクティブにする
 * @param {number} newTabId - 新しいタブのID
 * @param {chrome.tabs.Tab[]} oldTabs - 閉じる既存タブの配列
 */
const closeOldTabsAndActivateNew = async (newTabId, oldTabs) => {
  try {
    // 🛡️ 念のため: newTabId が閉じるリストに含まれていないか最終確認
    const oldTabIds = oldTabs
      .filter((tab) => tab.id !== newTabId)
      .map((tab) => tab.id)

    if (oldTabIds.length > 0) {
      await chrome.tabs.remove(oldTabIds)
    }

    // 🛡️ 新しいタブをアクティブにする（タブが既に閉じられている可能性を考慮）
    try {
      await chrome.tabs.update(newTabId, { active: true })
    } catch (_error) {
      // タブが存在しない場合は静かに無視
    }
  } catch (_error) {
    // エラーは静かに無視
  }
}

/**
 * タブのURL変更を処理（デバウンス + 重複処理防止）
 * @param {number} tabId - タブID
 * @param {string} url - 新しいURL
 */
const handleTabUrl = async (tabId, url) => {
  if (!url || url.startsWith('chrome://') || url.startsWith('edge://')) return

  // 既に処理中またはデバウンス待機中の場合はスキップ（重複処理防止）
  if (processingTabs.has(tabId) || debounceTimers.has(tabId)) {
    return
  }

  // グローバル処理中なら全体をスキップ
  if (isProcessing) {
    return
  }

  // 300msのデバウンス処理（複数のイベント発火をまとめる）
  debounceTimers.set(
    tabId,
    setTimeout(async () => {
      // 処理開始時にも再チェック
      if (isProcessing) {
        debounceTimers.delete(tabId)
        return
      }

      isProcessing = true
      processingTabs.add(tabId)

      try {
        // 設定からパターンを取得
        const patterns = await getUrlPatterns()
        if (patterns.length === 0) return

        // URLがパターンに一致するかチェック
        const matchedPattern = findMatchingPattern(url, patterns)
        if (!matchedPattern) {
          return
        }

        // 同じパターンに一致する既存タブを検索
        const matchingTabs = await findMatchingTabs(url, tabId, patterns)

        if (matchingTabs.length === 0) {
          return
        }

        await closeOldTabsAndActivateNew(tabId, matchingTabs)
      } finally {
        // 処理完了後に必ずフラグをクリア
        processingTabs.delete(tabId)
        debounceTimers.delete(tabId)
        isProcessing = false
      }
    }, 300)
  )
}

/**
 * タブ更新イベントリスナー
 * タブ作成時もこのイベントでURL確定を検知するため、onCreatedは不要
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
  // URLが変更された場合のみ処理
  if (changeInfo.url) {
    handleTabUrl(tabId, changeInfo.url)
  }
})

/**
 * タブ削除イベントリスナー
 * 処理中フラグとタイマーをクリーンアップ
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  processingTabs.delete(tabId)
  if (debounceTimers.has(tabId)) {
    clearTimeout(debounceTimers.get(tabId))
    debounceTimers.delete(tabId)
  }
})

/**
 * 拡張機能インストール時の初期化
 */
chrome.runtime.onInstalled.addListener(() => {
  // 初期化処理（必要に応じて追加）
})
