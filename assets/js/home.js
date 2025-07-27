// 首頁邏輯模塊
class HomePage {
    constructor() {
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
        
        this.init();
    }
    
    init() {
        this.createGamesGrid();
        this.bindEvents();
        this.loadGameStats();
    }
    
    createGamesGrid() {
        const gamesGrid = Utils.$('gamesGrid');
        if (!gamesGrid) return;
        
        gamesGrid.innerHTML = '';
        
        this.games.forEach(game => {
            const gameCard = this.createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });
    }
    
    createGameCard(game) {
        const card = Utils.createElement('div', 'game-card');
        if (!game.available) {
            Utils.addClass(card, 'disabled');
        }
        
        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <div class="game-title">${game.title}</div>
            <div class="game-description">${game.description}</div>
            <ul class="game-features">
                ${game.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <button class="play-button" ${!game.available ? 'disabled' : ''}>
                ${game.available ? '開始遊戲' : '即將推出'}
            </button>
        `;
        
        // 添加點擊事件
        if (game.available) {
            const playButton = card.querySelector('.play-button');
            Utils.on(playButton, 'click', () => {
                this.startGame(game);
            });
            
            Utils.on(card, 'click', (e) => {
                if (e.target !== playButton) {
                    this.startGame(game);
                }
            });
        }
        
        return card;
    }
    
    startGame(game) {
        if (!game.available) return;
        
        // 播放點擊音效
        Utils.playSound('click');
        Utils.vibrate(50);
        
        // 添加點擊動畫
        const card = event.target.closest('.game-card');
        if (card) {
            Utils.animate(card, [
                { transform: 'scale(1)' },
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], { duration: 150 });
        }
        
        // 保存遊戲開始時間
        this.saveGameStartTime(game.id);
        
        // 導航到遊戲頁面
        setTimeout(() => {
            window.location.href = game.file;
        }, 200);
    }
    
    bindEvents() {
        // 響應式檢測
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
        
        // 頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // 觸控優化
        if (Utils.isMobile()) {
            this.optimizeForTouch();
        }
    }
    
    handleResize() {
        // 響應式調整
        const gamesGrid = Utils.$('gamesGrid');
        if (gamesGrid && Utils.isSmallMobile()) {
            gamesGrid.style.gridTemplateColumns = '1fr';
        } else if (gamesGrid && Utils.isMobile()) {
            gamesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        }
    }
    
    optimizeForTouch() {
        // 移除 hover 效果
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        });
    }
    
    pauseAnimations() {
        // 暫停動畫以節省資源
        const animatedElements = document.querySelectorAll('.game-card');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }
    
    resumeAnimations() {
        // 恢復動畫
        const animatedElements = document.querySelectorAll('.game-card');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
    
    saveGameStartTime(gameId) {
        const gameStats = Utils.loadFromStorage('gameStats', {});
        if (!gameStats[gameId]) {
            gameStats[gameId] = {
                timesPlayed: 0,
                totalPlayTime: 0,
                bestScore: 0,
                lastPlayed: null
            };
        }
        
        gameStats[gameId].timesPlayed++;
        gameStats[gameId].lastPlayed = Date.now();
        
        Utils.saveToStorage('gameStats', gameStats);
    }
    
    loadGameStats() {
        const gameStats = Utils.loadFromStorage('gameStats', {});
        
        // 更新遊戲卡片顯示統計信息
        this.games.forEach(game => {
            const stats = gameStats[game.id];
            if (stats && stats.timesPlayed > 0) {
                this.updateGameCardStats(game.id, stats);
            }
        });
    }
    
    updateGameCardStats(gameId, stats) {
        const gameCard = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!gameCard) return;
        
        const statsElement = Utils.createElement('div', 'game-stats');
        statsElement.innerHTML = `
            <small>
                已玩 ${stats.timesPlayed} 次
                ${stats.bestScore ? `| 最高分: ${stats.bestScore}` : ''}
            </small>
        `;
        
        const description = gameCard.querySelector('.game-description');
        if (description) {
            description.appendChild(statsElement);
        }
    }
    
    // 添加新遊戲
    addGame(gameData) {
        this.games.push(gameData);
        this.createGamesGrid();
    }
    
    // 更新遊戲狀態
    updateGameAvailability(gameId, available) {
        const game = this.games.find(g => g.id === gameId);
        if (game) {
            game.available = available;
            this.createGamesGrid();
        }
    }
    
    // 獲取遊戲統計
    getGameStats() {
        return Utils.loadFromStorage('gameStats', {});
    }
    
    // 清除遊戲數據
    clearGameData() {
        if (confirm('確定要清除所有遊戲數據嗎？')) {
            localStorage.removeItem('gameStats');
            this.loadGameStats();
            this.createGamesGrid();
            alert('遊戲數據已清除');
        }
    }
    
    // 導出遊戲統計
    exportGameStats() {
        const stats = this.getGameStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = Utils.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `game-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 當頁面載入完成時初始化首頁
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('home-page')) {
        window.homePage = new HomePage();
    }
});

// 全域導出
window.HomePage = HomePage;