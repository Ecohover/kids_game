# 兒童小遊戲 - 項目需求文檔

## 📋 項目概述
創建一個專為兒童設計的小遊戲平台，包含多個有趣的小遊戲來訓練手眼協調、反應速度和專注力。

## 🎯 核心功能需求

### 1. 遊戲中心首頁
- [x] **遊戲選擇界面**
  - 卡片式遊戲展示
  - 遊戲介紹和特色說明
  - 遊戲統計和進度顯示
- [x] **響應式設計**
  - 桌面和手機版本適配
  - 觸控優化
- [x] **遊戲統計系統**
  - 遊戲次數記錄
  - 最高分統計
  - 遊戲時長追蹤

### 2. 護眼保護系統
- [x] **20分鐘強制休息**
  - 遊戲運行20分鐘後自動暫停
  - 強制1分鐘休息時間
  - 倒數計時顯示
- [x] **測試模式**
  - 快速測試：10秒遊戲 + 5秒休息
  - 明顯的視覺提示（紅色外框 + "測試環境"標籤）
  - 跨頁面保持測試狀態
  - 多種啟用方式：
    - URL參數：`?test=true`
    - 控制台命令：`EyeProtectionTester.quickTest()`
    - localStorage持久化
- [x] **可重複使用模塊**
  - 可在不同遊戲中共用
  - 支持自定義配置

### 3. 動物獵人遊戲
- [x] **遊戲邏輯**
  - 只能點擊肉食動物（+20分）
  - 點擊草食/雜食動物扣分扣血
  - 錯過肉食動物扣血
  - 3條生命系統
- [x] **動物分類**
  - 肉食動物：🦁🐯🐺🦈🐊🦅
  - 草食動物：🐄🐑🐰🦌🐴🐘
  - 雜食動物：🐻🐷🐵🐸🐔🦔
- [x] **視覺效果**
  - 森林+海洋背景漸層
  - 動物點擊動畫
  - 分數反饋效果
  - 可愛弓箭游標
- [x] **等級系統**
  - 每100分升級
  - 難度動態調整
- [x] **手機優化**
  - 觸控友好設計
  - 響應式佈局

## 🏗️ 技術架構

### 檔案結構 (Clean Code 重構後)
```
kids-game/
├── index.html                       # 遊戲中心首頁
├── animal-hunter.html              # 動物獵人遊戲頁面
├── assets/
│   ├── css/
│   │   ├── common.css              # 通用樣式
│   │   ├── home.css               # 首頁專用樣式
│   │   ├── game.css               # 遊戲頁面樣式
│   │   └── eye-protection.css     # 護眼系統樣式
│   ├── images/                     # 遊戲圖片資源 (預留)
│   └── js/
│       ├── utils/                  # 工具類模組 (Clean Code)
│       │   ├── dom-utils.js       # DOM 操作專用工具
│       │   ├── storage-utils.js   # 存儲操作專用工具
│       │   ├── url-utils.js       # URL 參數處理專用工具
│       │   ├── math-utils.js      # 數學計算專用工具
│       │   ├── device-utils.js    # 設備檢測專用工具
│       │   └── function-utils.js  # 函數式編程工具
│       ├── utils-clean.js          # 統一工具類入口 (組合模式)
│       ├── eye-protection-clean.js # 護眼保護模塊 (Clean Code)
│       ├── home-clean.js           # 首頁邏輯 (Clean Code)
│       ├── animal-hunter-clean.js  # 動物獵人遊戲 (Clean Code)
│       ├── utils.js                # 舊版工具庫 (向下兼容)
│       ├── eye-protection.js       # 舊版護眼模塊 (向下兼容)
│       ├── home.js                 # 舊版首頁邏輯 (向下兼容)
│       └── animal-hunter.js        # 舊版遊戲邏輯 (向下兼容)
└── PROJECT_REQUIREMENTS.md         # 本文檔
```

### Clean Code 架構原則
- [x] **單一職責原則 (SRP)**：每個類只負責一個功能領域
- [x] **開放封閉原則 (OCP)**：對擴展開放，對修改封閉
- [x] **組合模式**：使用組合而非繼承來組合功能
- [x] **依賴反轉**：高層模塊不依賴低層模塊的具體實現

### 核心模塊 (Clean Code 版本)
- [x] **工具類模組化**：
  - `DOMUtils`：DOM操作專用，避免混合職責
  - `StorageUtils`：localStorage和Cookie操作
  - `URLUtils`：URL參數處理和導航
  - `MathUtils`：數學計算和隨機數生成
  - `DeviceUtils`：設備檢測和響應式斷點
  - `FunctionUtils`：函數式編程工具（防抖、節流、記憶化等）
- [x] **統一工具入口**：`Utils` 類使用組合模式提供統一接口
- [x] **EyeProtection 類**：使用常數配置和私有方法，清晰分離關注點
- [x] **AnimalHunterGame 類**：遵循單一職責，方法職責明確
- [x] **HomePage 類**：清晰的初始化和事件處理分離

### 新增功能模塊
- [x] **URL參數傳遞系統**：自動保持頁面間的URL參數
- [x] **測試控制面板**：方便開發和測試的控制介面
- [x] **多重測試模式檢測**：URL、localStorage、物件狀態三重檢測

### Clean Code 重構成果
- [x] **模組化架構**：將大型 utils.js 拆分為專門化的小模組
- [x] **單一職責**：每個類和方法只負責一個明確的功能
- [x] **常數提取**：將魔術數字和字串提取為有意義的常數
- [x] **私有方法**：使用 `_` 前綴區分公共和私有方法
- [x] **參數驗證**：在工具方法中加入完整的參數驗證
- [x] **錯誤處理**：改善錯誤處理和回覆機制
- [x] **代碼組織**：將相關功能分組，提高可讀性
- [x] **向下兼容**：保留舊版文件確保現有功能不中斷

## 🔧 開發和測試

### 測試模式使用
```javascript
// 快速啟用測試模式
EyeProtectionTester.quickTest()

// 或使用URL參數
animal-hunter.html?test=true

// 檢查狀態
EyeProtectionTester.getStatus()

// 關閉測試模式
EyeProtectionTester.disableTestMode()
```

### 測試模式特徵
- [x] 全頁面紅色邊框（8px，呼吸燈效果）
- [x] 頂部中央"🧪 測試環境 🧪"標籤（閃爍動畫）
- [x] 右上角詳細信息提示框（5秒後自動消失）
- [x] 右下角測試控制面板（可收合）
- [x] 跨頁面狀態保持（自動傳遞URL參數）
- [x] 快速時間設定（10秒遊戲+5秒休息）

### 新增：測試控制面板
- **位置**：右下角固定面板，紅色邊框
- **功能**：
  - 立即觸發護眼休息
  - 切換測試模式開關
  - 顯示當前時間設定
  - 一鍵退出測試模式
- **響應式**：支援手機版自動縮放

### 新增：通用URL參數傳遞系統
- **自動參數保持**：所有頁面跳轉自動保持URL參數
- **統一導航方法**：`Utils.navigateWithParams()`
- **測試模式檢測**：`Utils.isTestMode()`
- **參數創建工具**：`Utils.createUrlWithParams()`

## 📱 響應式設計需求
- [x] **桌面版**（>768px）
  - 雙欄佈局
  - 完整功能展示
- [x] **平板版**（768px-480px）
  - 單欄佈局
  - 適中的元素大小
- [x] **手機版**（<480px）
  - 緊湊佈局
  - 觸控優化
  - 簡化介面元素

## 🎮 遊戲擴展計劃
其他小遊戲將根據需求逐步開發，不預先規劃具體內容。

## 🛠️ 當前已完成事項
- [x] **HTML結構重組**
  - 將現有HTML改為使用新的模塊化CSS/JS
  - 整合所有功能到新架構
- [x] **測試模式完善**
  - 添加測試控制面板
  - 實現跨頁面參數傳遞
  - 多重檢測機制
- [x] **通用工具方法**
  - URL參數處理系統
  - 統一導航方法
  - 測試模式檢測工具

## 🛠️ 當前待辦事項
- [ ] **測試和優化**
  - 跨瀏覽器測試
  - 性能優化
  - 錯誤處理改進
- [ ] **功能擴展**
  - 其他小遊戲開發（根據需求逐步添加）

## 🔄 持續開發指南

### Clean Code 開發原則
未來所有新增功能都應遵循以下 Clean Code 原則：

1. **創建新功能時**：
   - 優先使用 Clean Code 版本的工具類
   - 每個類應有明確的單一職責
   - 使用有意義的常數替代魔術數字
   - 私有方法使用 `_` 前綴
   - 加入完整的參數驗證

2. **修改現有功能時**：
   - 優先修改 Clean Code 版本（`*-clean.js`）
   - 如需向下兼容，同時更新舊版本
   - 保持 API 介面的一致性

### 添加新遊戲步驟 (Clean Code 版本)
1. 在 `assets/js/` 創建遊戲邏輯檔案（使用 Clean Code 原則）
2. 在 `assets/css/` 添加遊戲專用樣式
3. 創建遊戲HTML頁面（載入 Clean Code 工具模組）
4. 在 `home-clean.js` 中添加遊戲卡片
5. 整合護眼保護系統（使用 `eye-protection-clean.js`）

### 修改護眼系統 (Clean Code 版本)
- **時間設定**：`EyeProtection.DEFAULTS` 常數
- **測試模式邏輯**：`_detectTestMode()` 和相關私有方法
- **視覺提示**：`_createTestModeIndicator()` 和 `_createTestModeBorder()`
- **測試控制面板**：`_createTestControlPanel()`

### 工具類使用指南
- **DOM 操作**：使用 `Utils.createElement()`, `Utils.$()`
- **存儲操作**：使用 `Utils.saveToStorage()`, `Utils.getCookie()`
- **URL 參數**：使用 `URLUtils.getUrlParams()`, `URLUtils.navigateWithParams()`
- **數學計算**：使用 `Utils.random()`, `Utils.clamp()`
- **設備檢測**：使用 `Utils.isMobile()`, `Utils.vibrate()`

### 樣式修改
- 通用樣式：`common.css`
- 遊戲特定：對應的專用CSS檔案
- 測試模式樣式：`eye-protection.css` 和動態樣式

### URL參數處理 (Clean Code 版本)
- **通用方法**：`URLUtils` 類中的專用方法
- **導航統一使用**：`URLUtils.navigateWithParams()`
- **測試檢測統一使用**：`Utils.isTestMode()`

## 📞 協作說明
本文檔為持續開發的參考依據，可在其他對話中使用此文檔繼續開發。

⚠️ **重要提醒**：
**如果有任何功能調整、新增或修改，請務必回來更新這份 MD 文檔規格**，以確保文檔與實際代碼保持同步，方便後續開發和維護。

### 需要更新文檔的情況
- 新增功能或模塊
- 修改現有功能邏輯
- 調整檔案結構
- 更改API或方法名稱
- 修改測試模式相關功能
- 新增工具方法或公用函數

### 文檔更新原則
- 保持技術細節的準確性
- 更新功能狀態（pending → completed）
- 添加新的使用範例
- 補充開發指南和注意事項

### 關鍵信息
- **測試模式啟用**：`EyeProtectionTester.quickTest()` 或 URL `?test=true`
- **架構特點**：完全模塊化設計，Clean Code 原則，組件可重複使用
- **主要類別**：`EyeProtection`, `AnimalHunterGame`, `HomePage`, `Utils` (均有 Clean Code 版本)
- **工具模組**：專門化的工具類（DOM、Storage、URL、Math、Device、Function）
- **新增工具**：URL參數自動傳遞、測試控制面板、多重檢測機制
- **Clean Code 特色**：單一職責、組合模式、常數提取、私有方法、參數驗證
- **當前進度**：核心架構完成並 Clean Code 重構完成，包含完整測試系統，可開始新遊戲開發

---
*最後更新：2025-07-26*
*版本：v1.2 - Clean Code 重構完成，模組化工具類架構*