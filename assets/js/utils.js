// 工具函數庫
class Utils {
    // 獲取DOM元素
    static $(id) {
        return document.getElementById(id);
    }

    // 創建元素
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    // 隨機數生成
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 隨機選擇數組元素
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // 延遲執行
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 格式化時間
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 顯示/隱藏元素
    static show(element) {
        if (typeof element === 'string') element = this.$(element);
        element.style.display = 'block';
    }

    static hide(element) {
        if (typeof element === 'string') element = this.$(element);
        element.style.display = 'none';
    }

    static toggle(element) {
        if (typeof element === 'string') element = this.$(element);
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }

    // 添加/移除類名
    static addClass(element, className) {
        if (typeof element === 'string') element = this.$(element);
        element.classList.add(className);
    }

    static removeClass(element, className) {
        if (typeof element === 'string') element = this.$(element);
        element.classList.remove(className);
    }

    static toggleClass(element, className) {
        if (typeof element === 'string') element = this.$(element);
        element.classList.toggle(className);
    }

    // 動畫效果
    static animate(element, keyframes, options = {}) {
        if (typeof element === 'string') element = this.$(element);
        return element.animate(keyframes, {
            duration: 300,
            easing: 'ease-out',
            ...options
        });
    }

    // 平滑滾動到元素
    static scrollTo(element) {
        if (typeof element === 'string') element = this.$(element);
        element.scrollIntoView({ behavior: 'smooth' });
    }

    // 響應式檢測
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isSmallMobile() {
        return window.innerWidth <= 480;
    }

    // 存儲相關
    static saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from storage:', e);
            return defaultValue;
        }
    }

    // 事件相關
    static on(element, event, handler) {
        if (typeof element === 'string') element = this.$(element);
        element.addEventListener(event, handler);
    }

    static off(element, event, handler) {
        if (typeof element === 'string') element = this.$(element);
        element.removeEventListener(event, handler);
    }

    // 音效播放 (未來可擴展)
    static playSound(soundName) {
        // 預留音效功能
        console.log(`Playing sound: ${soundName}`);
    }

    // 震動反饋 (移動設備)
    static vibrate(pattern = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // 防抖函數
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 節流函數
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 深拷貝
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // 數組去重
    static unique(array) {
        return [...new Set(array)];
    }

    // 數值限制在範圍內
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // 計算兩點距離
    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // 角度轉弧度
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // 弧度轉角度
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // URL 參數處理方法
    static getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    // 創建帶參數的 URL
    static createUrlWithParams(baseUrl, additionalParams = {}) {
        const currentParams = this.getUrlParams();
        const newUrl = new URL(baseUrl, window.location.origin);
        
        // 保持當前頁面的所有參數
        for (const [key, value] of currentParams) {
            newUrl.searchParams.set(key, value);
        }
        
        // 添加額外參數
        for (const [key, value] of Object.entries(additionalParams)) {
            newUrl.searchParams.set(key, value);
        }
        
        return newUrl.href.replace(newUrl.origin + '/', '');
    }

    // 導航到頁面並保持參數
    static navigateWithParams(pageUrl, additionalParams = {}) {
        const urlWithParams = this.createUrlWithParams(pageUrl, additionalParams);
        console.log('🔗 導航到:', urlWithParams);
        window.location.href = urlWithParams;
    }

    // Cookie 操作方法
    static setCookie(name, value, days = 7) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    static getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    static eraseCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    // 檢查是否為測試模式
    static isTestMode() {
        const urlParams = this.getUrlParams();
        const urlTest = urlParams.get('test') === 'true';
        const localTest = localStorage.getItem('eyeProtectionTestMode') === 'true';
        const cookieTest = this.getCookie('eyeProtectionTestMode') === 'true';
        
        console.log('🔍 測試模式檢測:', { urlTest, localTest, cookieTest });
        
        return urlTest || localTest || cookieTest;
    }

    // 設置測試模式
    static setTestMode(enabled) {
        const value = enabled.toString();
        localStorage.setItem('eyeProtectionTestMode', value);
        this.setCookie('eyeProtectionTestMode', value);
        console.log(`🧪 測試模式已${enabled ? '啟用' : '關閉'} (localStorage + Cookie)`);
    }
}

// 導出工具類
window.Utils = Utils;