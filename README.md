# Single Tab Manager

同じ URL パターンに一致するタブを常に 1 つだけに制御する Chrome/Edge 拡張機能。

## 📋 概要

**Single Tab Manager** は、ユーザーが指定した正規表現パターンに一致する URL のタブを自動的に管理し、重複したタブを防ぐ Chrome/Edge 拡張機能です。新しいタブで同じパターンの URL を開いた場合、既存のタブを自動的に閉じて新しいタブだけを残します。

### 主な用途

- 管理画面や開発ツールなど、複数タブで開きたくないページの制御
- 社内システムやローカル開発環境の URL パターン管理
- 特定ドメインやパスのタブを常に 1 つに保つ

## ✨ 機能

- ✅ **正規表現による柔軟な URL パターン設定**
  - 複数のパターンを設定可能（改行区切り）
  - 無効な正規表現はエラー表示
- ✅ **自動タブ制御**
  - 新しいタブを開いた際、既存の一致タブを自動クローズ
  - 新しいタブをアクティブ化
- ✅ **使いやすいオプション画面**
  - 直感的な UI でパターンを管理
  - 正規表現の例とヘルプテキスト
  - 設定の保存・リセット機能
- ✅ **Chrome/Edge 対応**
  - Manifest V3 に準拠
  - chrome.storage.sync で設定を同期

## 🚀 インストール

### 開発者モードでのインストール（Chrome）

1. このリポジトリをクローンまたはダウンロード

   ```bash
   git clone https://github.com/yourusername/single-tab-manager.git
   cd single-tab-manager
   ```

2. Chrome を開き、`chrome://extensions/` にアクセス

3. 右上の「デベロッパーモード」を有効化

4. 「パッケージ化されていない拡張機能を読み込む」をクリック

5. クローンした `single-tab-manager` ディレクトリを選択

### 開発者モードでのインストール（Edge）

1. 上記と同じ手順でリポジトリをクローン

2. Edge を開き、`edge://extensions/` にアクセス

3. 左下の「開発者モード」を有効化

4. 「展開して読み込み」をクリック

5. クローンした `single-tab-manager` ディレクトリを選択

## 📖 使い方

### 1. オプション画面を開く

拡張機能のアイコンを右クリック → 「オプション」を選択

または、`chrome://extensions/` から拡張機能の詳細 → 「拡張機能のオプション」をクリック

### 2. URL パターンを設定

オプション画面のテキストエリアに、制御したい URL の正規表現パターンを入力します（1 行に 1 つ）。

**例:**

```
https://example\.com/.*
https://192\.168\.100\.197/DicomWeb/.*
https://.*\.github\.com/issues/.*
```

### 3. 保存

「保存」ボタンをクリックして設定を保存します。

### 4. 動作確認

設定したパターンに一致する URL を新しいタブで開くと、既存の一致タブが自動的に閉じられ、新しいタブだけが残ります。

## 🔧 正規表現の例

| パターン                                | 説明                                  |
| --------------------------------------- | ------------------------------------- |
| `https://example\.com/.*`               | example.com 配下の全てのページ       |
| `https://.*\.example\.com/.*`           | example.com の全てのサブドメイン      |
| `https://192\.168\.100\.\d+/.*`         | 192.168.100.x の IP アドレス          |
| `https://github\.com/.+/issues/\d+`     | GitHub の issue ページ                |
| `https://localhost:\d+/.*`              | localhost の任意のポート              |
| `https://.*/admin/.*`                   | 任意のドメインの /admin/ 以下         |
| `https://.*\.corp\.internal/dashboard$` | 社内ドメインの dashboard ページ      |

### 注意事項

- 正規表現の特殊文字（`.` `*` `+` `?` など）は `\` でエスケープしてください
- 例: `example.com` → `example\.com`
- パターンは完全一致ではなく、部分一致で動作します

## 🛠️ 開発

### 必要な環境

- Node.js (v18 以降推奨)
- npm または npx

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/single-tab-manager.git
cd single-tab-manager

# Biome フォーマッターでコードを整形
npx @biomejs/biome check --write .
```

### ファイル構成

```
single-tab-manager/
├── manifest.json          # Manifest V3 設定
├── background.js          # Service Worker（タブ制御ロジック）
├── options/
│   ├── options.html      # オプション画面 UI
│   ├── options.css       # スタイル
│   └── options.js        # オプション画面ロジック
├── icons/
│   ├── icon16.png        # ツールバーアイコン
│   ├── icon48.png        # 拡張機能管理画面用
│   └── icon128.png       # Chrome Web Store 用
├── biome.json            # Biome 設定
├── .zed/settings.json    # Zed エディタ設定
├── CLAUDE.md             # プロジェクト仕様
└── docs/
    └── tasks.md          # 実装タスク一覧
```

### デバッグ方法

1. **Service Worker のコンソールを開く**
   - `chrome://extensions/` → 拡張機能の詳細 → Service Worker の「検証」をクリック

2. **ログ確認**
   - `background.js` 内の `console.log` でタブ制御の動作を確認可能

3. **設定の確認**
   - DevTools の Application タブ → Storage → Chrome Storage → sync で保存された設定を確認

### コーディング規約

- フォーマッター: **Biome**
  - シングルクォート
  - セミコロン省略（as needed）
  - 80 文字幅
- アーリーリターンの徹底
- アロー関数を使用
- JSDoc コメントで関数を説明

### コミット規約

- コミットメッセージは日本語または英語
- 末尾に以下を追加:

  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## 🧪 テスト

### 基本動作テスト

1. オプション画面でパターンを設定: `https://example\.com/.*`
2. `https://example.com/page1` を開く
3. 新しいタブで `https://example.com/page2` を開く
4. → page1 のタブが閉じられ、page2 だけが残る

### 複数パターンテスト

```
https://example\.com/.*
https://192\.168\.100\.197/DicomWeb/.*
```

両方のパターンで独立して動作することを確認。

## 📦 パッケージング

### ZIP ファイルの作成

```bash
zip -r single-tab-manager.zip . \
  -x "*.git*" \
  -x "docs/*" \
  -x "CLAUDE.md" \
  -x "*.md" \
  -x ".zed/*" \
  -x "node_modules/*"
```

### Chrome Web Store への公開（将来）

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/) にアクセス
2. ZIP ファイルをアップロード
3. スクリーンショットと説明を追加
4. 審査を申請

## 🔒 セキュリティとプライバシー

- **データ保存**: URL パターンは `chrome.storage.sync` のみに保存
- **外部通信**: 一切なし
- **必要な権限**:
  - `tabs`: タブの URL 取得と制御
  - `storage`: 設定の保存

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🙏 謝辞

このプロジェクトは [Claude Code](https://claude.com/claude-code) を使用して開発されました。

## 📞 お問い合わせ

バグ報告や機能要望は [GitHub Issues](https://github.com/yourusername/single-tab-manager/issues) にお願いします。
