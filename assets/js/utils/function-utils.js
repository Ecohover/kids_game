// 函數工具類 - 單一職責：函數式編程輔助工具
class FunctionUtils {
    // 防抖函數
    static debounce(func, wait) {
        this._validateFunction(func);
        this._validateDelay(wait);
        
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 節流函數
    static throttle(func, limit) {
        this._validateFunction(func);
        this._validateDelay(limit);
        
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 延遲執行
    static delay(ms) {
        this._validateDelay(ms);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 重試機制
    static async retry(func, maxAttempts = 3, delayMs = 1000) {
        this._validateFunction(func);
        this._validateRetryParams(maxAttempts, delayMs);
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await func();
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                console.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
                await this.delay(delayMs);
            }
        }
    }

    // 函數組合
    static compose(...functions) {
        if (functions.length === 0) return arg => arg;
        if (functions.length === 1) return functions[0];
        
        functions.forEach(this._validateFunction);
        
        return functions.reduce((a, b) => (...args) => a(b(...args)));
    }

    // 管道操作
    static pipe(...functions) {
        return this.compose(...functions.reverse());
    }

    // 記憶化
    static memoize(func) {
        this._validateFunction(func);
        
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            
            if (cache.has(key)) {
                return cache.get(key);
            }
            
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }

    // 柯里化
    static curry(func) {
        this._validateFunction(func);
        
        return function curried(...args) {
            if (args.length >= func.length) {
                return func.apply(this, args);
            }
            return function(...nextArgs) {
                return curried.apply(this, args.concat(nextArgs));
            };
        };
    }

    // 私有方法 - 參數驗證
    static _validateFunction(func) {
        if (typeof func !== 'function') {
            throw new Error('Expected a function');
        }
    }

    static _validateDelay(delay) {
        if (typeof delay !== 'number' || delay < 0) {
            throw new Error('Delay must be a non-negative number');
        }
    }

    static _validateRetryParams(maxAttempts, delayMs) {
        if (typeof maxAttempts !== 'number' || maxAttempts < 1) {
            throw new Error('Max attempts must be a positive number');
        }
        this._validateDelay(delayMs);
    }
}

window.FunctionUtils = FunctionUtils;