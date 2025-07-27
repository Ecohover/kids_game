// Clean Code 重構後的首頁邏輯
class HomePage {
    // 頁面常數
    static ELEMENT_IDS = {
        GAMES_GRID: 'gamesGrid'
    };

    static CSS_CLASSES = {
        GAME_CARD: 'game-card',
        GAME_STATS: 'game-stats',
        PLAY_BUTTON: 'play-button',
        DISABLED: 'disabled'
    };

    static ANIMATION_DURATION = {
        CLICK: 150,
        DEBOUNCE: 250
    };

    static STORAGE_KEYS = {
        GAME_STATS: 'gameStats'
    };

    constructor() {
        this._initializeGames();
        this._initialize();
    }

    // 初始化遊戲數據
    _initializeGames() {
        this.games = [
            {
                id: 'animal-hunter',
                title: '動物獵人遊戲',
                icon: '🏹🦁',
                description: '在美麗的森林海洋世界中，學習辨識肉食、草食、雜食動物，訓練反應速度和手部精細動作！',
                features: [
                    '🎯 手眼協調訓練',
                    '🧠 動物分類學習',
                    '⚡ 反應速度提升',
                    '🏆 分級挑戰系統'
                ],
                file: 'animal-hunter.html',
                available: true
            }
        ];
    }

    // 初始化頁面
    _initialize() {
        this._createGamesGrid();
        this._bindEvents();
        this._loadGameStats();
    }

    // 創建遊戲網格
    _createGamesGrid() {
        const gamesGrid = Utils.$(HomePage.ELEMENT_IDS.GAMES_GRID);
        if (!gamesGrid) return;

        gamesGrid.innerHTML = '';

        this.games.forEach(game => {
            const gameCard = this._createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });
    }

    _createGameCard(game) {
        const card = Utils.createElement('div', HomePage.CSS_CLASSES.GAME_CARD);
        card.dataset.gameId = game.id;

        if (!game.available) {
            Utils.addClass(card, HomePage.CSS_CLASSES.DISABLED);
        }

        card.innerHTML = this._getGameCardHTML(game);
        this._bindGameCardEvents(card, game);

        return card;
    }

    _getGameCardHTML(game) {
        return `
            <div class="game-icon">${game.icon}</div>
            <div class="game-title">${game.title}</div>
            <div class="game-description">${game.description}</div>
            <ul class="game-features">
                ${game.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <button class="${HomePage.CSS_CLASSES.PLAY_BUTTON}" ${!game.available ? 'disabled' : ''}>
                ${game.available ? '開始遊戲' : '即將推出'}
            </button>
        `;
    }

    _bindGameCardEvents(card, game) {
        if (!game.available) return;

        const playButton = card.querySelector(`.${HomePage.CSS_CLASSES.PLAY_BUTTON}`);

        Utils.on(playButton, 'click', (e) => {
            e.stopPropagation();
            this._startGame(game, card);
        });

        Utils.on(card, 'click', () => {
            this._startGame(game, card);
        });
    }

    // 開始遊戲
    _startGame(game, cardElement) {
        if (!game.available) return;

        this._playClickFeedback();
        this._animateCardClick(cardElement);
        this._saveGameStartTime(game.id);
        this._navigateToGame(game);
    }

    _playClickFeedback() {
        Utils.playSound('click');
        Utils.vibrate(50);
    }

    _animateCardClick(cardElement) {
        Utils.animate(cardElement, [
            { transform: 'scale(1)' },
            { transform: 'scale(0.95)' },
            { transform: 'scale(1)' }
        ], { duration: HomePage.ANIMATION_DURATION.CLICK });
    }

    _navigateToGame(game) {
        setTimeout(() => {
            URLUtils.navigateWithParams(game.file, URLUtils.getUrlParams());
        }, 200);
    }

    // 事件綁定
    _bindEvents() {
        this._bindResizeEvents();
        this._bindVisibilityEvents();
        this._optimizeForDevice();
    }

    _bindResizeEvents() {
        window.addEventListener('resize', Utils.debounce(() => {
            this._handleResize();
        }, HomePage.ANIMATION_DURATION.DEBOUNCE));
    }

    _bindVisibilityEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._pauseAnimations();
            } else {
                this._resumeAnimations();
            }
        });
    }

    _optimizeForDevice() {
        if (Utils.isMobile()) {
            this._optimizeForTouch();
        }
    }

    // 響應式處理
    _handleResize() {
        const gamesGrid = Utils.$(HomePage.ELEMENT_IDS.GAMES_GRID);
        if (!gamesGrid) return;

        if (Utils.isSmallMobile()) {
            gamesGrid.style.gridTemplateColumns = '1fr';
        } else if (Utils.isMobile()) {
            gamesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        }
    }

    _optimizeForTouch() {
        const gameCards = document.querySelectorAll(`.${HomePage.CSS_CLASSES.GAME_CARD}`);
        gameCards.forEach(card => {
            card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        });
    }

    // 動畫控制
    _pauseAnimations() {
        this._setAnimationState('paused');
    }

    _resumeAnimations() {
        this._setAnimationState('running');
    }

    _setAnimationState(state) {
        const animatedElements = document.querySelectorAll(`.${HomePage.CSS_CLASSES.GAME_CARD}`);
        animatedElements.forEach(el => {
            el.style.animationPlayState = state;
        });
    }

    // 統計數據管理
    _saveGameStartTime(gameId) {
        const gameStats = this._getGameStats();
        
        if (!gameStats[gameId]) {
            gameStats[gameId] = this._createEmptyGameStats();
        }

        gameStats[gameId].timesPlayed++;
        gameStats[gameId].lastPlayed = Date.now();

        Utils.saveToStorage(HomePage.STORAGE_KEYS.GAME_STATS, gameStats);
    }

    _createEmptyGameStats() {
        return {
            timesPlayed: 0,
            totalPlayTime: 0,
            bestScore: 0,
            lastPlayed: null
        };
    }

    _loadGameStats() {
        const gameStats = this._getGameStats();

        this.games.forEach(game => {
            const stats = gameStats[game.id];
            if (stats && stats.timesPlayed > 0) {
                this._updateGameCardStats(game.id, stats);
            }
        });
    }

    _updateGameCardStats(gameId, stats) {
        const gameCard = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!gameCard) return;

        const statsElement = this._createStatsElement(stats);
        const description = gameCard.querySelector('.game-description');
        
        if (description) {
            description.appendChild(statsElement);
        }
    }

    _createStatsElement(stats) {
        const statsElement = Utils.createElement('div', HomePage.CSS_CLASSES.GAME_STATS);
        statsElement.innerHTML = `
            <small>
                已玩 ${stats.timesPlayed} 次
                ${stats.bestScore ? `| 最高分: ${stats.bestScore}` : ''}
            </small>
        `;
        return statsElement;
    }

    // 公共API
    addGame(gameData) {
        this.games.push(gameData);
        this._createGamesGrid();
    }

    updateGameAvailability(gameId, available) {
        const game = this.games.find(g => g.id === gameId);
        if (game) {
            game.available = available;
            this._createGamesGrid();
        }
    }

    getGameStats() {
        return this._getGameStats();
    }

    clearGameData() {
        if (confirm('確定要清除所有遊戲數據嗎？')) {
            this._clearStorageData();
            this._refreshGameDisplay();
            alert('遊戲數據已清除');
        }
    }

    exportGameStats() {
        const stats = this._getGameStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const filename = `game-stats-${new Date().toISOString().split('T')[0]}.json`;
        
        this._downloadFile(dataStr, filename, 'application/json');
    }

    // 私有輔助方法
    _getGameStats() {
        return Utils.loadFromStorage(HomePage.STORAGE_KEYS.GAME_STATS, {});
    }

    _clearStorageData() {
        localStorage.removeItem(HomePage.STORAGE_KEYS.GAME_STATS);
    }

    _refreshGameDisplay() {
        this._loadGameStats();
        this._createGamesGrid();
    }

    _downloadFile(content, filename, contentType) {
        const dataBlob = new Blob([content], { type: contentType });
        const link = Utils.createElement('a');
        
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 頁面載入時自動初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('home-page')) {
        window.homePage = new HomePage();
    }
});

// 全域導出
window.HomePage = HomePage;