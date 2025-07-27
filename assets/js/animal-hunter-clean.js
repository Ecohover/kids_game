// Clean Code 重構後的動物獵人遊戲
class AnimalHunterGame {
    // 遊戲常數
    static DEFAULTS = {
        MAX_LIVES: 10,
        SPAWN_RATE: 2000,          // 初始動物生成間隔 (毫秒)
        ANIMAL_LIFETIME: 5000,     // 初始動物存在時間 (毫秒)
        SPAWN_RATE_DECREASE: 0.15, // 每級動物生成速度增加15%
        LIFETIME_DECREASE: 0.1,    // 每級動物存在時間減少10%
        MIN_SPAWN_RATE: 500,       // 最小生成間隔 (避免太快)
        MIN_LIFETIME: 2000,        // 最小存在時間 (避免太短)
        LEVEL_UP_SCORE: 100
    };

    static ELEMENT_IDS = {
        GAME_SCORE: 'gameScore',
        GAME_LIVES: 'gameLives', 
        GAME_LEVEL: 'gameLevel',
        GAME_OVER_OVERLAY: 'gameOverOverlay',
        FINAL_SCORE: 'finalScore',
        FINAL_LEVEL: 'finalLevel',
        CELEBRATION: 'celebration'
    };

    static ANIMAL_TYPES = {
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

    constructor(gameAreaSelector, options = {}) {
        this._initializeConfig(gameAreaSelector, options);
        this._initializeState();
        this._createGameElements();
        this._bindEvents();
        this._updateDisplay();
    }

    // 初始化配置
    _initializeConfig(gameAreaSelector, options) {
        this.gameArea = Utils.$(gameAreaSelector) || document.querySelector(gameAreaSelector);
        if (!this.gameArea) {
            throw new Error(`Game area not found: ${gameAreaSelector}`);
        }

        this.options = {
            maxLives: options.maxLives || AnimalHunterGame.DEFAULTS.MAX_LIVES,
            spawnRate: options.spawnRate || AnimalHunterGame.DEFAULTS.SPAWN_RATE,
            animalLifetime: options.animalLifetime || AnimalHunterGame.DEFAULTS.ANIMAL_LIFETIME,
            difficultyIncrease: options.difficultyIncrease || AnimalHunterGame.DEFAULTS.DIFFICULTY_INCREASE,
            ...options
        };
    }

    // 初始化狀態
    _initializeState() {
        this.score = 0;
        this.level = 1;
        this.lives = this.options.maxLives;
        this.gameRunning = false;
        this.gamePaused = false;
        this.spawnTimer = null;
        this.activeAnimals = [];
    }

    // 創建遊戲元素
    _createGameElements() {
        this._createScoreElement();
        this._createLivesElement();
        this._createLevelElement();
        this._createGameOverOverlay();
    }

    _createScoreElement() {
        // 元素已在HTML中預先創建，只需要確保存在
        const scoreElement = Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_SCORE);
        if (scoreElement) {
            scoreElement.textContent = `分數: ${this.score}`;
        }
    }

    _createLivesElement() {
        // 元素已在HTML中預先創建，只需要確保存在並更新
        const livesContainer = Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_LIVES);
        if (livesContainer) {
            this._updateLivesDisplayElement(livesContainer);
        }
    }

    _createLevelElement() {
        // 元素已在HTML中預先創建，只需要確保存在並更新
        const levelElement = Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_LEVEL);
        if (levelElement) {
            levelElement.innerHTML = `<strong>等級:</strong> ${this.level}`;
        }
    }

    _createGameOverOverlay() {
        if (Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_OVER_OVERLAY)) return;

        const overlay = Utils.createElement('div', 'game-over');
        overlay.id = AnimalHunterGame.ELEMENT_IDS.GAME_OVER_OVERLAY;
        overlay.innerHTML = this._getGameOverHTML();
        document.body.appendChild(overlay);
    }

    _getGameOverHTML() {
        return `
            <div class="game-over-content">
                <h2>🎮 遊戲結束</h2>
                <div class="final-stats">
                    <p>最終分數: <span id="${AnimalHunterGame.ELEMENT_IDS.FINAL_SCORE}">${this.score}</span></p>
                    <p>達到等級: <span id="${AnimalHunterGame.ELEMENT_IDS.FINAL_LEVEL}">${this.level}</span></p>
                </div>
                <button class="button restart-btn" onclick="game.restart()">再玩一次</button>
                <button class="button" onclick="URLUtils.navigateWithParams('index.html', URLUtils.getUrlParams())">回到首頁</button>
            </div>
        `;
    }

    // 事件綁定
    _bindEvents() {
        // 遊戲區域點擊事件
        Utils.on(this.gameArea, 'click', (e) => {
            if (e.target.classList.contains('animal')) {
                this._handleAnimalClick(e.target);
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

    // 公共方法
    start() {
        if (this.gameRunning) return;

        this.gameRunning = true;
        this.gamePaused = false;
        this._startSpawning();
        console.log('動物獵人遊戲開始');
    }

    pause() {
        if (!this.gameRunning) return;

        this.gamePaused = true;
        this._clearSpawnTimer();
        this._pauseAllAnimalTimers();
        console.log('遊戲已暫停');
    }

    resume() {
        if (!this.gameRunning || !this.gamePaused) return;

        this.gamePaused = false;
        this._startSpawning();
        this._resumeAllAnimalTimers();
        console.log('遊戲已恢復');
    }

    stop() {
        this.gameRunning = false;
        this.gamePaused = false;
        this._clearSpawnTimer();
        this._clearAllAnimals();
        console.log('遊戲已停止');
    }

    restart() {
        this.stop();
        this._resetGameState();
        this._updateDisplay();
        Utils.hide(AnimalHunterGame.ELEMENT_IDS.GAME_OVER_OVERLAY);
        this.start();
    }

    // 私有方法 - 遊戲邏輯
    _startSpawning() {
        if (!this.gameRunning || this.gamePaused) return;

        this._spawnAnimal();
        const spawnRate = this._calculateSpawnRate();

        this.spawnTimer = setTimeout(() => {
            this._startSpawning();
        }, spawnRate);
    }

    _calculateSpawnRate() {
        // 每級降低15%的生成間隔，意味著動物出現更快
        const decrease = 1 - (AnimalHunterGame.DEFAULTS.SPAWN_RATE_DECREASE * (this.level - 1));
        const newRate = this.options.spawnRate * Math.max(0.25, decrease); // 最少降到25%
        const finalRate = Math.max(AnimalHunterGame.DEFAULTS.MIN_SPAWN_RATE, newRate);
        
        console.log(`等級 ${this.level}: 生成間隔 ${finalRate}ms (降低${((1-decrease)*100).toFixed(1)}%)`);
        return finalRate;
    }

    _calculateAnimalLifetime() {
        // 每級降低10%的存在時間，意味著動物消失更快
        const decrease = 1 - (AnimalHunterGame.DEFAULTS.LIFETIME_DECREASE * (this.level - 1));
        const newLifetime = this.options.animalLifetime * Math.max(0.4, decrease); // 最少降到40%
        const finalLifetime = Math.max(AnimalHunterGame.DEFAULTS.MIN_LIFETIME, newLifetime);
        
        console.log(`等級 ${this.level}: 動物存在時間 ${finalLifetime}ms (降低${((1-decrease)*100).toFixed(1)}%)`);
        return finalLifetime;
    }

    _spawnAnimal() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const animalConfig = this._generateAnimalConfig();
        const animalElement = this._createAnimalElement(animalConfig);
        const position = this._generateRandomPosition();

        this._positionAnimal(animalElement, position);
        this._addAnimalToGame(animalElement, animalConfig);
        
        console.log('生成動物:', animalConfig.emoji, animalConfig.type);
    }

    _generateAnimalConfig() {
        // 使用原網站的概率分佈：60% 肉食、25% 草食、15% 雜食
        const random = Math.random();
        let selectedType;
        
        if (random < 0.6) {
            selectedType = 'carnivore';  // 60%
        } else if (random < 0.85) {
            selectedType = 'herbivore';  // 25%
        } else {
            selectedType = 'omnivore';   // 15%
        }
        
        const animalData = AnimalHunterGame.ANIMAL_TYPES[selectedType];

        return {
            type: selectedType,
            emoji: Utils.randomChoice(animalData.emojis),
            points: animalData.points,
            color: animalData.color
        };
    }

    _createAnimalElement(config) {
        const animal = Utils.createElement('div', 'animal');
        animal.style.backgroundColor = config.color;
        animal.style.fontSize = '2.5em';  // 確保動物表情符號夠大
        animal.textContent = config.emoji;
        animal.dataset.type = config.type;
        animal.dataset.points = config.points;
        return animal;
    }

    _generateRandomPosition() {
        // 確保遊戲區域有尺寸，如果沒有則使用默認值
        const areaWidth = this.gameArea.clientWidth || 800;
        const areaHeight = this.gameArea.clientHeight || 400;
        const maxX = Math.max(50, areaWidth - 80);
        const maxY = Math.max(50, areaHeight - 80);
        
        return {
            x: Utils.random(0, maxX),
            y: Utils.random(0, maxY)
        };
    }

    _positionAnimal(animal, position) {
        animal.style.left = position.x + 'px';
        animal.style.top = position.y + 'px';
    }

    _addAnimalToGame(animalElement, config) {
        this.gameArea.appendChild(animalElement);

        // 入場動畫
        Utils.animate(animalElement, [
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ], { duration: 200 });

        // 計算當前等級的動物存在時間
        const currentLifetime = this._calculateAnimalLifetime();
        
        // 記錄動物信息
        const animalInfo = {
            element: animalElement,
            type: config.type,
            spawnTime: Date.now(),
            lifetime: currentLifetime,
            timer: null
        };

        // 設置移除計時器
        animalInfo.timer = setTimeout(() => {
            console.log(`動物自動消失: ${config.emoji} (${config.type}) 存在了${currentLifetime}ms`);
            this._removeAnimal(animalElement, config.type === 'carnivore');
        }, currentLifetime);

        this.activeAnimals.push(animalInfo);
    }

    _handleAnimalClick(animalElement) {
        if (!this.gameRunning || this.gamePaused) {
            console.log('遊戲未運行或已暫停');
            return;
        }

        const type = animalElement.dataset.type;
        const points = parseInt(animalElement.dataset.points);
        
        console.log('點擊動物:', type, points);

        const animalInfo = this._findAnimalInfo(animalElement);
        if (!animalInfo) {
            console.log('找不到動物信息');
            return;
        }

        this._clearAnimalTimer(animalInfo);
        this._updateScore(points);
        this._handleAnimalClickFeedback(animalElement, type, points);
        this._removeAnimal(animalElement, false);
        this._updateDisplay();
        this._checkLevelUp();
        this._checkGameOver();
        
        console.log('點擊處理完成, 當前分數:', this.score, '生命:', this.lives);
    }

    _findAnimalInfo(animalElement) {
        const animalIndex = this.activeAnimals.findIndex(a => a.element === animalElement);
        return animalIndex !== -1 ? this.activeAnimals[animalIndex] : null;
    }

    _clearAnimalTimer(animalInfo) {
        if (animalInfo.timer) {
            clearTimeout(animalInfo.timer);
        }
    }

    _updateScore(points) {
        const oldScore = this.score;
        this.score += points;
        console.log(`分數更新: ${oldScore} + ${points} = ${this.score}`);
    }

    _handleAnimalClickFeedback(animalElement, type, points) {
        if (type === 'herbivore' || type === 'omnivore') {
            const oldLives = this.lives;
            this.lives--;
            console.log(`扣血: ${oldLives} -> ${this.lives} (點擊了${type})`);
            this._showFeedback(animalElement, `${points}`, '#ff6b6b');
            
            // 添加生命值減少動畫
            const livesElement = Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_LIVES);
            if (livesElement) {
                livesElement.classList.remove('lives-decrease');
                setTimeout(() => {
                    livesElement.classList.add('lives-decrease');
                }, 10);
            }
            
            Utils.vibrate([100, 50, 100]);
        } else {
            console.log(`獲得分數: +${points} (點擊了${type})`);
            this._showFeedback(animalElement, `+${points}`, '#00b894');
            Utils.vibrate(50);
        }
    }

    _removeAnimal(animalElement, loseLife = false) {
        if (!animalElement.parentNode) return;

        this._removeAnimalFromActiveList(animalElement);

        if (loseLife) {
            this._handleMissedCarnivore(animalElement);
        }

        this._animateAnimalRemoval(animalElement);
    }

    _removeAnimalFromActiveList(animalElement) {
        const animalIndex = this.activeAnimals.findIndex(a => a.element === animalElement);
        if (animalIndex !== -1) {
            const animalInfo = this.activeAnimals[animalIndex];
            this._clearAnimalTimer(animalInfo);
            this.activeAnimals.splice(animalIndex, 1);
        }
    }

    _handleMissedCarnivore(animalElement) {
        this.lives--;
        this._showFeedback(animalElement, '錯過了!', '#ff6b6b');
        this._updateDisplay();
        this._checkGameOver();
    }

    _animateAnimalRemoval(animalElement) {
        console.log('開始移除動物動畫');
        
        // 先立即隱藏，避免動畫問題
        animalElement.style.transform = 'scale(0)';
        animalElement.style.opacity = '0';
        animalElement.style.pointerEvents = 'none';
        
        // 短暫延遲後移除元素
        setTimeout(() => {
            if (animalElement.parentNode) {
                console.log('移除動物元素');
                animalElement.parentNode.removeChild(animalElement);
            }
        }, 100);
    }

    _showFeedback(element, text, color) {
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

    // 顯示更新
    _updateDisplay() {
        console.log('更新顯示:', { score: this.score, level: this.level, lives: this.lives });
        this._updateScoreDisplay();
        this._updateLevelDisplay();
        this._updateLivesDisplay();
    }

    _updateScoreDisplay() {
        const scoreElement = Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_SCORE);
        if (scoreElement) {
            scoreElement.textContent = `分數: ${this.score}`;
            
            // 添加分數增加動畫
            scoreElement.classList.remove('score-boost');
            setTimeout(() => {
                scoreElement.classList.add('score-boost');
            }, 10);
            
            console.log('分數顯示已更新:', scoreElement.textContent);
        } else {
            console.log('找不到分數顯示元素');
        }
    }

    _updateLevelDisplay() {
        const levelElement = Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_LEVEL);
        if (levelElement) {
            levelElement.innerHTML = `<strong>等級:</strong> ${this.level}`;
            console.log('等級顯示已更新:', this.level);
        } else {
            console.log('找不到等級顯示元素');
        }
    }

    _updateLivesDisplay() {
        const livesElement = Utils.$(AnimalHunterGame.ELEMENT_IDS.GAME_LIVES);
        if (livesElement) {
            this._updateLivesDisplayElement(livesElement);
            console.log('生命顯示已更新:', this.lives);
        } else {
            console.log('找不到生命顯示元素');
        }
    }

    _updateLivesDisplayElement(container) {
        container.innerHTML = '';
        
        // 根據生命數量決定排列方式
        const totalLives = this.options.maxLives;
        
        if (totalLives <= 5) {
            // 5個或以下：單行排列
            for (let i = 0; i < totalLives; i++) {
                const heart = Utils.createElement('span', 'heart');
                heart.textContent = '❤️';
                if (i >= this.lives) {
                    Utils.addClass(heart, 'lost');
                }
                container.appendChild(heart);
            }
        } else {
            // 超過5個：兩行排列
            for (let row = 0; row < 2; row++) {
                const heartRow = Utils.createElement('div', 'heart-row');
                const heartsInRow = row === 0 ? Math.ceil(totalLives / 2) : Math.floor(totalLives / 2);
                const startIndex = row === 0 ? 0 : Math.ceil(totalLives / 2);
                
                for (let i = 0; i < heartsInRow; i++) {
                    const heartIndex = startIndex + i;
                    const heart = Utils.createElement('span', 'heart');
                    heart.textContent = '❤️';
                    if (heartIndex >= this.lives) {
                        Utils.addClass(heart, 'lost');
                    }
                    heartRow.appendChild(heart);
                }
                container.appendChild(heartRow);
            }
        }
    }

    // 遊戲狀態檢查
    _checkLevelUp() {
        const newLevel = Math.floor(this.score / AnimalHunterGame.DEFAULTS.LEVEL_UP_SCORE) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this._showCelebration('等級提升! 🎉');
        }
    }

    _checkGameOver() {
        if (this.lives <= 0) {
            this._gameOver();
        }
    }

    _gameOver() {
        this.stop();
        this._updateFinalStats();
        Utils.show(AnimalHunterGame.ELEMENT_IDS.GAME_OVER_OVERLAY);
        Utils.vibrate([200, 100, 200, 100, 200]);
    }

    _updateFinalStats() {
        const finalScore = Utils.$(AnimalHunterGame.ELEMENT_IDS.FINAL_SCORE);
        const finalLevel = Utils.$(AnimalHunterGame.ELEMENT_IDS.FINAL_LEVEL);
        if (finalScore) finalScore.textContent = this.score;
        if (finalLevel) finalLevel.textContent = this.level;
    }

    _showCelebration(message) {
        let celebration = Utils.$(AnimalHunterGame.ELEMENT_IDS.CELEBRATION);
        if (!celebration) {
            celebration = Utils.createElement('div', 'celebration');
            celebration.id = AnimalHunterGame.ELEMENT_IDS.CELEBRATION;
            document.body.appendChild(celebration);
        }

        celebration.textContent = message;
        Utils.show(celebration);

        setTimeout(() => {
            Utils.hide(celebration);
        }, 2000);

        Utils.vibrate([100, 50, 100, 50, 100]);
    }

    // 計時器管理
    _clearSpawnTimer() {
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
    }

    _pauseAllAnimalTimers() {
        this.activeAnimals.forEach(animal => {
            if (animal.timer) {
                clearTimeout(animal.timer);
            }
        });
    }

    _resumeAllAnimalTimers() {
        this.activeAnimals.forEach(animal => {
            const remainingTime = animal.lifetime - (Date.now() - animal.spawnTime);
            if (remainingTime > 0) {
                animal.timer = setTimeout(() => {
                    this._removeAnimal(animal.element, animal.type === 'carnivore');
                }, remainingTime);
            } else {
                this._removeAnimal(animal.element, animal.type === 'carnivore');
            }
        });
    }

    _clearAllAnimals() {
        this.activeAnimals.forEach(animal => {
            if (animal.timer) clearTimeout(animal.timer);
            if (animal.element.parentNode) {
                animal.element.parentNode.removeChild(animal.element);
            }
        });
        this.activeAnimals = [];
    }

    _resetGameState() {
        this.score = 0;
        this.level = 1;
        this.lives = this.options.maxLives;
    }

    // 公共API
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

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// 工廠函數
window.createAnimalHunterGame = function(gameAreaSelector, options = {}) {
    return new AnimalHunterGame(gameAreaSelector, options);
};

// 全域類別
window.AnimalHunterGame = AnimalHunterGame;