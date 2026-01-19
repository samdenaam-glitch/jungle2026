// JUNGLE QUEST 2026 - PHYSICS ENGINE
// Handles collision detection, gravity, and movement physics

class PhysicsEngine {
    constructor() {
        // Physics constants
        this.gravity = 0.5;
        this.friction = 0.85;
        this.airResistance = 0.95;
        this.maxFallSpeed = 20;
        this.maxHorizontalSpeed = 10;
        
        // Collision categories
        this.collisionTypes = {
            PLAYER: 1,
            PLATFORM: 2,
            ENEMY: 4,
            COLLECTIBLE: 8,
            PROJECTILE: 16
        };
    }
    
    // Check collision between two axis-aligned bounding boxes
    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    // Check collision with more detailed information
    checkCollisionDetailed(a, b) {
        const collision = {
            collided: false,
            direction: null,
            overlapX: 0,
            overlapY: 0
        };
        
        if (!this.checkCollision(a, b)) {
            return collision;
        }
        
        collision.collided = true;
        
        // Calculate overlap on each axis
        collision.overlapX = Math.min(
            a.x + a.width - b.x,
            b.x + b.width - a.x
        );
        
        collision.overlapY = Math.min(
            a.y + a.height - b.y,
            b.y + b.height - a.y
        );
        
        // Determine collision direction based on minimum overlap
        if (collision.overlapX < collision.overlapY) {
            if (a.x < b.x) {
                collision.direction = 'left';
            } else {
                collision.direction = 'right';
            }
        } else {
            if (a.y < b.y) {
                collision.direction = 'top';
            } else {
                collision.direction = 'bottom';
            }
        }
        
        return collision;
    }
    
    // Resolve collision between player and platform
    resolveCollision(player, platform) {
        const collision = this.checkCollisionDetailed(player, platform);
        
        if (!collision.collided) return;
        
        switch (collision.direction) {
            case 'top':
                // Player lands on platform
                player.y = platform.y - player.height;
                player.velocity.y = 0;
                player.grounded = true;
                player.jumpCount = 0;
                break;
                
            case 'bottom':
                // Player hits platform from below
                player.y = platform.y + platform.height;
                player.velocity.y = 0;
                break;
                
            case 'left':
                // Player hits platform from left
                player.x = platform.x - player.width;
                player.velocity.x = 0;
                break;
                
            case 'right':
                // Player hits platform from right
                player.x = platform.x + platform.width;
                player.velocity.x = 0;
                break;
        }
    }
    
    // Apply gravity to an entity
    applyGravity(entity, deltaTime) {
        if (!entity.grounded && !entity.ignoreGravity) {
            entity.velocity.y += this.gravity * deltaTime * 0.016;
            
            // Terminal velocity
            if (entity.velocity.y > this.maxFallSpeed) {
                entity.velocity.y = this.maxFallSpeed;
            }
        }
    }
    
    // Apply friction to an entity
    applyFriction(entity, deltaTime) {
        if (entity.grounded) {
            entity.velocity.x *= this.friction;
        } else {
            entity.velocity.x *= this.airResistance;
        }
        
        // Stop very small velocities
        if (Math.abs(entity.velocity.x) < 0.1) {
            entity.velocity.x = 0;
        }
    }
    
    // Update entity position based on velocity
    updatePosition(entity, deltaTime) {
        entity.x += entity.velocity.x * deltaTime * 0.016;
        entity.y += entity.velocity.y * deltaTime * 0.016;
    }
    
    // Check if entity is within world bounds
    checkWorldBounds(entity, worldWidth, worldHeight) {
        // Left bound
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocity.x = 0;
        }
        
        // Right bound
        if (entity.x + entity.width > worldWidth) {
            entity.x = worldWidth - entity.width;
            entity.velocity.x = 0;
        }
        
        // Top bound
        if (entity.y < 0) {
            entity.y = 0;
            entity.velocity.y = 0;
        }
        
        // Bottom bound (falling out of world)
        if (entity.y > worldHeight) {
            return false; // Entity should be removed
        }
        
        return true;
    }
    
    // Calculate distance between two points
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate angle between two points in radians
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    // Check if point is inside rectangle
    pointInRect(px, py, rect) {
        return px >= rect.x && 
               px <= rect.x + rect.width && 
               py >= rect.y && 
               py <= rect.y + rect.height;
    }
    
    // Get tile coordinates from world coordinates
    worldToTile(x, y, tileSize) {
        return {
            tileX: Math.floor(x / tileSize),
            tileY: Math.floor(y / tileSize)
        };
    }
    
    // Get world coordinates from tile coordinates
    tileToWorld(tileX, tileY, tileSize) {
        return {
            x: tileX * tileSize,
            y: tileY * tileSize
        };
    }
    
    // Check collision with multiple platforms (optimized)
    checkPlatformCollisions(player, platforms) {
        let grounded = false;
        
        for (const platform of platforms) {
            if (this.checkCollision(player, platform)) {
                this.resolveCollision(player, platform);
                
                if (player.grounded) {
                    grounded = true;
                }
            }
        }
        
        return grounded;
    }
    
    // Simple line-of-sight check
    hasLineOfSight(x1, y1, x2, y2, obstacles) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            
            for (const obstacle of obstacles) {
                if (this.pointInRect(x, y, obstacle)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Calculate bounce reflection
    calculateBounce(incident, normal) {
        const dot = incident.x * normal.x + incident.y * normal.y;
        return {
            x: incident.x - 2 * dot * normal.x,
            y: incident.y - 2 * dot * normal.y
        };
    }
    
    // Apply impulse (instant velocity change)
    applyImpulse(entity, impulseX, impulseY) {
        entity.velocity.x += impulseX;
        entity.velocity.y += impulseY;
    }
    
    // Apply force over time (acceleration)
    applyForce(entity, forceX, forceY, deltaTime) {
        entity.velocity.x += forceX * deltaTime * 0.016;
        entity.velocity.y += forceY * deltaTime * 0.016;
    }
    
    // Clamp velocity to maximum values
    clampVelocity(entity) {
        entity.velocity.x = Math.max(
            -this.maxHorizontalSpeed, 
            Math.min(this.maxHorizontalSpeed, entity.velocity.x)
        );
        
        entity.velocity.y = Math.max(
            -this.maxFallSpeed, 
            Math.min(this.maxFallSpeed, entity.velocity.y)
        );
    }
    
    // Predict future position
    predictPosition(entity, timeAhead) {
        return {
            x: entity.x + entity.velocity.x * timeAhead,
            y: entity.y + entity.velocity.y * timeAhead
        };
    }
    
    // Check if moving from point A to point B would collide
    movingCollision(startX, startY, endX, endY, width, height, obstacles) {
        // Create a rectangle representing the movement path
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX + width, endX + width);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY + height, endY + height);
        
        const movementBounds = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
        
        for (const obstacle of obstacles) {
            if (this.checkCollision(movementBounds, obstacle)) {
                return true;
            }
        }
        
        return false;
    }
}