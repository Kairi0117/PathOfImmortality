const CULTIVATION_RANKS = [
    { name: "Qi Condensation", sub_stages: ["Layer 1", "Layer 2", "Layer 3", "Layer 4", "Layer 5",
        "Layer 6", "Layer 7", "Layer 8", "Layer 9",
        "Layer 10", "Layer 11", "Layer 12", "Layer 13"] },
    { name: "Foundation Establishment", sub_stages: ["Early", "Mid", "Late", "Peak"] },
    { name: "Core Formation", sub_stages: ["Early", "Mid", "Late", "Peak"] },
    { name: "Nascent Soul", sub_stages: ["Early", "Mid", "Late", "Peak"] },
    { name: "Soul Formation", sub_stages: ["Early", "Mid", "Late", "Peak"] },
    { name: "Soul Transformation", sub_stages: ["Early", "Mid", "Late", "Peak"] },
    { name: "Ascendant", sub_stages: ["Illusory Ying", "Corporeal Yang"] },
    { name: "Nirvana Shattering", sub_stages: ["Nirvana Scryer", "Nirvana Cleanser", "Nirvana Shatterer"] },
];

const BASE_QI_REQUIREMENTS = [
    100, 200, 350, 550, 800, 1100, 1500, 2000, 2600,
    3300, 4100, 5000, 6000,
    8000, 12000, 18000, 28000,
    40000, 60000, 85000, 120000,
    180000, 280000, 420000, 650000,
    950000, 1400000, 2100000, 3200000,
    4800000, 7200000, 11000000,
    16000000, 25000000, 40000000
];

class CultivationSystem {
    constructor() {
        this.rankIndex = 0;
        this.subIndex = 0;
    }

    get currentRank() { return CULTIVATION_RANKS[this.rankIndex]; }
    get currentSubStage() { return this.currentRank.sub_stages[this.subIndex]; }
    get displayName() { return `${this.currentRank.name} - ${this.currentSubStage}`; }

    getQiRequirement() {
        let total = 0;
        for (let i = 0; i < this.rankIndex; i++) {
            total += CULTIVATION_RANKS[i].sub_stages.length;
        }
        total += this.subIndex;
        if (total >= BASE_QI_REQUIREMENTS.length) {
            return BASE_QI_REQUIREMENTS[BASE_QI_REQUIREMENTS.length - 1] * (1 + Math.floor((total - BASE_QI_REQUIREMENTS.length + 1) / 2));
        }
        return BASE_QI_REQUIREMENTS[total];
    }

    breakthrough(currentQi, talentModifier = 1.0) {
        const required = this.getQiRequirement();
        if (currentQi < required) {
            return [false, `Need ${required} Qi (have ${currentQi})`];
        }

        const difficulty = (this.rankIndex * 10 + this.subIndex) * talentModifier;
        const success = (50 / (50 + difficulty)) > 0.15;

        if (success) {
            this.subIndex++;
            if (this.subIndex >= this.currentRank.sub_stages.length) {
                this.subIndex = 0;
                this.rankIndex++;
                if (this.rankIndex >= CULTIVATION_RANKS.length) {
                    this.rankIndex = CULTIVATION_RANKS.length - 1;
                    return [true, "You have reached the peak of cultivation!"];
                }
            }
            return [true, `Breakthrough successful! You are now at ${this.displayName}`];
        }
        return [false, "Breakthrough failed. Your foundation is not solid enough. Keep cultivating."];
    }

    qiPerMeditation(talentLevel) {
        const base = 5;
        const multiplier = {
            Heavenly: 3.0, Earth: 2.0, Profound: 1.5, Mortal: 1.0, Crippled: 0.5,
        };
        return Math.floor(base * (multiplier[talentLevel] || 1.0));
    }
}

module.exports = { CULTIVATION_RANKS, CultivationSystem };
