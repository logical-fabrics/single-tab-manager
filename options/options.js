/**
 * Single Tab Manager - Options Page
 * 設定画面のロジック
 */

const STORAGE_KEY = 'urlPatterns'

// DOM要素
const patternsTextarea = document.getElementById('patterns')
const saveButton = document.getElementById('save')
const resetButton = document.getElementById('reset')
const statusDiv = document.getElementById('status')

/**
 * 設定を読み込んでテキストエリアに表示
 */
const loadPatterns = async () => {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY)
    const patterns = result[STORAGE_KEY] || ''
    patternsTextarea.value = patterns
  } catch (error) {
    console.error('Error loading patterns:', error)
    showStatus('設定の読み込みに失敗しました', 'error')
  }
}

/**
 * 設定を保存
 */
const savePatterns = async () => {
  try {
    const patterns = patternsTextarea.value.trim()

    // 各行の正規表現をバリデーション
    const lines = patterns
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)

    const invalidPatterns = []
    for (const pattern of lines) {
      try {
        new RegExp(pattern)
      } catch (_error) {
        invalidPatterns.push(pattern)
      }
    }

    if (invalidPatterns.length > 0) {
      showStatus(
        `無効な正規表現が含まれています: ${invalidPatterns.join(', ')}`,
        'error'
      )
      return
    }

    // chrome.storage.sync に保存
    await chrome.storage.sync.set({ [STORAGE_KEY]: patterns })
    showStatus('設定を保存しました', 'success')
  } catch (error) {
    console.error('Error saving patterns:', error)
    showStatus('設定の保存に失敗しました', 'error')
  }
}

/**
 * 設定をリセット
 */
const resetPatterns = async () => {
  if (!confirm('設定をリセットしますか？')) return

  try {
    await chrome.storage.sync.remove(STORAGE_KEY)
    patternsTextarea.value = ''
    showStatus('設定をリセットしました', 'success')
  } catch (error) {
    console.error('Error resetting patterns:', error)
    showStatus('設定のリセットに失敗しました', 'error')
  }
}

/**
 * ステータスメッセージを表示
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージタイプ（'success' | 'error'）
 */
const showStatus = (message, type) => {
  statusDiv.textContent = message
  statusDiv.className = `status ${type}`

  // 3秒後に自動的に非表示
  setTimeout(() => {
    statusDiv.className = 'status hidden'
  }, 3000)
}

/**
 * イベントリスナーの設定
 */
const initializeEventListeners = () => {
  saveButton.addEventListener('click', savePatterns)
  resetButton.addEventListener('click', resetPatterns)

  // Ctrl+S / Cmd+S で保存
  patternsTextarea.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      savePatterns()
    }
  })
}

/**
 * 初期化
 */
const initialize = () => {
  initializeEventListeners()
  loadPatterns()
}

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}
