// JUNGLE QUEST 2026 - LEVEL DATA
// Contains all level definitions: platforms, collectibles, enemies, etc.

const LEVEL_DATA = [
    // LEVEL 1: VINE CANYON (1994 Era)
    {
        name: "Vine Canyon",
        era: 1994,
        width: 2000,
        height: 600,
        playerStart: { x: 100, y: 400 },
        backgroundColor: "#006400",
        completionRequirement: { type: "keys", amount: 5 },
        
        platforms: [
            // Ground
            { x: 0, y: 500, width: 2000, height: 100, type: "normal" },
            
            // Main path platforms
            { x: 200, y: 400, width: 150, height: 20, type: "normal" },
            { x: 450, y: 350, width: 120, height: 20, type: "normal" },
            { x: 700, y: 300, width: 100, height: 20, type: "normal" },
            { x: 950, y: 350, width: 120, height: 20, type: "normal" },
            { x: 1200, y: 400, width: 150, height: 20, type: "normal" },
            { x: 1500, y: 300, width: 200, height: 20, type: "normal" },
            { x: 1800, y: 250, width: 150, height: 20, type: "normal" },
            
            // Floating platforms for collectibles
            { x: 300, y: 200, width: 80, height: 20, type: "normal" },
            { x: 550, y: 150, width: 80, height: 20, type: "normal" },
            { x: 800, y: 200, width: 80, height: 20, type: "normal" },
            { x: 1050, y: 150, width: 80, height: 20, type: "normal" },
            { x: 1300, y: 200, width: 80, height: 20, type: "normal" },
            { x: 1550, y: 150, width: 80, height: 20, type: "normal" },
            
            // Final temple platform
            { x: 1850, y: 100, width: 100, height: 20, type: "temple" }
        ],
        
        collectibles: [
            // Bananas (basic collectibles)
            { x: 250, y: 350, type: "banana", value: 10 },
            { x: 500, y: 300, type: "banana", value: 10 },
            { x: 750, y: 250, type: "banana", value: 10 },
            { x: 1000, y: 300, type: "banana", value: 10 },
            { x: 1250, y: 350, type: "banana", value: 10 },
            { x: 1500, y: 250, type: "banana", value: 10 },
            { x: 1750, y: 200, type: "banana", value: 10 },
            
            // Floating bananas
            { x: 350, y: 150, type: "banana", value: 10 },
            { x: 600, y: 100, type: "banana", value: 10 },
            { x: 850, y: 150, type: "banana", value: 10 },
            { x: 1100, y: 100, type: "banana", value: 10 },
            { x: 1350, y: 150, type: "banana", value: 10 },
            { x: 1600, y: 100, type: "banana", value: 10 },
            
            // Keys (level completion items)
            { x: 400, y: 150, type: "key", value: 100 },
            { x: 700, y: 100, type: "key", value: 100 },
            { x: 1000, y: 150, type: "key", value: 100 },
            { x: 1300, y: 100, type: "key", value: 100 },
            { x: 1600, y: 50, type: "key", value: 100 },
            
            // Health pickups
            { x: 600, y: 450, type: "health", value: 1 },
            { x: 1200, y: 450, type: "health", value: 1 },
            
            // Secret quantum fragment
            { x: 1800, y: 50, type: "quantum", value: 50 }
        ],
        
        enemies: [
            { x: 300, y: 450, type: "bandit", patrolRange: 100 },
            { x: 650, y: 400, type: "bandit", patrolRange: 80 },
            { x: 950, y: 350, type: "bandit", patrolRange: 120 },
            { x: 1300, y: 450, type: "bandit", patrolRange: 100 },
            { x: 1650, y: 250, type: "bandit", patrolRange: 150 }
        ],
        
        hazards: [
            { x: 400, y: 480, width: 50, height: 20, type: "spikes" },
            { x: 900, y: 480, width: 50, height: 20, type: "spikes" },
            { x: 1400, y: 480, width: 50, height: 20, type: "spikes" }
        ]
    },
    
    // LEVEL 2: QUANTUM TEMPLE (2026 Era)
    {
        name: "Quantum Temple",
        era: 2026,
        width: 2200,
        height: 800,
        playerStart: { x: 100, y: 600 },
        backgroundColor: "#001122",
        completionRequirement: { type: "quantum", amount: 10 },
        
        platforms: [
            // Quantum floating platforms
            { x: 100, y: 550, width: 120, height: 20, type: "quantum", floatAmplitude: 20, floatSpeed: 0.5 },
            { x: 300, y: 500, width: 100, height: 20, type: "quantum", floatAmplitude: 15, floatSpeed: 0.7 },
            { x: 500, y: 450, width: 120, height: 20, type: "quantum", floatAmplitude: 25, floatSpeed: 0.4 },
            { x: 700, y: 500, width: 100, height: 20, type: "quantum", floatAmplitude: 18, floatSpeed: 0.6 },
            { x: 900, y: 550, width: 120, height: 20, type: "quantum", floatAmplitude: 22, floatSpeed: 0.5 },
            { x: 1100, y: 450, width: 150, height: 20, type: "quantum", floatAmplitude: 30, floatSpeed: 0.3 },
            { x: 1300, y: 500, width: 100, height: 20, type: "quantum", floatAmplitude: 15, floatSpeed: 0.8 },
            { x: 1500, y: 400, width: 120, height: 20, type: "quantum", floatAmplitude: 20, floatSpeed: 0.6 },
            { x: 1700, y: 450, width: 100, height: 20, type: "quantum", floatAmplitude: 25, floatSpeed: 0.4 },
            { x: 1900, y: 350, width: 150, height: 20, type: "quantum", floatAmplitude: 35, floatSpeed: 0.2 },
            
            // Moving platforms
            { x: 250, y: 300, width: 100, height: 20, type: "moving", moveX: 100, moveY: 0, speed: 1 },
            { x: 750, y: 250, width: 100, height: 20, type: "moving", moveX: 0, moveY: 100, speed: 0.8 },
            { x: 1250, y: 200, width: 100, height: 20, type: "moving", moveX: 100, moveY: 50, speed: 0.6 },
            { x: 1750, y: 150, width: 100, height: 20, type: "moving", moveX: 50, moveY: 100, speed: 0.7 },
            
            // Safety net at bottom
            { x: 0, y: 700, width: 2200, height: 100, type: "normal" }
        ],
        
        collectibles: [
            // Quantum fragments (primary collectibles)
            { x: 150, y: 500, type: "quantum", value: 50, glow: true },
            { x: 350, y: 450, type: "quantum", value: 50, glow: true },
            { x: 550, y: 400, type: "quantum", value: 50, glow: true },
            { x: 750, y: 450, type: "quantum", value: 50, glow: true },
            { x: 950, y: 500, type: "quantum", value: 50, glow: true },
            { x: 1150, y: 400, type: "quantum", value: 50, glow: true },
            { x: 1350, y: 450, type: "quantum", value: 50, glow: true },
            { x: 1550, y: 350, type: "quantum", value: 50, glow: true },
            { x: 1750, y: 400, type: "quantum", value: 50, glow: true },
            { x: 1950, y: 300, type: "quantum", value: 50, glow: true },
            
            // Health pickups
            { x: 300, y: 250, type: "health", value: 1 },
            { x: 800, y: 200, type: "health", value: 1 },
            { x: 1300, y: 150, type: "health", value: 1 },
            { x: 1800, y: 100, type: "health", value: 1 },
            
            // Bananas
            { x: 200, y: 200, type: "banana", value: 10 },
            { x: 450, y: 150, type: "banana", value: 10 },
            { x: 700, y: 200, type: "banana", value: 10 },
            { x: 950, y: 150, type: "banana", value: 10 },
            { x: 1200, y: 200, type: "banana", value: 10 },
            { x: 1450, y: 150, type: "banana", value: 10 },
            { x: 1700, y: 200, type: "banana", value: 10 },
            { x: 1950, y: 150, type: "banana", value: 10 }
        ],
        
        enemies: [
            { x: 400, y: 300, type: "glitch", behavior: "float" },
            { x: 800, y: 250, type: "glitch", behavior: "float" },
            { x: 1200, y: 200, type: "glitch", behavior: "float" },
            { x: 1600, y: 150, type: "glitch", behavior: "float" },
            { x: 2000, y: 100, type: "glitch", behavior: "float" }
        ],
        
        hazards: [
            { x: 600, y: 650, width: 100, height: 20, type: "energy" },
            { x: 1100, y: 650, width: 100, height: 20, type: "energy" },
            { x: 1600, y: 650, width: 100, height: 20, type: "energy" }
        ]
    },
    
    // LEVEL 3: BOSS BATTLE - KING BANANA
    {
        name: "Temple of the Banana King",
        era: 1994,
        width: 1200,
        height: 600,
        playerStart: { x: 100, y: 400 },
        backgroundColor: "#8B0000",
        completionRequirement: { type: "boss", amount: 1 },
        isBossLevel: true,
        
        platforms: [
            // Arena floor
            { x: 0, y: 500, width: 1200, height: 100, type: "normal" },
            
            // Player platforms
            { x: 100, y: 300, width: 80, height: 20, type: "normal" },
            { x: 300, y: 350, width: 80, height: 20, type: "normal" },
            { x: 500, y: 300, width: 80, height: 20, type: "normal" },
            { x: 700, y: 350, width: 80, height: 20, type: "normal" },
            { x: 900, y: 300, width: 80, height: 20, type: "normal" },
            { x: 1100, y: 350, width: 80, height: 20, type: "normal" },
            
            // High platforms for躲避
            { x: 200, y: 150, width: 60, height: 20, type: "normal" },
            { x: 400, y: 100, width: 60, height: 20, type: "normal" },
            { x: 600, y: 150, width: 60, height: 20, type: "normal" },
            { x: 800, y: 100, width: 60, height: 20, type: "normal" },
            { x: 1000, y: 150, width: 60, height: 20, type: "normal" }
        ],
        
        collectibles: [
            // Health pickups for survival
            { x: 150, y: 250, type: "health", value: 1 },
            { x: 450, y: 250, type: "health", value: 1 },
            { x: 750, y: 250, type: "health", value: 1 },
            { x: 1050, y: 250, type: "health", value: 1 },
            
            // Quantum energy for abilities
            { x: 300, y: 100, type: "quantum", value: 50 },
            { x: 700, y: 50, type: "quantum", value: 50 },
            { x: 1100, y: 100, type: "quantum", value: 50 },
            
            // Bananas (for score)
            { x: 250, y: 450, type: "banana", value: 10 },
            { x: 550, y: 450, type: "banana", value: 10 },
            { x: 850, y: 450, type: "banana", value: 10 },
            { x: 1150, y: 450, type: "banana", value: 10 }
        ],
        
        enemies: [
            { x: 600, y: 150, type: "boss", health: 300 }
        ],
        
        hazards: [
            { x: 350, y: 480, width: 50, height: 20, type: "spikes" },
            { x: 650, y: 480, width: 50, height: 20, type: "spikes" },
            { x: 950, y: 480, width: 50, height: 20, type: "spikes" }
        ]
    },
    
    // LEVEL 4: FUTURE JUNGLE (2048 Era)
    {
        name: "Neon Nexus",
        era: 2048,
        width: 2400,
        height: 700,
        playerStart: { x: 100, y: 550 },
        backgroundColor: "#001100",
        completionRequirement: { type: "bananas", amount: 30 },
        
        platforms: [
            // Holographic ground
            { x: 0, y: 600, width: 2400, height: 100, type: "holographic", alpha: 0.7 },
            
            // Main hologram platforms
            { x: 150, y: 500, width: 120, height: 15, type: "holographic", alpha: 0.8 },
            { x: 350, y: 450, width: 100, height: 15, type: "holographic", alpha: 0.8 },
            { x: 550, y: 400, width: 120, height: 15, type: "holographic", alpha: 0.8 },
            { x: 750, y: 450, width: 100, height: 15, type: "holographic", alpha: 0.8 },
            { x: 950, y: 500, width: 120, height: 15, type: "holographic", alpha: 0.8 },
            { x: 1150, y: 450, width: 100, height: 15, type: "holographic", alpha: 0.8 },
            { x: 1350, y: 400, width: 120, height: 15, type: "holographic", alpha: 0.8 },
            { x: 1550, y: 450, width: 100, height: 15, type: "holographic", alpha: 0.8 },
            { x: 1750, y: 500, width: 120, height: 15, type: "holographic", alpha: 0.8 },
            { x: 1950, y: 400, width: 120, height: 15, type: "holographic", alpha: 0.8 },
            { x: 2150, y: 350, width: 150, height: 15, type: "holographic", alpha: 0.8 },
            
            // High-speed moving platforms
            { x: 200, y: 300, width: 120, height: 15, type: "moving", moveX: 200, moveY: 0, speed: 2 },
            { x: 600, y: 250, width: 120, height: 15, type: "moving", moveX: 0, moveY: 100, speed: 1.5 },
            { x: 1000, y: 200, width: 120, height: 15, type: "moving", moveX: 150, moveY: 50, speed: 1.8 },
            { x: 1400, y: 250, width: 120, height: 15, type: "moving", moveX: 100, moveY: 100, speed: 1.2 },
            { x: 1800, y: 300, width: 120, height: 15, type: "moving", moveX: 200, moveY: 0, speed: 2.2 },
            
            // Dangerous spike platforms
            { x: 400, y: 350, width: 60, height: 20, type: "spikes" },
            { x: 800, y: 350, width: 60, height: 20, type: "spikes" },
            { x: 1200, y: 350, width: 60, height: 20, type: "spikes" },
            { x: 1600, y: 350, width: 60, height: 20, type: "spikes" },
            { x: 2000, y: 350, width: 60, height: 20, type: "spikes" }
        ],
        
        collectibles: [
            // Bananas (need 30 to complete)
            { x: 200, y: 450, type: "banana", value: 10 },
            { x: 400, y: 400, type: "banana", value: 10 },
            { x: 600, y: 350, type: "banana", value: 10 },
            { x: 800, y: 400, type: "banana", value: 10 },
            { x: 1000, y: 450, type: "banana", value: 10 },
            { x: 1200, y: 400, type: "banana", value: 10 },
            { x: 1400, y: 350, type: "banana", value: 10 },
            { x: 1600, y: 400, type: "banana", value: 10 },
            { x: 1800, y: 450, type: "banana", value: 10 },
            { x: 2000, y: 400, type: "banana", value: 10 },
            { x: 2200, y: 350, type: "banana", value: 10 },
            { x: 250, y: 250, type: "banana", value: 10 },
            { x: 450, y: 200, type: "banana", value: 10 },
            { x: 650, y: 250, type: "banana", value: 10 },
            { x: 850, y: 200, type: "banana", value: 10 },
            { x: 1050, y: 250, type: "banana", value: 10 },
            { x: 1250, y: 200, type: "banana", value: 10 },
            { x: 1450, y: 250, type: "banana", value: 10 },
            { x: 1650, y: 200, type: "banana", value: 10 },
            { x: 1850, y: 250, type: "banana", value: 10 },
            { x: 2050, y: 200, type: "banana", value: 10 },
            { x: 2250, y: 250, type: "banana", value: 10 },
            { x: 300, y: 100, type: "banana", value: 10 },
            { x: 500, y: 150, type: "banana", value: 10 },
            { x: 700, y: 100, type: "banana", value: 10 },
            { x: 900, y: 150, type: "banana", value: 10 },
            { x: 1100, y: 100, type: "banana", value: 10 },
            { x: 1300, y: 150, type: "banana", value: 10 },
            { x: 1500, y: 100, type: "banana", value: 10 },
            { x: 1700, y: 150, type: "banana", value: 10 },
            { x: 1900, y: 100, type: "banana", value: 10 },
            { x: 2100, y: 150, type: "banana", value: 10 },
            { x: 2300, y: 100, type: "banana", value: 10 },
            
            // Health pickups
            { x: 350, y: 100, type: "health", value: 1 },
            { x: 750, y: 150, type: "health", value: 1 },
            { x: 1150, y: 100, type: "health", value: 1 },
            { x: 1550, y: 150, type: "health", value: 1 },
            { x: 1950, y: 100, type: "health", value: 1 },
            { x: 2350, y: 150, type: "health", value: 1 },
            
            // Quantum energy
            { x: 500, y: 50, type: "quantum", value: 50 },
            { x: 1000, y: 50, type: "quantum", value: 50 },
            { x: 1500, y: 50, type: "quantum", value: 50 },
            { x: 2000, y: 50, type: "quantum", value: 50 }
        ],
        
        enemies: [
            { x: 300, y: 500, type: "drone", behavior: "patrol", patrolRange: 200 },
            { x: 700, y: 450, type: "drone", behavior: "patrol", patrolRange: 200 },
            { x: 1100, y: 500, type: "drone", behavior: "patrol", patrolRange: 200 },
            { x: 1500, y: 450, type: "drone", behavior: "patrol", patrolRange: 200 },
            { x: 1900, y: 500, type: "drone", behavior: "patrol", patrolRange: 200 },
            { x: 2300, y: 450, type: "drone", behavior: "patrol", patrolRange: 200 },
            { x: 500, y: 300, type: "drone", behavior: "follow" },
            { x: 900, y: 250, type: "drone", behavior: "follow" },
            { x: 1300, y: 300, type: "drone", behavior: "follow" },
            { x: 1700, y: 250, type: "drone", behavior: "follow" },
            { x: 2100, y: 300, type: "drone", behavior: "follow" }
        ],
        
        hazards: [
            { x: 100, y: 580, width: 50, height: 20, type: "laser" },
            { x: 500, y: 580, width: 50, height: 20, type: "laser" },
            { x: 900, y: 580, width: 50, height: 20, type: "laser" },
            { x: 1300, y: 580, width: 50, height: 20, type: "laser" },
            { x: 1700, y: 580, width: 50, height: 20, type: "laser" },
            { x: 2100, y: 580, width: 50, height: 20, type: "laser" }
        ]
    }
];

// Level metadata for UI display
const LEVEL_METADATA = [
    {
        number: 1,
        name: "Vine Canyon",
        description: "Classic jungle platforming. Collect 5 keys to unlock the ancient temple.",
        difficulty: "Easy",
        era: 1994,
        previewColor: "#006400",
        unlocked: true
    },
    {
        number: 2,
        name: "Quantum Temple",
        description: "Navigate floating quantum platforms. Collect all quantum fragments.",
        difficulty: "Medium",
        era: 2026,
        previewColor: "#001122",
        unlocked: false
    },
    {
        number: 3,
        name: "Temple of the Banana King",
        description: "Face the mighty Banana King in an epic boss battle!",
        difficulty: "Hard",
        era: 1994,
        previewColor: "#8B0000",
        unlocked: false
    },
    {
        number: 4,
        name: "Neon Nexus",
        description: "Future jungle with holographic platforms. Collect 30 bananas.",
        difficulty: "Very Hard",
        era: 2048,
        previewColor: "#001100",
        unlocked: false
    }
];

// Timeline information
const TIMELINE_DATA = {
    1994: {
        name: "Classic Era",
        description: "Pixel art graphics, traditional platforming",
        color: "#006400",
        gravity: 0.5,
        playerSpeed: 5
    },
    2026: {
        name: "Quantum Era",
        description: "Neon visuals, quantum mechanics",
        color: "#001122",
        gravity: 0.4,
        playerSpeed: 6
    },
    2048: {
        name: "Future Era",
        description: "Holographic interfaces, advanced technology",
        color: "#001100",
        gravity: 0.3,
        playerSpeed: 7
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LEVEL_DATA, LEVEL_METADATA, TIMELINE_DATA };
}