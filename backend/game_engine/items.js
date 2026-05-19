const ITEM_TIERS = ["mortal", "earth", "profound", "heaven", "celestial"];

const TIER_BASE_REQUIREMENTS = {
    mortal: { stone: "Mortal Refinement Stone", stonesNeeded: 1 },
    earth: { stone: "Earth Refinement Stone", stonesNeeded: 2 },
    profound: { stone: "Profound Refinement Stone", stonesNeeded: 3 },
    heaven: { stone: "Heaven Refinement Stone", stonesNeeded: 4 },
    celestial: { stone: "Celestial Refinement Stone", stonesNeeded: 5 },
};

const EQUIPMENT_DEFS = {
    // Weapons
    iron_sword: { id: "iron_sword", name: "Iron Sword", type: "weapon", tier: "mortal", baseStats: { atk: 3 }, description: "A basic iron sword." },
    spirit_blade: { id: "spirit_blade", name: "Spirit Blade", type: "weapon", tier: "earth", baseStats: { atk: 8 }, description: "A blade infused with spiritual energy." },
    seven_star_sword: { id: "seven_star_sword", name: "Seven Star Sword", type: "weapon", tier: "profound", baseStats: { atk: 15 }, description: "A sword that channels the power of seven constellations." },
    heaven_defying_blade: { id: "heaven_defying_blade", name: "Heaven-Defying Blade", type: "weapon", tier: "heaven", baseStats: { atk: 30 }, description: "A blade that defies the heavens themselves." },
    celestial_ravager: { id: "celestial_ravager", name: "Celestial Ravager", type: "weapon", tier: "celestial", baseStats: { atk: 55 }, description: "A weapon from beyond the mortal realm." },

    // Armor
    iron_robe: { id: "iron_robe", name: "Iron Robe", type: "armor", tier: "mortal", baseStats: { def: 2 }, description: "A simple reinforced robe." },
    spirit_armor: { id: "spirit_armor", name: "Spirit Armor", type: "armor", tier: "earth", baseStats: { def: 5, hp: 20 }, description: "Armor woven from spirit silk." },
    cloud_silk_robe: { id: "cloud_silk_robe", name: "Cloud Silk Robe", type: "armor", tier: "profound", baseStats: { def: 10, hp: 40 }, description: "A robe as light as clouds, as tough as steel." },
    starlight_mantle: { id: "starlight_mantle", name: "Starlight Mantle", type: "armor", tier: "heaven", baseStats: { def: 20, hp: 80 }, description: "A mantle woven from starlight itself." },
    primordial_armor: { id: "primordial_armor", name: "Primordial Armor", type: "armor", tier: "celestial", baseStats: { def: 40, hp: 150 }, description: "Armor from the age of chaos." },

    // Accessories
    qi_pendant: { id: "qi_pendant", name: "Qi Pendant", type: "accessory", tier: "mortal", baseStats: { qi: 20 }, description: "A pendant that slowly gathers Qi." },
    defense_amulet: { id: "defense_amulet", name: "Defense Amulet", type: "accessory", tier: "earth", baseStats: { def: 3, hp: 15 }, description: "An amulet warding against harm." },
    spirit_ring: { id: "spirit_ring", name: "Spirit Ring", type: "accessory", tier: "profound", baseStats: { qi: 80, atk: 5 }, description: "A ring that amplifies spiritual power." },
    heavenly_talisman: { id: "heavenly_talisman", name: "Heavenly Talisman", type: "accessory", tier: "heaven", baseStats: { qi: 200, def: 8, atk: 8 }, description: "A talisman inscribed by celestial beings." },
    dao_badge: { id: "dao_badge", name: "Dao Badge", type: "accessory", tier: "celestial", baseStats: { qi: 500, atk: 15, def: 15, hp: 100 }, description: "A badge that resonates with the dao itself." },
};

const CONSUMABLE_DEFS = {
    qi_pill: { id: "qi_pill", name: "Qi Pill", type: "consumable", tier: "mortal", description: "Restores 30 HP.", effect: { heal: 30 } },
    foundation_pill: { id: "foundation_pill", name: "Foundation Pill", type: "consumable", tier: "earth", description: "Boosts breakthrough chance when used." },
    spirit_herb: { id: "spirit_herb", name: "Spirit Herb", type: "consumable", tier: "mortal", description: "Grants 10 Qi when consumed.", effect: { qi: 10 } },
    qi_stone: { id: "qi_stone", name: "Qi Stone", type: "consumable", tier: "earth", description: "Restores 50 Qi when consumed.", effect: { qi: 50 } },
};

const MATERIAL_DEFS = {
    mortal_refinement_stone: { id: "mortal_refinement_stone", name: "Mortal Refinement Stone", type: "material", tier: "mortal", description: "Used to refine mortal-tier equipment." },
    earth_refinement_stone: { id: "earth_refinement_stone", name: "Earth Refinement Stone", type: "material", tier: "earth", description: "Used to refine earth-tier equipment." },
    profound_refinement_stone: { id: "profound_refinement_stone", name: "Profound Refinement Stone", type: "material", tier: "profound", description: "Used to refine profound-tier equipment." },
    heaven_refinement_stone: { id: "heaven_refinement_stone", name: "Heaven Refinement Stone", type: "material", tier: "heaven", description: "Used to refine heaven-tier equipment." },
    celestial_refinement_stone: { id: "celestial_refinement_stone", name: "Celestial Refinement Stone", type: "material", tier: "celestial", description: "Used to refine celestial-tier equipment." },
    spirit_ore: { id: "spirit_ore", name: "Spirit Ore", type: "material", tier: "earth", description: "A lump of spirit-infused ore. Used in crafting." },
    beast_core: { id: "beast_core", name: "Beast Core", type: "material", tier: "profound", description: "The core of a powerful spirit beast. Used in high-tier refining." },
};

function getItemDef(itemId) {
    return EQUIPMENT_DEFS[itemId] || CONSUMABLE_DEFS[itemId] || MATERIAL_DEFS[itemId] || null;
}

function getItemName(itemId) {
    const def = getItemDef(itemId);
    return def ? def.name : itemId;
}

function getItemTier(itemId) {
    const def = getItemDef(itemId);
    return def ? def.tier : "mortal";
}

function refineSuccessChance(currentRefine) {
    const chances = [0.90, 0.75, 0.55, 0.35, 0.20, 0.10, 0.05];
    return chances[currentRefine] !== undefined ? chances[currentRefine] : 0.05;
}

function refineItem(itemData) {
    const def = EQUIPMENT_DEFS[itemData.id];
    if (!def) return { success: false, destroyed: false, message: "This item cannot be refined." };

    const currentRefine = itemData.refineLevel || 0;
    const tierIdx = ITEM_TIERS.indexOf(def.tier);
    const maxRefine = (tierIdx + 1) * 3;

    if (currentRefine >= maxRefine) {
        return { success: false, destroyed: false, message: "This item has reached its maximum refine level." };
    }

    const baseChance = refineSuccessChance(currentRefine);
    const tierPenalty = tierIdx * 0.05;
    const chance = Math.max(0.05, baseChance - tierPenalty);
    const roll = Math.random();

    if (roll < chance) {
        itemData.refineLevel = (itemData.refineLevel || 0) + 1;
        return { success: true, destroyed: false, message: `Refinement succeeded! ${def.name} is now +${itemData.refineLevel}.` };
    }

    const failRoll = Math.random();
    if (failRoll < 0.2) {
        return { success: false, destroyed: true, message: `Refinement failed! ${def.name} has been destroyed!` };
    }
    if (failRoll < 0.6) {
        const drop = Math.max(0, (itemData.refineLevel || 0) - 1);
        itemData.refineLevel = drop;
        return { success: false, destroyed: false, message: `Refinement failed! ${def.name} dropped to +${drop}.` };
    }
    return { success: false, destroyed: false, message: `Refinement failed, but ${def.name} remains unchanged.` };
}

function getEffectiveStats(itemData) {
    const def = EQUIPMENT_DEFS[itemData.id];
    if (!def) return { atk: 0, def: 0, hp: 0, qi: 0 };
    const refineLevel = itemData.refineLevel || 0;
    const mult = 1 + refineLevel * 0.2;
    const stats = { atk: 0, def: 0, hp: 0, qi: 0 };
    for (const [key, val] of Object.entries(def.baseStats)) {
        stats[key] = Math.floor(val * mult);
    }
    return stats;
}

function getRefineDisplay(itemData) {
    const rl = itemData.refineLevel || 0;
    return rl > 0 ? `+${rl}` : "";
}

module.exports = {
    ITEM_TIERS, EQUIPMENT_DEFS, CONSUMABLE_DEFS, MATERIAL_DEFS,
    getItemDef, getItemName, getItemTier,
    refineItem, refineSuccessChance, getEffectiveStats, getRefineDisplay,
};
