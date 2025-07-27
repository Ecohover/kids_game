// 護眼保護系統 - 可重複使用模塊
class EyeProtection {
    constructor(options = {}) {
        // 檢查是否為測試模式
        this.testMode = options.testMode || this.isTestMode();
        
        // 根據測試模式設定時間
        if (this.testMode) {
            this.gameTimeLimit = options.gameTimeLimit || 10 * 1000; // 測試模式：10秒
            this.restTime = options.restTime || 5; // 測試模式：5秒休息
        } else {
            this.gameTimeLimit = options.gameTimeLimit || 20 * 60 * 1000; // 正常：20分鐘
            this.restTime = options.restTime || 60; // 正常：1分鐘休息
        }
        
        this.onPause = options.onPause || null; // 暫停回調
        this.onResume = options.onResume || null; // 恢復回調
        this.customMessage = options.customMessage || null; // 自定義提醒訊息
        
        this.gameStartTime = null;
        this.eyeProtectionTimer = null;
        this.restTimer = null;
        this.isResting = false;
        
        this.init();
        
        // 如果是測試模式，顯示提示
        if (this.testMode) {
            this.showTestModeInfo();
        }
    }
    
    // 檢查是否為測試模式
    isTestMode() {
        // 使用 Utils 的通用檢測方法
        const isTest = Utils.isTestMode();
        
        // 額外檢查 testMode 參數
        const urlParams = Utils.getUrlParams();
        const testModeParam = urlParams.get('testMode') === 'true';
        
        // 檢查開發模式
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const devTest = isDev && localStorage.getItem('eyeProtectionTestMode') !== 'false';
        
        const finalResult = isTest || testModeParam || devTest;
        
        // 如果通過 URL 參數檢測到測試模式，自動設置持久化存儲
        if ((urlParams.get('test') === 'true' || testModeParam) && !Utils.getCookie('eyeProtectionTestMode')) {
            Utils.setTestMode(true);
            console.log('🔄 檢測到URL測試參數，已自動設置持久化存儲');
        }
        
        return finalResult;
    }
    
    // 顯示測試模式提示
    showTestModeInfo() {
        console.log('🧪 護眼保護測試模式已啟用');
        console.log(`⏰ 遊戲時間: ${this.gameTimeLimit / 1000}秒`);
        console.log(`😴 休息時間: ${this.restTime}秒`);
        console.log('💡 輸入 eyeProtection.toggleTestMode() 來切換模式');
        console.log('💡 輸入 eyeProtection.forceRest() 來立即觸發休息');
        
        // 創建視覺提示
        this.createTestModeIndicator();
    }
    
    // 創建測試模式視覺提示
    createTestModeIndicator() {
        // 檢查是否已存在
        if (document.getElementById('testModeIndicator')) {
            return;
        }
        
        // 創建全頁面紅色外框
        this.createTestModeBorder();
        
        // 創建測試控制面板
        this.createTestControlPanel();
        
        const indicator = Utils.createElement('div', 'test-mode-indicator');
        indicator.id = 'testModeIndicator';
        indicator.innerHTML = `
            <div class="test-mode-content">
                <div class="test-mode-icon">🧪</div>
                <div class="test-mode-text">
                    <strong>測試模式</strong><br>
                    <small>遊戲${this.gameTimeLimit / 1000}秒 | 休息${this.restTime}秒</small>
                </div>
                <button class="test-mode-close" onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;
        
        // 添加樣式
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            color: white;
            padding: 0;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
            z-index: 9999;
            font-family: Arial, sans-serif;
            animation: testModeSlideIn 0.5s ease-out, testModePulse 2s infinite;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        `;
        
        // 內容樣式
        const content = indicator.querySelector('.test-mode-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            position: relative;
        `;
        
        // 圖標樣式
        const icon = indicator.querySelector('.test-mode-icon');
        icon.style.cssText = `
            font-size: 1.5em;
            animation: testModeRotate 3s linear infinite;
        `;
        
        // 文字樣式
        const text = indicator.querySelector('.test-mode-text');
        text.style.cssText = `
            font-size: 0.9em;
            line-height: 1.3;
        `;
        
        // 關閉按鈕樣式
        const closeBtn = indicator.querySelector('.test-mode-close');
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2em;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            margin-left: 5px;
        `;
        
        // 添加動畫樣式
        this.addTestModeStyles();
        
        document.body.appendChild(indicator);
        
        // 5秒後自動隱藏
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.animation = 'testModeSlideOut 0.5s ease-in forwards';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                    }
                }, 500);
            }
        }, 5000);
        
        // 點擊關閉按鈕事件
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            closeBtn.style.transform = 'scale(1.1)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1)';
        });
    }
    
    // 創建全頁面紅色外框
    createTestModeBorder() {
        if (document.getElementById('testModeBorder')) {
            return;
        }
        
        const border = Utils.createElement('div', 'test-mode-border');
        border.id = 'testModeBorder';
        
        // 外框樣式
        border.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 8px solid #ff0000;
            pointer-events: none;
            z-index: 99999;
            box-sizing: border-box;
            animation: testModeBorderPulse 2s infinite;
        `;
        
        // 頂部文字標籤
        const label = Utils.createElement('div', 'test-mode-label');
        label.textContent = '🧪 測試環境 🧪';
        label.style.cssText = `
            position: absolute;
            top: -2px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff0000;
            color: white;
            padding: 8px 20px;
            font-size: 16px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            border-radius: 0 0 10px 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            animation: testModeLabelBlink 1.5s infinite;
            min-width: 140px;
            text-align: center;
        `;
        
        border.appendChild(label);
        document.body.appendChild(border);
    }
    
    // 創建測試控制面板
    createTestControlPanel() {
        if (document.getElementById('testControlPanel')) {
            return;
        }
        
        const panel = Utils.createElement('div', 'test-control-panel');
        panel.id = 'testControlPanel';
        panel.innerHTML = `
            <div class="test-panel-header">
                <span>🧪 測試控制面板</span>
                <button class="test-panel-toggle" onclick="this.parentNode.parentNode.classList.toggle('collapsed')">−</button>
            </div>
            <div class="test-panel-content">
                <div class="test-section">
                    <h4>護眼功能測試</h4>
                    <button class="test-btn small" onclick="eyeProtection.forceRest()">立即觸發休息</button>
                    <button class="test-btn small" onclick="eyeProtection.toggleTestMode()">切換測試模式</button>
                </div>
                <div class="test-section">
                    <h4>時間設定</h4>
                    <div class="test-info">
                        <span>遊戲時間: ${this.gameTimeLimit / 1000}秒</span><br>
                        <span>休息時間: ${this.restTime}秒</span>
                    </div>
                </div>
                <div class="test-section">
                    <h4>快速操作</h4>
                    <button class="test-btn small" onclick="EyeProtectionTester.disableTestMode(); location.reload()">退出測試模式</button>
                    <button class="test-btn small" onclick="EyeProtectionTester.getStatus()">檢查測試狀態</button>
                </div>
            </div>
        `;
        
        // 面板樣式
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #ff0000;
            border-radius: 15px;
            padding: 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 9998;
            font-family: Arial, sans-serif;
            font-size: 14px;
            min-width: 250px;
            max-width: 300px;
        `;
        
        document.body.appendChild(panel);
        this.addTestControlPanelStyles();
    }
    
    // 測試控制面板樣式
    addTestControlPanelStyles() {
        if (document.getElementById('testControlPanelStyles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'testControlPanelStyles';
        style.textContent = `
            .test-panel-header {
                background: #ff0000;
                color: white;
                padding: 10px 15px;
                border-radius: 13px 13px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
            }
            
            .test-panel-toggle {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .test-panel-content {
                padding: 15px;
            }
            
            .test-control-panel.collapsed .test-panel-content {
                display: none;
            }
            
            .test-control-panel.collapsed .test-panel-toggle {
                transform: rotate(180deg);
            }
            
            .test-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .test-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .test-section h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 13px;
            }
            
            .test-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                margin: 2px;
                transition: background 0.2s;
            }
            
            .test-btn:hover {
                background: #0056b3;
            }
            
            .test-btn.small {
                padding: 4px 8px;
                font-size: 11px;
            }
            
            .test-info {
                font-size: 11px;
                color: #666;
                line-height: 1.4;
            }
            
            @media (max-width: 768px) {
                .test-control-panel {
                    bottom: 10px !important;
                    right: 10px !important;
                    min-width: 200px !important;
                    max-width: 250px !important;
                    font-size: 12px !important;
                }
                
                .test-panel-header {
                    padding: 8px 12px !important;
                    font-size: 12px !important;
                }
                
                .test-panel-content {
                    padding: 12px !important;
                }
                
                .test-btn {
                    padding: 5px 10px !important;
                    font-size: 11px !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 添加測試模式動畫樣式
    addTestModeStyles() {
        if (document.getElementById('testModeStyles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'testModeStyles';
        style.textContent = `
            @keyframes testModeSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes testModeSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes testModePulse {
                0%, 100% {
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
                }
                50% {
                    box-shadow: 0 8px 35px rgba(255, 107, 107, 0.6);
                }
            }
            
            @keyframes testModeRotate {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
            
            @keyframes testModeBorderPulse {
                0%, 100% {
                    border-color: #ff0000;
                    opacity: 1;
                }
                50% {
                    border-color: #ff6666;
                    opacity: 0.8;
                }
            }
            
            @keyframes testModeLabelBlink {
                0%, 100% {
                    background: #ff0000;
                    transform: translateX(-50%) scale(1);
                }
                50% {
                    background: #cc0000;
                    transform: translateX(-50%) scale(1.05);
                }
            }
            
            @media (max-width: 768px) {
                .test-mode-indicator {
                    top: 5px !important;
                    right: 5px !important;
                    font-size: 0.85em !important;
                }
                
                .test-mode-content {
                    padding: 8px 10px !important;
                    gap: 8px !important;
                }
                
                .test-mode-icon {
                    font-size: 1.3em !important;
                }
                
                .test-mode-close {
                    width: 20px !important;
                    height: 20px !important;
                    font-size: 1em !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    init() {
        this.createOverlay();
        this.bindEvents();
    }

    createOverlay() {
        // 如果已經存在，直接返回
        if (document.getElementById('eyeProtectionOverlay')) {
            return;
        }

        const overlay = Utils.createElement('div', 'eye-protection-overlay');
        overlay.id = 'eyeProtectionOverlay';
        
        const content = Utils.createElement('div', 'rest-content');
        content.innerHTML = `
            <div class="rest-icon">👁️‍🗨️</div>
            <div class="rest-title">護眼時間到！</div>
            <div class="rest-message">
                ${this.customMessage || `小朋友，你已經玩了20分鐘了！<br>現在讓眼睛休息一下，看看遠方的風景吧～`}
            </div>
            <div class="countdown" id="countdown">60</div>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="rest-tips">
                💡 小貼士：看看窗外的綠色植物，對眼睛很有幫助哦！
            </div>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }

    bindEvents() {
        // 頁面離開時清理資源
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 頁面隱藏時暫停計時
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    start() {
        this.gameStartTime = Date.now();
        this.eyeProtectionTimer = setTimeout(() => {
            this.showRestScreen();
        }, this.gameTimeLimit);
        
        console.log('護眼保護已啟動');
    }

    pause() {
        if (this.eyeProtectionTimer) {
            clearTimeout(this.eyeProtectionTimer);
        }
    }

    resume() {
        if (this.gameStartTime && !this.isResting) {
            const elapsed = Date.now() - this.gameStartTime;
            const remaining = Math.max(0, this.gameTimeLimit - elapsed);
            
            if (remaining > 0) {
                this.eyeProtectionTimer = setTimeout(() => {
                    this.showRestScreen();
                }, remaining);
            } else {
                this.showRestScreen();
            }
        }
    }

    showRestScreen() {
        if (this.isResting) return;
        
        this.isResting = true;
        
        // 暫停遊戲
        if (this.onPause) {
            this.onPause();
        }
        
        const overlay = Utils.$('eyeProtectionOverlay');
        const countdown = Utils.$('countdown');
        const progressFill = Utils.$('progressFill');
        
        Utils.show(overlay);
        
        let timeLeft = this.restTime;
        countdown.textContent = timeLeft;
        progressFill.style.width = '0%';
        
        this.restTimer = setInterval(() => {
            timeLeft--;
            countdown.textContent = timeLeft;
            
            // 更新進度條
            const progress = ((this.restTime - timeLeft) / this.restTime) * 100;
            progressFill.style.width = progress + '%';
            
            // 最後倒數時的視覺效果
            if (timeLeft <= 5) {
                countdown.style.color = '#ff6b6b';
                countdown.style.transform = 'scale(1.1)';
            } else {
                countdown.style.color = '#00b894';
                countdown.style.transform = 'scale(1)';
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.restTimer);
                this.hideRestScreen();
            }
        }, 1000);
        
        // 播放提示音效
        Utils.playSound('rest');
        Utils.vibrate([200, 100, 200]);
    }

    hideRestScreen() {
        const overlay = Utils.$('eyeProtectionOverlay');
        Utils.hide(overlay);
        this.isResting = false;
        
        // 恢復遊戲
        if (this.onResume) {
            this.onResume();
        }
        
        // 重新開始計時
        this.start();
        
        console.log('休息結束，遊戲恢復');
    }

    cleanup() {
        if (this.eyeProtectionTimer) {
            clearTimeout(this.eyeProtectionTimer);
            this.eyeProtectionTimer = null;
        }
        
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
        
        this.isResting = false;
        console.log('護眼保護已清理');
    }

    // 獲取剩餘時間
    getRemainingTime() {
        if (!this.gameStartTime) return this.gameTimeLimit;
        
        const elapsed = Date.now() - this.gameStartTime;
        return Math.max(0, this.gameTimeLimit - elapsed);
    }

    // 獲取遊戲時長
    getElapsedTime() {
        if (!this.gameStartTime) return 0;
        
        return Date.now() - this.gameStartTime;
    }

    // 是否正在休息
    isInRestMode() {
        return this.isResting;
    }

    // 設置自定義提醒訊息
    setCustomMessage(message) {
        this.customMessage = message;
        const messageElement = document.querySelector('.rest-message');
        if (messageElement) {
            messageElement.innerHTML = message;
        }
    }

    // 強制顯示休息畫面（測試用）
    forceRest() {
        this.showRestScreen();
    }

    // 更新配置
    updateConfig(options) {
        if (options.gameTimeLimit) this.gameTimeLimit = options.gameTimeLimit;
        if (options.restTime) this.restTime = options.restTime;
        if (options.onPause) this.onPause = options.onPause;
        if (options.onResume) this.onResume = options.onResume;
        if (options.customMessage) this.customMessage = options.customMessage;
        if (options.testMode !== undefined) {
            this.testMode = options.testMode;
            this.applyTestMode();
        }
    }
    
    // 切換測試模式
    toggleTestMode() {
        this.testMode = !this.testMode;
        localStorage.setItem('eyeProtectionTestMode', this.testMode.toString());
        this.applyTestMode();
        
        console.log(`🔧 測試模式已${this.testMode ? '啟用' : '關閉'}`);
        if (this.testMode) {
            this.showTestModeInfo();
        } else {
            // 移除測試模式提示
            const indicator = document.getElementById('testModeIndicator');
            const border = document.getElementById('testModeBorder');
            const panel = document.getElementById('testControlPanel');
            if (indicator) {
                indicator.remove();
            }
            if (border) {
                border.remove();
            }
            if (panel) {
                panel.remove();
            }
        }
        
        return this.testMode;
    }
    
    // 套用測試模式設定
    applyTestMode() {
        if (this.testMode) {
            this.gameTimeLimit = 10 * 1000; // 10秒
            this.restTime = 5; // 5秒
        } else {
            this.gameTimeLimit = 20 * 60 * 1000; // 20分鐘
            this.restTime = 60; // 1分鐘
        }
        
        // 重新開始計時
        if (this.gameStartTime && !this.isResting) {
            this.cleanup();
            this.start();
        }
    }
    
    // 啟用測試模式 (外部調用)
    enableTestMode() {
        if (!this.testMode) {
            this.toggleTestMode();
        }
    }
    
    // 關閉測試模式 (外部調用)
    disableTestMode() {
        if (this.testMode) {
            this.toggleTestMode();
        }
    }

    // 獲取統計信息
    getStats() {
        return {
            totalGameTime: this.getElapsedTime(),
            remainingTime: this.getRemainingTime(),
            isResting: this.isResting,
            restProgress: this.isResting ? 
                ((this.restTime - parseInt(Utils.$('countdown')?.textContent || this.restTime)) / this.restTime * 100) : 0
        };
    }
}

// 全域實例，方便在不同遊戲中使用
window.EyeProtection = EyeProtection;

// 快速建立護眼保護的輔助函數
window.createEyeProtection = function(gameCallbacks = {}) {
    return new EyeProtection({
        onPause: gameCallbacks.onPause || function() {
            console.log('遊戲已暫停');
        },
        onResume: gameCallbacks.onResume || function() {
            console.log('遊戲已恢復');
        },
        customMessage: gameCallbacks.customMessage,
        testMode: gameCallbacks.testMode
    });
};

// 全域測試工具
window.EyeProtectionTester = {
    // 快速啟用測試模式
    enableTestMode() {
        Utils.setTestMode(true);
        console.log('🧪 護眼保護測試模式已全域啟用 (localStorage + Cookie)');
        console.log('🔄 請重新載入頁面以生效');
    },
    
    // 快速關閉測試模式
    disableTestMode() {
        Utils.setTestMode(false);
        Utils.eraseCookie('eyeProtectionTestMode');
        console.log('✅ 護眼保護測試模式已全域關閉');
        console.log('🔄 請重新載入頁面以生效');
    },
    
    // 檢查當前狀態
    getStatus() {
        const testMode = Utils.isTestMode();
        console.log(`當前測試模式狀態: ${testMode ? '啟用' : '關閉'}`);
        console.log('檢測方式: URL參數 + localStorage + Cookie');
        return testMode;
    },
    
    // 快速測試
    quickTest() {
        this.enableTestMode();
        console.log('🚀 快速測試模式已啟用！');
        console.log('📝 測試設定:');
        console.log('   - 遊戲時間: 10秒');
        console.log('   - 休息時間: 5秒');
        console.log('   - 儲存方式: localStorage + Cookie');
        console.log('🔄 請重新載入頁面開始測試');
    }
};