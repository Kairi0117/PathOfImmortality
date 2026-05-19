const AUDIO_URLS = {
    village: "https://cdn.pixabay.com/download/audio/2025/03/02/audio_e9e0c56fc1.mp3?filename=chinese-guzheng-1-308264.mp3",
    wilderness: "https://cdn.pixabay.com/download/audio/2025/01/08/audio_0e3615aa45.mp3?filename=chinese-relaxing-meditation-285376.mp3",
    scenic: "https://cdn.pixabay.com/download/audio/2025/06/02/audio_bf62d2ab24.mp3?filename=moonlit-whispers-353045.mp3",
    road: "https://cdn.pixabay.com/download/audio/2022/12/16/audio_32d44513d8.mp3?filename=oriental-travel-129544.mp3",
    city: "https://cdn.pixabay.com/download/audio/2025/06/07/audio_61d4f3c103.mp3?filename=mo-li-hua-356371.mp3",
    sect: "https://cdn.pixabay.com/download/audio/2026/01/07/audio_1efe7f43a8.mp3?filename=chinese-traditional-oriental-462186.mp3",
    dungeon: "https://cdn.pixabay.com/download/audio/2025/11/10/audio_cec6b50a76.mp3?filename=asian-percussion-drums-434225.mp3",
    combat: "https://cdn.pixabay.com/download/audio/2026/01/06/audio_27ffa79c24.mp3?filename=chinese-wuxia-462016.mp3",
};

const AudioManager = {
    ctx: null,
    masterGain: null,
    sfxGain: null,
    currentAudio: null,
    currentLocation: null,
    muted: false,
    volume: 0.5,

    // ── Web Audio for SFX ──

    init() {
        try {
            if (this.ctx && this.ctx.state !== "closed") return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);
            this.resume();
        } catch (e) {
            console.warn("Web Audio API not available:", e);
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    },

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.volume;
        if (this.currentAudio) this.currentAudio.volume = this.muted ? 0 : this.volume * 0.8;
    },

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.volume;
        if (this.currentAudio) this.currentAudio.volume = this.muted ? 0 : this.volume * 0.8;
        return this.muted;
    },

    // ── BGM via HTML Audio ──

    stopBGM() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio.src = "";
            this.currentAudio = null;
        }
    },

    playLocationBGM(locationId) {
        if (!this.ctx) return;
        if (locationId === this.currentLocation) return;
        this.currentLocation = locationId;
        this.resume();

        const locTypes = {
            cloud_wind_village: "village", azure_mountains: "wilderness",
            misty_falls: "scenic", hidden_cave: "dungeon",
            eastern_road: "road", zhao_city: "city",
            azure_peaks_sect: "sect",
        };
        const type = locTypes[locationId] || "village";

        this.stopBGM();
        this._loadBGM(type);
    },

    _loadBGM(type) {
        const url = AUDIO_URLS[type] || AUDIO_URLS.village;
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = this.muted ? 0 : this.volume * 0.8;
        audio.play().catch(() => {});
        this.currentAudio = audio;
    },

    playCombatBGM() {
        if (!this.ctx) return;
        this.resume();
        this.stopBGM();
        const audio = new Audio(AUDIO_URLS.combat);
        audio.loop = true;
        audio.volume = this.muted ? 0 : this.volume * 0.8;
        audio.play().catch(() => {});
        this.currentAudio = audio;
    },

    // ── SFX ──

    _sfx(freq, duration, type, vol = 0.3, glide = 0) {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (glide) osc.frequency.linearRampToValueAtTime(glide, now + duration);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + duration);
    },

    _noise(duration, vol = 0.15) {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        src.connect(gain);
        gain.connect(this.sfxGain);
        src.start(now);
    },

    playHit() { this._sfx(200, 0.1, "sawtooth", 0.25, 80); this._noise(0.05, 0.1); },
    playCrit() { this._sfx(400, 0.15, "sawtooth", 0.35, 150); this._sfx(600, 0.08, "sine", 0.2); },
    playEnemyHit() { this._sfx(100, 0.12, "square", 0.2, 60); },
    playBreakthrough(rankIndex = 0) {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const r = Math.min(rankIndex, 7);

        const _chime = (freq, start, dur, vol, glide = 0) => {
            const o = this.ctx.createOscillator();
            o.type = "sine";
            o.frequency.setValueAtTime(freq, now + start);
            if (glide) o.frequency.linearRampToValueAtTime(glide, now + start + dur);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now + start);
            g.gain.linearRampToValueAtTime(vol, now + start + dur * 0.15);
            g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(now + start);
            o.stop(now + start + dur);
        };

        const _drone = (freq, start, dur, vol) => {
            const o = this.ctx.createOscillator();
            o.type = "triangle";
            o.frequency.setValueAtTime(freq, now + start);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now + start);
            g.gain.linearRampToValueAtTime(vol, now + start + dur * 0.2);
            g.gain.linearRampToValueAtTime(vol * 0.6, now + start + dur * 0.6);
            g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(now + start);
            o.stop(now + start + dur);
        };

        const _sweep = (from, to, start, dur, vol) => {
            const o = this.ctx.createOscillator();
            o.type = "sine";
            o.frequency.setValueAtTime(from, now + start);
            o.frequency.exponentialRampToValueAtTime(to, now + start + dur);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, now + start);
            g.gain.linearRampToValueAtTime(vol, now + start + dur * 0.3);
            g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(now + start);
            o.stop(now + start + dur);
        };

        if (r === 0) {
            // Qi Condensation — gentle awakening chime
            _chime(520, 0, 1.5, 0.15, 780);
            _chime(660, 0.2, 1.8, 0.1, 880);
        } else if (r === 1) {
            // Foundation Establishment — resonant hum + chime
            _drone(130, 0, 2.5, 0.12);
            _chime(660, 0.3, 2.0, 0.15, 990);
            _chime(880, 0.6, 1.8, 0.08, 1100);
        } else if (r === 2) {
            // Core Formation — deep power + shimmer
            _drone(80, 0, 3.0, 0.15);
            _drone(120, 0.1, 2.8, 0.08);
            _chime(880, 0.4, 2.5, 0.12, 1320);
            _sweep(200, 600, 0, 2.0, 0.06);
        } else if (r <= 4) {
            // Nascent Soul / Soul Formation — ethereal + forceful
            _drone(65, 0, 3.5, 0.18);
            _drone(110, 0.2, 3.2, 0.1);
            _chime(1047, 0.3, 2.8, 0.12, 1568);
            _chime(1319, 0.6, 2.5, 0.08, 1760);
            _sweep(150, 500, 0, 2.5, 0.08);
            _chime(523, 1.0, 2.0, 0.06, 784);
        } else {
            // Soul Transformation / Ascendant / Nirvana — earth-shattering
            _drone(55, 0, 4.0, 0.22);
            _drone(85, 0.1, 3.8, 0.14);
            _chime(784, 0.2, 3.5, 0.15, 1175);
            _chime(1047, 0.4, 3.2, 0.12, 1568);
            _chime(1319, 0.6, 3.0, 0.1, 1976);
            _sweep(100, 400, 0, 3.0, 0.1);
            _sweep(400, 1000, 0.5, 2.5, 0.07);
        }
    },
    playDeath() {
        this._sfx(500, 0.8, "sawtooth", 0.3, 40);
        this._noise(0.3, 0.15);
    },
    playVictory() {
        this._sfx(400, 0.15, "sine", 0.25, 600);
        setTimeout(() => this._sfx(600, 0.15, "sine", 0.25, 800), 150);
        setTimeout(() => this._sfx(900, 0.3, "sine", 0.3, 1200), 300);
    },
    playFlee() { this._sfx(300, 0.2, "triangle", 0.2, 100); this._sfx(200, 0.15, "triangle", 0.15, 50); },
    playMeditate() {
        if (!this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // deep resonant base — qi gathering
        const osc1 = this.ctx.createOscillator();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(90, now);
        osc1.frequency.exponentialRampToValueAtTime(130, now + 2.5);
        const gain1 = this.ctx.createGain();
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.8);
        gain1.gain.linearRampToValueAtTime(0.08, now + 2.0);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
        osc1.connect(gain1);
        gain1.connect(this.sfxGain);
        osc1.start(now);
        osc1.stop(now + 3.5);

        // ethereal shimmer — qi condensing
        const osc2 = this.ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.exponentialRampToValueAtTime(660, now + 2.0);
        osc2.frequency.exponentialRampToValueAtTime(550, now + 3.0);
        const gain2 = this.ctx.createGain();
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.06, now + 1.0);
        gain2.gain.linearRampToValueAtTime(0.03, now + 2.5);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start(now);
        osc2.stop(now + 4.0);

        // octave drone — grounding energy
        const osc3 = this.ctx.createOscillator();
        osc3.type = "sine";
        osc3.frequency.setValueAtTime(180, now);
        osc3.frequency.linearRampToValueAtTime(220, now + 1.5);
        const gain3 = this.ctx.createGain();
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.05, now + 0.6);
        gain3.gain.linearRampToValueAtTime(0.03, now + 2.0);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
        osc3.connect(gain3);
        gain3.connect(this.sfxGain);
        osc3.start(now);
        osc3.stop(now + 3.0);

        // slow LFO tremolo on the shimmer
        const lfo = this.ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(2.5, now);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gain2.gain);
        lfo.start(now);
        lfo.stop(now + 4.0);
    },
    playPing() { this._sfx(800, 0.08, "sine", 0.15); },
    playError() { this._sfx(200, 0.15, "square", 0.2, 150); },
};
