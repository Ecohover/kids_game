// Clean Code 重構後的護眼保護系統
class EyeProtection {
    // 常數定義
    static DEFAULTS = {
        GAME_TIME_NORMAL: 20 * 60 * 1000, // 20分鐘
        GAME_TIME_TEST: 10 * 1000,        // 10秒
        REST_TIME_NORMAL: 60,             // 1分鐘
        REST_TIME_TEST: 5,                // 5秒
        COOKIE_EXPIRY_DAYS: 7
    };

    static ELEMENT_IDS = {
        OVERLAY: 'eyeProtectionOverlay',
        COUNTDOWN: 'countdown',
        PROGRESS_FILL: 'progressFill',
        TEST_INDICATOR: 'testModeIndicator',
        TEST_BORDER: 'testModeBorder',
        TEST_CONTROL_PANEL: 'testControlPanel'
    };

    constructor(options = {}) {
        this._initializeConfig(options);
        this._initializeState();
        this._setupEventListeners();
        
        if (this.testMode) {
            this._showTestModeInterface();
        }
    }

    // 初始化配置
    _initializeConfig(options) {
        this.testMode = options.testMode || this._detectTestMode();
        this.gameTimeLimit = this._getGameTimeLimit();
        this.restTime = this._getRestTime();
        this.onPause = options.onPause || null;
        this.onResume = options.onResume || null;
        this.customMessage = options.customMessage || null;
    }

    // 初始化狀態
    _initializeState() {
        this.gameStartTime = null;
        this.eyeProtectionTimer = null;
        this.restTimer = null;
        this.isResting = false;
        
        this._createOverlay();
    }

    // 事件監聽器設置
    _setupEventListeners() {
        window.addEventListener('beforeunload', () => this.cleanup());
        document.addEventListener('visibilitychange', () => this._handleVisibilityChange());
    }

    // 檢測測試模式
    _detectTestMode() {
        const urlTest = URLUtils.isTestModeFromUrl();
        const storageTest = Utils.isTestMode();
        
        const result = urlTest || storageTest || this._isLocalDevelopment();
        
        // 自動設置持久化存儲
        if (urlTest && !Utils.getCookie('eyeProtectionTestMode')) {
            Utils.setTestMode(true);
            console.log('🔄 檢測到URL測試參數，已自動設置持久化存儲');
        }
        
        return result;
    }

    // 本地開發環境檢測
    _isLocalDevelopment() {
        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        return isLocalhost && Utils.loadFromStorage('eyeProtectionTestMode') !== 'false';
    }

    // 獲取遊戲時間限制
    _getGameTimeLimit() {
        return this.testMode ? 
            EyeProtection.DEFAULTS.GAME_TIME_TEST : 
            EyeProtection.DEFAULTS.GAME_TIME_NORMAL;
    }

    // 獲取休息時間
    _getRestTime() {
        return this.testMode ? 
            EyeProtection.DEFAULTS.REST_TIME_TEST : 
            EyeProtection.DEFAULTS.REST_TIME_NORMAL;
    }

    // 顯示測試模式界面
    _showTestModeInterface() {
        this._logTestModeInfo();
        this._createTestModeIndicator();
        this._createTestModeBorder();
        this._createTestControlPanel();
    }

    // 記錄測試模式信息
    _logTestModeInfo() {
        console.log('🧪 護眼保護測試模式已啟用');
        console.log(`⏰ 遊戲時間: ${this.gameTimeLimit / 1000}秒`);
        console.log(`😴 休息時間: ${this.restTime}秒`);
        console.log('💡 可用命令:');
        console.log('  - eyeProtection.toggleTestMode() 切換模式');
        console.log('  - eyeProtection.forceRest() 立即休息');
    }

    // 創建護眼覆蓋層
    _createOverlay() {
        if (Utils.$(EyeProtection.ELEMENT_IDS.OVERLAY)) return;

        const overlay = Utils.createElement('div', 'eye-protection-overlay');
        overlay.id = EyeProtection.ELEMENT_IDS.OVERLAY;
        
        overlay.innerHTML = this._getOverlayHTML();
        document.body.appendChild(overlay);
    }

    // 獲取覆蓋層 HTML
    _getOverlayHTML() {
        const message = this.customMessage || 
            '小朋友，你已經玩了20分鐘了！<br>現在讓眼睛休息一下，看看遠方的風景吧～';
            
        return `
            <div class="rest-content">
                <div class="rest-icon">👁️‍🗨️</div>
                <div class="rest-title">護眼時間到！</div>
                <div class="rest-message">${message}</div>
                <div class="countdown" id="${EyeProtection.ELEMENT_IDS.COUNTDOWN}">60</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="${EyeProtection.ELEMENT_IDS.PROGRESS_FILL}"></div>
                </div>
                <div class="rest-tips">
                    💡 小貼士：看看窗外的綠色植物，對眼睛很有幫助哦！
                </div>
            </div>
        `;
    }

    // 處理頁面可見性變化
    _handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }

    // 公共方法
    start() {
        if (this.eyeProtectionTimer) return;
        
        this.gameStartTime = Date.now();
        this.eyeProtectionTimer = setTimeout(() => {
            this._showRestScreen();
        }, this.gameTimeLimit);
        
        console.log('護眼保護已啟動');
    }

    pause() {
        if (this.eyeProtectionTimer) {
            clearTimeout(this.eyeProtectionTimer);
            this.eyeProtectionTimer = null;
        }
    }

    resume() {
        if (!this.gameStartTime || this.isResting) return;
        
        const elapsed = Date.now() - this.gameStartTime;
        const remaining = Math.max(0, this.gameTimeLimit - elapsed);
        
        if (remaining > 0) {
            this.eyeProtectionTimer = setTimeout(() => {
                this._showRestScreen();
            }, remaining);
        } else {
            this._showRestScreen();
        }
    }

    cleanup() {
        this._clearTimers();
        this.isResting = false;
        console.log('護眼保護已清理');
    }

    forceRest() {
        this._showRestScreen();
    }

    toggleTestMode() {
        this.testMode = !this.testMode;
        Utils.setTestMode(this.testMode);
        this._updateConfiguration();
        
        console.log(`🔧 測試模式已${this.testMode ? '啟用' : '關閉'}`);
        
        if (this.testMode) {
            this._showTestModeInterface();
        } else {
            this._hideTestModeInterface();
        }
        
        return this.testMode;
    }

    // 私有方法 - 休息屏幕控制
    _showRestScreen() {
        if (this.isResting) return;
        
        this.isResting = true;
        this._pauseGame();
        this._displayRestOverlay();
        this._startRestCountdown();
        this._playRestEffects();
    }

    _pauseGame() {
        if (this.onPause) {
            this.onPause();
        }
    }

    _displayRestOverlay() {
        const overlay = Utils.$(EyeProtection.ELEMENT_IDS.OVERLAY);
        Utils.show(overlay);
    }

    _startRestCountdown() {
        const countdown = Utils.$(EyeProtection.ELEMENT_IDS.COUNTDOWN);
        const progressFill = Utils.$(EyeProtection.ELEMENT_IDS.PROGRESS_FILL);
        
        let timeLeft = this.restTime;
        countdown.textContent = timeLeft;
        progressFill.style.width = '0%';
        
        this.restTimer = setInterval(() => {
            timeLeft--;
            this._updateCountdownDisplay(countdown, progressFill, timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(this.restTimer);
                this._hideRestScreen();
            }
        }, 1000);
    }

    _updateCountdownDisplay(countdown, progressFill, timeLeft) {
        countdown.textContent = timeLeft;
        
        const progress = ((this.restTime - timeLeft) / this.restTime) * 100;
        progressFill.style.width = progress + '%';
        
        // 最後倒數視覺效果
        if (timeLeft <= 5) {
            countdown.style.color = '#ff6b6b';
            countdown.style.transform = 'scale(1.1)';
        } else {
            countdown.style.color = '#00b894';
            countdown.style.transform = 'scale(1)';
        }
    }

    _hideRestScreen() {
        const overlay = Utils.$(EyeProtection.ELEMENT_IDS.OVERLAY);
        Utils.hide(overlay);
        this.isResting = false;
        
        this._resumeGame();
        this.start(); // 重新開始計時
        
        console.log('休息結束，遊戲恢復');
    }

    _resumeGame() {
        if (this.onResume) {
            this.onResume();
        }
    }

    _playRestEffects() {
        Utils.playSound('rest');
        Utils.vibrate([200, 100, 200]);
    }

    _clearTimers() {
        if (this.eyeProtectionTimer) {
            clearTimeout(this.eyeProtectionTimer);
            this.eyeProtectionTimer = null;
        }
        
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
    }

    _updateConfiguration() {
        this.gameTimeLimit = this._getGameTimeLimit();
        this.restTime = this._getRestTime();
        
        if (this.gameStartTime && !this.isResting) {
            this.cleanup();
            this.start();
        }
    }

    _hideTestModeInterface() {
        const elements = [
            EyeProtection.ELEMENT_IDS.TEST_INDICATOR,
            EyeProtection.ELEMENT_IDS.TEST_BORDER,
            EyeProtection.ELEMENT_IDS.TEST_CONTROL_PANEL
        ];
        
        elements.forEach(id => {
            const element = Utils.$(id);
            if (element) element.remove();
        });
    }

    // 創建測試模式指示器
    _createTestModeIndicator() {
        if (Utils.$(EyeProtection.ELEMENT_IDS.TEST_INDICATOR)) return;
        
        const indicator = Utils.createElement('div', 'test-mode-indicator');
        indicator.id = EyeProtection.ELEMENT_IDS.TEST_INDICATOR;
        
        const closeBtn = Utils.createElement('span', 'close-btn');
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => indicator.remove();
        
        indicator.innerHTML = `
            🧪 測試環境 - 遊戲${this.gameTimeLimit / 1000}秒 休息${this.restTime}秒
        `;
        indicator.appendChild(closeBtn);
        
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
            animation: testModeSlideIn 0.5s ease-out;
            cursor: pointer;
            user-select: none;
        `;
        
        closeBtn.style.cssText = `
            position: absolute;
            top: -5px;
            right: 5px;
            width: 25px;
            height: 25px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            margin-left: 5px;
        `;
        
        this._addTestModeStyles();
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
        
        // 添加鼠標事件
        Utils.on(closeBtn, 'mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            closeBtn.style.transform = 'scale(1.1)';
        });
        
        Utils.on(closeBtn, 'mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1)';
        });
    }

    _createTestModeBorder() {
        if (Utils.$(EyeProtection.ELEMENT_IDS.TEST_BORDER)) return;
        
        const border = Utils.createElement('div', 'test-mode-border');
        border.id = EyeProtection.ELEMENT_IDS.TEST_BORDER;
        
        border.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 8px solid #ff0000;
            border-radius: 10px;
            pointer-events: none;
            z-index: 9998;
            animation: testModeBorderPulse 2s infinite;
            box-shadow: 
                inset 0 0 0 4px rgba(255, 0, 0, 0.3),
                0 0 0 2px rgba(255, 0, 0, 0.2);
        `;
        
        document.body.appendChild(border);
    }

    _createTestControlPanel() {
        if (Utils.$(EyeProtection.ELEMENT_IDS.TEST_CONTROL_PANEL)) return;
        
        const panel = Utils.createElement('div', 'test-control-panel');
        panel.id = EyeProtection.ELEMENT_IDS.TEST_CONTROL_PANEL;
        
        panel.innerHTML = `
            <div class="panel-header">
                <span>🧪 測試控制面板</span>
                <button class="close-panel">×</button>
            </div>
            <div class="panel-content">
                <div class="control-group">
                    <label>遊戲時間: ${this.gameTimeLimit / 1000}秒</label>
                    <label>休息時間: ${this.restTime}秒</label>
                </div>
                <div class="control-buttons">
                    <button onclick="eyeProtection.forceRest()" class="control-btn">強制休息</button>
                    <button onclick="eyeProtection.toggleTestMode()" class="control-btn">切換模式</button>
                </div>
                <div class="panel-info">
                    <small>💡 控制台可用: eyeProtection.getStats()</small>
                </div>
            </div>
        `;
        
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border-radius: 10px;
            padding: 0;
            z-index: 9999;
            min-width: 280px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            font-family: monospace;
            border: 2px solid #ff6b6b;
        `;
        
        document.body.appendChild(panel);
        this._bindTestControlPanelEvents(panel);
    }

    _addTestModeStyles() {
        if (document.getElementById('testModeStyles')) return;
        
        const style = Utils.createElement('style');
        style.id = 'testModeStyles';
        style.textContent = `
            @keyframes testModeSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes testModeSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes testModeBorderPulse {
                0%, 100% { border-color: #ff0000; box-shadow: inset 0 0 0 4px rgba(255, 0, 0, 0.3), 0 0 0 2px rgba(255, 0, 0, 0.2); }
                50% { border-color: #ff4444; box-shadow: inset 0 0 0 4px rgba(255, 0, 0, 0.5), 0 0 0 2px rgba(255, 0, 0, 0.4); }
            }
            
            .test-control-panel .panel-header {
                background: #ff6b6b;
                padding: 10px 15px;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
            }
            
            .test-control-panel .panel-content {
                padding: 15px;
            }
            
            .test-control-panel .control-group {
                margin-bottom: 10px;
            }
            
            .test-control-panel .control-group label {
                display: block;
                margin-bottom: 5px;
                font-size: 12px;
                color: #ccc;
            }
            
            .test-control-panel .control-buttons {
                margin-bottom: 10px;
            }
            
            .test-control-panel .control-btn {
                background: #333;
                color: white;
                border: 1px solid #555;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 5px;
                margin-bottom: 5px;
                font-size: 11px;
                transition: all 0.3s;
            }
            
            .test-control-panel .control-btn:hover {
                background: #555;
                border-color: #777;
            }
            
            .test-control-panel .close-panel {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .test-control-panel .panel-info {
                border-top: 1px solid #333;
                padding-top: 8px;
                margin-top: 8px;
            }
            
            .test-control-panel .panel-info small {
                color: #888;
                font-size: 10px;
            }
        `;
        
        document.head.appendChild(style);
    }

    _bindTestControlPanelEvents(panel) {
        const closeBtn = panel.querySelector('.close-panel');
        Utils.on(closeBtn, 'click', () => panel.remove());
    }

    // 統計信息
    getStats() {
        return {
            totalGameTime: this._getElapsedTime(),
            remainingTime: this._getRemainingTime(),
            isResting: this.isResting,
            testMode: this.testMode,
            gameTimeLimit: this.gameTimeLimit,
            restTime: this.restTime
        };
    }

    _getElapsedTime() {
        return this.gameStartTime ? Date.now() - this.gameStartTime : 0;
    }

    _getRemainingTime() {
        if (!this.gameStartTime) return this.gameTimeLimit;
        const elapsed = this._getElapsedTime();
        return Math.max(0, this.gameTimeLimit - elapsed);
    }
}

// 工廠函數
window.createEyeProtection = function(options = {}) {
    return new EyeProtection(options);
};

// 測試工具 - 重構後的版本
window.EyeProtectionTester = {
    enableTestMode() {
        Utils.setTestMode(true);
        console.log('🧪 護眼保護測試模式已全域啟用 (localStorage + Cookie)');
        console.log('🔄 請重新載入頁面以生效');
    },
    
    disableTestMode() {
        Utils.setTestMode(false);
        Utils.eraseCookie('eyeProtectionTestMode');
        console.log('✅ 護眼保護測試模式已全域關閉');
        console.log('🔄 請重新載入頁面以生效');
    },
    
    getStatus() {
        const testMode = Utils.isTestMode();
        console.log(`當前測試模式狀態: ${testMode ? '啟用' : '關閉'}`);
        console.log('檢測方式: URL參數 + localStorage + Cookie');
        return testMode;
    },
    
    quickTest() {
        this.enableTestMode();
        console.log('🚀 快速測試模式已啟用！');
        console.log('📝 測試設定: 遊戲10秒 + 休息5秒');
        console.log('🔄 請重新載入頁面開始測試');
    }
};

window.EyeProtection = EyeProtection;