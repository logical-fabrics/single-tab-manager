# Single Tab Manager - Chrome/Edge 拡張機能

## 📋 プロジェクト概要

同じ URL パターンに一致するタブを常に 1 つだけに制御する Chrome/Edge 拡張機能。
ユーザーが正規表現で対象 URL を設定可能で、新しいタブで対象 URL を開いた場合、既存のタブを閉じて新しいタブだけを残す。

### 対象ブラウザ
- Google Chrome (Manifest V3)
- Microsoft Edge (Chromium ベース)

### 配布方法
- 主に: パッケージ化してインストール
- 将来的: Chrome Web Store / Edge Add-ons での一般公開の可能性あり

---

## 🎯 機能要件

### 1. 対象 URL の判定
- 拡張機能のオプション画面で、ユーザーが 1 つ以上の正規表現パターンを入力可能
- 新規タブが作成されたり、URL が更新された際に、入力されたパターンに一致するかをチェック

### 2. タブの制御ルール
すでに同じパターンに一致するタブが存在する場合:
- 既存タブを閉じる
- 新しいタブを残す（アクティブにする）
- パターンに一致しない場合は何もしない

### 3. オプション画面
- 正規表現パターンを複数入力できるテキストエリア（改行区切り）
- 保存／読み込みは `chrome.storage.sync` を使用
- パターンの追加・編集・削除が直感的に行える UI

### 4. 想定利用例
入力パターン: `https://192.168.100.197/DicomWeb/.*`

動作:
- `/DicomWeb/` 以下のページを複数タブで開くと、常に最新のタブだけが残る
- 古いタブは自動的に閉じられる

---

## 🏗️ アーキテクチャ

### ファイル構成

```
single-tab-manager/
├── manifest.json              # Manifest V3 設定
├── background.js              # Service Worker（タブ制御ロジック）
├── options/
│   ├── options.html          # 設定画面 UI
│   ├── options.js            # 設定ロジック
│   └── options.css           # スタイル
├── icons/
│   ├── icon16.png            # ツールバーアイコン
│   ├── icon48.png            # 拡張機能管理画面
│   └── icon128.png           # Chrome Web Store
├── CLAUDE.md                  # このファイル
├── docs/
│   └── tasks.md              # 実装タスク一覧
├── LICENSE
└── README.md                  # ユーザー向けドキュメント（将来作成）
```

### 技術スタック

**必須 API:**
- `chrome.tabs` - タブの監視と制御
- `chrome.storage.sync` - 設定の同期保存
- `chrome.runtime` - バックグラウンド処理

**Manifest V3 要件:**
- Service Worker ベース（background.js）
- declarativeNetRequest（不要）
- host_permissions（不要 - tabs API で URL 取得可能）

---

## 🔧 実装詳細

### 1. manifest.json

```json
{
  "manifest_version": 3,
  "name": "Single Tab Manager",
  "version": "1.0.0",
  "description": "同じURLパターンに一致するタブを1つだけに制御",
  "permissions": [
    "tabs",
    "storage"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "options_page": "options/options.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 2. background.js - タブ制御ロジック

**主要機能:**
1. `chrome.tabs.onCreated` - 新規タブ作成を監視
2. `chrome.tabs.onUpdated` - タブ URL 更新を監視
3. パターンマッチング - 正規表現で URL 判定
4. 既存タブ検索 - 同じパターンに一致するタブを探す
5. タブクローズ - 古いタブを閉じる

**処理フロー:**
```
タブ作成/更新
  ↓
設定から正規表現パターンを取得
  ↓
現在のタブ URL がパターンに一致？
  ↓ Yes
全タブを検索して一致するタブを抽出
  ↓
一致するタブが 2 つ以上存在？
  ↓ Yes
新しいタブ以外（古いタブ）を閉じる
  ↓
新しいタブをアクティブにする
```

**注意点:**
- タブクローズのタイミング - レースコンディションを避ける
- 複数パターンのマッチング - すべてのパターンをチェック
- エラーハンドリング - 無効な正規表現の処理

### 3. options/ - 設定画面

**options.html:**
- シンプルな UI
- テキストエリア（改行区切りでパターン入力）
- 保存ボタン
- ヘルプテキスト（正規表現の例）

**options.js:**
- `chrome.storage.sync.get()` - 設定読み込み
- `chrome.storage.sync.set()` - 設定保存
- バリデーション - 正規表現の妥当性チェック

**options.css:**
- クリーンなデザイン
- レスポンシブ対応
- Chrome/Edge のネイティブスタイルに調和

---

## 🧪 テストシナリオ

### 基本動作テスト
1. パターン設定: `https://example.com/.*`
2. `https://example.com/page1` を開く
3. 新しいタブで `https://example.com/page2` を開く
4. → page1 のタブが閉じられる
5. page2 のタブだけが残る

### 複数パターンテスト
1. パターン設定:
   ```
   https://example.com/.*
   https://192.168.100.197/DicomWeb/.*
   ```
2. 両方のパターンで動作を確認

### エッジケース
- 無効な正規表現を入力した場合
- パターンが空の場合
- 同時に複数タブを開いた場合
- タブを手動で閉じた場合

---

## 🚀 デプロイ方法

### 開発者モードでのローカルインストール

**Chrome:**
1. `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトディレクトリを選択

**Edge:**
1. `edge://extensions/` を開く
2. 「開発者モード」を有効化
3. 「展開して読み込み」をクリック
4. プロジェクトディレクトリを選択

### パッケージ化

```bash
# ディレクトリを ZIP 圧縮
cd single-tab-manager
zip -r single-tab-manager.zip . -x "*.git*" -x "docs/*" -x "CLAUDE.md"
```

---

## 📝 今後の拡張アイデア

- [ ] パターンごとに有効/無効を切り替え
- [ ] タブを閉じる代わりに、既存タブに切り替えるモード
- [ ] ホワイトリスト/ブラックリストモード
- [ ] 統計情報（閉じたタブ数など）
- [ ] インポート/エクスポート機能
- [ ] ダークモード対応

---

## 🔒 セキュリティとプライバシー

- URL データはローカル（chrome.storage.sync）のみに保存
- 外部サーバーへのデータ送信なし
- 必要最小限の権限のみ要求（tabs, storage）
- ユーザーが明示的に設定したパターンのみ処理

---

## 📚 参考資料

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [chrome.tabs API](https://developer.chrome.com/docs/extensions/reference/tabs/)
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
