// 數學工具類 - 單一職責：數學計算相關操作
class MathUtils {
    // 隨機數生成
    static randomInt(min, max) {
        this._validateRange(min, max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min, max) {
        this._validateRange(min, max);
        return Math.random() * (max - min) + min;
    }

    static randomChoice(array) {
        this._validateArray(array);
        return array[Math.floor(Math.random() * array.length)];
    }

    // 數值處理
    static clamp(value, min, max) {
        this._validateRange(min, max);
        return Math.min(Math.max(value, min), max);
    }

    static round(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    // 距離計算
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 角度轉換
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // 時間格式化
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 私有方法 - 參數驗證
    static _validateRange(min, max) {
        if (typeof min !== 'number' || typeof max !== 'number') {
            throw new Error('Min and max must be numbers');
        }
        if (min > max) {
            throw new Error('Min cannot be greater than max');
        }
    }

    static _validateArray(array) {
        if (!Array.isArray(array) || array.length === 0) {
            throw new Error('Input must be a non-empty array');
        }
    }
}

window.MathUtils = MathUtils;