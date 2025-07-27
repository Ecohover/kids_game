// URL 工具類 - 單一職責：URL 和導航相關操作
class URLUtils {
    // URL 參數操作
    static getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    static getUrlParam(paramName) {
        return this.getUrlParams().get(paramName);
    }

    static hasUrlParam(paramName) {
        return this.getUrlParams().has(paramName);
    }

    // URL 構建
    static createUrlWithParams(baseUrl, additionalParams = {}) {
        this._validateBaseUrl(baseUrl);
        
        const currentParams = this.getUrlParams();
        const newUrl = new URL(baseUrl, window.location.origin);
        
        // 保持當前頁面的所有參數
        currentParams.forEach((value, key) => {
            newUrl.searchParams.set(key, value);
        });
        
        // 添加額外參數
        Object.entries(additionalParams).forEach(([key, value]) => {
            newUrl.searchParams.set(key, value);
        });
        
        return newUrl.href.replace(newUrl.origin + '/', '');
    }

    // 導航方法
    static navigateWithParams(pageUrl, additionalParams = {}) {
        const urlWithParams = this.createUrlWithParams(pageUrl, additionalParams);
        this._logNavigation(urlWithParams);
        window.location.href = urlWithParams;
    }

    static navigateTo(url) {
        this._validateBaseUrl(url);
        window.location.href = url;
    }

    static reload() {
        window.location.reload();
    }

    // 測試模式檢測
    static isTestModeFromUrl() {
        return this.getUrlParam('test') === 'true' || 
               this.getUrlParam('testMode') === 'true';
    }

    // 私有方法
    static _validateBaseUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('URL must be a non-empty string');
        }
    }

    static _logNavigation(url) {
        console.log('🔗 導航到:', url);
    }
}

window.URLUtils = URLUtils;