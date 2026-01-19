// JUNGLE QUEST 2026 - GAME ENGINE
// Main game controller and state manager

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state management
        this.state = {
            currentScreen: 'loading',
            gameRunning: false,
            paused: false,
            timeScale: 1.0,
            debugMode: false
        };
        
        // Game objects containers
        this.player = null;
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.particles = [];
        this.projectiles = [];
        
        // Level management
        this.currentLevel = 1;
        this.levelData = null;
        this.levelComplete = false;
        this.checkpoint = null;
        
        // Game statistics
        this.stats = {
            score: 0,
            lives: 3,
            bananas: 0,
            keys: 0,
            quantumEnergy: 100,
            timeline: 2026,
            totalTime: 0
        };
        
        // Physics system
        this.physics = new PhysicsEngine();
        
        // Input system
        this.keys = {};
        this.touchControls = {};
        
        // Timing system
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.frameCount = 0;
        
        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1,
            shakeAmount: 0,
            shakeDuration: 0
        };
        
        // Audio system
        this.audio = new AudioSystem();
        
        // Save system
        this.saveSlot = 'jungleQuest2026_save';
        
        // Initialize the game
        this.init();
    }
    
    async init() {
        console.log('🌴 Initializing Jungle Quest 2026...');
        
        // Load game assets and setup
        await this.loadAssets();
        
        // Setup input handlers
        this.setupInput();
        
        // Setup screen transitions
        this.setupScreens();
        
        // Start the main game loop
        this.gameLoop();
        
        console.log('✅ Game initialized successfully');
    }
    
    async loadAssets() {
        const loadingText = document.getElementById('loading-text');
        const loadingFill = document.getElementById('loading-fill');
        
        const loadSteps = [
            { text: 'Loading graphics engine...', progress: 20 },
            { text: 'Initializing quantum physics...', progress: 40 },
            { text: 'Loading level data...', progress: 60 },
            { text: 'Setting up audio system...', progress: 80 },
            { text: 'Preparing game world...', progress: 100 }
        ];
        
        for (const step of loadSteps) {
            loadingText.textContent = step.text;
            loadingFill.style.width = `${step.progress}%`;
            await this.delay(300);
        }
        
        // Initialize player
        this.player = new Player(this, 100, 300);
        
        // Load first level
        this.loadLevel(1);
        
        // Transition to menu
        setTimeout(() => {
            this.showScreen('menu');
        }, 500);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setupInput() {
        // Keyboard input handling
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleSpecialKeys(e);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mobile touch controls
        this.setupMobileControls();
        
        // Menu interactions
        this.setupMenuInteractions();
    }
    
    handleSpecialKeys(e) {
        // Toggle debug mode
        if (e.code === 'KeyD' && e.shiftKey) {
            this.state.debugMode = !this.state.debugMode;
            console.log(`🔧 Debug mode: ${this.state.debugMode ? 'ON' : 'OFF'}`);
        }
        
        // Pause game
        if (e.code === 'Escape' && this.state.gameRunning) {
            this.togglePause();
        }
        
        // Menu navigation
        if (this.state.currentScreen === 'menu') {
            this.handleMenuNavigation(e);
        }
        
        // Cheat codes (for testing)
        this.handleCheatCodes(e);
    }
    
    handleMenuNavigation(e) {
        const menuItems = document.querySelectorAll('.menu-item');
        
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            const direction = e.code === 'ArrowDown' ? 1 : -1;
            this.navigateMenu(direction);
        }
        
        if (e.code === 'Enter' || e.code === 'Space') {
            this.selectMenuOption();
        }
    }
    
    handleCheatCodes(e) {
        if (!e.ctrlKey) return;
        
        switch(e.code) {
            case 'KeyQ': // Add score
                this.stats.score += 1000;
                console.log('💰 Cheat: +1000 score');
                break;
            case 'KeyT': // Switch timeline
                this.stats.timeline = this.stats.timeline === 2026 ? 2048 : 2026;
                console.log('⏰ Cheat: Timeline switched');
                break;
            case 'KeyB': // Add bananas
                this.stats.bananas += 10;
                console.log('🍌 Cheat: +10 bananas');
                break;
            case 'KeyL': // Add lives
                this.stats.lives += 3;
                console.log('❤️ Cheat: +3 lives');
                break;
            case 'KeyN': // Next level
                this.currentLevel = Math.min(4, this.currentLevel + 1);
                this.loadLevel(this.currentLevel);
                console.log('🚀 Cheat: Level skipped');
                break;
        }
        
        this.updateHUD();
    }
    
    setupMobileControls() {
        const mobileBtns = document.querySelectorAll('.mobile-btn');
        
        mobileBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const key = btn.dataset.key;
                this.touchControls[key] = true;
                this.keys[key] = true;
                btn.style.background = 'rgba(0, 255, 0, 0.6)';
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const key = btn.dataset.key;
                this.touchControls[key] = false;
                this.keys[key] = false;
                btn.style.background = 'rgba(0, 255, 0, 0.3)';
            });
        });
        
        // Show mobile controls on mobile devices
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            document.getElementById('mobile-controls').style.display = 'flex';
        }
    }
    
    setupMenuInteractions() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleMenuAction(action);
            });
        });
    }
    
    setupScreens() {
        // Set first menu item as selected
        const menuItems = document.querySelectorAll('.menu-item');
        if (menuItems.length > 0) {
            menuItems[0].classList.add('selected');
        }
    }
    
    navigateMenu(direction) {
        const menuItems = document.querySelectorAll('.menu-item');
        let currentIndex = 0;
        
        // Find currently selected item
        menuItems.forEach((item, index) => {
            if (item.classList.contains('selected')) {
                currentIndex = index;
                item.classList.remove('selected');
            }
        });
        
        // Calculate new index
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = menuItems.length - 1;
        if (newIndex >= menuItems.length) newIndex = 0;
        
        // Apply selection
        menuItems[newIndex].classList.add('selected');
    }
    
    selectMenuOption() {
        const selected = document.querySelector('.menu-item.selected');
        if (selected) {
            this.handleMenuAction(selected.dataset.action);
        }
    }
    
    handleMenuAction(action) {
        switch(action) {
            case 'new-game':
                this.startNewGame();
                break;
            case 'continue':
                this.continueGame();
                break;
            case 'level-select':
                this.showLevelSelect();
                break;
            case 'options':
                this.showOptions();
                break;
            case 'credits':
                this.showCredits();
                break;
        }
    }
    
    startNewGame() {
        console.log('🎮 Starting new game...');
        
        // Reset game statistics
        this.stats = {
            score: 0,
            lives: 3,
            bananas: 0,
            keys: 0,
            quantumEnergy: 100,
            timeline: 2026,
            totalTime: 0
        };
        
        this.currentLevel = 1;
        this.levelComplete = false;
        this.checkpoint = null;
        
        // Load first level
        this.loadLevel(this.currentLevel);
        
        // Show game screen
        this.showScreen('game');
        this.state.gameRunning = true;
        this.state.paused = false;
        
        // Update HUD
        this.updateHUD();
        
        // Play background music
        this.audio.playBackgroundMusic();
        
        console.log(`🚀 Level ${this.currentLevel} started`);
    }
    
    continueGame() {
        const saved = this.loadGame();
        if (saved) {
            // Restore saved state
            this.stats = saved.stats;
            this.currentLevel = saved.level || 1;
            this.checkpoint = saved.checkpoint;
            
            // Load the saved level
            this.loadLevel(this.currentLevel);
            
            // Restore checkpoint if exists
            if (this.checkpoint) {
                this.player.x = this.checkpoint.x;
                this.player.y = this.checkpoint.y;
            }
            
            // Show game screen
            this.showScreen('game');
            this.state.gameRunning = true;
            this.updateHUD();
            this.audio.playBackgroundMusic();
            
            console.log(`🎮 Game loaded from level ${this.currentLevel}`);
        } else {
            console.log('⚠️ No saved game found, starting new game');
            this.startNewGame();
        }
    }
    
    showLevelSelect() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = `
            <div class="title">SELECT LEVEL</div>
            <div class="menu">
                <div class="menu-item" data-level="1">LEVEL 1 - VINE CANYON</div>
                <div class="menu-item" data-level="2">LEVEL 2 - QUANTUM TEMPLE</div>
                <div class="menu-item" data-level="3">LEVEL 3 - BOSS BATTLE</div>
                <div class="menu-item" data-level="4">LEVEL 4 - FUTURE JUNGLE</div>
                <div class="menu-item" data-action="back">BACK TO MENU</div>
            </div>
        `;
        
        // Reattach event listeners
        setTimeout(() => {
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                if (item.dataset.level) {
                    item.addEventListener('click', () => {
                        this.currentLevel = parseInt(item.dataset.level);
                        this.startNewGame();
                    });
                } else if (item.dataset.action === 'back') {
                    item.addEventListener('click', () => this.showScreen('menu'));
                }
            });
        }, 100);
    }
    
    showOptions() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = `
            <div class="title">OPTIONS</div>
            <div class="menu">
                <div class="menu-item" onclick="toggleCRT()">CRT EFFECT: ON</div>
                <div class="menu-item" onclick="toggleSound()">SOUND: ON</div>
                <div class="menu-item" onclick="toggleMobileControls()">MOBILE CONTROLS: ON</div>
                <div class="menu-item" data-action="back">BACK TO MENU</div>
            </div>
        `;
        
        setTimeout(() => {
            const backBtn = document.querySelector('.menu-item[data-action="back"]');
            backBtn.addEventListener('click', () => this.showScreen('menu'));
        }, 100);
    }
    
    showCredits() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = `
            <div class="title">CREDITS</div>
            <div class="credits-content">
                <h3>JUNGLE QUEST 2026</h3>
                <p>HTML5 Edition</p>
                <br>
                <p>Developed by: RetroCoders 2026</p>
                <p>Graphics: PixelArt Division</p>
                <p>Sound: Quantum Audio Labs</p>
                <p>Physics: Newton.js Engine</p>
                <br>
                <p>Special Thanks:</p>
                <p>MS-DOS Preservation Society</p>
                <p>All Beta Testers</p>
                <p>You, the player!</p>
                <br>
                <p>© 2026 Digital Archaeology Labs</p>
                <br>
                <p class="menu-item" style="margin-top: 20px;" data-action="back">BACK TO MENU</p>
            </div>
        `;
        
        setTimeout(() => {
            const backBtn = document.querySelector('.menu-item[data-action="back"]');
            backBtn.addEventListener('click', () => this.showScreen('menu'));
        }, 100);
    }
    
    showScreen(screenName) {
        this.state.currentScreen = screenName;
        
        // Hide all screens
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('menu-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'none';
        
        // Show selected screen
        switch(screenName) {
            case 'menu':
                document.getElementById('menu-screen').style.display = 'flex';
                break;
            case 'game':
                document.getElementById('game-screen').style.display = 'flex';
                break;
        }
    }
    
    loadLevel(levelNum) {
        console.log(`🗺️ Loading level ${levelNum}...`);
        
        // Clear existing game objects
        this.clearGameObjects();
        
        // Get level data
        this.levelData = LEVEL_DATA[levelNum - 1];
        if (!this.levelData) {
            console.error(`❌ Level ${levelNum} data not found!`);
            return;
        }
        
        // Create platforms
        this.levelData.platforms.forEach(platform => {
            this.platforms.push(new Platform(
                this,
                platform.x,
                platform.y,
                platform.width,
                platform.height,
                platform.type
            ));
        });
        
        // Create collectibles
        this.levelData.collectibles.forEach(item => {
            this.collectibles.push(new Collectible(
                this,
                item.x,
                item.y,
                item.type
            ));
        });
        
        // Create enemies
        this.levelData.enemies.forEach(enemy => {
            this.enemies.push(new Enemy(
                this,
                enemy.x,
                enemy.y,
                enemy.type
            ));
        });
        
        // Reset player position
        if (this.player) {
            this.player.x = this.levelData.playerStart.x;
            this.player.y = this.levelData.playerStart.y;
            this.player.velocity.x = 0;
            this.player.velocity.y = 0;
            this.player.grounded = false;
        }
        
        // Reset camera
        this.camera.x = 0;
        this.camera.y = 0;
        
        // Update HUD
        document.getElementById('level').textContent = levelNum;
        
        this.levelComplete = false;
        
        console.log(`✅ Level ${levelNum} loaded: ${this.platforms.length} platforms, ${this.collectibles.length} collectibles, ${this.enemies.length} enemies`);
    }
    
    clearGameObjects() {
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.particles = [];
        this.projectiles = [];
    }
    
    update(deltaTime) {
        if (this.state.paused || !this.state.gameRunning || this.levelComplete) return;
        
        // Apply time scaling
        deltaTime *= this.state.timeScale;
        this.gameTime += deltaTime;
        this.frameCount++;
        this.stats.totalTime += deltaTime;
        
        // Update camera
        this.updateCamera(deltaTime);
        
        // Update player
        this.player.update(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Update HUD
        this.updateHUD();
        
        // Check level completion
        this.checkLevelCompletion();
        
        // Regenerate quantum energy
        this.stats.quantumEnergy = Math.min(100, this.stats.quantumEnergy + 0.3);
        
        // Auto-save every 60 seconds
        if (this.frameCount % 3600 === 0) { // 60 seconds at 60fps
            this.saveGame();
        }
    }
    
    updateCamera(deltaTime) {
        // Camera follows player with smoothing
        const targetX = this.player.x - this.width / 2;
        const targetY = this.player.y - this.height / 2;
        
        // Clamp camera to level bounds
        const levelWidth = this.levelData ? this.levelData.width : this.width * 2;
        const levelHeight = this.levelData ? this.levelData.height : this.height * 2;
        
        this.camera.targetX = Math.max(0, Math.min(targetX, levelWidth - this.width));
        this.camera.targetY = Math.max(0, Math.min(targetY, levelHeight - this.height));
        
        // Apply camera smoothing
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        // Apply camera shake if active
        if (this.camera.shakeDuration > 0) {
            this.camera.shakeDuration -= deltaTime;
            const shakeX = (Math.random() - 0.5) * this.camera.shakeAmount;
            const shakeY = (Math.random() - 0.5) * this.camera.shakeAmount;
            this.camera.x += shakeX;
            this.camera.y += shakeY;
        }
    }
    
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 15, '#f00');
                this.enemies.splice(i, 1);
                this.stats.score += 100;
                this.audio.playSound('enemy-death');
            }
        }
    }
    
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            // Remove off-screen or expired projectiles
            if (projectile.x < -100 || projectile.x > this.levelData.width + 100 ||
                projectile.y < -100 || projectile.y > this.levelData.height + 100 ||
                projectile.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Player vs Platforms
        this.platforms.forEach(platform => {
            if (this.physics.checkCollision(this.player, platform)) {
                this.physics.resolveCollision(this.player, platform);
            }
        });
        
        // Player vs Collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (!collectible.collected && this.physics.checkCollision(this.player, collectible)) {
                this.collectItem(collectible);
                this.collectibles.splice(i, 1);
            }
        }
        
        // Player vs Enemies
        this.enemies.forEach(enemy => {
            if (this.physics.checkCollision(this.player, enemy)) {
                if (this.player.velocity.y > 0 && 
                    this.player.y + this.player.height - this.player.velocity.y <= enemy.y + 10) {
                    // Player landed on enemy
                    this.player.velocity.y = -15;
                    enemy.takeDamage(50);
                    this.stats.score += 50;
                    this.audio.playSound('enemy-hit');
                    this.cameraShake(5, 0.2);
                } else if (!this.player.invincible) {
                    // Player hit by enemy
                    this.playerTakeDamage(10);
                }
            }
        });
        
        // Player vs Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (projectile.enemy && this.physics.checkCollision(this.player, projectile)) {
                this.playerTakeDamage(15);
                this.projectiles.splice(i, 1);
                this.createParticles(projectile.x, projectile.y, 8, '#f00');
            }
        }
        
        // Projectiles vs Platforms
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            for (const platform of this.platforms) {
                if (this.physics.checkCollision(projectile, platform)) {
                    this.projectiles.splice(i, 1);
                    this.createParticles(projectile.x, projectile.y, 5, '#ff0');
                    break;
                }
            }
        }
    }
    
    collectItem(collectible) {
        collectible.collected = true;
        
        switch(collectible.type) {
            case 'banana':
                this.stats.bananas++;
                this.stats.score += 10;
                this.audio.playSound('collect');
                this.createParticles(collectible.x + 8, collectible.y + 8, 8, '#ff0');
                break;
                
            case 'key':
                this.stats.keys++;
                this.stats.score += 100;
                this.audio.playSound('key');
                this.createParticles(collectible.x + 12, collectible.y + 12, 12, '#ff8000');
                break;
                
            case 'quantum':
                this.stats.quantumEnergy = Math.min(100, this.stats.quantumEnergy + 25);
                this.stats.score += 50;
                this.audio.playSound('quantum');
                this.createParticles(collectible.x + 12, collectible.y + 12, 15, '#0ff');
                break;
                
            case 'health':
                this.stats.lives = Math.min(5, this.stats.lives + 1);
                this.audio.playSound('health');
                this.createParticles(collectible.x + 12, collectible.y + 12, 10, '#0f0');
                break;
        }
    }
    
    playerTakeDamage(damage) {
        if (this.player.invincible) return;
        
        this.stats.lives -= damage;
        this.player.invincible = true;
        this.player.invincibleTimer = 60; // 1 second at 60fps
        
        this.audio.playSound('hit');
        this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 20, '#f00');
        this.cameraShake(10, 0.3);
        
        // Knockback
        this.player.velocity.y = -10;
        this.player.velocity.x = -this.player.direction * 8;
        
        if (this.stats.lives <= 0) {
            this.gameOver();
        }
    }
    
    checkLevelCompletion() {
        if (this.levelComplete) return;
        
        let completed = false;
        
        switch(this.currentLevel) {
            case 1: // Collect 5 keys
                completed = this.stats.keys >= 5;
                break;
            case 2: // Collect all quantum fragments
                const fragments = this.collectibles.filter(c => c.type === 'quantum' && !c.collected).length;
                completed = fragments === 0;
                break;
            case 3: // Defeat boss
                completed = this.enemies.length === 0;
                break;
            case 4: // Collect 30 bananas
                completed = this.stats.bananas >= 30;
                break;
        }
        
        if (completed && !this.levelComplete) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.levelComplete = true;
        this.state.gameRunning = false;
        
        // Calculate bonus
        const timeBonus = Math.max(0, 300 - Math.floor(this.stats.totalTime / 1000)) * 10;
        const bananaBonus = this.stats.bananas * 5;
        const levelBonus = this.currentLevel * 500;
        const totalBonus = timeBonus + bananaBonus + levelBonus;
        
        this.stats.score += totalBonus;
        
        // Save checkpoint for next level
        this.checkpoint = {
            x: this.player.x,
            y: this.player.y,
            level: this.currentLevel
        };
        
        this.saveGame();
        
        // Show level complete screen
        setTimeout(() => {
            this.showLevelCompleteScreen(totalBonus, timeBonus, bananaBonus, levelBonus);
        }, 1000);
    }
    
    showLevelCompleteScreen(totalBonus, timeBonus, bananaBonus, levelBonus) {
        const html = `
            <div class="screen" style="background: rgba(0,0,0,0.95);">
                <div class="title" style="color: #0ff; animation: pulse 1s infinite;">LEVEL COMPLETE!</div>
                <div class="level-complete-content">
                    <div class="bonus-item">Time Bonus: <span style="color: #0ff;">${timeBonus}</span></div>
                    <div class="bonus-item">Banana Bonus: <span style="color: #ff0;">${bananaBonus}</span></div>
                    <div class="bonus-item">Level Bonus: <span style="color: #0f0;">${levelBonus}</span></div>
                    <div class="total-bonus">TOTAL BONUS: <span style="color: #f0f; font-size: 32px;">${totalBonus}</span></div>
                    <div class="score-total">TOTAL SCORE: <span style="color: #fff; font-size: 28px;">${this.stats.score}</span></div>
                    <br>
                    <div class="menu-item" onclick="game.continueToNextLevel()" style="margin: 10px;">CONTINUE</div>
                    <div class="menu-item" onclick="game.returnToMenu()" style="margin: 10px;">MAIN MENU</div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    }
    
    continueToNextLevel() {
        const levelCompleteScreen = document.querySelector('.screen .level-complete-content').parentElement;
        if (levelCompleteScreen) levelCompleteScreen.remove();
        
        this.currentLevel++;
        if (this.currentLevel <= LEVEL_DATA.length) {
            this.loadLevel(this.currentLevel);
            this.levelComplete = false;
            this.state.gameRunning = true;
            this.updateHUD();
            this.audio.playBackgroundMusic();
        } else {
            this.gameWon();
        }
    }
    
    returnToMenu() {
        const levelCompleteScreen = document.querySelector('.screen .level-complete-content').parentElement;
        if (levelCompleteScreen) levelCompleteScreen.remove();
        
        this.showScreen('menu');
    }
    
    gameOver() {
        this.state.gameRunning = false;
        this.audio.stopBackgroundMusic();
        
        setTimeout(() => {
            this.showGameOverScreen();
        }, 1000);
    }
    
    showGameOverScreen() {
        const html = `
            <div class="screen" style="background: rgba(0,0,0,0.95);">
                <div class="title" style="color: #f00; animation: glitch 0.5s infinite;">GAME OVER</div>
                <div class="game-over-content">
                    <div class="final-score">FINAL SCORE: <span style="color: #0ff; font-size: 32px;">${this.stats.score}</span></div>
                    <div class="stats">
                        <p>Bananas Collected: ${this.stats.bananas}</p>
                        <p>Level Reached: ${this.currentLevel}</p>
                        <p>Total Time: ${Math.floor(this.stats.totalTime / 1000)}s</p>
                    </div>
                    <br>
                    <div class="menu-item" onclick="game.restartLevel()" style="margin: 10px;">RESTART LEVEL</div>
                    <div class="menu-item" onclick="game.returnToMenu()" style="margin: 10px;">MAIN MENU</div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
        
        // Add glitch animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glitch {
                0% { transform: translate(0); text-shadow: 0 0 10px #f00; }
                20% { transform: translate(-2px, 2px); text-shadow: 0 0 10px #0ff; }
                40% { transform: translate(-2px, -2px); text-shadow: 0 0 10px #ff0; }
                60% { transform: translate(2px, 2px); text-shadow: 0 0 10px #f0f; }
                80% { transform: translate(2px, -2px); text-shadow: 0 0 10px #0f0; }
                100% { transform: translate(0); text-shadow: 0 0 10px #f00; }
            }
        `;
        document.head.appendChild(style);
    }
    
    restartLevel() {
        const gameOverScreen = document.querySelector('.screen .game-over-content').parentElement;
        if (gameOverScreen) {
            gameOverScreen.remove();
            document.querySelector('style[data-glitch]')?.remove();
        }
        
        this.stats.lives = 3;
        this.loadLevel(this.currentLevel);
        this.state.gameRunning = true;
        this.updateHUD();
        this.audio.playBackgroundMusic();
    }
    
    gameWon() {
        this.state.gameRunning = false;
        this.audio.stopBackgroundMusic();
        this.audio.playSound('victory');
        
        setTimeout(() => {
            this.showVictoryScreen();
        }, 2000);
    }
    
    showVictoryScreen() {
        const html = `
            <div class="screen" style="background: rgba(0,0,0,0.95);">
                <div class="title" style="color: #0f0; animation: pulse 1s infinite;">CONGRATULATIONS!</div>
                <div class="victory-content">
                    <h2 style="color: #0ff; margin-bottom: 20px;">You Completed Jungle Quest 2026!</h2>
                    <div class="final-stats">
                        <p>Final Score: <span style="color: #ff0; font-size: 24px;">${this.stats.score}</span></p>
                        <p>Total Bananas: <span style="color: #ff0; font-size: 24px;">${this.stats.bananas}</span></p>
                        <p>Total Keys: <span style="color: #ff0; font-size: 24px;">${this.stats.keys}</span></p>
                        <p>Time: <span style="color: #ff0; font-size: 24px;">${Math.floor(this.stats.totalTime / 1000)} seconds</span></p>
                    </div>
                    <br>
                    <p style="color: #0ff; font-size: 18px; margin: 20px 0;">Thank you for playing!</p>
                    <div class="menu-item" onclick="game.returnToMenu()" style="margin: 10px;">MAIN MENU</div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x,
                y,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                color,
                Math.random() * 30 + 20
            ));
        }
    }
    
    cameraShake(amount, duration) {
        this.camera.shakeAmount = amount;
        this.camera.shakeDuration = duration * 1000; // Convert to milliseconds
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.stats.score;
        document.getElementById('lives').textContent = Math.max(0, this.stats.lives);
        document.getElementById('bananas').textContent = this.stats.bananas;
        document.getElementById('keys').textContent = this.stats.keys;
        document.getElementById('quantum-energy').style.width = `${this.stats.quantumEnergy}%`;
        document.getElementById('timeline').textContent = `TIMELINE: ${this.stats.timeline}`;
        
        // Update quantum energy color
        const quantumBar = document.getElementById('quantum-energy');
        if (this.stats.quantumEnergy < 20) {
            quantumBar.style.background = '#f00';
        } else if (this.stats.quantumEnergy < 50) {
            quantumBar.style.background = '#ff0';
        } else {
            quantumBar.style.background = 'linear-gradient(90deg, #00f, #0ff)';
        }
    }
    
    saveGame() {
        const saveData = {
            stats: this.stats,
            level: this.currentLevel,
            checkpoint: this.checkpoint,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.saveSlot, JSON.stringify(saveData));
            console.log('💾 Game saved');
        } catch (e) {
            console.error('❌ Failed to save game:', e);
        }
    }
    
    loadGame() {
        try {
            const saved = localStorage.getItem(this.saveSlot);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('❌ Failed to load game:', e);
        }
        return null;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw background based on timeline
        this.drawBackground();
        
        // Draw platforms
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Draw collectibles
        this.collectibles.forEach(collectible => collectible.render(this.ctx));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        
        // Draw particles
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // Draw player
        this.player.render(this.ctx);
        
        // Restore context
        this.ctx.restore();
        
        // Draw debug info if enabled
        if (this.state.debugMode) {
            this.drawDebugInfo();
        }
    }
    
    drawBackground() {
        const ctx = this.ctx;
        const width = this.levelData ? this.levelData.width : this.width * 2;
        const height = this.levelData ? this.levelData.height : this.height * 2;
        
        // Draw based on current timeline
        switch(this.stats.timeline) {
            case 1994:
                this.draw1994Background(ctx, width, height);
                break;
            case 2026:
                this.draw2026Background(ctx, width, height);
                break;
            case 2048:
                this.draw2048Background(ctx, width, height);
                break;
        }
    }
    
    draw1994Background(ctx, width, height) {
        // Classic pixel jungle background
        ctx.fillStyle = '#006400';
        ctx.fillRect(0, 0, width, height);
        
        // Draw pixel trees
        for (let i = 0; i < width; i += 80) {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(i + 20, height - 100, 15, 80);
            ctx.fillStyle = '#228B22';
            ctx.fillRect(i, height - 120, 55, 40);
        }
        
        // Draw sun
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(100, 80, 30, 0, Math.PI * 2);
        ctx.fill();
    }
    
    draw2026Background(ctx, width, height) {
        // Quantum neon background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(0.5, '#003322');
        gradient.addColorStop(1, '#001133');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw quantum energy streams
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 100 + i * 40);
            for (let j = 0; j < 20; j++) {
                const x = j * 40;
                const y = 100 + i * 40 + Math.sin(this.gameTime/1000 + j + i) * 30;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    draw2048Background(ctx, width, height) {
        // Future grid background
        ctx.fillStyle = '#001100';
        ctx.fillRect(0, 0, width, height);
        
        // Grid lines
        ctx.strokeStyle = '#00ff80';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        
        // Floating data nodes
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(this.gameTime/2000 + i) * 100 + i * 100) % width;
            const y = (Math.cos(this.gameTime/2000 + i) * 50 + i * 50) % height;
            ctx.fillStyle = '#00ff80';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawDebugInfo() {
        const ctx = this.ctx;
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        
        const debugInfo = [
            `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
            `Velocity: (${this.player.velocity.x.toFixed(2)}, ${this.player.velocity.y.toFixed(2)})`,
            `Camera: (${Math.floor(this.camera.x)}, ${Math.floor(this.camera.y)})`,
            `Level: ${this.currentLevel}`,
            `Entities: ${this.enemies.length + this.collectibles.length}`,
            `FPS: ${Math.floor(1000 / this.deltaTime)}`,
            `Time: ${Math.floor(this.gameTime / 1000)}s`
        ];
        
        debugInfo.forEach((text, i) => {
            ctx.fillText(text, 10, 20 + i * 15);
        });
    }
    
    togglePause() {
        this.state.paused = !this.state.paused;
        if (this.state.paused) {
            this.audio.pauseBackgroundMusic();
            console.log('⏸️ Game paused');
        } else {
            this.audio.resumeBackgroundMusic();
            console.log('▶️ Game resumed');
        }
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Cap delta time to prevent large jumps
        if (this.deltaTime > 100) this.deltaTime = 100;
        
        // Update game state
        this.update(this.deltaTime);
        
        // Render game
        this.render();
        
        // Continue the loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Global functions for HTML event handlers
function toggleCRT() {
    document.body.classList.toggle('crt');
}

function toggleSound() {
    if (window.game && window.game.audio) {
        window.game.audio.toggleMute();
    }
}

function toggleMobileControls() {
    const controls = document.getElementById('mobile-controls');
    controls.style.display = controls.style.display === 'none' ? 'flex' : 'none';
}

// Make game instance globally available
window.GameEngine = GameEngine;