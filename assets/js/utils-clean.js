// Clean Code 重構後的統一工具類入口
// 採用組合模式，將各個專門的工具類組合起來

class Utils {
    // DOM 操作代理
    static get DOM() { return DOMUtils; }
    static $(id) { return DOMUtils.getElementById(id); }
    static createElement(tag, className, content) { 
        return DOMUtils.createElement(tag, className, content); 
    }
    static show(element) { return DOMUtils.show(element); }
    static hide(element) { return DOMUtils.hide(element); }
    static toggle(element) { return DOMUtils.toggle(element); }
    static addClass(element, className) { return DOMUtils.addClass(element, className); }
    static removeClass(element, className) { return DOMUtils.removeClass(element, className); }
    static toggleClass(element, className) { return DOMUtils.toggleClass(element, className); }
    static on(element, event, handler) { return DOMUtils.addEventListener(element, event, handler); }
    static off(element, event, handler) { return DOMUtils.removeEventListener(element, event, handler); }
    static animate(element, keyframes, options) { return DOMUtils.animate(element, keyframes, options); }
    static scrollTo(element) { return DOMUtils.scrollToElement(element); }

    // 存儲操作代理
    static get Storage() { return StorageUtils; }
    static saveToStorage(key, data) { return StorageUtils.saveToLocalStorage(key, data); }
    static loadFromStorage(key, defaultValue) { return StorageUtils.loadFromLocalStorage(key, defaultValue); }
    static setCookie(name, value, days) { return StorageUtils.setCookie(name, value, days); }
    static getCookie(name) { return StorageUtils.getCookie(name); }
    static eraseCookie(name) { return StorageUtils.deleteCookie(name); }

    // URL 操作代理
    static get URL() { return URLUtils; }
    static getUrlParams() { return URLUtils.getUrlParams(); }
    static createUrlWithParams(baseUrl, params) { return URLUtils.createUrlWithParams(baseUrl, params); }
    static navigateWithParams(pageUrl, params) { return URLUtils.navigateWithParams(pageUrl, params); }

    // 數學操作代理
    static get Math() { return MathUtils; }
    static random(min, max) { return MathUtils.randomInt(min, max); }
    static randomChoice(array) { return MathUtils.randomChoice(array); }
    static clamp(value, min, max) { return MathUtils.clamp(value, min, max); }
    static distance(x1, y1, x2, y2) { return MathUtils.distance(x1, y1, x2, y2); }
    static formatTime(seconds) { return MathUtils.formatTime(seconds); }
    static toRadians(degrees) { return MathUtils.toRadians(degrees); }
    static toDegrees(radians) { return MathUtils.toDegrees(radians); }

    // 設備檢測代理
    static get Device() { return DeviceUtils; }
    static isMobile() { return DeviceUtils.isMobile(); }
    static isSmallMobile() { return DeviceUtils.isSmallMobile(); }
    static vibrate(pattern) { return DeviceUtils.vibrate(pattern); }
    static playSound(soundName) { return DeviceUtils.playSound(soundName); }

    // 函數工具代理
    static get Function() { return FunctionUtils; }
    static debounce(func, wait) { return FunctionUtils.debounce(func, wait); }
    static throttle(func, limit) { return FunctionUtils.throttle(func, limit); }
    static delay(ms) { return FunctionUtils.delay(ms); }

    // 數據處理
    static deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.warn('Deep clone failed:', error);
            return obj;
        }
    }

    static unique(array) {
        if (!Array.isArray(array)) {
            throw new Error('Input must be an array');
        }
        return [...new Set(array)];
    }

    // 測試模式相關 - 業務邏輯
    static isTestMode() {
        const urlTest = URLUtils.isTestModeFromUrl();
        const localTest = StorageUtils.loadFromLocalStorage('eyeProtectionTestMode') === 'true';
        const cookieTest = StorageUtils.getCookie('eyeProtectionTestMode') === 'true';
        
        console.log('🔍 測試模式檢測:', { urlTest, localTest, cookieTest });
        return urlTest || localTest || cookieTest;
    }

    static setTestMode(enabled) {
        const value = enabled.toString();
        StorageUtils.saveToLocalStorage('eyeProtectionTestMode', value);
        StorageUtils.setCookie('eyeProtectionTestMode', value);
        console.log(`🧪 測試模式已${enabled ? '啟用' : '關閉'} (localStorage + Cookie)`);
    }
}

// 向後兼容 - 保持原有的 window.Utils
window.Utils = Utils;