// JUNGLE QUEST 2026 - MAIN ENTRY POINT
// Game initialization and global functions

// Global game instance
let game = null;

// Game initialization
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Jungle Quest 2026 - Initializing...');
    
    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('📱 Mobile device detected');
        document.getElementById('mobile-controls').style.display = 'flex';
        
        // Add viewport meta tag for mobile
        const viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewportMeta);
    }
    
    // Initialize the game
    try {
        game = new GameEngine();
        window.game = game; // Make available globally for debugging
        
        console.log('✅ Game instance created');
        
        // Auto-save interval
        setInterval(() => {
            if (game && game.state.gameRunning) {
                game.saveGame();
            }
        }, 30000); // Save every 30 seconds
        
        // Prevent context menu on right-click
        document.addEventListener('contextmenu', (e) => {
            if (game.state.gameRunning) {
                e.preventDefault();
            }
        });
        
        // Handle visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && game && game.state.gameRunning) {
                game.togglePause();
                console.log('⏸️ Game auto-paused due to tab switch');
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorScreen(error);
    }
});

// Global utility functions
function toggleCRT() {
    document.body.classList.toggle('crt');
    localStorage.setItem('jungleQuestCRT', document.body.classList.contains('crt'));
}

function toggleSound() {
    if (game && game.audio) {
        const muted = game.audio.toggleMute();
        const button = document.querySelector('.menu-item[onclick*="toggleSound"]');
        if (button) {
            button.textContent = `SOUND: ${muted ? 'OFF' : 'ON'}`;
        }
    }
}

function toggleMobileControls() {
    const controls = document.getElementById('mobile-controls');
    if (controls) {
        const isVisible = controls.style.display !== 'none';
        controls.style.display = isVisible ? 'none' : 'flex';
        localStorage.setItem('jungleQuestMobileControls', !isVisible);
        
        const button = document.querySelector('.menu-item[onclick*="toggleMobileControls"]');
        if (button) {
            button.textContent = `MOBILE CONTROLS: ${!isVisible ? 'ON' : 'OFF'}`;
        }
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function showErrorScreen(error) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="title" style="color: #f00;">ERROR</div>
            <div style="color: #fff; font-size: 18px; text-align: center; max-width: 600px; margin: 20px;">
                <p>Failed to load Jungle Quest 2026</p>
                <p style="color: #ff0; font-family: monospace; margin: 10px;">${error.message}</p>
                <br>
                <p>Please try:</p>
                <p>1. Refreshing the page</p>
                <p>2. Using a different browser</p>
                <p>3. Checking console for details</p>
                <br>
                <div class="menu-item" onclick="location.reload()">RELOAD PAGE</div>
            </div>
        `;
    }
}

// Cheat codes (for debugging)
window.addEventListener('keydown', (e) => {
    if (!game || !e.ctrlKey) return;
    
    switch(e.code) {
        case 'KeyQ': // Add 1000 score
            game.stats.score += 1000;
            game.updateHUD();
            console.log('💰 Cheat: +1000 score');
            break;
            
        case 'KeyT': // Switch timeline
            const timelines = [1994, 2026, 2048];
            const currentIndex = timelines.indexOf(game.stats.timeline);
            game.stats.timeline = timelines[(currentIndex + 1) % timelines.length];
            game.updateHUD();
            console.log('⏰ Cheat: Timeline switched to', game.stats.timeline);
            break;
            
        case 'KeyB': // Add bananas
            game.stats.bananas += 10;
            game.updateHUD();
            console.log('🍌 Cheat: +10 bananas');
            break;
            
        case 'KeyL': // Add lives
            game.stats.lives += 3;
            game.updateHUD();
            console.log('❤️ Cheat: +3 lives');
            break;
            
        case 'KeyN': // Next level
            game.currentLevel = Math.min(4, game.currentLevel + 1);
            game.loadLevel(game.currentLevel);
            game.levelComplete = false;
            game.state.gameRunning = true;
            game.updateHUD();
            console.log('🚀 Cheat: Level skipped to', game.currentLevel);
            break;
            
        case 'KeyP': // Toggle physics debug
            game.state.debugMode = !game.state.debugMode;
            console.log(`🔧 Physics debug: ${game.state.debugMode ? 'ON' : 'OFF'}`);
            break;
            
        case 'KeyS': // Save game
            game.saveGame();
            console.log('💾 Manual save triggered');
            break;
            
        case 'KeyR': // Reset level
            game.loadLevel(game.currentLevel);
            game.state.gameRunning = true;
            console.log('🔄 Level reset');
            break;
    }
});

// Touch event prevention (for mobile)
document.addEventListener('touchmove', (e) => {
    if (game && game.state.gameRunning) {
        e.preventDefault();
    }
}, { passive: false });

// Load saved preferences
window.addEventListener('load', () => {
    // Load CRT preference
    const crtEnabled = localStorage.getItem('jungleQuestCRT') !== 'false';
    if (crtEnabled) {
        document.body.classList.add('crt');
    }
    
    // Load mobile controls preference
    const mobileControlsEnabled = localStorage.getItem('jungleQuestMobileControls') === 'true';
    if (mobileControlsEnabled && /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        document.getElementById('mobile-controls').style.display = 'flex';
    }
    
    // Add CSS for level complete screen
    const style = document.createElement('style');
    style.textContent = `
        .level-complete-content {
            color: #0ff;
            font-size: 24px;
            text-align: center;
            margin: 20px;
            max-width: 600px;
        }
        
        .bonus-item {
            margin: 10px 0;
            padding: 10px;
            background: rgba(0, 50, 50, 0.5);
            border: 1px solid #0ff;
        }
        
        .total-bonus {
            margin: 20px 0;
            padding: 15px;
            background: rgba(0, 0, 50, 0.7);
            border: 2px solid #f0f;
            font-size: 28px;
        }
        
        .score-total {
            margin: 15px 0;
            padding: 10px;
            background: rgba(0, 50, 0, 0.7);
            border: 1px solid #0f0;
        }
        
        .game-over-content {
            color: #0ff;
            font-size: 24px;
            text-align: center;
            margin: 20px;
            max-width: 600px;
        }
        
        .final-score {
            margin: 20px 0;
            padding: 15px;
            background: rgba(50, 0, 0, 0.7);
            border: 2px solid #f00;
        }
        
        .stats {
            margin: 15px 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #0ff;
        }
        
        .victory-content {
            color: #0ff;
            font-size: 24px;
            text-align: center;
            margin: 20px;
            max-width: 800px;
        }
        
        .final-stats {
            margin: 20px 0;
            padding: 20px;
            background: rgba(0, 50, 50, 0.7);
            border: 2px solid #0ff;
        }
        
        .credits-content {
            color: #0ff;
            font-size: 20px;
            text-align: center;
            margin: 20px;
            max-width: 600px;
            line-height: 1.6;
        }
        
        .credits-content h3 {
            color: #0f0;
            margin-bottom: 20px;
        }
        
        .credits-content p {
            margin: 10px 0;
        }
    `;
    document.head.appendChild(style);
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { game };
}

console.log('🎮 Jungle Quest 2026 - Ready!');