# quotation-system

銓瑞複材科技內部報價與文件系統。

## Firebase 登入設定

1. 進入 Firebase Console 的 `windner-document` 專案。
2. 在 Authentication → Sign-in method 啟用「電子郵件/密碼」。
3. 在 Authentication → Settings → Authorized domains 加入 `stanleyliutw.github.io`。
4. 在 Authentication → Users 建立公司使用者帳號。
5. 將 `database.rules.json` 的內容發布至 Realtime Database → Rules。
6. 將 `firestore.rules` 的內容發布至 Firestore Database → Rules。
7. 將 `storage.rules` 的內容發布至 Storage → Rules。
8. 發布網站後，由 `login.html` 登入。

所有業務頁面都會透過 `firebase-auth.js` 驗證登入狀態；未登入使用者會被導向登入頁。
