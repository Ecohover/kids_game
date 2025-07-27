// 動物獵人遊戲邏輯模塊
class AnimalHunterGame {
    constructor(gameAreaSelector, options = {}) {
        this.gameArea = Utils.$(gameAreaSelector) || document.querySelector(gameAreaSelector);
        this.options = {
            maxLives: options.maxLives || 10,
            spawnRate: options.spawnRate || 2000,
            animalLifetime: options.animalLifetime || 3000,
            difficultyIncrease: options.difficultyIncrease || 0.9,
            ...options
        };
        
        this.score = 0;
        this.level = 1;
        this.lives = this.options.maxLives;
        this.gameRunning = false;
        this.gamePaused = false;
        this.spawnTimer = null;
        this.activeAnimals = [];
        
        this.animalTypes = {
            carnivore: {
                emojis: ['🦁', '🐯', '🐺', '🦈', '🐊', '🦅'],
                points: 20,
                color: '#ff6b6b'
            },
            herbivore: {
                emojis: ['🐄', '🐑', '🐰', '🦌', '🐴', '🐘'],
                points: -10,
                color: '#74b9ff'
            },
            omnivore: {
                emojis: ['🐻', '🐷', '🐵', '🐸', '🐔', '🦔'],
                points: -5,
                color: '#fdcb6e'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createGameElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    createGameElements() {
        // 檢查是否已存在遊戲元素
        if (!Utils.$('gameScore')) {
            this.createScoreElements();
        }
        if (!Utils.$('gameLives')) {
            this.createLivesElements();
        }
        if (!Utils.$('gameLevel')) {
            this.createLevelElements();
        }
        this.createGameOverOverlay();
    }
    
    createScoreElements() {
        const scoreElement = Utils.createElement('div', 'score');
        scoreElement.id = 'gameScore';
        scoreElement.textContent = `分數: ${this.score}`;
        this.gameArea.parentNode.insertBefore(scoreElement, this.gameArea);
    }
    
    createLivesElements() {
        const livesContainer = Utils.createElement('div', 'lives');
        livesContainer.id = 'gameLives';
        this.updateLivesDisplay(livesContainer);
        this.gameArea.parentNode.insertBefore(livesContainer, this.gameArea);
    }
    
    createLevelElements() {
        const levelElement = Utils.createElement('div', 'level-info');
        levelElement.id = 'gameLevel';
        levelElement.innerHTML = `<strong>等級:</strong> ${this.level}`;
        this.gameArea.parentNode.insertBefore(levelElement, this.gameArea);
    }
    
    createGameOverOverlay() {
        if (Utils.$('gameOverOverlay')) return;
        
        const overlay = Utils.createElement('div', 'game-over');
        overlay.id = 'gameOverOverlay';
        overlay.innerHTML = `
            <div class="game-over-content">
                <h2>🎮 遊戲結束</h2>
                <div class="final-stats">
                    <p>最終分數: <span id="finalScore">${this.score}</span></p>
                    <p>達到等級: <span id="finalLevel">${this.level}</span></p>
                </div>
                <button class="button restart-btn" onclick="game.restart()">再玩一次</button>
                <button class="button" onclick="window.location.href='index.html'">回到首頁</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    bindEvents() {
        // 遊戲區域點擊事件
        Utils.on(this.gameArea, 'click', (e) => {
            if (e.target.classList.contains('animal')) {
                this.handleAnimalClick(e.target);
            }
        });
        
        // 防止右鍵菜單
        Utils.on(this.gameArea, 'contextmenu', (e) => {
            e.preventDefault();
        });
        
        // 觸控優化
        if (Utils.isMobile()) {
            Utils.on(this.gameArea, 'touchstart', (e) => {
                e.preventDefault();
            });
        }
    }
    
    start() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.startSpawning();
        console.log('動物獵人遊戲開始');
    }
    
    pause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = true;
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
        
        // 暫停所有動物的計時器
        this.activeAnimals.forEach(animal => {
            if (animal.timer) {
                clearTimeout(animal.timer);
            }
        });
        
        console.log('遊戲已暫停');
    }
    
    resume() {
        if (!this.gameRunning || !this.gamePaused) return;
        
        this.gamePaused = false;
        this.startSpawning();
        
        // 恢復動物計時器
        this.activeAnimals.forEach(animal => {
            const remainingTime = animal.lifetime - (Date.now() - animal.spawnTime);
            if (remainingTime > 0) {
                animal.timer = setTimeout(() => {
                    this.removeAnimal(animal.element, false);
                }, remainingTime);
            } else {
                this.removeAnimal(animal.element, false);
            }
        });
        
        console.log('遊戲已恢復');
    }
    
    stop() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
        
        // 清除所有動物
        this.activeAnimals.forEach(animal => {
            if (animal.timer) clearTimeout(animal.timer);
            if (animal.element.parentNode) {
                animal.element.parentNode.removeChild(animal.element);
            }
        });
        this.activeAnimals = [];
        
        console.log('遊戲已停止');
    }
    
    restart() {
        this.stop();
        this.score = 0;
        this.level = 1;
        this.lives = this.options.maxLives;
        this.updateDisplay();
        Utils.hide('gameOverOverlay');
        this.start();
    }
    
    startSpawning() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.spawnAnimal();
        
        // 根據等級調整生成速度
        const spawnRate = Math.max(500, this.options.spawnRate * Math.pow(this.options.difficultyIncrease, this.level - 1));
        
        this.spawnTimer = setTimeout(() => {
            this.startSpawning();
        }, spawnRate);
    }
    
    spawnAnimal() {
        const types = Object.keys(this.animalTypes);
        const randomType = Utils.randomChoice(types);
        const animalData = this.animalTypes[randomType];
        const emoji = Utils.randomChoice(animalData.emojis);
        
        const animal = Utils.createElement('div', 'animal');
        animal.style.backgroundColor = animalData.color;
        animal.textContent = emoji;
        animal.dataset.type = randomType;
        animal.dataset.points = animalData.points;
        
        // 隨機位置
        const maxX = this.gameArea.clientWidth - 80;
        const maxY = this.gameArea.clientHeight - 80;
        const x = Utils.random(0, maxX);
        const y = Utils.random(0, maxY);
        
        animal.style.left = x + 'px';
        animal.style.top = y + 'px';
        
        this.gameArea.appendChild(animal);
        
        // 入場動畫
        Utils.animate(animal, [
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ], { duration: 200 });
        
        // 記錄動物信息
        const animalInfo = {
            element: animal,
            type: randomType,
            spawnTime: Date.now(),
            lifetime: this.options.animalLifetime,
            timer: null
        };
        
        // 設置移除計時器
        animalInfo.timer = setTimeout(() => {
            this.removeAnimal(animal, randomType === 'carnivore');
        }, this.options.animalLifetime);
        
        this.activeAnimals.push(animalInfo);
    }
    
    handleAnimalClick(animalElement) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const type = animalElement.dataset.type;
        const points = parseInt(animalElement.dataset.points);
        
        // 找到對應的動物信息
        const animalIndex = this.activeAnimals.findIndex(a => a.element === animalElement);
        if (animalIndex === -1) return;
        
        const animalInfo = this.activeAnimals[animalIndex];
        
        // 清除計時器
        if (animalInfo.timer) {
            clearTimeout(animalInfo.timer);
        }
        
        // 更新分數
        this.score += points;
        
        // 如果點擊了草食動物或雜食動物，扣生命
        if (type === 'herbivore' || type === 'omnivore') {
            this.lives--;
            this.showFeedback(animalElement, `${points}`, '#ff6b6b');
            Utils.vibrate([100, 50, 100]);
        } else {
            this.showFeedback(animalElement, `+${points}`, '#00b894');
            Utils.vibrate(50);
        }
        
        // 移除動物
        this.removeAnimal(animalElement, false);
        
        // 更新顯示
        this.updateDisplay();
        
        // 檢查升級
        this.checkLevelUp();
        
        // 檢查遊戲結束
        this.checkGameOver();
    }
    
    removeAnimal(animalElement, loseLife = false) {
        if (!animalElement.parentNode) return;
        
        // 從活動動物列表中移除
        const animalIndex = this.activeAnimals.findIndex(a => a.element === animalElement);
        if (animalIndex !== -1) {
            const animalInfo = this.activeAnimals[animalIndex];
            if (animalInfo.timer) {
                clearTimeout(animalInfo.timer);
            }
            this.activeAnimals.splice(animalIndex, 1);
        }
        
        // 如果是肉食動物且沒有被點擊，扣生命
        if (loseLife) {
            this.lives--;
            this.showFeedback(animalElement, '錯過了!', '#ff6b6b');
            this.updateDisplay();
            this.checkGameOver();
        }
        
        // 退場動畫
        Utils.animate(animalElement, [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0)', opacity: 0 }
        ], { duration: 200 }).then(() => {
            if (animalElement.parentNode) {
                animalElement.parentNode.removeChild(animalElement);
            }
        });
    }
    
    showFeedback(element, text, color) {
        const feedback = Utils.createElement('div', 'feedback');
        feedback.textContent = text;
        feedback.style.cssText = `
            position: absolute;
            left: ${element.style.left};
            top: ${element.style.top};
            color: ${color};
            font-size: 1.5em;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;
        
        this.gameArea.appendChild(feedback);
        
        Utils.animate(feedback, [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-50px)', opacity: 0 }
        ], { duration: 1000 }).then(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        });
    }
    
    updateDisplay() {
        // 更新分數
        const scoreElement = Utils.$('gameScore');
        if (scoreElement) {
            scoreElement.textContent = `分數: ${this.score}`;
        }
        
        // 更新等級
        const levelElement = Utils.$('gameLevel');
        if (levelElement) {
            levelElement.innerHTML = `<strong>等級:</strong> ${this.level}`;
        }
        
        // 更新生命
        const livesElement = Utils.$('gameLives');
        if (livesElement) {
            this.updateLivesDisplay(livesElement);
        }
    }
    
    updateLivesDisplay(container) {
        container.innerHTML = '';
        for (let i = 0; i < this.options.maxLives; i++) {
            const heart = Utils.createElement('span', 'heart');
            heart.textContent = '❤️';
            if (i >= this.lives) {
                Utils.addClass(heart, 'lost');
            }
            container.appendChild(heart);
        }
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showCelebration(`等級提升! 🎉`);
        }
    }
    
    checkGameOver() {
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.stop();
        
        // 更新最終統計
        const finalScore = Utils.$('finalScore');
        const finalLevel = Utils.$('finalLevel');
        if (finalScore) finalScore.textContent = this.score;
        if (finalLevel) finalLevel.textContent = this.level;
        
        Utils.show('gameOverOverlay');
        Utils.vibrate([200, 100, 200, 100, 200]);
    }
    
    showCelebration(message) {
        let celebration = Utils.$('celebration');
        if (!celebration) {
            celebration = Utils.createElement('div', 'celebration');
            celebration.id = 'celebration';
            document.body.appendChild(celebration);
        }
        
        celebration.textContent = message;
        Utils.show(celebration);
        
        setTimeout(() => {
            Utils.hide(celebration);
        }, 2000);
        
        Utils.vibrate([100, 50, 100, 50, 100]);
    }
    
    // 獲取遊戲統計
    getStats() {
        return {
            score: this.score,
            level: this.level,
            lives: this.lives,
            activeAnimals: this.activeAnimals.length,
            isRunning: this.gameRunning,
            isPaused: this.gamePaused
        };
    }
    
    // 設置配置
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// 全域遊戲實例
window.AnimalHunterGame = AnimalHunterGame;

// 快速創建遊戲的輔助函數
window.createAnimalHunterGame = function(gameAreaSelector, options = {}) {
    return new AnimalHunterGame(gameAreaSelector, options);
};