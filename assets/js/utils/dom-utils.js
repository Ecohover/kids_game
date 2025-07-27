// DOM 操作工具類 - 單一職責：DOM 相關操作
class DOMUtils {
    // 獲取DOM元素
    static getElementById(id) {
        return document.getElementById(id);
    }

    // 創建元素
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    // 顯示/隱藏元素
    static show(element) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) el.style.display = 'block';
    }

    static hide(element) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) el.style.display = 'none';
    }

    static toggle(element) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) {
            el.style.display = el.style.display === 'none' ? 'block' : 'none';
        }
    }

    // CSS 類操作
    static addClass(element, className) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) el.classList.add(className);
    }

    static removeClass(element, className) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) el.classList.remove(className);
    }

    static toggleClass(element, className) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) el.classList.toggle(className);
    }

    // 事件處理
    static addEventListener(element, event, handler) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) el.addEventListener(event, handler);
    }

    static removeEventListener(element, event, handler) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) el.removeEventListener(event, handler);
    }

    // 動畫效果
    static animate(element, keyframes, options = {}) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) {
            const animation = el.animate(keyframes, {
                duration: 300,
                easing: 'ease-out',
                ...options
            });
            return animation.finished;
        }
        return Promise.resolve();
    }

    // 平滑滾動
    static scrollToElement(element) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

window.DOMUtils = DOMUtils;