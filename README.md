# Bingo Master 科技感兌獎整合系統

這是一個為大型抽獎活動設計的自動化管理系統。前端使用 React 構建，具備現代感十足的科技風格介面；後端整合 Google Sheets 與 Google Apps Script (GAS)，實現資料的即時雲端同步。

## 🚀 系統亮點
- **三區獨立架構**：抽獎匯入、中獎查詢、兌獎作業分為獨立頁面，各組人員作業互不干擾。
- **QR Code 整合**：全區支援手機鏡頭掃描，省去手動輸入號碼的繁瑣。
- **智慧判定**：自動識別「需身分證」獎項，並彈出個資收集表單。
- **雲端同步**：所有操作即時存儲於 Google 試算表，方便後續報表匯出。

---

## 🛠️ 環境準備
1. **Node.js**: 請確保安裝了 [Node.js](https://nodejs.org/) (建議 v18 以上)。
2. **Google 帳號**: 用於建立 Google 試算表與部署後端腳本。

---

## 📦 安裝步驟

### 1. 複製專案與安裝套件
```bash
# 進入專案目錄
cd bingo

# 安裝依賴
npm install
```

### 2. 設定環境變數
在專案根目錄建立一個 `.env` 檔案，內容如下：
```env
VITE_GOOGLE_APP_SCRIPT_URL=您的_GOOGLE_APP_SCRIPT_網頁應用程式連結
```

---

## 📊 Google Sheets 設置說明

### 1. 建立試算表
在 Google 雲端硬碟建立一份新的「Google 試算表」。

### 2. 設定表頭
請將第一個工作表命名為 **「中獎清單」**，並在第一列 (A1-J1) 填入以下完全一致的標題：
`摸彩卷號碼` | `抽獎階段` | `獎次` | `獎品內容` | `備註` | `兌獎狀態` | `姓名` | `身分證ID` | `電話` | `地址`

---

## ⚙️ Google Apps Script (GAS) 部署

這是串接 React 與 Google Sheets 的關鍵步驟：

1. **開啟指令碼編輯器**：在您的試算表中，點擊 **「擴充功能 > Apps Script」**。
2. **貼上代碼**：刪除裡面原本的所有代碼，並貼上專案根目錄下的 `gas-backend.gs` 代碼。
3. **儲存專案**：點擊左上角的磁碟片圖示或按 `Ctrl+S`。
4. **部署網頁應用程式**：
   - 點擊右上角的 **「部署 > 新部署」**。
   - 選取類型：**「網頁應用程式」**。
   - 說名：填寫 `Bingo Backend v1`。
   - 執行身份：選取 **「我」(Me)**。
   - 誰有權存取：選取 **「任何人」(Anyone)** (這是為了讓前端能無需登入直接請求)。
5. **許可權授權**：點擊「部署」後，會跳出權限請求，請選取您的帳號並授權存取試算表。
6. **取得 URL**：部署成功後會得到一串以 `https://script.google.com/macros/s/...` 開頭的 URL。

---

## 🌐 GitHub Pages 自動化部屬

本專案已配置 GitHub Actions，只需簡單設定即可在每次推送代碼後自動更新網頁。

### 1. 設定 GitHub Secrets
1. 進入您的 GitHub 儲存庫設定：**Settings > Secrets and variables > Actions**。
2. 點擊 **New repository secret**。
3. 名稱填入：`VITE_GOOGLE_APP_SCRIPT_URL`。
4. 內容填入：您在 GAS 部署時取得的網頁應用程式 URL。

### 2. 設定 GitHub Pages 來源
1. 進入 **Settings > Pages**。
2. 在 **Build and deployment > Source** 選擇 **GitHub Actions**。

### 3. 推送代碼
完成上述設定後，每當您將代碼推送到 `main` 分支，GitHub Actions 就會自動構建並部屬您的網頁！

---

## 🏃 本地執行系統
```bash
# 啟動開發者模式
npm run dev
```
啟動後會看到三個導引門路：
- **抽獎區**: `http://localhost:5173/lottery`
- **查詢區**: `http://localhost:5173/query`
- **兌獎區**: `http://localhost:5173/redeem`

---

## 📝 獎項配置修改
如果您需要修改獎項名稱、內容或身分證判斷邏輯，請編輯 `src/config.js` 檔案。

```javascript
// src/config.js 範例
export const PRIZE_LIST = [
  { rank: '特別獎', content: '商品抵用券18,800元', remark: '需身分證' },
  // ... 其他獎項
];
```

---

## ⚠️ 注意事項
- **相機權限**：使用 QR Code 掃描功能時，瀏覽器會請求相機權限。
- **HTTPS 部署**：若正式上網，必須使用 HTTPS 協定，否則手機瀏覽器出於安全考慮會禁止存取鏡頭。
- **CORS 議題**：確保 GAS 部署時選取的存取權限為「任何人」(Anyone)，否則前端請求會被阻擋。

---
&copy; 2026 TechBingo System. All rights reserved.
