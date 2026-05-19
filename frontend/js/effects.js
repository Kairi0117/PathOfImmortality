const Effects = {
    _particles: [],
    _ctx: null,
    _canvas: null,
    _animId: null,

    init() {
        this._canvas = document.createElement("canvas");
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
        this._ctx = this._canvas.getContext("2d");
        document.getElementById("particle-canvas").appendChild(this._canvas);

        window.addEventListener("resize", () => {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
        });

        this._spawnParticles();
        this._loop();
    },

    _spawnParticles() {
        for (let i = 0; i < 40; i++) {
            this._particles.push({
                x: Math.random() * this._canvas.width,
                y: Math.random() * this._canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 0.5 - 0.2,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? "gold" : "crimson",
            });
        }
    },

    _loop() {
        const ctx = this._ctx;
        const w = this._canvas.width;
        const h = this._canvas.height;
        ctx.clearRect(0, 0, w, h);

        for (const p of this._particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
            if (p.alpha < 0) p.alpha = 0;
            if (p.life !== undefined) {
                p.life -= 0.005;
                if (p.life <= 0) { p.alpha = 0; continue; }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color === "gold"
                ? `rgba(201, 168, 76, ${p.alpha})`
                : p.color === "red"
                    ? `rgba(204, 51, 51, ${p.alpha})`
                    : `rgba(139, 0, 0, ${p.alpha})`;
            ctx.fill();
        }

        this._particles = this._particles.filter(p => p.life === undefined || p.life > 0);

        this._animId = requestAnimationFrame(() => this._loop());
    },

    stop() {
        if (this._animId) cancelAnimationFrame(this._animId);
        this._particles = [];
    },

    _resolveElement(el) {
        return typeof el === "string" ? document.querySelector(el) : el;
    },

    stopTypewriter() {
        this._currentTypewriter = null;
    },

    typewriter(element, text, speed = 30, callback) {
        const el = this._resolveElement(element);
        if (!el) return;
        el.innerHTML = "";
        const id = Date.now() + Math.random();
        this._currentTypewriter = id;
        let i = 0;

        const type = () => {
            if (this._currentTypewriter !== id) return;
            if (i < text.length) {
                el.innerHTML = text.substring(0, i + 1) + '<span class="cursor">|</span>';
                i++;
                setTimeout(type, speed + Math.random() * 20);
            } else {
                el.innerHTML = text;
                if (callback) callback();
            }
        };
        type();
    },

    shake(duration = 300) {
        const container = document.getElementById("game-container");
        container.classList.add("screen-shake");
        setTimeout(() => container.classList.remove("screen-shake"), duration);
    },

    breakthroughFlash(duration = 1000) {
        const container = document.getElementById("game-container");
        container.classList.add("breakthrough-flash");
        setTimeout(() => container.classList.remove("breakthrough-flash"), duration);
    },

    hitFlash(duration = 300) {
        const container = document.getElementById("game-container");
        container.classList.add("hit-flash");
        setTimeout(() => container.classList.remove("hit-flash"), duration);
    },

    deathFade() {
        const overlay = document.getElementById("death-overlay");
        overlay.classList.add("active");
    },

    fadeInScene() {
        const story = document.getElementById("story-area");
        story.classList.remove("fade-transition");
        void story.offsetWidth;
        story.classList.add("fade-transition");
    },

    burstParticles(x, y, count = 20, color = "gold") {
        const cx = x || this._canvas.width / 2;
        const cy = y || this._canvas.height / 2;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = Math.random() * 3 + 1;
            this._particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                alpha: 1,
                color: color,
                life: 1,
            });
        }
    },
};
