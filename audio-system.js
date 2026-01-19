// JUNGLE QUEST 2026 - AUDIO SYSTEM
// Handles all sound effects and music

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.soundVolume = 0.8;
        this.musicVolume = 0.6;
        this.muted = false;
        
        // Sound buffers
        this.sounds = {};
        this.music = null;
        this.musicPlaying = false;
        
        // Initialize audio context
        this.init();
    }
    
    async init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create sound effects
            await this.createSounds();
            
            console.log('🔊 Audio system initialized');
        } catch (error) {
            console.warn('⚠️ Audio context not available:', error);
            this.audioContext = null;
        }
    }
    
    async createSounds() {
        // Create basic sound effects using Web Audio API oscillators
        
        // Jump sound
        this.sounds.jump = () => this.createBeep(523.25, 0.1, 'sine');
        
        // Collect banana
        this.sounds.collect = () => this.createBeep(659.25, 0.05, 'square');
        
        // Collect key
        this.sounds.key = () => {
            this.createBeep(880, 0.1, 'sawtooth');
            setTimeout(() => this.createBeep(987.77, 0.1, 'sawtooth'), 50);
        };
        
        // Collect quantum
        this.sounds.quantum = () => {
            this.createBeep(1046.50, 0.2, 'sine');
            setTimeout(() => this.createBeep(1318.51, 0.2, 'sine'), 100);
        };
        
        // Collect health
        this.sounds.health = () => {
            this.createBeep(783.99, 0.15, 'triangle');
            this.createBeep(1046.50, 0.15, 'triangle', 50);
        };
        
        // Player hit
        this.sounds.hit = () => {
            this.createBeep(220, 0.3, 'square');
            this.createBeep(165, 0.3, 'square', 50);
        };
        
        // Enemy hit
        this.sounds['enemy-hit'] = () => this.createBeep(330, 0.2, 'square');
        
        // Enemy death
        this.sounds['enemy-death'] = () => {
            this.createBeep(165, 0.5, 'sawtooth');
            this.createBeep(110, 0.5, 'sawtooth', 100);
        };
        
        // Enemy shoot
        this.sounds['enemy-shoot'] = () => this.createBeep(440, 0.1, 'square');
        
        // Boss shoot
        this.sounds['boss-shoot'] = () => {
            this.createBeep(220, 0.2, 'sawtooth');
            this.createBeep(165, 0.2, 'sawtooth', 50);
        };
        
        // Quantum scan
        this.sounds['quantum-scan'] = () => {
            this.createSweep(200, 1000, 0.3, 'sine');
        };
        
        // Time jump
        this.sounds['time-jump'] = () => {
            this.createSweep(1000, 200, 0.4, 'sawtooth');
        };
        
        // Quantum entangle
        this.sounds.entangle = () => {
            this.createBeep(1567.98, 0.5, 'square');
            this.createBeep(1975.53, 0.5, 'square', 100);
        };
        
        // Victory fanfare
        this.sounds.victory = () => {
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    this.createBeep(freq, 0.3, 'sine');
                }, i * 200);
            });
        };
        
        // Level complete
        this.sounds['level-complete'] = () => {
            const notes = [659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    this.createBeep(freq, 0.2, 'triangle');
                }, i * 150);
            });
        };
        
        // Game over
        this.sounds['game-over'] = () => {
            this.createBeep(220, 0.5, 'sawtooth');
            setTimeout(() => this.createBeep(165, 0.5, 'sawtooth'), 300);
            setTimeout(() => this.createBeep(110, 0.5, 'sawtooth'), 600);
        };
        
        // Summon
        this.sounds.summon = () => {
            this.createSweep(50, 400, 0.5, 'triangle');
        };
    }
    
    createBeep(frequency, duration, type, delay = 0) {
        if (!this.audioContext || this.muted) return;
        
        setTimeout(() => {
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(this.masterVolume * this.soundVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Audio error:', error);
            }
        }, delay);
    }
    
    createSweep(startFreq, endFreq, duration, type) {
        if (!this.audioContext || this.muted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(this.masterVolume * this.soundVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playSound(soundName) {
        if (!this.audioContext || this.muted) return;
        
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        } else {
            console.warn(`Sound "${soundName}" not found`);
        }
    }
    
    playBackgroundMusic() {
        if (!this.audioContext || this.muted || this.musicPlaying) return;
        
        this.musicPlaying = true;
        
        // Create oscillators for music
        const melodyOsc = this.audioContext.createOscillator();
        const bassOsc = this.audioContext.createOscillator();
        const melodyGain = this.audioContext.createGain();
        const bassGain = this.audioContext.createGain();
        
        melodyOsc.connect(melodyGain);
        bassOsc.connect(bassGain);
        melodyGain.connect(this.audioContext.destination);
        bassGain.connect(this.audioContext.destination);
        
        melodyOsc.type = 'triangle';
        bassOsc.type = 'sine';
        
        melodyGain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.3, this.audioContext.currentTime);
        bassGain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.2, this.audioContext.currentTime);
        
        // Jungle-themed melody pattern
        const melodyPattern = [
            261.63, 293.66, 329.63, 349.23, // C4, D4, E4, F4
            392.00, 349.23, 329.63, 293.66  // G4, F4, E4, D4
        ];
        
        const bassPattern = [
            130.81, 146.83, 164.81, 174.61, // C3, D3, E3, F3
            196.00, 174.61, 164.81, 146.83  // G3, F3, E3, D3
        ];
        
        let currentNote = 0;
        
        const playNote = () => {
            if (!this.musicPlaying) return;
            
            // Set frequencies
            melodyOsc.frequency.setValueAtTime(melodyPattern[currentNote], this.audioContext.currentTime);
            bassOsc.frequency.setValueAtTime(bassPattern[currentNote], this.audioContext.currentTime);
            
            // Move to next note
            currentNote = (currentNote + 1) % melodyPattern.length;
            
            // Schedule next note
            setTimeout(playNote, 500);
        };
        
        melodyOsc.start();
        bassOsc.start();
        playNote();
        
        this.music = {
            melodyOsc,
            bassOsc,
            melodyGain,
            bassGain
        };
    }
    
    stopBackgroundMusic() {
        if (this.music) {
            this.music.melodyOsc.stop();
            this.music.bassOsc.stop();
            this.music = null;
        }
        this.musicPlaying = false;
    }
    
    pauseBackgroundMusic() {
        if (this.music) {
            this.music.melodyGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.music.bassGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        }
    }
    
    resumeBackgroundMusic() {
        if (this.music) {
            this.music.melodyGain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.3, this.audioContext.currentTime);
            this.music.bassGain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.2, this.audioContext.currentTime);
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            this.music.melodyGain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.3, this.audioContext.currentTime);
            this.music.bassGain.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.2, this.audioContext.currentTime);
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            this.pauseBackgroundMusic();
        } else {
            this.resumeBackgroundMusic();
        }
        
        return this.muted;
    }
    
    getVolume() {
        return {
            master: this.masterVolume,
            sound: this.soundVolume,
            music: this.musicVolume,
            muted: this.muted
        };
    }
    
    // Special sound effects for abilities
    playQuantumScan() {
        this.playSound('quantum-scan');
    }
    
    playTimeJump() {
        this.playSound('time-jump');
    }
    
    playQuantumEntangle() {
        this.playSound('entangle');
    }
    
    playVictory() {
        this.playSound('victory');
    }
    
    playLevelComplete() {
        this.playSound('level-complete');
    }
    
    playGameOver() {
        this.playSound('game-over');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}