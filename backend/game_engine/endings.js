const ENDINGS = {
    heavenly_ascension: {
        id: "heavenly_ascension",
        title: "Heavenly Ascension",
        rank: 1,
        requirement: (p) => {
            return p.cultivation.rankIndex >= 7
                && p.faction.transcendent >= 30
                && p.flags.sage_legacy_claimed;
        },
        text: "You have walked the path of the Heaven-Defying Sage himself. "
            + "With the Sage's legacy in hand and your cultivation at the peak of mortal limits, "
            + "the heavens themselves tremble before you.\n\n"
            + "A celestial rift opens above. Light pours down, and you feel the pull of a higher realm. "
            + "As you ascend, you look back one last time at the world that forged you.\n\n"
            + "The mortals below whisper your name. Generations will tell tales of the one "
            + "who defied heaven and won.\n\n"
            + "You have transcended the mortal plane. The path of immortality is yours.",
    },
    righteous_paragon: {
        id: "righteous_paragon",
        title: "Righteous Paragon",
        rank: 2,
        requirement: (p) => {
            return p.faction.righteous >= 50
                && p.flags.inner_disciple
                && p.quests.completed && p.quests.completed.beast_hunt;
        },
        text: "You stand at the peak of Azure Peaks Sect, having risen from humble origins "
            + "to become its greatest protector.\n\n"
            + "The sect elders bow to you. The villagers you saved cheer your name. "
            + "The demonic cults flee at the mere mention of your presence.\n\n"
            + "Under your leadership, the Azure Peaks Sect enters a golden age. "
            + "Disciples flock from across the land. Peace returns to the region.\n\n"
            + "You have become a legend \u2014 a beacon of righteousness in a dark world. "
            + "The path of the righteous cultivator is complete.",
    },
    demonic_overlord: {
        id: "demonic_overlord",
        title: "Demonic Overlord",
        rank: 2,
        requirement: (p) => {
            return p.faction.demonic >= 50
                && p.flags.soul_banner_info
                && p.combatKills >= 5;
        },
        text: "Power respects only power. You have learned this lesson well.\n\n"
            + "The Soul Banner cult kneels before you. The righteous sects have fallen. "
            + "The Flying Head Elder's techniques are now yours.\n\n"
            + "You sit upon a throne of skulls, the air thick with the scent of blood and Qi. "
            + "The world trembles at your name.\n\n"
            + "But as you gaze upon your domain, you wonder \u2014 was the price worth it? "
            + "The faces of those you sacrificed haunt the edges of your vision.\n\n"
            + "The demonic path is lonely at the top. But the power... the power is undeniable.",
    },
    mortal_sage: {
        id: "mortal_sage",
        title: "Mortal Sage",
        rank: 3,
        requirement: (p) => {
            return p.cultivation.rankIndex >= 5 && p.faction.transcendent >= 20;
        },
        text: "You have reached a profound understanding of the dao. "
            + "Not through conflict, not through domination, but through understanding.\n\n"
            + "You sit upon a mountain peak, overlooking the world you have traveled. "
            + "Every life you touched, every battle you fought, every technique you mastered "
            + "\u2014 all of it was part of the dao.\n\n"
            + "You smile. The questions that once plagued you no longer matter. "
            + "You are at peace.\n\n"
            + "Your name may not be remembered in history books, but the wind "
            + "will carry your wisdom to those who need it. The dao continues.",
    },
    seeker_of_truth: {
        id: "seeker_of_truth",
        title: "Seeker of Truth",
        rank: 4,
        requirement: (p) => {
            return p.faction.transcendent >= 40
                && p.flags.hermit_sage_info
                && p.flags.saw_rune_vision;
        },
        text: "The world is not what it seems. You have peeled back the layers of reality "
            + "and glimpsed the truth beneath.\n\n"
            + "The ancient runes at Misty Falls, the hermit's cryptic words, "
            + "the Sage's legacy \u2014 all pieces of a greater puzzle.\n\n"
            + "You understand now. The path of cultivation is not about power. "
            + "It is about awakening.\n\n"
            + "You vanish from the world, not in death, but in understanding. "
            + "Some say you became the mountain mist. Others say you found the dao itself.\n\n"
            + "The truth is known only to you.",
    },
    wandering_hero: {
        id: "wandering_hero",
        title: "Wandering Hero",
        rank: 5,
        requirement: (p) => {
            return p.faction.righteous >= 20 || (p.quests.completed && p.quests.completed.beast_hunt);
        },
        text: "Your journey has been one of quiet heroism. You helped those in need, "
            + "fought when you had to, and walked your own path.\n\n"
            + "You never sought power for its own sake, nor did you bow to darkness. "
            + "You simply... walked.\n\n"
            + "The world is safer because of you. The people remember your kindness. "
            + "And somewhere, a boy you once taught gathers Qi beneath the stars.\n\n"
            + "It was a good journey.",
    },
    fallen_hero: {
        id: "fallen_hero",
        title: "Fallen Hero",
        rank: 6,
        requirement: (p) => {
            return p.faction.demonic >= 20;
        },
        text: "The path of cultivation is littered with those who lost their way.\n\n"
            + "You started with good intentions. But power corrupts, "
            + "and the demonic path offered shortcuts you could not refuse.\n\n"
            + "Now you wander the land, feared by those who once respected you. "
            + "Your techniques are stained with the blood of the innocent.\n\n"
            + "Perhaps there is still time to turn back. Or perhaps... this is who you are now.",
    },
    default: {
        id: "default",
        title: "The Wanderer's End",
        rank: 99,
        requirement: () => true,
        text: "Your journey on the path of immortality has come to an end.\n\n"
            + "Not with a bang, but with a quiet step off the path. "
            + "You lived, you fought, you cultivated. And now, you rest.\n\n"
            + "The world continues to turn. New cultivators will rise. "
            + "New legends will be written.\n\n"
            + "But your story \u2014 your small, honest story \u2014 "
            + "will be remembered by those who walked beside you.\n\n"
            + "And perhaps, in another life, you will walk the path again.",
    },
};

function evaluateEnding(player) {
    const sorted = Object.values(ENDINGS).sort((a, b) => a.rank - b.rank);
    for (const ending of sorted) {
        if (ending.id === "default") continue;
        try {
            if (ending.requirement(player)) return { ...ending };
        } catch (e) {
            continue;
        }
    }
    return { ...ENDINGS.default };
}

function getFactionLabel(faction) {
    const r = faction.righteous || 0;
    const d = faction.demonic || 0;
    const t = faction.transcendent || 0;
    if (r >= d && r >= t && r >= 10) return { label: "Righteous", value: r, color: "#4488cc" };
    if (d >= r && d >= t && d >= 10) return { label: "Demonic", value: d, color: "#cc3344" };
    if (t >= r && t >= d && t >= 10) return { label: "Transcendent", value: t, color: "#c9a84c" };
    return { label: "Neutral", value: 0, color: "#888" };
}

module.exports = { ENDINGS, evaluateEnding, getFactionLabel };
