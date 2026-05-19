const Game = {
    state: null,
    backgrounds: {},
    inCombat: false,
    combatState: null,

    async init() {
        Effects.init();
        this.backgrounds = await API.getBackgrounds();
        this._setupStartScreen();
        this._setupDeathScreen();
        this._setupAudio();
        document.addEventListener("click", () => AudioManager.init(), { once: true });
        this._setupSidebar();
    },

    _setupAudio() {
        const slider = document.getElementById("volume-slider");
        const muteBtn = document.getElementById("mute-btn");
        slider.addEventListener("input", () => AudioManager.setVolume(slider.value / 100));
        muteBtn.addEventListener("click", () => {
            const muted = AudioManager.toggleMute();
            muteBtn.textContent = muted ? "♪" : "♫";
        });
    },

    _setupSidebar() {
        const toggle = document.getElementById("sidebar-toggle");
        const sidebar = document.getElementById("sidebar");
        const backdrop = document.getElementById("sidebar-backdrop");
        if (!toggle || !sidebar || !backdrop) return;
        const close = () => { sidebar.classList.remove("open"); backdrop.classList.remove("open"); };
        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("open");
            backdrop.classList.toggle("open");
        });
        backdrop.addEventListener("click", close);
        document.getElementById("main-area").addEventListener("click", (e) => {
            if (e.target.closest("#sidebar-toggle")) return;
            close();
        });
    },

    _setupStartScreen() {
        const bgOptions = document.querySelectorAll(".bg-option");
        bgOptions.forEach(el => {
            el.addEventListener("click", () => {
                bgOptions.forEach(o => o.classList.remove("selected"));
                el.classList.add("selected");
            });
        });

        document.getElementById("start-btn").addEventListener("click", () => {
            const name = document.getElementById("name-input").value.trim() || "Wanderer";
            const selected = document.querySelector(".bg-option.selected");
            const bg = selected ? selected.dataset.bg : "village_orphan";
            this._startNewGame(name, bg);
        });

        document.getElementById("name-input").addEventListener("keydown", (e) => {
            if (e.key === "Enter") document.getElementById("start-btn").click();
        });
    },

    _setupDeathScreen() {
        document.getElementById("death-restart-btn").addEventListener("click", () => {
            document.getElementById("death-overlay").classList.remove("active");
            document.getElementById("game-container").classList.remove("active");
            document.getElementById("start-screen").classList.remove("hidden");
            this.state = null;
            this.inCombat = false;
            this.combatState = null;
        });
    },

    async _startNewGame(name, bg) {
        const data = await API.newGame(name, bg);
        this.state = data.player_stats;

        document.getElementById("start-screen").classList.add("hidden");
        document.getElementById("game-container").classList.add("active");

        AudioManager.init();
        this._updateUI(data.player_stats);
        this._showScene(data.scene);
    },

    _updateUI(stats) {
        if (!stats) return;
        document.getElementById("char-name").textContent = stats.name;
        document.getElementById("char-title").textContent = stats.background;
        document.getElementById("char-cultivation").textContent = stats.cultivation;
        document.getElementById("location-name").textContent = this._getLocName(stats.location);

        const maxHp = stats.max_health || 100;
        const hpPct = Math.max(0, (stats.health / maxHp) * 100);
        document.getElementById("health-bar").style.width = hpPct + "%";
        document.getElementById("health-text").textContent = `${stats.health}/${maxHp}`;

        const qiMax = this._getQiMax(stats);
        const qiPct = qiMax > 0 ? Math.min(100, (stats.qi / qiMax) * 100) : 0;
        document.getElementById("qi-bar").style.width = qiPct + "%";
        document.getElementById("qi-text").textContent = stats.qi;

        document.getElementById("stat-talent").textContent = stats.talent;
        document.getElementById("stat-bg").textContent = stats.background;
        document.getElementById("stat-gold").textContent = stats.gold;
        document.getElementById("stat-rep").textContent = stats.reputation;

        const techList = document.getElementById("techniques-list");
        techList.innerHTML = stats.techniques.map(t => `<div>${t}</div>`).join("");

        const questList = document.getElementById("quests-list");
        if (stats.quests && stats.quests.active && Object.keys(stats.quests.active).length > 0) {
            const names = { beast_hunt: "Slay the Iron-Fanged Boar", source_of_corruption: "Find the Source of Corruption" };
            questList.innerHTML = Object.keys(stats.quests.active).map(q => `<div>${names[q] || q}</div>`).join("");
        } else {
            questList.innerHTML = "<div style='color:#666;font-style:italic;border-left:2px solid #333;'>None active</div>";
        }

        this._renderEquipment(stats);
        this._renderInventory(stats);
    },

    async _initItemDefs() {
        if (this._itemDefs) return;
        this._itemDefs = await fetch("/api/items/definitions").then(r => r.json());
    },

    _getItemName(itemId) {
        if (this._itemDefs && this._itemDefs[itemId]) return this._itemDefs[itemId].name;
        return itemId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    },

    _renderEquipment(stats) {
        if (!stats.equipment) return;
        const eq = stats.equipment;
        document.querySelectorAll(".eq-slot").forEach(el => {
            const slot = el.dataset.slot;
            const item = eq[slot];
            let nameSpan = el.querySelector(".eq-name");
            let refineBtn = el.querySelector(".refine-btn");
            if (item) {
                const rl = item.refineLevel || 0;
                if (!nameSpan) { nameSpan = document.createElement("span"); nameSpan.className = "eq-name"; el.appendChild(nameSpan); }
                nameSpan.textContent = this._getItemName(item.id) + (rl > 0 ? ` +${rl}` : "");
                if (!refineBtn) {
                    refineBtn = document.createElement("button");
                    refineBtn.className = "refine-btn";
                    refineBtn.textContent = "↑";
                    refineBtn.title = "Refine";
                    el.prepend(refineBtn);
                }
                refineBtn.onclick = (e) => { e.stopPropagation(); this._handleRefine(item.id); };
                refineBtn.style.display = "";
                el.style.cursor = "pointer";
                el.onclick = () => this._handleUnequip(slot);
            } else {
                if (nameSpan) nameSpan.textContent = "-";
                if (refineBtn) refineBtn.style.display = "none";
                el.style.cursor = "default";
                el.onclick = null;
            }
        });
        const eqStatsDiv = document.getElementById("equipment-stats");
        if (stats.equipment_stats) {
            const s = stats.equipment_stats;
            const parts = [];
            if (s.atk) parts.push(`ATK+${s.atk}`);
            if (s.def) parts.push(`DEF+${s.def}`);
            if (s.hp) parts.push(`HP+${s.hp}`);
            if (s.qi) parts.push(`QI+${s.qi}`);
            eqStatsDiv.textContent = parts.length ? parts.join(" | ") : "";
        }
    },

    async _handleRefine(itemId) {
        if (!confirm(`Attempt to refine ${this._getItemName(itemId)}? It may break!`)) return;
        const data = await fetch("/api/refine", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemId }),
        }).then(r => r.json());
        this._showNotification(data.message || "Refinement attempted.");
        AudioManager.playPing();
        if (data.destroyed) AudioManager.playDeath();
        if (data.success) AudioManager.playBreakthrough();
        if (data.player_stats) {
            this.state = data.player_stats;
            this._updateUI(data.player_stats);
        }
    },

    _renderInventory(stats) {
        const inv = stats.inventory || [];
        const items = stats.items || [];
        const list = document.getElementById("inventory-list");
        const allItems = [...inv.map(i => {
            const id = typeof i === "string" ? i : i.id;
            const rl = typeof i === "object" ? (i.refineLevel || 0) : 0;
            return { id, refineLevel: rl, isEquip: true };
        }), ...items.map(id => ({ id, refineLevel: 0, isEquip: false }))];

        if (allItems.length === 0) {
            list.innerHTML = "<div style='color:#666;font-style:italic;border-left-color:#333;'>Empty</div>";
            return;
        }

        list.innerHTML = allItems.map((item, idx) => {
            const name = this._getItemName(item.id);
            const suffix = item.refineLevel > 0 ? ` +${item.refineLevel}` : "";
            const typeLabel = item.isEquip ? "[E]" : "";
            return `<div data-idx="${idx}" data-id="${item.id}" data-equip="${item.isEquip}">
                <span>${typeLabel} ${name}${suffix}</span>
                <span style="color:var(--text-dim);font-size:11px;">
                    ${item.isEquip ? "click to equip" : "click to use"}
                </span>
            </div>`;
        }).join("");

        list.querySelectorAll("div").forEach(el => {
            el.addEventListener("click", () => {
                const id = el.dataset.id;
                const isEquip = el.dataset.equip === "true";
                if (isEquip) this._handleEquip(id);
                else this._handleUseItem(id);
            });
        });
    },

    async _handleEquip(itemId) {
        const data = await fetch("/api/equip", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemId }),
        }).then(r => r.json());
        if (data.message) this._showNotification(data.message);
        if (data.player_stats) {
            this.state = data.player_stats;
            this._updateUI(data.player_stats);
        }
    },

    async _handleUnequip(slot) {
        const data = await fetch("/api/unequip", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slot }),
        }).then(r => r.json());
        if (data.message) this._showNotification(data.message);
        if (data.player_stats) {
            this.state = data.player_stats;
            this._updateUI(data.player_stats);
        }
    },

    async _handleUseItem(itemId) {
        if (confirm(`Use ${this._getItemName(itemId)}?`)) {
            const data = await fetch("/api/use-item", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: itemId }),
            }).then(r => r.json());
            if (data.message) this._showNotification(data.message);
            if (data.player_stats) {
                this.state = data.player_stats;
                this._updateUI(data.player_stats);
            }
        }
    },

    _getLocName(locId) {
        const names = {
            cloud_wind_village: "Cloud Wind Village",
            azure_mountains: "Azure Mountains",
            misty_falls: "Misty Falls",
            hidden_cave: "Hidden Cave",
            eastern_road: "Eastern Road",
            zhao_city: "Zhao City",
            azure_peaks_sect: "Azure Peaks Sect",
        };
        return names[locId] || locId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    },

    _getQiMax(stats) {
        const ranks = {
            "Qi Condensation": 1000, "Foundation Establishment": 5000,
            "Core Formation": 20000, "Nascent Soul": 100000,
            "Soul Formation": 500000, "Soul Transformation": 2000000,
            "Ascendant": 10000000, "Nirvana Shattering": 50000000,
        };
        for (const [rank, max] of Object.entries(ranks)) {
            if (stats.cultivation && stats.cultivation.startsWith(rank)) return max;
        }
        return 1000;
    },

    _showScene(scene) {
        if (!scene) return;

        this._setCombatMode(false);
        Effects.fadeInScene();

        if (this.state && this.state.location) {
            AudioManager.playLocationBGM(this.state.location);
        }
        const storyText = document.getElementById("story-text");

        if (scene.effects && scene.effects.type === "fade_in") {
            storyText.style.opacity = "0";
            setTimeout(() => {
                Effects.typewriter("#story-text", scene.text, 25);
                storyText.style.opacity = "1";
            }, 500);
        } else {
            Effects.typewriter("#story-text", scene.text, 25);
        }

        const choicesArea = document.getElementById("choices-area");
        choicesArea.innerHTML = "";

        if (scene.choices) {
            scene.choices.forEach(choice => {
                const btn = document.createElement("button");
                btn.className = "choice-btn";

                if (choice.action && choice.action.startsWith("combat:")) {
                    btn.textContent = "⚔ " + choice.text;
                } else {
                    btn.textContent = choice.text;
                }

                btn.addEventListener("click", () => {
                    this._handleChoice(choice.action);
                });
                choicesArea.appendChild(btn);
            });
        }

        const actions = document.querySelectorAll(".action-btn");
        actions.forEach(btn => {
            btn.onclick = () => this._handleChoice(btn.dataset.action);
        });
    },

    _setCombatMode(active) {
        this.inCombat = active;
        const storyArea = document.getElementById("story-area");
        const combatArea = document.getElementById("combat-area");
        const choicesArea = document.getElementById("choices-area");
        const actionBar = document.getElementById("action-bar");

        if (active) {
            storyArea.style.display = "none";
            choicesArea.style.display = "none";
            actionBar.style.display = "none";
            combatArea.classList.add("active");
        } else {
            storyArea.style.display = "block";
            choicesArea.style.display = "flex";
            actionBar.style.display = "flex";
            combatArea.classList.remove("active");
        }
    },

    async _handleChoice(action) {
        if (!action) return;

        Effects.stopTypewriter();

        if (action === "meditate" || action === "breakthrough") {
            document.getElementById("story-text").innerHTML = "";
        }

        if (action === "meditate") {
            AudioManager.playMeditate();
            const btn = document.querySelector('.action-btn[data-action="meditate"]');
            if (btn && btn.disabled) return;
            if (btn) { btn.disabled = true; btn.style.opacity = "0.4"; btn.style.cursor = "not-allowed"; }
            setTimeout(() => {
                if (btn) { btn.disabled = false; btn.style.opacity = ""; btn.style.cursor = ""; }
            }, 700);
        }

        if (action.startsWith("combat:")) {
            const enemyId = action.slice(7);
            await this._startCombat(enemyId);
            return;
        }

        if (action === "transcend") {
            if (!confirm("End your journey and see your ending?")) return;
            const data = await fetch("/api/transcend", { method: "POST" }).then(r => r.json());
            this._onEnding(data);
            return;
        }

        const data = await API.doAction(action);

        if (data.error) {
            this._showNotification(data.error);
            return;
        }

        if (data.game_over) {
            this._onDeath(data.player_stats);
            return;
        }

        if (data.player_stats) {
            this.state = data.player_stats;

            if (data.effects && data.effects.breakthrough) {
                AudioManager.playBreakthrough(data.player_stats.rankIndex);
                Effects.breakthroughFlash();
                Effects.shake(400);
                Effects.burstParticles(undefined, undefined, 40, "gold");
                this._showFloatingText(data.effects.message, "breakthrough-text");
            }

            if (data.effects && data.effects.message && !data.effects.breakthrough && !data.effects.qi) {
                this._showNotification(data.effects.message);
            }

            if (data.effects && data.effects.qi) {
                Effects.burstParticles(undefined, undefined, 15, "gold");
                this._showFloatingText(`+${data.effects.qi} Qi`, "qi-gain");
            }

            this._updateUI(data.player_stats);

            if (data.travel_msg) {
                this._showNotification(data.travel_msg);
                Effects.fadeInScene();
            }
        }

        if (data.encounter) {
            await this._startCombat(data.encounter);
            return;
        }

        if (data.scene) {
            this._showScene(data.scene);
        }
    },

    async _startCombat(enemyId) {
        const data = await fetch("/api/combat/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enemy_id: enemyId }),
        }).then(r => r.json());

        if (data.error) {
            this._showNotification(data.error);
            return;
        }

        this.combatState = data.combat;
        this._setCombatMode(true);
        AudioManager.playCombatBGM();
        this._renderCombat();
    },

    _renderCombat() {
        const cs = this.combatState;
        if (!cs) return;

        const enemy = cs.enemy;
        document.getElementById("enemy-name").textContent = enemy.name;
        document.getElementById("enemy-tier").textContent = `Tier: ${enemy.tier}`;
        const hpPct = (enemy.hp / enemy.maxHP) * 100;
        document.getElementById("enemy-hp-bar").style.width = `${Math.max(0, hpPct)}%`;
        document.getElementById("enemy-hp-text").textContent = `${enemy.hp}/${enemy.maxHP}`;
        document.getElementById("enemy-atk").textContent = enemy.atk;
        document.getElementById("enemy-def").textContent = enemy.def;

        const logEl = document.getElementById("combat-log");
        logEl.innerHTML = "";
        if (cs.turnLog && cs.turnLog.length > 0) {
            cs.turnLog.forEach(line => {
                const div = document.createElement("div");
                if (line.includes("BREAKTHROUGH")) div.className = "log-breakthrough";
                else if (line.includes("Victory")) div.className = "log-victory";
                else if (line.includes("slain")) div.className = "log-enemy";
                else div.className = "log-player";
                div.textContent = line;
                logEl.appendChild(div);
            });
        }
        logEl.scrollTop = logEl.scrollHeight;

        const actionsEl = document.getElementById("combat-actions");
        actionsEl.innerHTML = "";

        if (!cs.isActive) {
            if (cs.victory) {
                const btn = document.createElement("button");
                btn.className = "combat-btn special";
                btn.textContent = "Continue";
                btn.onclick = () => this._handleChoice("check_state");
                actionsEl.appendChild(btn);
            }
            return;
        }

        if (cs.availableActions) {
            cs.availableActions.forEach(act => {
                const btn = document.createElement("button");
                btn.className = "combat-btn";
                if (act.special) btn.classList.add("special");
                if (!act.unlocked) btn.classList.add("cooldown");

                let label = act.name;
                if (act.tier) {
                    const tierIcons = { basic: "", common: "", uncommon: "◆", rare: "◆◆", legendary: "◆◆◆", mythical: "★" };
                    label = `${tierIcons[act.tier] || ""} ${act.name}`.trim();
                }
                if (act.cooldown > 0) label += ` [${act.cooldown}]`;

                btn.textContent = label;
                btn.disabled = !act.unlocked;

                btn.addEventListener("click", () => this._handleCombatAction(act.id));
                actionsEl.appendChild(btn);
            });
        }
    },

    async _handleCombatAction(action) {
        const data = await fetch("/api/combat/act", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        }).then(r => r.json());

        if (data.game_over) {
            this.combatState = null;
            this._setCombatMode(false);
            this._onDeath(data.player_stats);
            return;
        }

        if (data.combat_result === "victory") {
            this.combatState = null;
            this.state = data.player_stats;
            this._updateUI(data.player_stats);
            this._showNotification("Victory!");
            AudioManager.playVictory();
            Effects.burstParticles(undefined, undefined, 30, "gold");
            this._showScene(data.scene);
            return;
        }

        if (data.combat) {
            this.combatState = data.combat;
            if (data.combat.player_stats) {
                this.state = data.combat.player_stats;
                this._updateUI(data.combat.player_stats);

                const oldHp = data.combat.player_stats.health;
                if (oldHp < 30) { Effects.hitFlash(); AudioManager.playEnemyHit(); }

                if (data.combat.canBreakthrough) {
                    this._showNotification("You feel a breakthrough opportunity in the heat of battle!");
                }
            }

            if (data.combat.turnLog && data.combat.turnLog.length > 0) {
                const last = data.combat.turnLog[data.combat.turnLog.length - 1];
                if (last.includes("BREAKTHROUGH")) AudioManager.playBreakthrough();
                else if (last.includes("flee") || last.includes("Fled")) AudioManager.playFlee();
                else if (last.includes("Critical")) AudioManager.playCrit();
                else if (last.includes("Victory")) {}
                else if (last.includes("damage") || last.includes("strike") || last.includes("hit")) {
                    if (last.startsWith("The") || last.startsWith("Your")) AudioManager.playEnemyHit();
                    else AudioManager.playHit();
                }
            }

            this._renderCombat();
        }
    },

    _onDeath(stats) {
        this.state = stats;
        this._updateUI(stats);

        const deathStats = document.getElementById("death-stats");
        deathStats.innerHTML = `
            Name: ${stats.name}<br>
            Cultivation: ${stats.cultivation}<br>
            Gold: ${stats.gold}<br>
            Techniques: ${stats.techniques.length} learned<br>
            Location: ${this._getLocName(stats.location)}
        `;

        AudioManager.playDeath();
        AudioManager.stopBGM(0.3);
        Effects.shake(500);
        Effects.burstParticles(undefined, undefined, 40, "red");
        setTimeout(() => {
            Effects.deathFade();
        }, 800);
    },

    _onEnding(data) {
        this.state = data.player_stats;
        const overlay = document.getElementById("ending-overlay");
        document.getElementById("ending-title").textContent = data.ending.title;
        document.getElementById("ending-text").textContent = data.ending.text;
        document.getElementById("ending-stats").innerHTML = `
            Cultivation: ${data.player_stats.cultivation} | 
            Gold: ${data.player_stats.gold} | 
            Techniques: ${data.player_stats.techniques.length} |
            Kills: ${data.player_stats.combat_kills || 0}
        `;
        const fl = data.faction;
        const factionColor = fl.color || "#888";
        document.getElementById("ending-faction").innerHTML =
            `Path: <span style="color:${factionColor}">${fl.label}</span> (${fl.value})`;
        AudioManager.stopBGM(1);
        setTimeout(() => { AudioManager.playVictory(); }, 1200);
        overlay.classList.add("active");
        document.getElementById("ending-restart-btn").onclick = () => {
            overlay.classList.remove("active");
            document.getElementById("game-container").classList.remove("active");
            document.getElementById("start-screen").classList.remove("hidden");
            this.state = null; this.inCombat = false; this.combatState = null;
        };
    },

    _showFloatingText(text, className = "qi-gain") {
        const el = document.createElement("div");
        el.className = `floating-text ${className}`;
        el.textContent = text;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2500);
    },

    _showNotification(msg) {
        if (!msg) return;
        const existing = document.querySelector(".notification");
        if (existing) existing.remove();

        const div = document.createElement("div");
        div.className = "notification";
        div.textContent = msg;
        Object.assign(div.style, {
            position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.9)", color: "var(--gold)", padding: "12px 24px",
            border: "1px solid var(--gold)", zIndex: "1000",
            fontFamily: "inherit", fontSize: "16px", opacity: "0",
            transition: "opacity 0.3s", pointerEvents: "none",
        });
        document.body.appendChild(div);
        requestAnimationFrame(() => div.style.opacity = "1");
        setTimeout(() => {
            div.style.opacity = "0";
            setTimeout(() => div.remove(), 300);
        }, 3000);
    },
};

document.addEventListener("DOMContentLoaded", () => Game.init());
