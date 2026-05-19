const { TECHNIQUES, ENEMY_TECHNIQUES } = require("./techniques");
const { getScaledEnemy, DANGER_MAP } = require("./enemies");

const RANK_BONUS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

class Combat {
    constructor(player, enemyTemplate, locationType) {
        this.player = player;
        this.enemy = getScaledEnemy(enemyTemplate, player.cultivation.rankIndex, locationType);
        this.turnLog = [];
        this.isActive = true;
        this.victory = false;
        this.playerDefending = false;
        this.playerDodging = false;
        this.enemyStunned = false;
        this.enemyBurns = 0;
        this.playerPoison = 0;
        this.enemyDots = 0;
        this.enemyAtkReduction = 0;
        this.enemyDmgReduction = 0;
        this.playerQiShield = false;
        this.slowTimeActive = false;
        this.combatKills = 0;
        this.rebirthUsed = false;

        this.cooldowns = {};
        for (const [id, tech] of Object.entries(TECHNIQUES)) {
            if (player.techniques.includes(tech.name)) {
                this.cooldowns[id] = 0;
            }
        }

        this.addLog(`A ${this.enemy.name} appears!`);
    }

    addLog(msg) {
        this.turnLog.push(msg);
        if (this.turnLog.length > 20) this.turnLog.shift();
    }

    canBreakthrough() {
        const required = this.player.cultivation.getQiRequirement();
        return this.player.qi >= required;
    }

    getTechniqueIdByName(name) {
        for (const [id, tech] of Object.entries(TECHNIQUES)) {
            if (tech.name === name) return id;
        }
        return null;
    }

    getPlayerActions() {
        const actions = [{ id: "attack", name: "Attack", cooldown: 0, unlocked: true }];
        actions.push({ id: "defend", name: "Defend", cooldown: 0, unlocked: true });

        for (const [id, tech] of Object.entries(TECHNIQUES)) {
            if (this.cooldowns[id] !== undefined) {
                const remaining = this.cooldowns[id];
                const canUse = remaining === 0 && (tech.id !== "rebirth_art" || !this.rebirthUsed);
                actions.push({
                    id: `technique:${id}`,
                    name: tech.name,
                    tier: tech.tier,
                    cooldown: remaining,
                    totalCooldown: tech.cooldown,
                    unlocked: canUse,
                });
            }
        }

        if (this.canBreakthrough()) {
            actions.push({ id: "breakthrough", name: "BREAKTHROUGH!", cooldown: 0, unlocked: true, special: true });
        }

        actions.push({ id: "flee", name: "Flee", cooldown: 0, unlocked: true });
        return actions;
    }

    processPlayerAction(actionId) {
        this.playerDefending = false;

        if (actionId === "attack") {
            return this._executeBasicAttack();
        }
        if (actionId === "defend") {
            this.playerDefending = true;
            this.addLog("You brace yourself, reducing incoming damage.");
            return { damage: 0, log: "You take a defensive stance." };
        }
        if (actionId.startsWith("technique:")) {
            const techId = actionId.slice(10);
            return this._executeTechnique(techId);
        }
        if (actionId === "breakthrough") {
            return this._executeCombatBreakthrough();
        }
        if (actionId === "flee") {
            return this._executeFlee();
        }
        return { damage: 0, log: "Nothing happens." };
    }

    _getRankDamageBonus() {
        return 1 + this.player.cultivation.rankIndex * 0.2;
    }

    _rollCrit() {
        return Math.random() < 0.1 ? 1.5 : 1.0;
    }

    _executeBasicAttack() {
        const rankMult = this._getRankDamageBonus();
        const slaughterBonus = (this.player.techniques.includes("Slaughter Domain") ? this.combatKills * 0.05 : 0);
        let atk = this.player.cultivation.rankIndex * 3 + 10;
        let rawDmg = Math.floor(atk * rankMult * (1 + slaughterBonus) * this._rollCrit());
        let def = this.enemy.def;
        let dmg = Math.max(1, rawDmg - def);
        const isCrit = rawDmg > Math.floor(atk * rankMult * (1 + slaughterBonus));
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        const critText = isCrit ? " (Critical!)" : "";
        this.addLog(`You strike the ${this.enemy.name} for ${dmg} damage!${critText}`);
        return { damage: dmg, log: `Strike for ${dmg}${critText}` };
    }

    _executeTechnique(techId) {
        const tech = TECHNIQUES[techId];
        if (!tech || this.cooldowns[techId] === undefined || this.cooldowns[techId] > 0) {
            this.addLog("That technique is on cooldown!");
            return { damage: 0, log: "On cooldown" };
        }
        if (tech.id === "rebirth_art" && this.rebirthUsed) {
            this.addLog("Rebirth Art can only be used once per battle!");
            return { damage: 0, log: "Already used" };
        }

        this.cooldowns[techId] = tech.cooldown;

        const rankMult = this._getRankDamageBonus();
        const slaughterBonus = (this.player.techniques.includes("Slaughter Domain") ? this.combatKills * 0.05 : 0);

        if (tech.effect === "heal_25") {
            const healAmt = Math.floor(this.player.maxHealth * 0.25);
            this.player.heal(healAmt);
            this.addLog(`You consume a pill and recover ${healAmt} HP!`);
            return { damage: 0, log: `Healed ${healAmt} HP` };
        }
        if (tech.effect === "heal_15") {
            const healAmt = Math.floor(this.player.maxHealth * 0.15);
            this.player.heal(healAmt);
            this.addLog(`Your clan art mends your wounds for ${healAmt} HP!`);
            return { damage: 0, log: `Healed ${healAmt} HP` };
        }
        if (tech.effect === "defend_60") {
            this.playerDefending = true;
            this.addLog("Your body hardens like iron. Damage reduced by 60%.");
            return { damage: 0, log: "Iron Body active" };
        }
        if (tech.effect === "negate_next_hit") {
            this.playerQiShield = true;
            this.addLog("A shimmering Qi Shield surrounds you!");
            return { damage: 0, log: "Qi Shield raised" };
        }
        if (tech.effect === "cleanse_heal_10") {
            this.playerPoison = 0;
            const healAmt = Math.floor(this.player.maxHealth * 0.1);
            this.player.heal(healAmt);
            this.addLog(`Meridians cleansed! Debuffs removed and ${healAmt} HP restored.`);
            return { damage: 0, log: "Cleansed + healed" };
        }
        if (tech.effect === "dodge_next") {
            this.playerDodging = true;
            this.addLog("You move like lightning, ready to dodge the next attack!");
            return { damage: 0, log: "Dodge ready" };
        }
        if (tech.effect === "ignore_defense_20") {
            let rawDmg = Math.floor((10) * rankMult * (1 + slaughterBonus) * this._rollCrit());
            let effectiveDef = Math.floor(this.enemy.def * 0.8);
            let dmg = Math.max(1, rawDmg - effectiveDef);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Fist strike crashes through! ${dmg} damage!`);
            return { damage: dmg, log: `Fist strike ${dmg}` };
        }
        if (tech.effect === "ignore_defense_40") {
            let rawDmg = Math.floor(14 * rankMult * (1 + slaughterBonus) * this._rollCrit());
            let effectiveDef = Math.floor(this.enemy.def * 0.6);
            let dmg = Math.max(1, rawDmg - effectiveDef);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Sneak attack slips past defenses for ${dmg} damage!`);
            return { damage: dmg, log: `Sneak attack ${dmg}` };
        }
        if (tech.effect === "crit_10") {
            let rawDmg = Math.floor(12 * rankMult * (1 + slaughterBonus));
            let isCrit = Math.random() < 0.1;
            rawDmg = isCrit ? Math.floor(rawDmg * 1.5) : rawDmg;
            let dmg = Math.max(1, rawDmg - this.enemy.def);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            const critText = isCrit ? " (Critical hit!)" : "";
            this.addLog(`Wind slash hits for ${dmg}!${critText}`);
            return { damage: dmg, log: `Wind slash ${dmg}${critText}` };
        }
        if (tech.effect === "burn") {
            let rawDmg = Math.floor(16 * rankMult * (1 + slaughterBonus));
            let dmg = Math.max(1, rawDmg - this.enemy.def);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.enemyBurns = 2;
            this.addLog(`Flame strike burns the ${this.enemy.name} for ${dmg}! It will burn for 2 turns!`);
            return { damage: dmg, log: `Flame strike ${dmg} + burn` };
        }
        if (tech.effect === "reduce_atk_20") {
            let rawDmg = Math.floor(12 * rankMult * (1 + slaughterBonus));
            let dmg = Math.max(1, rawDmg - this.enemy.def);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.enemyAtkReduction = 2;
            this.addLog(`Frost wave hits for ${dmg}! Enemy attack reduced!`);
            return { damage: dmg, log: `Frost wave ${dmg} + debuff` };
        }
        if (tech.effect === "stun") {
            let rawDmg = Math.floor(18 * rankMult * (1 + slaughterBonus));
            let dmg = Math.max(1, rawDmg - this.enemy.def);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.enemyStunned = true;
            this.addLog(`Stone fist smashes for ${dmg}! The enemy is stunned!`);
            return { damage: dmg, log: `Stone fist ${dmg} + stun` };
        }
        if (tech.effect === "steal_qi_15") {
            let rawDmg = Math.floor(10 * rankMult * (1 + slaughterBonus));
            let dmg = Math.max(1, rawDmg - this.enemy.def);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            const qiStolen = Math.floor(15 * rankMult);
            this.player.qi += qiStolen;
            this.addLog(`Qi drain steals ${qiStolen} Qi and deals ${dmg} damage!`);
            return { damage: dmg, log: `Qi drain ${dmg} +${qiStolen} qi` };
        }
        if (tech.effect === "pure_damage") {
            let dmg = Math.floor(35 * rankMult * (1 + slaughterBonus));
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Seven stars align! ${dmg} pure damage!`);
            return { damage: dmg, log: `Seven Star Sword ${dmg}` };
        }
        if (tech.effect === "missing_hp_damage") {
            const missing = this.player.maxHealth - this.player.health;
            let dmg = Math.floor(missing * 0.3 * rankMult) + 10;
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Blood blossoms from your wounds! ${dmg} damage!`);
            return { damage: dmg, log: `Blood blossom ${dmg}` };
        }
        if (tech.effect === "steal_hp_20") {
            const stealAmt = Math.floor(this.enemy.maxHP * 0.2);
            let dmg = Math.min(stealAmt, this.enemy.hp);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.player.heal(dmg);
            this.addLog(`Soul transference steals ${dmg} HP and heals you!`);
            return { damage: dmg, log: `Soul transference ${dmg}` };
        }
        if (tech.effect === "consume_half_qi") {
            const qiCost = Math.floor(this.player.qi * 0.5);
            let dmg = Math.floor(25 * rankMult * (1 + slaughterBonus) * (1 + qiCost / 100));
            this.player.qi -= qiCost;
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Qi Burst consumes ${qiCost} Qi for ${dmg} devastating damage!`);
            return { damage: dmg, log: `Qi Burst ${dmg}` };
        }
        if (tech.effect === "dodge_counter") {
            this.playerDodging = true;
            this.addLog("You become a phantom, ready to counter!");
            return { damage: 0, log: "Phantom stance", dodging: true };
        }
        if (tech.effect === "skip_enemy_turn") {
            let dmg = Math.floor(5 * rankMult);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.enemyStunned = true;
            this.addLog(`Earth prison traps the enemy! They lose their next turn!`);
            return { damage: dmg, log: `Earth prison ${dmg}` };
        }
        if (tech.effect === "ignore_defense_100") {
            let dmg = Math.floor(40 * rankMult * (1 + slaughterBonus));
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Heaven-Defying Palm strikes true! ${dmg} unavoidable damage!`);
            return { damage: dmg, log: `Heaven-Defying Palm ${dmg}` };
        }
        if (tech.effect === "dot_3turns") {
            let dmg = Math.floor(20 * rankMult * (1 + slaughterBonus));
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.enemyDots = 3;
            this.addLog(`Sword domain manifests! ${dmg} initial damage! Swords will strike for 3 turns!`);
            return { damage: dmg, log: `Sword domain ${dmg} + bleed` };
        }
        if (tech.effect === "burn_block_heal") {
            let dmg = Math.floor(15 * rankMult * (1 + slaughterBonus));
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.enemyBurns = 3;
            this.addLog(`Flame domain scorches the enemy for ${dmg}! Wounds cannot heal!`);
            return { damage: dmg, log: `Flame domain ${dmg}` };
        }
        if (tech.effect === "missing_hp_150") {
            const missing = this.player.maxHealth - this.player.health;
            let dmg = Math.floor(missing * 1.5) + 10;
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Void severance tears reality! ${dmg} damage from your sacrifice!`);
            return { damage: dmg, log: `Void severance ${dmg}` };
        }
        if (tech.effect === "sacrifice_30") {
            const sacrifice = Math.floor(this.player.maxHealth * 0.3);
            this.player.takeDamage(sacrifice);
            let dmg = Math.floor(60 * rankMult * (1 + slaughterBonus));
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Celestial tribulation consumes ${sacrifice} HP for ${dmg} cataclysmic damage!`);
            return { damage: dmg, log: `Tribulation ${dmg} (sacrificed ${sacrifice} HP)` };
        }

        if (tech.effect === "soul_banner_attack") {
            const souls = this.player.soulBannerCount || 0;
            let dmg = souls * 8 + 10;
            if (souls === 0) dmg = 15;
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            const soulDesc = souls > 0 ? `${souls} vengeful spirits` : "a few wandering souls";
            this.addLog(`The Soul Banner howls! ${soulDesc} tear into the enemy for ${dmg} damage!`);
            return { damage: dmg, log: `Soul Banner ${dmg}` };
        }
        if (tech.effect === "slow_time") {
            this.slowTimeActive = true;
            this.addLog("Time slows! The enemy will skip their turn, and your next attack is empowered!");
            return { damage: 0, log: "Time slowed", slowTime: true };
        }
        if (tech.effect === "ignore_defense_80") {
            let dmg = Math.floor(50 * rankMult * (1 + slaughterBonus));
            const effectiveDef = Math.floor(this.enemy.def * 0.2);
            dmg = Math.max(1, dmg - effectiveDef);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Sundered Night descends! ${dmg} damage through the void!`);
            return { damage: dmg, log: `Sundered Night ${dmg}` };
        }
        if (tech.effect === "hp_drain_20") {
            const drainAmt = Math.floor(this.enemy.hp * 0.2);
            let dmg = Math.max(1, drainAmt);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.player.heal(dmg);
            this.addLog(`Underworld River flows! Drains ${dmg} HP from the enemy into you!`);
            return { damage: dmg, log: `Underworld River ${dmg}` };
        }
        if (tech.effect === "reset_cooldowns") {
            for (const id of Object.keys(this.cooldowns)) {
                if (id !== "flowing_time") this.cooldowns[id] = 0;
            }
            this.player.heal(Math.floor(this.player.maxHealth * 0.1));
            this.addLog("Flowing Time rewinds! All techniques are off cooldown!");
            return { damage: 0, log: "Cooldowns reset", reset: true };
        }
        if (tech.effect === "reduce_enemy_damage_50") {
            this.enemyDmgReduction = 3;
            let dmg = Math.floor(15 * rankMult);
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Karma severs the enemy's power! Their damage is halved for 3 turns!`);
            return { damage: dmg, log: `Karma Severance ${dmg}` };
        }
        if (tech.effect === "stun_plus_buff") {
            this.playerDefending = true;
            this.enemyStunned = true;
            let dmg = Math.floor(25 * rankMult * (1 + slaughterBonus));
            this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
            this.addLog(`Ancient God Transformation! Stunning power surges through you! ${dmg} damage!`);
            return { damage: dmg, log: `Ancient God ${dmg}` };
        }
        if (tech.effect === "passive_damage_per_kill") {
            this.addLog("Slaughter Domain awakens. Each kill empowers you further.");
            return { damage: 0, log: "Slaughter Domain passive active" };
        }
        if (tech.effect === "full_heal_once") {
            this.rebirthUsed = true;
            this.player.health = this.player.maxHealth;
            this.playerPoison = 0;
            this.addLog("Rebirth Art! You are fully restored!");
            return { damage: 0, log: "Full heal", rebirth: true };
        }

        let rawDmg = Math.floor(10 * rankMult * (1 + slaughterBonus));
        let dmg = Math.max(1, rawDmg - this.enemy.def);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.addLog(`You use ${tech.name} for ${dmg} damage!`);
        return { damage: dmg, log: `${tech.name} ${dmg}` };
    }

    _executeCombatBreakthrough() {
        const [success, msg] = this.player.attemptBreakthrough();
        if (success) {
            this.player.health = this.player.maxHealth;
            const bonusDmg = this.player.cultivation.rankIndex * 25 + 20;
            this.enemy.hp = Math.max(0, this.enemy.hp - bonusDmg);
            this.addLog(`*** BREAKTHROUGH! *** ${msg}. A surge of power blasts the enemy for ${bonusDmg} damage!`);
            return { damage: bonusDmg, log: msg, breakthrough: true };
        }
        const qiLost = Math.floor(this.player.qi * 0.1);
        this.player.qi = Math.max(0, this.player.qi - qiLost);
        this.addLog(`Breakthrough failed! Qi destabilized, lost ${qiLost}. The enemy strikes!`);
        return { damage: 0, log: `Breakthrough failed! Lost ${qiLost} Qi.`, breakthroughFailed: true };
    }

    _executeFlee() {
        const playerRank = this.player.cultivation.rankIndex;
        const enemyTier = { beast: 0, human: 1, demonic: 2, human_boss: 3, demonic_boss: 4, boss: 3, super_boss: 5 }[this.enemy.tier] || 1;
        let chance = 60 + (playerRank - enemyTier) * 10;
        chance = Math.min(90, Math.max(20, chance));
        const roll = Math.random() * 100;
        if (roll < chance) {
            this.isActive = false;
            this.addLog("You successfully flee!");
            return { damage: 0, log: "Fled successfully!", fled: true };
        }
        this.addLog("Failed to flee! The enemy takes a free shot!");
        return { damage: 0, log: "Flee failed!", fleeFailed: true };
    }

    processEnemyTurn() {
        this.playerDodging = false;

        if (this.enemyStunned) {
            this.enemyStunned = false;
            this.addLog(`The ${this.enemy.name} is stunned and cannot act!`);
            return { damage: 0, log: "Enemy stunned" };
        }

        if (this.slowTimeActive) {
            this.slowTimeActive = false;
            this.addLog(`The ${this.enemy.name} is caught in slowed time and cannot act!`);
            return { damage: 0, log: "Time slowed enemy" };
        }

        let atkMult = 1.0;
        if (this.enemyAtkReduction > 0) atkMult -= 0.2;
        if (this.enemyDmgReduction > 0) atkMult -= 0.5;

        const techName = this.enemy.techniques[Math.floor(Math.random() * this.enemy.techniques.length)];
        const tech = ENEMY_TECHNIQUES[techName] || ENEMY_TECHNIQUES.claw_swipe;
        let rawDmg = Math.floor(this.enemy.atk * (tech.power || 1.0) * atkMult);

        if (tech.effect === "drain") {
            const healAmt = Math.floor(rawDmg * 0.5);
            this.enemy.hp = Math.min(this.enemy.maxHP, this.enemy.hp + healAmt);
            this.addLog(`The ${this.enemy.name} drains your life force!`);

            if (this.playerQiShield) { this.playerQiShield = false; this.addLog("Qi Shield absorbs the attack!"); return { damage: 0 }; }
            if (this.playerDefending) rawDmg = Math.floor(rawDmg * 0.4);
            this.player.takeDamage(rawDmg);
            this.addLog(`You take ${rawDmg} damage (life drained).`);
            return { damage: rawDmg };
        }
        if (tech.effect === "poison") {
            this.playerPoison = 2;
            this.addLog(`The ${this.enemy.name} poisons you!`);

            if (this.playerQiShield) { this.playerQiShield = false; this.addLog("Qi Shield absorbs the attack!"); return { damage: 0 }; }
            if (this.playerDefending) rawDmg = Math.floor(rawDmg * 0.4);
            this.player.takeDamage(rawDmg);
            this.addLog(`You take ${rawDmg} damage (poisoned).`);
            return { damage: rawDmg };
        }
        if (tech.effect === "curse") {
            if (this.playerQiShield) { this.playerQiShield = false; this.addLog("Qi Shield absorbs the curse!"); return { damage: 0 }; }
            if (this.playerDefending) rawDmg = Math.floor(rawDmg * 0.4);
            this.player.takeDamage(rawDmg);
            this.addLog(`The Blood Witch's curse strikes for ${rawDmg} damage!`);
            return { damage: rawDmg };
        }
        if (tech.effect === "ignore_defense") {
            if (this.playerQiShield) { this.playerQiShield = false; this.addLog("Qi Shield absorbs soul attack!"); return { damage: 0 }; }
            this.player.takeDamage(rawDmg);
            this.addLog(`Soul attack pierces through! ${rawDmg} damage!`);
            return { damage: rawDmg };
        }
        if (tech.effect === "enrage") {
            this.enemy.atk = Math.floor(this.enemy.atk * 1.5);
            this.addLog(`The ${this.enemy.name} enrages! Attack power surges!`);
            return { damage: 0, log: "Enemy enraged" };
        }
        if (tech.effect === "stun") {
            if (this.playerQiShield) { this.playerQiShield = false; return { damage: 0 }; }
            if (this.playerDefending) rawDmg = Math.floor(rawDmg * 0.4);
            this.player.takeDamage(rawDmg);
            this.addLog(`Terra stomp shakes the ground! ${rawDmg} damage!`);
            return { damage: rawDmg };
        }

        if (tech.type === "heal") {
            const healAmt = Math.floor(this.enemy.maxHP * (tech.healPct || 0.2));
            this.enemy.hp = Math.min(this.enemy.maxHP, this.enemy.hp + healAmt);
            this.addLog(`The ${this.enemy.name} heals for ${healAmt} HP!`);
            return { damage: 0, log: "Enemy healed" };
        }
        if (tech.type === "defend") {
            const oldDef = this.enemy.def;
            this.enemy.def = Math.floor(this.enemy.def * (tech.defMult || 1.5));
            this.addLog(`The ${this.enemy.name} raises its guard! Defense doubled!`);
            setTimeout(() => { this.enemy.def = oldDef; }, 0);
            return { damage: 0, log: "Enemy defending" };
        }

        if (this.playerQiShield) {
            this.playerQiShield = false;
            this.addLog("Qi Shield absorbs the entire attack!");
            return { damage: 0 };
        }
        if (this.playerDefending) rawDmg = Math.floor(rawDmg * 0.4);
        this.player.takeDamage(rawDmg);
        this.addLog(`The ${this.enemy.name} uses ${tech.name} for ${rawDmg} damage!`);
        return { damage: rawDmg };
    }

    processTurn(actionId) {
        if (!this.isActive) return this.getState();

        for (const id of Object.keys(this.cooldowns)) {
            if (this.cooldowns[id] > 0) this.cooldowns[id]--;
        }

        if (this.enemyBurns > 0) {
            const burnDmg = Math.floor(this.enemy.maxHP * 0.05);
            this.enemy.hp = Math.max(0, this.enemy.hp - burnDmg);
            this.enemyBurns--;
            this.addLog(`Burn deals ${burnDmg} damage to the ${this.enemy.name}!`);
        }
        if (this.enemyDots > 0) {
            const dotDmg = Math.floor(this.enemy.maxHP * 0.06);
            this.enemy.hp = Math.max(0, this.enemy.hp - dotDmg);
            this.enemyDots--;
            this.addLog(`Sword domain shreds the enemy for ${dotDmg} damage!`);
        }
        if (this.playerPoison > 0) {
            const poisonDmg = Math.floor(this.player.maxHealth * 0.05);
            this.player.takeDamage(poisonDmg);
            this.playerPoison--;
            this.addLog(`Poison deals ${poisonDmg} damage to you!`);
        }
        if (this.enemyAtkReduction > 0) this.enemyAtkReduction--;
        if (this.enemyDmgReduction > 0) this.enemyDmgReduction--;

        this.playerDefending = false;

        const playerResult = this.processPlayerAction(actionId);

        const wasFlee = playerResult.fled;
        if (wasFlee) {
            this.isActive = false;
            return this.getState();
        }

        const wasBreakthroughFailed = playerResult.breakthroughFailed;
        if (this.enemy.hp <= 0) {
            this.isActive = false;
            this.victory = true;
            this._handleVictory();
            return this.getState();
        }

        if (wasBreakthroughFailed) {
            const enemyResult = this.processEnemyTurn();
        }

        const enemyResult = this.processEnemyTurn();

        if (this.player.health <= 0) {
            this.player.health = 0;
            this.player.alive = false;
            this.isActive = false;
            this.addLog("You have been slain...");
            this.player.soulBannerCount = 0;
            return this.getState();
        }

        return this.getState();
    }

    _handleVictory() {
        const qiReward = Math.floor(this.enemy.maxHP * 0.3);
        this.player.qi += qiReward;

        const goldRange = this.enemy.drops.gold || [5, 15];
        const goldReward = Math.floor(Math.random() * (goldRange[1] - goldRange[0] + 1)) + goldRange[0];
        this.player.gold += goldReward;

        this.combatKills++;
        if (this.player.techniques.includes("Soul Banner")) {
            this.player.soulBannerCount = (this.player.soulBannerCount || 0) + 1;
        }

        let itemDrop = null;
        if (this.enemy.drops.chance > Math.random()) {
            const items = this.enemy.drops.items || [];
            if (items.length > 0) {
                itemDrop = items[Math.floor(Math.random() * items.length)];
                this.player.items.push(itemDrop);
            }
        }

        let techniqueDrop = null;
        if (this.enemy.drops.technique) {
            const techData = TECHNIQUES[this.enemy.drops.technique];
            if (techData && !this.player.techniques.includes(techData.name)) {
                techniqueDrop = techData.name;
                this.player.techniques.push(techData.name);
                const techId = this.enemy.drops.technique;
                if (this.cooldowns[techId] === undefined) {
                    this.cooldowns[techId] = 0;
                }
            }
        }

        this.addLog(`Victory! Gained ${qiReward} Qi, ${goldReward} gold.${itemDrop ? ` Found: ${itemDrop}.` : ""}${techniqueDrop ? ` Learned: ${techniqueDrop}!` : ""}`);
    }

    getState() {
        const canBT = this.canBreakthrough();
        return {
            isActive: this.isActive,
            victory: this.victory,
            enemy: {
                name: this.enemy.name,
                tier: this.enemy.tier,
                hp: this.enemy.hp,
                maxHP: this.enemy.maxHP,
                atk: this.enemy.atk,
                def: this.enemy.def,
            },
            player_stats: this.player.stats,
            turnLog: this.turnLog,
            availableActions: this.getPlayerActions(),
            canBreakthrough: canBT,
        };
    }
}

module.exports = { Combat };
