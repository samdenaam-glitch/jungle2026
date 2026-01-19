// JUNGLE QUEST 2026 - GAME ENTITIES
// All game objects: Player, Enemies, Collectibles, Projectiles, Particles

// BASE ENTITY CLASS
class GameEntity {
    constructor(game, x, y, width, height) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = { x: 0, y: 0 };
        this.active = true;
        this.grounded = false;
        this.ignoreGravity = false;
        
        // Visual properties
        this.color = "#ffffff";
        this.opacity = 1.0;
        this.visible = true;
        
        // Animation
        this.animationTime = 0;
        this.animationSpeed = 1.0;
        this.currentFrame = 0;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update animation
        this.animationTime += deltaTime * this.animationSpeed;
        
        // Apply physics
        if (!this.ignoreGravity) {
            this.game.physics.applyGravity(this, deltaTime);
        }
        
        this.game.physics.updatePosition(this, deltaTime);
        this.game.physics.applyFriction(this, deltaTime);
        
        // Keep within world bounds
        if (this.game.levelData) {
            this.game.physics.checkWorldBounds(
                this, 
                this.game.levelData.width, 
                this.game.levelData.height
            );
        }
    }
    
    render(ctx) {
        if (!this.active || !this.visible) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
        ctx.restore();
    }
    
    destroy() {
        this.active = false;
    }
    
    isOffScreen() {
        return this.x + this.width < this.game.camera.x ||
               this.x > this.game.camera.x + this.game.width ||
               this.y + this.height < this.game.camera.y ||
               this.y > this.game.camera.y + this.game.height;
    }
}

// PLAYER ENTITY
class Player extends GameEntity {
    constructor(game, x, y) {
        super(game, x, y, 24, 40);
        
        // Player properties
        this.speed = 5;
        this.jumpForce = -12;
        this.maxJumps = 2;
        this.jumpCount = 0;
        this.direction = 1; // 1 = right, -1 = left
        this.coyoteTime = 0;
        this.jumpBuffer = 0;
        
        // Combat properties
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 60; // frames
        this.flashTimer = 0;
        
        // Quantum abilities
        this.quantumAbilities = {
            scan: {
                active: false,
                cooldown: 0,
                duration: 0,
                cost: 20
            },
            timeJump: {
                active: false,
                cooldown: 0,
                duration: 0,
                cost: 30
            },
            entangle: {
                active: false,
                cooldown: 0,
                duration: 0,
                cost: 40
            }
        };
        
        // Animation
        this.walkAnimation = 0;
        this.jumpAnimation = 0;
        this.spriteState = "idle";
        
        // Stats
        this.maxHealth = 100;
        this.health = 100;
    }
    
    update(deltaTime) {
        // Handle input
        this.handleInput(deltaTime);
        
        // Update physics
        super.update(deltaTime);
        
        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer--;
            this.flashTimer++;
            
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.flashTimer = 0;
            }
        }
        
        // Update coyote time
        if (this.grounded) {
            this.coyoteTime = 10; // 10 frames
            this.jumpCount = 0;
        } else if (this.coyoteTime > 0) {
            this.coyoteTime--;
        }
        
        // Update jump buffer
        if (this.jumpBuffer > 0) {
            this.jumpBuffer--;
        }
        
        // Update quantum abilities
        this.updateQuantumAbilities(deltaTime);
        
        // Update animation state
        this.updateAnimation(deltaTime);
        
        // Reset grounded flag
        this.grounded = false;
    }
    
    handleInput(deltaTime) {
        // Horizontal movement
        if (this.game.keys['ArrowLeft'] || this.game.keys['KeyA']) {
            this.velocity.x = -this.speed;
            this.direction = -1;
            this.spriteState = "walk";
        } else if (this.game.keys['ArrowRight'] || this.game.keys['KeyD']) {
            this.velocity.x = this.speed;
            this.direction = 1;
            this.spriteState = "walk";
        } else {
            this.velocity.x *= 0.8;
            if (Math.abs(this.velocity.x) < 0.1) {
                this.velocity.x = 0;
                if (this.grounded) this.spriteState = "idle";
            }
        }
        
        // Jumping
        const jumpPressed = this.game.keys['ArrowUp'] || this.game.keys['KeyW'] || this.game.keys['Space'];
        
        if (jumpPressed) {
            this.jumpBuffer = 5; // 5 frame buffer
        }
        
        if (this.jumpBuffer > 0 && (this.grounded || this.coyoteTime > 0)) {
            this.jump();
            this.jumpBuffer = 0;
        } else if (this.jumpBuffer > 0 && this.jumpCount < this.maxJumps - 1) {
            // Double jump
            this.velocity.y = this.jumpForce * 0.8;
            this.jumpCount++;
            this.jumpBuffer = 0;
            this.game.audio.playSound('jump');
            this.spriteState = "jump";
        }
        
        // Quantum abilities
        if (this.game.keys['Digit1'] && this.canUseAbility('scan')) {
            this.useQuantumAbility('scan');
        }
        
        if (this.game.keys['Digit2'] && this.canUseAbility('timeJump')) {
            this.useQuantumAbility('timeJump');
        }
        
        if (this.game.keys['Digit3'] && this.canUseAbility('entangle')) {
            this.useQuantumAbility('entangle');
        }
        
        // Clamp velocity
        this.game.physics.clampVelocity(this);
    }
    
    jump() {
        this.velocity.y = this.jumpForce;
        this.grounded = false;
        this.coyoteTime = 0;
        this.jumpCount++;
        this.game.audio.playSound('jump');
        this.spriteState = "jump";
    }
    
    canUseAbility(abilityName) {
        const ability = this.quantumAbilities[abilityName];
        return this.game.stats.quantumEnergy >= ability.cost && 
               ability.cooldown <= 0;
    }
    
    useQuantumAbility(abilityName) {
        const ability = this.quantumAbilities[abilityName];
        
        // Deduct energy
        this.game.stats.quantumEnergy -= ability.cost;
        
        // Set cooldown
        ability.cooldown = 300; // 5 seconds at 60fps
        ability.active = true;
        ability.duration = 180; // 3 seconds
        
        // Ability effects
        switch(abilityName) {
            case 'scan':
                this.game.audio.playSound('quantum-scan');
                
                // Highlight all collectibles
                this.game.collectibles.forEach(item => {
                    item.scanned = true;
                    setTimeout(() => {
                        item.scanned = false;
                    }, 3000);
                });
                break;
                
            case 'timeJump':
                this.game.audio.playSound('time-jump');
                
                // Switch timeline
                const timelines = [1994, 2026, 2048];
                const currentIndex = timelines.indexOf(this.game.stats.timeline);
                this.game.stats.timeline = timelines[(currentIndex + 1) % timelines.length];
                
                // Visual effect
                this.game.createParticles(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    50,
                    '#0ff'
                );
                break;
                
            case 'entangle':
                this.game.audio.playSound('entangle');
                
                // Link nearby collectibles for bonus
                let linkedCount = 0;
                this.game.collectibles.forEach(item => {
                    const dist = this.game.physics.distance(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        item.x + item.width/2,
                        item.y + item.height/2
                    );
                    
                    if (dist < 200 && !item.collected) {
                        linkedCount++;
                        item.entangled = true;
                        setTimeout(() => {
                            item.entangled = false;
                        }, 2000);
                    }
                });
                
                if (linkedCount >= 2) {
                    this.game.stats.score += linkedCount * 50;
                }
                break;
        }
    }
    
    updateQuantumAbilities(deltaTime) {
        for (const abilityName in this.quantumAbilities) {
            const ability = this.quantumAbilities[abilityName];
            
            if (ability.cooldown > 0) {
                ability.cooldown--;
            }
            
            if (ability.active) {
                ability.duration--;
                if (ability.duration <= 0) {
                    ability.active = false;
                }
            }
        }
    }
    
    updateAnimation(deltaTime) {
        if (!this.grounded && this.velocity.y < 0) {
            this.spriteState = "jump";
        } else if (!this.grounded && this.velocity.y > 0) {
            this.spriteState = "fall";
        } else if (Math.abs(this.velocity.x) > 0.1) {
            this.walkAnimation += deltaTime * 0.02;
            this.spriteState = "walk";
        } else {
            this.spriteState = "idle";
        }
    }
    
    takeDamage(amount) {
        if (this.invincible) return;
        
        this.health -= amount;
        this.invincible = true;
        this.invincibleTimer = this.invincibleDuration;
        
        this.game.audio.playSound('hit');
        this.game.cameraShake(10, 0.3);
        
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Apply camera transform
        const screenX = this.x - this.game.camera.x;
        const screenY = this.y - this.game.camera.y;
        
        // Flash effect when invincible
        if (this.invincible && Math.floor(this.flashTimer / 3) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw based on timeline
        switch(this.game.stats.timeline) {
            case 1994:
                this.render1994(ctx, screenX, screenY);
                break;
            case 2026:
                this.render2026(ctx, screenX, screenY);
                break;
            case 2048:
                this.render2048(ctx, screenX, screenY);
                break;
        }
        
        // Draw ability effects
        this.renderAbilityEffects(ctx, screenX, screenY);
        
        ctx.restore();
    }
    
    render1994(ctx, x, y) {
        // Classic pixel art style
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(x, y, this.width, this.height);
        
        // Head
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + 4, y + 4, 16, 12);
        
        // Eyes
        ctx.fillStyle = '#000000';
        const eyeOffset = this.direction > 0 ? 2 : -2;
        ctx.fillRect(x + 8 + eyeOffset, y + 8, 3, 3);
        ctx.fillRect(x + 16 + eyeOffset, y + 8, 3, 3);
        
        // Body
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x + 2, y + 16, 20, 20);
        
        // Legs (walking animation)
        if (this.spriteState === "walk") {
            const legOffset = Math.sin(this.walkAnimation) * 3;
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(x + 4, y + 36, 6, 4 + legOffset);
            ctx.fillRect(x + 14, y + 36, 6, 4 - legOffset);
        } else {
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(x + 4, y + 36, 6, 4);
            ctx.fillRect(x + 14, y + 36, 6, 4);
        }
        
        // Jump/Fall animation
        if (this.spriteState === "jump" || this.spriteState === "fall") {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(x + 8, y + 36, 8, 4);
        }
    }
    
    render2026(ctx, x, y) {
        // Quantum neon style
        const gradient = ctx.createLinearGradient(x, y, x + this.width, y + this.height);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#0088ff');
        gradient.addColorStop(1, '#00ffff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, this.width, this.height);
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        
        // Core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 8, y + 8, 8, 24);
        
        // Energy lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y + 10 + i * 10);
            ctx.lineTo(x + this.width, y + 10 + i * 10);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
    }
    
    render2048(ctx, x, y) {
        // Future holographic style
        ctx.globalAlpha = 0.9;
        
        // Hologram scan lines
        for (let i = 0; i < this.height; i += 4) {
            ctx.fillStyle = i % 8 === 0 ? '#00ff80' : '#00cc66';
            ctx.fillRect(x, y + i, this.width, 2);
        }
        
        // Glowing outline
        ctx.strokeStyle = '#00ff80';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, this.width, this.height);
        
        // Core energy
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + this.width/2 - 2, y + 8, 4, 24);
        
        ctx.globalAlpha = 1;
    }
    
    renderAbilityEffects(ctx, x, y) {
        // Scan effect
        if (this.quantumAbilities.scan.active) {
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(x + this.width/2, y + this.height/2, 100, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Entangle effect
        if (this.quantumAbilities.entangle.active) {
            ctx.strokeStyle = '#f0f';
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + this.animationTime * 0.1;
                const radius = 50 + Math.sin(this.animationTime * 0.2 + i) * 20;
                const px = x + this.width/2 + Math.cos(angle) * radius;
                const py = y + this.height/2 + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.moveTo(x + this.width/2, y + this.height/2);
                ctx.lineTo(px, py);
                ctx.stroke();
            }
        }
    }
}

// PLATFORM ENTITY
class Platform extends GameEntity {
    constructor(game, x, y, width, height, type = 'normal') {
        super(game, x, y, width, height);
        this.type = type;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.originalY = y;
        this.originalX = x; // Added missing property
        this.movePhase = 0;
        
        // Platform properties based on type
        switch(type) {
            case 'quantum':
                this.floatAmplitude = 20;
                this.floatSpeed = 0.5;
                this.color = '#0ff';
                this.opacity = 0.7;
                break;
                
            case 'moving':
                this.moveDistanceX = 100;
                this.moveDistanceY = 50;
                this.moveSpeed = 1;
                this.color = '#8B4513';
                break;
                
            case 'holographic':
                this.color = '#00ff80';
                this.opacity = 0.8;
                break;
                
            case 'spikes':
                this.color = '#ff0000';
                break;
                
            case 'temple':
                this.color = '#ff8800';
                break;
                
            default: // normal
                this.color = '#8B4513';
                break;
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Platform-specific behaviors
        switch(this.type) {
            case 'quantum':
                // Floating animation
                this.floatPhase += deltaTime * 0.001 * this.floatSpeed;
                this.y = this.originalY + Math.sin(this.floatPhase) * this.floatAmplitude;
                this.opacity = 0.7 + Math.sin(this.floatPhase * 2) * 0.3;
                break;
                
            case 'moving':
                // Moving platform
                this.movePhase += deltaTime * 0.001 * this.moveSpeed;
                this.x = this.originalX + Math.sin(this.movePhase) * this.moveDistanceX;
                this.y = this.originalY + Math.cos(this.movePhase) * this.moveDistanceY;
                break;
                
            case 'spikes':
                // Spikes damage player on contact
                if (this.game.physics.checkCollision(this, this.game.player)) {
                    this.game.playerTakeDamage(5);
                }
                break;
        }
    }
    
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        
        const screenX = this.x - this.game.camera.x;
        const screenY = this.y - this.game.camera.y;
        
        // Draw platform base
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Platform-specific rendering
        switch(this.type) {
            case 'quantum':
                // Glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color;
                ctx.fillRect(screenX, screenY, this.width, this.height);
                ctx.shadowBlur = 0;
                
                // Energy lines
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(screenX, screenY + i * 5);
                    ctx.lineTo(screenX + this.width, screenY + i * 5);
                    ctx.stroke();
                }
                break;
                
            case 'holographic':
                // Scan lines
                for (let i = 0; i < this.height; i += 3) {
                    ctx.fillStyle = i % 6 === 0 ? '#ffffff' : this.color;
                    ctx.fillRect(screenX, screenY + i, this.width, 1);
                }
                break;
                
            case 'spikes':
                // Draw spikes
                ctx.fillStyle = '#ff4444';
                for (let i = 0; i < this.width; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(screenX + i, screenY + this.height);
                    ctx.lineTo(screenX + i + 5, screenY);
                    ctx.lineTo(screenX + i + 10, screenY + this.height);
                    ctx.fill();
                }
                break;
                
            case 'temple':
                // Temple patterns
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(screenX + 10, screenY + 5, this.width - 20, 5);
                ctx.fillRect(screenX + 5, screenY + 15, this.width - 10, 5);
                break;
        }
        
        ctx.restore();
    }
}

// COLLECTIBLE ENTITY
class Collectible extends GameEntity {
    constructor(game, x, y, type) {
        super(game, x, y, 16, 16);
        this.type = type;
        this.collected = false;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.scanned = false;
        this.entangled = false;
        this.rotation = 0; // Added missing property
        
        // Set properties based on type
        switch(type) {
            case 'banana':
                this.value = 10;
                this.color = '#ffff00';
                this.glowColor = '#ffaa00';
                break;
                
            case 'key':
                this.value = 100;
                this.color = '#ff8800';
                this.glowColor = '#ffcc00';
                break;
                
            case 'quantum':
                this.value = 50;
                this.color = '#00ffff';
                this.glowColor = '#ffffff';
                break;
                
            case 'health':
                this.value = 1; // Add one life
                this.color = '#00ff00';
                this.glowColor = '#88ff88';
                break;
        }
    }
    
    update(deltaTime) {
        if (this.collected) return;
        
        super.update(deltaTime);
        
        // Floating animation
        this.floatPhase += deltaTime * 0.001;
        this.y += Math.sin(this.floatPhase) * 0.5;
        
        // Rotation animation
        this.rotation = Math.sin(this.floatPhase * 1.5) * 0.1;
    }
    
    render(ctx) {
        if (this.collected || !this.visible) return;
        
        ctx.save();
        
        const screenX = this.x - this.game.camera.x;
        const screenY = this.y - this.game.camera.y;
        const centerX = screenX + this.width/2;
        const centerY = screenY + this.height/2;
        
        // Apply rotation
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.translate(-centerX, -centerY);
        
        // Glow effect when scanned
        if (this.scanned) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = this.glowColor;
        }
        
        // Entanglement effect
        if (this.entangled) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#f0f';
        }
        
        // Draw collectible based on type
        switch(this.type) {
            case 'banana':
                this.renderBanana(ctx, screenX, screenY);
                break;
                
            case 'key':
                this.renderKey(ctx, screenX, screenY);
                break;
                
            case 'quantum':
                this.renderQuantum(ctx, screenX, screenY);
                break;
                
            case 'health':
                this.renderHealth(ctx, screenX, screenY);
                break;
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    renderBanana(ctx, x, y) {
        const pulse = Math.sin(this.floatPhase * 2) * 2;
        
        // Banana shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            x + 8 + pulse,
            y + 8,
            8 + pulse/2,
            4,
            Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Stem
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 10, y + 2, 2, 6);
        
        // Highlight
        ctx.fillStyle = '#ffffaa';
        ctx.beginPath();
        ctx.ellipse(
            x + 10,
            y + 6,
            3,
            2,
            Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    renderKey(ctx, x, y) {
        const pulse = Math.sin(this.floatPhase * 3) * 1.5;
        
        // Key handle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 6 + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Key shaft
        ctx.fillRect(x + 8, y + 2, 8 + pulse, 4);
        
        // Teeth
        ctx.fillRect(x + 14, y + 4, 2 + pulse/2, 4);
        ctx.fillRect(x + 14, y + 8, 4 + pulse/2, 2);
        
        // Highlight
        ctx.fillStyle = '#ffcc88';
        ctx.beginPath();
        ctx.arc(x + 7, y + 7, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderQuantum(ctx, x, y) {
        const pulse = Math.sin(this.floatPhase * 4) * 3;
        
        // Outer glow
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 8 + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Energy particles
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + this.floatPhase;
            const px = x + 8 + Math.cos(angle) * (6 + pulse);
            const py = y + 8 + Math.sin(angle) * (6 + pulse);
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderHealth(ctx, x, y) {
        const pulse = Math.sin(this.floatPhase * 2) * 2;
        
        // Plus sign
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 6, y + 2 + pulse, 4, 12 - pulse*2);
        ctx.fillRect(x + 2, y + 6 + pulse, 12 - pulse*2, 4);
        
        // Pulse effect
        if (Math.sin(this.floatPhase * 3) > 0) {
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 16, 16);
        }
        
        // Glow
        ctx.fillStyle = this.glowColor;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 8 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ENEMY ENTITY
class Enemy extends GameEntity {
    constructor(game, x, y, type) {
        let width, height;
        
        // Set size based on type
        switch(type) {
            case 'bandit':
                width = 28;
                height = 40;
                break;
            case 'glitch':
                width = 32;
                height = 32;
                break;
            case 'drone':
                width = 24;
                height = 24;
                break;
            case 'boss':
                width = 80;
                height = 80;
                break;
            default:
                width = 32;
                height = 32;
        }
        
        super(game, x, y, width, height);
        
        this.type = type;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.patrolRange = 100;
        this.startX = x;
        this.startY = y;
        this.attackCooldown = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 10;
        
        // Type-specific properties
        switch(type) {
            case 'bandit':
                this.speed = 2;
                this.color = '#ff0000';
                break;
            case 'glitch':
                this.speed = 1.5;
                this.color = '#ff00ff';
                this.ignoreGravity = true;
                break;
            case 'drone':
                this.speed = 3;
                this.color = '#00ff80';
                this.ignoreGravity = true;
                break;
            case 'boss':
                this.speed = 1;
                this.color = '#ff8800';
                this.health = 300;
                this.maxHealth = 300;
                this.damage = 20;
                break;
        }
        
        // AI state
        this.aiState = 'patrol';
        this.targetX = x;
        this.targetY = y;
        this.aggroRange = 300;
        this.attackRange = 150;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        super.update(deltaTime);
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // AI Behavior
        switch(this.type) {
            case 'bandit':
                this.updateBanditAI(deltaTime);
                break;
            case 'glitch':
                this.updateGlitchAI(deltaTime);
                break;
            case 'drone':
                this.updateDroneAI(deltaTime);
                break;
            case 'boss':
                this.updateBossAI(deltaTime);
                break;
        }
        
        // Check if off screen for too long
        if (this.isOffScreen() && this.type !== 'boss') {
            this.active = false;
        }
    }
    
    updateBanditAI(deltaTime) {
        // Simple patrol behavior
        this.velocity.x = this.direction * this.speed;
        
        // Turn around at patrol limits
        if (Math.abs(this.x - this.startX) > this.patrolRange) {
            this.direction *= -1;
        }
        
        // Jump randomly
        if (this.grounded && Math.random() < 0.001) {
            this.velocity.y = -10;
        }
        
        // Aggro on player
        const player = this.game.player;
        const distance = this.game.physics.distance(
            this.x + this.width/2,
            this.y + this.height/2,
            player.x + player.width/2,
            player.y + player.height/2
        );
        
        if (distance < this.aggroRange) {
            this.aiState = 'chase';
            this.targetX = player.x;
            this.targetY = player.y;
            
            // Move toward player
            const dx = player.x - this.x;
            this.direction = dx > 0 ? 1 : -1;
            this.velocity.x = this.direction * this.speed * 1.5;
        } else {
            this.aiState = 'patrol';
        }
    }
    
    updateGlitchAI(deltaTime) {
        // Erratic floating movement
        this.animationTime += deltaTime * 0.001;
        
        this.velocity.x = Math.sin(this.animationTime * 2) * this.speed;
        this.velocity.y = Math.cos(this.animationTime * 1.5) * this.speed;
        
        // Phase in and out
        if (Math.random() < 0.01) {
            this.visible = !this.visible;
        }
        
        // Teleport occasionally
        if (Math.random() < 0.005) {
            this.x += (Math.random() - 0.5) * 100;
            this.y += (Math.random() - 0.5) * 100;
        }
    }
    
    updateDroneAI(deltaTime) {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.aggroRange) {
            // Chase player
            this.aiState = 'chase';
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
            
            // Shoot at player
            if (this.attackCooldown <= 0 && distance < this.attackRange) {
                this.shootAtPlayer();
                this.attackCooldown = 60; // 1 second
            }
        } else {
            // Idle movement
            this.aiState = 'patrol';
            this.velocity.x = Math.sin(this.animationTime) * this.speed * 0.5;
            this.velocity.y = Math.cos(this.animationTime) * this.speed * 0.5;
        }
    }
    
    updateBossAI(deltaTime) {
        const player = this.game.player;
        
        // Float up and down
        this.velocity.y = Math.sin(this.animationTime) * this.speed;
        
        // Move toward player horizontally
        if (Math.abs(player.x - this.x) > 50) {
            this.velocity.x = Math.sign(player.x - this.x) * this.speed;
        } else {
            this.velocity.x *= 0.9;
        }
        
        // Attack patterns based on health
        if (this.attackCooldown <= 0) {
            if (this.health < this.maxHealth / 3) {
                // Phase 3: Rapid fire
                this.bossAttack('rapid');
                this.attackCooldown = 20;
            } else if (this.health < this.maxHealth * 2 / 3) {
                // Phase 2: Triple shot
                this.bossAttack('triple');
                this.attackCooldown = 60;
            } else {
                // Phase 1: Single shot
                this.bossAttack('single');
                this.attackCooldown = 90;
            }
        }
        
        // Summon minions when health is low
        if (this.health < this.maxHealth / 2 && Math.random() < 0.001) {
            this.summonMinions();
        }
    }
    
    shootAtPlayer() {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.game.projectiles.push(new Projectile(
            this.game,
            this.x + this.width/2,
            this.y + this.height/2,
            (dx / distance) * 8,
            (dy / distance) * 8,
            true, // enemy projectile
            '#ff0000'
        ));
        
        this.game.audio.playSound('enemy-shoot');
    }
    
    bossAttack(pattern) {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        switch(pattern) {
            case 'single':
                this.game.projectiles.push(new Projectile(
                    this.game,
                    this.x + this.width/2,
                    this.y + this.height/2,
                    Math.cos(angle) * 6,
                    Math.sin(angle) * 6,
                    true,
                    '#ff8800',
                    15
                ));
                break;
                
            case 'triple':
                for (let i = -1; i <= 1; i++) {
                    const spreadAngle = angle + i * 0.3;
                    this.game.projectiles.push(new Projectile(
                        this.game,
                        this.x + this.width/2,
                        this.y + this.height/2,
                        Math.cos(spreadAngle) * 6,
                        Math.sin(spreadAngle) * 6,
                        true,
                        '#ff8800',
                        15
                    ));
                }
                break;
                
            case 'rapid':
                for (let i = 0; i < 3; i++) {
                    const randomAngle = angle + (Math.random() - 0.5) * 0.5;
                    this.game.projectiles.push(new Projectile(
                        this.game,
                        this.x + this.width/2,
                        this.y + this.height/2,
                        Math.cos(randomAngle) * 8,
                        Math.sin(randomAngle) * 8,
                        true,
                        '#ff0000',
                        10
                    ));
                }
                break;
        }
        
        this.game.audio.playSound('boss-shoot');
    }
    
    summonMinions() {
        for (let i = 0; i < 3; i++) {
            this.game.enemies.push(new Enemy(
                this.game,
                this.x + (i - 1) * 50,
                this.y + 100,
                'bandit'
            ));
        }
        
        this.game.audio.playSound('summon');
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Visual feedback
        this.game.createParticles(
            this.x + this.width/2,
            this.y + this.height/2,
            10,
            '#ff0000'
        );
        
        if (this.health <= 0) {
            this.destroy();
            this.game.stats.score += this.type === 'boss' ? 1000 : 100;
        }
    }
    
    render(ctx) {
        if (!this.active || !this.visible) return;
        
        ctx.save();
        
        const screenX = this.x - this.game.camera.x;
        const screenY = this.y - this.game.camera.y;
        
        // Damage flash
        if (this.health < this.maxHealth) {
            ctx.globalAlpha = 0.7 + Math.sin(this.animationTime * 10) * 0.3;
        }
        
        // Draw enemy based on type
        switch(this.type) {
            case 'bandit':
                this.renderBandit(ctx, screenX, screenY);
                break;
            case 'glitch':
                this.renderGlitch(ctx, screenX, screenY);
                break;
            case 'drone':
                this.renderDrone(ctx, screenX, screenY);
                break;
            case 'boss':
                this.renderBoss(ctx, screenX, screenY);
                break;
        }
        
        // Draw health bar for bosses
        if (this.type === 'boss') {
            this.renderHealthBar(ctx, screenX, screenY);
        }
        
        ctx.restore();
    }
    
    renderBandit(ctx, x, y) {
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, this.width, this.height);
        
        // Face
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 10, 4, 4);
        ctx.fillRect(x + 18, y + 10, 4, 4);
        
        // Mouth
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 10, y + 20, 8, 2);
        
        // Animation
        const legOffset = Math.sin(this.animationTime * 3) * 3;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + this.height - 4, 6, 4 + legOffset);
        ctx.fillRect(x + 18, y + this.height - 4, 6, 4 - legOffset);
    }
    
    renderGlitch(ctx, x, y) {
        // Glitch effect
        const offsetX = Math.sin(this.animationTime * 5) * 2;
        const offsetY = Math.cos(this.animationTime * 5) * 2;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(x + offsetX, y + offsetY, this.width, this.height);
        
        // Glitch lines
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            const lineY = y + i * 8 + Math.sin(this.animationTime * 2 + i) * 2;
            ctx.fillRect(x, lineY, this.width, 2);
        }
        
        // Distortion
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + offsetX * 2, y + offsetY * 2, this.width, this.height);
    }
    
    renderDrone(ctx, x, y) {
        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            x + this.width/2,
            y + this.height/2,
            this.width/2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Propeller animation
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = this.animationTime * 5 + i * Math.PI / 2;
            const x1 = x + this.width/2;
            const y1 = y + this.height/2;
            const x2 = x1 + Math.cos(angle) * this.width/2;
            const y2 = y1 + Math.sin(angle) * this.width/2;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Eye
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + this.width/2, y + this.height/2, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderBoss(ctx, x, y) {
        // Body
        const gradient = ctx.createRadialGradient(
            x + this.width/2,
            y + this.height/2,
            10,
            x + this.width/2,
            y + this.height/2,
            this.width/2
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ff8800');
        gradient.addColorStop(1, '#ff4400');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            x + this.width/2,
            y + this.height/2,
            this.width/2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Angry face
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + this.width/2 - 15, y + this.height/2 - 10, 6, 0, Math.PI * 2);
        ctx.arc(x + this.width/2 + 15, y + this.height/2 - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + this.width/2, y + this.height/2 + 10, 15, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Crown
        ctx.fillStyle = '#ffdd00';
        for (let i = 0; i < 5; i++) {
            const crownX = x + this.width/2 - 20 + i * 10;
            const crownY = y + this.height/2 - 40;
            ctx.beginPath();
            ctx.moveTo(crownX, crownY);
            ctx.lineTo(crownX + 5, crownY - 10);
            ctx.lineTo(crownX + 10, crownY);
            ctx.fill();
        }
    }
    
    renderHealthBar(ctx, x, y) {
        const barWidth = 100;
        const barHeight = 8;
        const barX = x + this.width/2 - barWidth/2;
        const barY = y - 20;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                       healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

// PROJECTILE ENTITY
class Projectile extends GameEntity {
    constructor(game, x, y, vx, vy, enemy = false, color = '#ffffff', size = 8) {
        super(game, x - size/2, y - size/2, size, size);
        this.velocity.x = vx;
        this.velocity.y = vy;
        this.enemy = enemy;
        this.color = color;
        this.life = 300; // 5 seconds at 60fps
        this.damage = enemy ? 15 : 10;
        this.ignoreGravity = !enemy; // Player projectiles have gravity
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.life--;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        const screenX = this.x - this.game.camera.x;
        const screenY = this.y - this.game.camera.y;
        const centerX = screenX + this.width/2;
        const centerY = screenY + this.height/2;
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Draw projectile based on type
        if (this.enemy) {
            // Enemy projectile (spikey)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = this.width/2;
                const px = centerX + Math.cos(angle) * radius;
                const py = centerY + Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // Player projectile (energy ball)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner glow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width/4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

// PARTICLE ENTITY
class Particle extends GameEntity {
    constructor(game, x, y, vx, vy, color, life) {
        super(game, x, y, 4, 4);
        this.velocity.x = vx;
        this.velocity.y = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.ignoreGravity = false;
        this.fade = true;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.life--;
        
        if (this.life <= 0) {
            this.active = false;
        }
        
        // Fade out
        if (this.fade) {
            this.opacity = this.life / this.maxLife;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        const screenX = this.x - this.game.camera.x;
        const screenY = this.y - this.game.camera.y;
        
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        // Draw particle as circle or square
        if (Math.random() > 0.5) {
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, screenY + this.height/2, this.width/2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
        
        ctx.restore();
    }
}

// Export classes for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameEntity,
        Player,
        Platform,
        Collectible,
        Enemy,
        Projectile,
        Particle
    };
}