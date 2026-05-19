const { CultivationSystem } = require("./cultivation");
const { TECHNIQUES } = require("./techniques");
const { EQUIPMENT_DEFS, getEffectiveStats } = require("./items");

const BACKGROUNDS = {
    village_orphan: {
        name: "Village Orphan",
        description: "You grew up alone in a small mountain village. Life was hard, but it forged an unyielding will.",
        talent: "Mortal", qi_bonus: 0, techniques: ["Qi Gathering", "Fist Strike"],
    },
    fallen_clan_heir: {
        name: "Fallen Clan Heir",
        description: "Your clan was destroyed when you were young. You carry a bloodline secret and a desire for revenge.",
        talent: "Profound", qi_bonus: 50, techniques: ["Qi Gathering", "Clan Hidden Art"],
    },
    rogue_cultivator: {
        name: "Rogue Cultivator",
        description: "You never joined a sect. You have scraped by on cunning and stolen techniques.",
        talent: "Mortal", qi_bonus: 30, techniques: ["Qi Gathering", "Sneak Attack"],
    },
    merchant_scion: {
        name: "Merchant Scion",
        description: "Your family has wealth but no cultivation heritage. You buy your way into the immortal path.",
        talent: "Earth", qi_bonus: 100, techniques: ["Qi Gathering", "Pill Refining"],
    },
};

class Player {
    constructor(name, backgroundKey) {
        const bg = BACKGROUNDS[backgroundKey];
        this.name = name;
        this.background = bg;
        this.talent = bg.talent;
        this.qi = bg.qi_bonus;
        this.health = 100;
        this.maxHealth = 100;
        this.cultivation = new CultivationSystem();
        this.techniques = [...bg.techniques];
        this.items = [];
        this.gold = 10;
        this.location = "cloud_wind_village";
        this.reputation = 0;
        this.alive = true;
        this.defense = 5;
        this.soulBannerCount = 0;
        this.quests = { active: {}, completed: {} };
        this.flags = {};
        this.equipment = { weapon: null, armor: null, accessory: null };
        this.inventory = [];
        this.faction = { righteous: 0, demonic: 0, transcendent: 0 };
        this.combatKills = 0;
    }

    get cultivationDisplay() { return this.cultivation.displayName; }

    get equipmentStats() {
        let total = { atk: 0, def: 0, hp: 0, qi: 0 };
        for (const slot of ["weapon", "armor", "accessory"]) {
            const item = this.equipment[slot];
            if (item) {
                const s = getEffectiveStats(item);
                for (const k of Object.keys(total)) total[k] += s[k] || 0;
            }
        }
        return total;
    }

    get stats() {
        const eqStats = this.equipmentStats;
        return {
            name: this.name,
            background: this.background.name,
            talent: this.talent,
            qi: this.qi + (eqStats.qi || 0),
            health: this.health,
            max_health: this.maxHealth + (eqStats.hp || 0),
            cultivation: this.cultivationDisplay,
            rankIndex: this.cultivation.rankIndex,
            techniques: this.techniques,
            items: this.items,
            gold: this.gold,
            location: this.location,
            reputation: this.reputation,
            alive: this.alive,
            defense: this.defense + (eqStats.def || 0),
            soulBannerCount: this.soulBannerCount,
            quests: this.quests,
            flags: this.flags,
            equipment: this.equipment,
            inventory: this.inventory,
            equipment_stats: eqStats,
            faction: this.faction,
            combat_kills: this.combatKills,
        };
    }

    meditate() {
        const gain = this.cultivation.qiPerMeditation(this.talent);
        this.qi += gain;
        return gain;
    }

    attemptBreakthrough() {
        const talentMult = { Heavenly: 0.3, Earth: 0.6, Profound: 0.9, Mortal: 1.3, Crippled: 2.0 }[this.talent] || 1.0;
        const [success, msg] = this.cultivation.breakthrough(this.qi, talentMult);
        if (success) {
            this.qi = 0;
            this.maxHealth += 20;
            this.health = this.maxHealth;
        }
        return [success, msg];
    }

    takeDamage(dmg) { this.health = Math.max(0, this.health - dmg); if (this.health <= 0) this.alive = false; return this.health; }
    heal(amount) { this.health = Math.min(this.maxHealth, this.health + amount); }

    hasItem(itemId) {
        if (this.items.includes(itemId)) return true;
        return this.inventory.some(i => (typeof i === "string" ? i : i.id) === itemId);
    }

    addItem(itemId) {
        const { getItemDef } = require("./items");
        const def = getItemDef(itemId);
        if (def && (def.type === "consumable" || def.type === "material")) {
            this.items.push(itemId);
        } else if (def) {
            this.inventory.push(itemId);
        } else {
            this.items.push(itemId);
        }
    }

    removeItem(itemId) {
        for (let i = 0; i < this.inventory.length; i++) {
            if ((typeof this.inventory[i] === "string" ? this.inventory[i] : this.inventory[i].id) === itemId) {
                this.inventory.splice(i, 1); return true;
            }
        }
        const idx2 = this.items.indexOf(itemId);
        if (idx2 !== -1) { this.items.splice(idx2, 1); return true; }
        return false;
    }

    equip(itemId) {
        const { EQUIPMENT_DEFS } = require("./items");
        const def = EQUIPMENT_DEFS[itemId];
        if (!def) return { success: false, message: "Cannot equip this item." };
        let idx = -1;
        let itemData = null;
        for (let i = 0; i < this.inventory.length; i++) {
            const entry = this.inventory[i];
            const entryId = typeof entry === "string" ? entry : entry.id;
            if (entryId === itemId) { idx = i; itemData = typeof entry === "string" ? { id: entry, refineLevel: 0 } : entry; break; }
        }
        if (idx === -1) return { success: false, message: "Item not in inventory." };
        const rl = itemData.refineLevel || 0;
        const old = this.equipment[def.type];
        this.equipment[def.type] = { id: itemId, refineLevel: rl };
        this.inventory.splice(idx, 1);
        if (old) this.inventory.push(typeof old === "string" ? old : { id: old.id, refineLevel: old.refineLevel || 0 });
        return { success: true, message: `Equipped ${def.name}${rl > 0 ? ` +${rl}` : ""}.`, unequipped: old ? (typeof old === "string" ? old : old.id) : null };
    }

    unequip(slot) {
        const item = this.equipment[slot];
        if (!item) return { success: false, message: "Nothing equipped in that slot." };
        const def = require("./items").EQUIPMENT_DEFS[item.id];
        this.equipment[slot] = null;
        this.inventory.push(item.id);
        return { success: true, message: `Unequipped ${def ? def.name : item.id}.` };
    }

    useConsumable(itemId) {
        const { CONSUMABLE_DEFS } = require("./items");
        const def = CONSUMABLE_DEFS[itemId];
        if (!def) return { success: false, message: "Cannot use this item." };
        if (!this.hasItem(itemId)) return { success: false, message: "Item not found." };
        this.removeItem(itemId);
        if (def.effect) {
            if (def.effect.heal) this.heal(def.effect.heal);
            if (def.effect.qi) this.qi += def.effect.qi;
        }
        return { success: true, message: `Used ${def.name}.`, effect: def.effect || {} };
    }
}

module.exports = { Player, BACKGROUNDS };
