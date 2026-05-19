const RANDOM_ENCOUNTERS = {
    wilderness: { chance: 0.4, enemies: ["shadow_viper", "spirit_beast", "iron_fanged_boar"] },
    scenic: { chance: 0.25, enemies: ["wood_elemental", "spirit_beast"] },
    road: { chance: 0.2, enemies: ["mountain_bandit", "wandering_swordsman"] },
    dungeon: { chance: 0.5, enemies: ["corpse_puppet", "wood_elemental"] },
    village: { chance: 0.05, enemies: ["mountain_bandit"] },
    city: { chance: 0.1, enemies: ["wandering_swordsman", "rogue_cultivator"] },
    sect: { chance: 0.1, enemies: ["sect_disciple"] },
};

function checkRandomEncounter(locationType) {
    const enc = RANDOM_ENCOUNTERS[locationType];
    if (!enc) return null;
    if (Math.random() < enc.chance) {
        return enc.enemies[Math.floor(Math.random() * enc.enemies.length)];
    }
    return null;
}

const LOCATIONS = {
    cloud_wind_village: {
        name: "Cloud Wind Village",
        description: "A small village nestled between misty mountains. Simple folk, humble living.",
        connections: ["azure_mountains", "misty_falls", "eastern_road"],
        type: "village", danger_level: 1,
    },
    azure_mountains: {
        name: "Azure Mountains",
        description: "Towering peaks shrouded in azure mist. Spirit beasts roam the forests.",
        connections: ["cloud_wind_village", "hidden_cave", "azure_peaks_sect"],
        type: "wilderness", danger_level: 3,
    },
    misty_falls: {
        name: "Misty Falls",
        description: "A magnificent waterfall that seems to touch the heavens. Qi gathers densely here.",
        connections: ["cloud_wind_village", "hidden_cave"],
        type: "scenic", danger_level: 2,
    },
    hidden_cave: {
        name: "Hidden Cave",
        description: "An ancient cave sealed by formation arrays. Rumors say a powerful cultivator legacy lies within.",
        connections: ["azure_mountains", "misty_falls"],
        type: "dungeon", danger_level: 5,
    },
    eastern_road: {
        name: "Eastern Road",
        description: "A well-traveled road connecting villages to the larger cities of Zhao Guo.",
        connections: ["cloud_wind_village", "zhao_city"],
        type: "road", danger_level: 2,
    },
    zhao_city: {
        name: "Zhao City",
        description: "A bustling city under the Zhao Kingdom. Markets, auction houses, and sect recruitment halls.",
        connections: ["eastern_road", "azure_peaks_sect"],
        type: "city", danger_level: 2,
    },
    azure_peaks_sect: {
        name: "Azure Peaks Sect",
        description: "A mid-rank sect built on seven peaks. The gate of entry for many aspiring cultivators.",
        connections: ["azure_mountains", "zhao_city"],
        type: "sect", danger_level: 4,
    },
};

class World {
    getLocation(locId) { return LOCATIONS[locId] || LOCATIONS.cloud_wind_village; }

    getAvailableMoves(locId) {
        const loc = this.getLocation(locId);
        const dests = {};
        for (const conn of loc.connections) {
            dests[conn] = this.getLocation(conn).name;
        }
        return dests;
    }

    travel(player, destinationId) {
        const loc = this.getLocation(player.location);
        if (loc.connections.includes(destinationId)) {
            player.location = destinationId;
            const newLoc = this.getLocation(destinationId);
            return { success: true, location: newLoc, message: `You travel to ${newLoc.name}.` };
        }
        return { success: false, location: loc, message: "You cannot go that way." };
    }
}

module.exports = { World, checkRandomEncounter };
