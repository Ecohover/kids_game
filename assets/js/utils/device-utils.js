// 設備工具類 - 單一職責：設備檢測和相關操作
class DeviceUtils {
    // 設備檢測
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isSmallMobile() {
        return window.innerWidth <= 480;
    }

    static isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    static isDesktop() {
        return window.innerWidth > 1024;
    }

    // 觸控支援檢測
    static isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }

    // 瀏覽器檢測
    static getBrowserInfo() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        
        return 'Unknown';
    }

    // 設備功能
    static vibrate(pattern = 50) {
        if (this.supportsVibration()) {
            navigator.vibrate(pattern);
            return true;
        }
        return false;
    }

    static supportsVibration() {
        return 'vibrate' in navigator;
    }

    // 音效播放（預留）
    static playSound(soundName) {
        console.log(`Playing sound: ${soundName}`);
        // TODO: 實現真正的音效播放
    }

    // 響應式斷點檢測
    static getBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= 480) return 'small-mobile';
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        
        return 'desktop';
    }

    // 屏幕方向
    static getOrientation() {
        if (screen.orientation) {
            return screen.orientation.type;
        }
        
        // 備用方法
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    // 性能檢測
    static getPerformanceInfo() {
        if (!performance || !performance.memory) {
            return null;
        }

        return {
            memory: {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
            },
            timing: performance.timing ? {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
            } : null
        };
    }
}

window.DeviceUtils = DeviceUtils;