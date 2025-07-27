// 存儲工具類 - 單一職責：數據存儲相關操作
class StorageUtils {
    // localStorage 操作
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    }

    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    static removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
            return false;
        }
    }

    // Cookie 操作
    static setCookie(name, value, days = 7) {
        this._validateCookieParams(name, value);
        
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${value || ""}${expires}; path=/`;
    }

    static getCookie(name) {
        this._validateCookieName(name);
        
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            let c = cookie.trim();
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length);
            }
        }
        return null;
    }

    static deleteCookie(name) {
        this._validateCookieName(name);
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }

    // 私有方法 - 參數驗證
    static _validateCookieName(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Cookie name must be a non-empty string');
        }
    }

    static _validateCookieParams(name, value) {
        this._validateCookieName(name);
        if (value !== null && value !== undefined && typeof value !== 'string') {
            throw new Error('Cookie value must be a string, null, or undefined');
        }
    }

    // 清除所有相關存儲
    static clearAllGameData() {
        const gameKeys = ['gameStats', 'eyeProtectionTestMode'];
        
        gameKeys.forEach(key => {
            this.removeFromLocalStorage(key);
            this.deleteCookie(key);
        });
        
        console.log('All game data cleared');
    }
}

window.StorageUtils = StorageUtils;