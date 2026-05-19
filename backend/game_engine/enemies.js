const ENEMY_TEMPLATES = [
  { id: "spirit_beast", name: "Spirit Beast", tier: "beast", baseHP: 80, baseAtk: 12, baseDef: 5,
    techniques: ["claw_swipe"], drops: { gold: [5, 15], items: ["Spirit Herb"], chance: 0.3 } },
  { id: "iron_fanged_boar", name: "Iron-Fanged Boar", tier: "beast", baseHP: 120, baseAtk: 15, baseDef: 8,
    techniques: ["charge"], drops: { gold: [10, 25], items: ["Boar Tusk"], chance: 0.4 } },
  { id: "shadow_viper", name: "Shadow Viper", tier: "beast", baseHP: 60, baseAtk: 18, baseDef: 3,
    techniques: ["poison_bite"], drops: { gold: [8, 20], items: ["Viper Venom"], chance: 0.3 } },
  { id: "wood_elemental", name: "Wood Elemental", tier: "beast", baseHP: 100, baseAtk: 10, baseDef: 12,
    techniques: ["healing_roots"], drops: { gold: [12, 30], items: ["Wood Essence"], chance: 0.5 } },

  { id: "rogue_cultivator", name: "Rogue Cultivator", tier: "human", baseHP: 60, baseAtk: 15, baseDef: 5,
    techniques: ["wind_slash", "sneak_attack"], drops: { gold: [15, 35], items: ["Qi Pill"], chance: 0.3, technique: "wind_slash" } },
  { id: "mountain_bandit", name: "Mountain Bandit", tier: "human", baseHP: 70, baseAtk: 13, baseDef: 6,
    techniques: ["dirty_strike"], drops: { gold: [20, 40], items: [], chance: 0.5 } },
  { id: "wandering_swordsman", name: "Wandering Swordsman", tier: "human", baseHP: 50, baseAtk: 22, baseDef: 3,
    techniques: ["sword_strike"], drops: { gold: [10, 30], items: ["Iron Sword"], chance: 0.4, technique: "wind_slash" } },

  { id: "demonic_cultivator", name: "Demonic Cultivator", tier: "demonic", baseHP: 100, baseAtk: 20, baseDef: 7,
    techniques: ["dark_strike", "life_drain"], drops: { gold: [25, 50], items: ["Demonic Core"], chance: 0.4 } },
  { id: "corpse_puppet", name: "Corpse Puppet", tier: "demonic", baseHP: 150, baseAtk: 12, baseDef: 12,
    techniques: ["slam"], drops: { gold: [10, 20], items: [], chance: 0.2 } },
  { id: "blood_witch", name: "Blood Witch", tier: "demonic", baseHP: 80, baseAtk: 25, baseDef: 4,
    techniques: ["blood_curse", "aoe_strike"], drops: { gold: [30, 60], items: ["Blood Essence"], chance: 0.5, technique: "blood_blossom" } },
  { id: "soul_banner_cultivator", name: "Soul Banner Cultivator", tier: "demonic", baseHP: 90, baseAtk: 22, baseDef: 6,
    techniques: ["soul_attack"], drops: { gold: [35, 70], items: ["Soul Fragment"], chance: 0.6, technique: "soul_banner" } },
  { id: "flying_head_elder", name: "Flying Head Elder", tier: "demonic_boss", baseHP: 300, baseAtk: 30, baseDef: 10,
    techniques: ["head_flying_attack", "summon_minions", "domain_attack"], drops: { gold: [100, 200], items: ["Elder Core", "Ancient Key"], chance: 1.0, technique: "karma_severance" } },

  { id: "sect_disciple", name: "Sect Disciple", tier: "human", baseHP: 70, baseAtk: 16, baseDef: 6,
    techniques: ["sect_strike", "qi_barrier"], drops: { gold: [10, 20], items: ["Sect Token"], chance: 0.3 } },
  { id: "inner_disciple", name: "Inner Disciple", tier: "human", baseHP: 100, baseAtk: 20, baseDef: 8,
    techniques: ["advanced_sect_strike", "qi_barrier"], drops: { gold: [20, 40], items: ["Inner Disciple Robe"], chance: 0.5, technique: "seven_star_sword" } },
  { id: "sect_elder", name: "Sect Elder", tier: "human_boss", baseHP: 250, baseAtk: 28, baseDef: 12,
    techniques: ["elder_domain", "sect_ultimate"], drops: { gold: [80, 150], items: ["Elder Token", "Foundation Pill"], chance: 1.0, technique: "sword_domain" } },
  { id: "sect_grand_elder", name: "Sect Grand Elder", tier: "human_boss", baseHP: 400, baseAtk: 35, baseDef: 15,
    techniques: ["grand_domain", "heavenly_strike"], drops: { gold: [200, 400], items: ["Grand Elder Badge", "Core Formation Pill"], chance: 1.0, technique: "heaven_defying_palm" } },

  { id: "guardian_beast", name: "Guardian Beast", tier: "boss", baseHP: 500, baseAtk: 25, baseDef: 15,
    techniques: ["rage_mode", "terra_stomp", "beast_roar"], drops: { gold: [150, 300], items: ["Beast Core", "Guardian Scale"], chance: 1.0, technique: "ancient_god_transformation" } },
  { id: "heaven_defying_sage_remnant", name: "Heaven-Defying Sage Remnant", tier: "super_boss", baseHP: 800, baseAtk: 40, baseDef: 20,
    techniques: ["sage_domain", "void_attack", "time_distortion"], drops: { gold: [500, 1000], items: ["Sage Legacy", "Celestial Fragment"], chance: 1.0, technique: "sundered_night" } },
  { id: "ancient_god_statue", name: "Ancient God Statue", tier: "boss", baseHP: 350, baseAtk: 35, baseDef: 25,
    techniques: ["god_stomp", "ancient_barrier"], drops: { gold: [100, 250], items: ["God Blood Drop"], chance: 0.8, technique: "ancient_god_transformation" } },
  { id: "azure_drake", name: "Azure Drake", tier: "super_boss", baseHP: 600, baseAtk: 38, baseDef: 18,
    techniques: ["drake_breath", "sky_dive", "scale_shield"], drops: { gold: [300, 600], items: ["Dragon Scale", "Drake Heart"], chance: 1.0, technique: "flowing_time" } },
];

const DANGER_MAP = {
  village: 1, road: 2, scenic: 2, wilderness: 3, sect: 4, dungeon: 5,
};

function getScaledEnemy(template, playerCultivationRank, locationDanger) {
  const rankBonus = playerCultivationRank;
  const dangerMult = DANGER_MAP[locationDanger] || 2;
  const scale = 1 + dangerMult * 0.3 + rankBonus * 0.5;
  return {
    id: template.id,
    name: template.name,
    tier: template.tier,
    maxHP: Math.floor(template.baseHP * scale),
    hp: Math.floor(template.baseHP * scale),
    atk: Math.floor(template.baseAtk * scale),
    def: Math.floor(template.baseDef * scale),
    techniques: template.techniques,
    drops: template.drops,
  };
}

function getEnemyById(id) {
  return ENEMY_TEMPLATES.find(e => e.id === id);
}

module.exports = { ENEMY_TEMPLATES, getScaledEnemy, getEnemyById, DANGER_MAP };
