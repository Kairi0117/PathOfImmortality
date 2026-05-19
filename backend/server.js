const express = require("express");
const cors = require("cors");
const path = require("path");
const { Player, BACKGROUNDS } = require("./game_engine/player");
const { StoryEngine } = require("./game_engine/story");
const { World, checkRandomEncounter } = require("./game_engine/world");
const { Combat } = require("./game_engine/combat");
const { getEnemyById, DANGER_MAP } = require("./game_engine/enemies");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

const gameState = { player: null, story: new StoryEngine(), world: new World(), combat: null };

function checkAlive(req, res, next) {
    if (gameState.player && !gameState.player.alive) {
        return res.json({ game_over: true, player_stats: gameState.player.stats });
    }
    next();
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.get("/api/backgrounds", (req, res) => {
    const bgs = {};
    for (const [k, v] of Object.entries(BACKGROUNDS)) {
        bgs[k] = { name: v.name, description: v.description, talent: v.talent };
    }
    res.json(bgs);
});

app.post("/api/new-game", (req, res) => {
    const { name = "Wanderer", background = "village_orphan" } = req.body;
    gameState.player = new Player(name, background);
    gameState.combat = null;
    const scene = gameState.story.getScene("intro");
    res.json({ scene, player_stats: gameState.player.stats });
});

app.get("/api/state", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    const inCombat = gameState.combat && gameState.combat.isActive;
    res.json({
        player_stats: gameState.player.stats,
        in_combat: inCombat,
        combat_state: inCombat ? gameState.combat.getState() : null,
    });
});

app.post("/api/action", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    if (gameState.combat && gameState.combat.isActive) {
        return res.json({ error: "You are in combat!" });
    }

    const { action } = req.body;
    const player = gameState.player;
    const story = gameState.story;
    const world = gameState.world;

    if (action.startsWith("travel_")) {
        let dest = action.slice(7);
        if (!world.getLocation(dest)) {
            return res.status(400).json({ error: "Unknown destination." });
        }
        player.location = dest;
        const locData = world.getLocation(dest);
        const encounter = (locData.type !== "village" && locData.type !== "city" && locData.type !== "sect")
            ? checkRandomEncounter(locData.type) : null;
        const scene = story.getLocationScene(dest);
        return res.json({ scene, player_stats: player.stats, travel_msg: `You travel to ${locData.name}.`, encounter });
    }

    if (action === "meditate") {
        const qi = player.meditate();
        return res.json({ player_stats: player.stats, effects: { qi, message: `You meditated and gained ${qi} Qi.` } });
    }

    if (action === "breakthrough") {
        const [success, msg] = player.attemptBreakthrough();
        return res.json({ player_stats: player.stats, effects: { breakthrough: success, message: msg } });
    }

    const result = story.processAction(player, action);
    res.json(result);
});

app.post("/api/combat/start", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });

    const { enemy_id } = req.body;
    if (!enemy_id) return res.status(400).json({ error: "No enemy specified" });

    const template = getEnemyById(enemy_id);
    if (!template) return res.status(400).json({ error: "Unknown enemy" });

    const locData = gameState.world.getLocation(gameState.player.location);
    gameState.combat = new Combat(gameState.player, template, locData.type);
    res.json({ combat: gameState.combat.getState() });
});

app.post("/api/combat/act", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    if (!gameState.combat || !gameState.combat.isActive) {
        return res.status(400).json({ error: "Not in combat" });
    }

    const { action } = req.body;
    if (!action) return res.status(400).json({ error: "No action specified" });

    const state = gameState.combat.processTurn(action);

    if (state.victory) {
        gameState.combat = null;
        gameState.player.combatKills = (gameState.player.combatKills || 0) + 1;
        const scene = gameState.story.getLocationScene(gameState.player.location);
        return res.json({
            combat_result: "victory",
            combat_log: state.turnLog,
            player_stats: state.player_stats,
            scene,
        });
    }

    if (!gameState.player.alive) {
        gameState.combat = null;
        return res.json({
            game_over: true,
            player_stats: gameState.player.stats,
            combat_log: state.turnLog,
        });
    }

    res.json({ combat: state });
});

app.get("/api/combat/state", checkAlive, (req, res) => {
    if (!gameState.combat || !gameState.combat.isActive) {
        return res.json({ in_combat: false });
    }
    res.json({ combat: gameState.combat.getState() });
});

// ── PHASE 5: Equipment & Refining API ──

app.get("/api/items/definitions", (req, res) => {
    const { EQUIPMENT_DEFS, CONSUMABLE_DEFS, MATERIAL_DEFS } = require("./game_engine/items");
    const defs = {};
    for (const [k, v] of Object.entries(EQUIPMENT_DEFS)) defs[k] = v;
    for (const [k, v] of Object.entries(CONSUMABLE_DEFS)) defs[k] = v;
    for (const [k, v] of Object.entries(MATERIAL_DEFS)) defs[k] = v;
    res.json(defs);
});

app.post("/api/equip", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ error: "No item specified" });
    const result = gameState.player.equip(item_id);
    res.json({ ...result, player_stats: gameState.player.stats });
});

app.post("/api/unequip", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    const { slot } = req.body;
    if (!slot) return res.status(400).json({ error: "No slot specified" });
    const result = gameState.player.unequip(slot);
    res.json({ ...result, player_stats: gameState.player.stats });
});

app.post("/api/use-item", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ error: "No item specified" });
    const result = gameState.player.useConsumable(item_id);
    res.json({ ...result, player_stats: gameState.player.stats });
});

app.post("/api/refine", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ error: "No item specified" });

    const { getItemDef, refineItem, TIER_BASE_REQUIREMENTS } = require("./game_engine/items");
    const def = getItemDef(item_id);
    if (!def) return res.status(400).json({ error: "Unknown item." });

    const tierReq = TIER_BASE_REQUIREMENTS[def.tier];
    const stoneCount = gameState.player.items.filter(i => i === tierReq.stone).length;
    if (stoneCount < tierReq.stonesNeeded) {
        return res.json({ success: false, message: `Need ${tierReq.stonesNeeded}x ${tierReq.stone} to refine. You have ${stoneCount}.`, player_stats: gameState.player.stats });
    }

    const invIdx = gameState.player.inventory.indexOf(item_id);
    if (invIdx === -1) return res.status(400).json({ error: "Item not in inventory." });

    for (let i = 0; i < tierReq.stonesNeeded; i++) {
        const si = gameState.player.items.indexOf(tierReq.stone);
        if (si !== -1) gameState.player.items.splice(si, 1);
    }

    const itemData = gameState.player.inventory[invIdx];
    if (typeof itemData === "string") {
        gameState.player.inventory[invIdx] = { id: item_id, refineLevel: 0 };
    }

    const itemRef = typeof gameState.player.inventory[invIdx] === "object"
        ? gameState.player.inventory[invIdx] : { id: item_id, refineLevel: 0 };

    const result = refineItem(itemRef);
    if (result.destroyed) {
        gameState.player.inventory.splice(invIdx, 1);
    }
    gameState.player.inventory[invIdx] = itemRef;
    res.json({ ...result, player_stats: gameState.player.stats });
});

// ── PHASE 6: Endings ──

app.get("/api/ending", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    const { evaluateEnding, getFactionLabel } = require("./game_engine/endings");
    const ending = evaluateEnding(gameState.player);
    const faction = getFactionLabel(gameState.player.faction);
    res.json({ ending, faction, player_stats: gameState.player.stats });
});

app.post("/api/transcend", checkAlive, (req, res) => {
    if (!gameState.player) return res.status(400).json({ error: "No active game" });
    const { evaluateEnding, getFactionLabel } = require("./game_engine/endings");
    const ending = evaluateEnding(gameState.player);
    const faction = getFactionLabel(gameState.player.faction);
    gameState.player.alive = false;
    res.json({ ending, faction, player_stats: gameState.player.stats, game_over: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Path of Immortality server running on port ${PORT}`);
});
