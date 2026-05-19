const API = {
    base: "",

    async getBackgrounds() {
        const r = await fetch(`${this.base}/api/backgrounds`);
        return r.json();
    },

    async newGame(name, background) {
        const r = await fetch(`${this.base}/api/new-game`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, background }),
        });
        return r.json();
    },

    async getState() {
        const r = await fetch(`${this.base}/api/state`);
        return r.json();
    },

    async doAction(action) {
        const r = await fetch(`${this.base}/api/action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        return r.json();
    },
};
