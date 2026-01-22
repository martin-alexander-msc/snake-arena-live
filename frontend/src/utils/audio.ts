/**
 * Web Audio API based sound synthesizer for the Snake Game.
 * Synthesizes sounds on-the-fly to avoid external asset requirements.
 */

class AudioService {
    private ctx: AudioContext | null = null;

    private initContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        // Resume context if it's suspended (browsers block audio until user interaction)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playEatSound() {
        this.initContext();
        if (!this.ctx) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.start();
        oscillator.stop(this.ctx.currentTime + 0.1);
    }

    playGameOverSound() {
        this.initContext();
        if (!this.ctx) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5);

        gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.start();
        oscillator.stop(this.ctx.currentTime + 0.5);
    }
}

export const audioService = new AudioService();
