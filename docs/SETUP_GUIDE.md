# Single Tab Manager インストール & 設定ガイド

このドキュメントでは、**Google Chrome** または **Microsoft Edge** に「Single Tab Manager」をインストールし、URL パターンを設定する方法を説明します。

---

## 1. 拡張機能の管理画面を開く

- **Chrome の場合**
  アドレスバーに次を入力して Enter を押します：

  ```
  chrome://extensions/
  ```

  ![拡張機能の管理画面を開く_chrome](images/1_chrome.PNG)

- **Edge の場合**
  アドレスバーに次を入力して Enter を押します：

  ```
  edge://extensions/
  ```

  ![拡張機能の管理画面を開く_edge](images/1_edge.PNG)

---

## 2. デベロッパーモードを有効化する

- **Chrome の場合**：「右上のスイッチ」をクリックして **デベロッパーモード** を ON にします。
  ![デベロッパーモードを有効化する_chrome](images/2_chrome.PNG)

- **Edge の場合**：「左下のスイッチ」をクリックして **開発者モード** を ON にします。
  ![デベロッパーモードを有効化する_edge](images/2_edge.PNG)

---

## 3. 拡張機能を読み込む

- **Chrome の場合**：「パッケージ化されていない拡張機能を読み込む」をクリック
  ![拡張機能を読み込む_chrome](images/3_chrome.PNG)

- **Edge の場合**：「展開して読み込み」をクリック
  ![拡張機能を読み込む_edge](images/3_edge.PNG)

---

## 4. 拡張機能フォルダを選択

- **`single-tab-manager`** を選択して読み込みます。
  ![拡張機能フォルダを選択](images/4.PNG)

---

## 5. インストール確認

- 拡張機能一覧に **「Single Tab Manager」** が表示されていることを確認します。
  ![インストール確認_chrome](images/5_chrome.PNG)
  ![インストール確認_edge](images/5_edge.PNG)

---

## 6. 詳細設定画面を開く

1. 「Single Tab Manager」の **詳細** ボタンをクリックします。
   ![詳細設定画面を開く-1_chrome](images/6-1_chrome.PNG)
   ![詳細設定画面を開く-1_edge](images/6-1_edge.PNG)
2. 「拡張機能のオプション」をクリックします。
   ![詳細設定画面を開く-2_chrome](images/6-2_chrome.PNG)
   ![詳細設定画面を開く-2_edge](images/6-2_edge.PNG)

---

## 7. URL パターンを設定する

1. 設定画面が開いたら、「URL パターン（正規表現）」の入力欄に以下を入力します：
   ```
   http://192.168.100.197/DicomWeb/.*
   ```
2. **保存** ボタンをクリックします。

![URLパターンを設定する](images/7.PNG)

---

## 8. 設定の確認

- 画面に **「設定を保存しました」** と表示されれば完了です。
  ![設定の確認](images/8.PNG)

---

## 完了 🎉

これで「Single Tab Manager」が有効になり、指定した URL を複数開いた場合も常に最新の 1 タブだけが残るようになります。
