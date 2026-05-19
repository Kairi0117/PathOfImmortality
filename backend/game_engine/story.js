class Scene {
    constructor(sceneId, title, text, choices = [], effects = {}, combat = null) {
        this.sceneId = sceneId;
        this.title = title;
        this.text = text;
        this.choices = choices;
        this.effects = effects;
        this.combat = combat;
    }

    toDict() {
        return { scene_id: this.sceneId, title: this.title, text: this.text, choices: this.choices, effects: this.effects };
    }
}

class StoryEngine {
    constructor() {
        this.scenes = {};
        this.locationEntryScenes = {
            cloud_wind_village: "cloud_wind_village",
            azure_mountains: "azure_mountains_entry",
            misty_falls: "misty_falls_entry",
            hidden_cave: "hidden_cave_entrance",
            eastern_road: "eastern_road_entry",
            zhao_city: "zhao_city_entry",
            azure_peaks_sect: "sect_gate",
        };
        this._build();
    }

    getLocationScene(locationId) {
        const sceneId = this.locationEntryScenes[locationId] || locationId;
        return this.getScene(sceneId);
    }

    _build() {
        this._buildIntro();
        this._buildCloudWindVillage();
        this._buildAzureMountains();
        this._buildMistyFalls();
        this._buildHiddenCaveDungeon();
        this._buildEasternRoad();
        this._buildZhaoCity();
        this._buildAzurePeaksSect();
        this._buildBeastHuntQuest();
        this._buildNPCs();
    }

    // ── INTRO ──
    _buildIntro() {
        this.scenes["intro"] = new Scene(
            "intro", "The Path of Immortality",
            "The world is vast, and the path to immortality is fraught with danger and opportunity.\n\n"
            + "Legends speak of cultivators who can move mountains, split rivers, and live for millennia. "
            + "But you \u2014 you are nothing. A mortal. An ant beneath the feet of the immortals.\n\n"
            + "Yet the dao is fair. Even the smallest ant can one day shake the heavens.\n\n"
            + "Your journey begins now.",
            [{ text: "Begin your journey", action: "start" }],
            { type: "fade_in", music: "intro" }
        );
    }

    // ── CLOUD WIND VILLAGE ──
    _buildCloudWindVillage() {
        this.scenes["cloud_wind_village"] = new Scene(
            "cloud_wind_village", "Cloud Wind Village",
            "You stand at the edge of Cloud Wind Village, a small settlement nestled between misty mountains.\n\n"
            + "The villagers go about their day \u2014 farmers tending fields, merchants hawking wares, "
            + "children playing with wooden swords. The smell of rice porridge drifts from a nearby home.\n\n"
            + "An old storyteller sits beneath a willow tree, regaling a crowd with tales of immortal cultivators "
            + "who soar through the skies on flying swords.",
            [
                { text: "Listen to the storyteller", action: "storyteller" },
                { text: "Train in the mountains", action: "train_mountains" },
                { text: "Explore the village", action: "explore_village" },
                { text: "Rest at the inn", action: "rest_village" },
            ]
        );

        this.scenes["storyteller"] = new Scene(
            "storyteller", "The Storyteller\u2019s Tale",
            "The old man\u2019s eyes twinkle as he speaks.\n\n"
            + "\u201cAh, young one, I see the fire in your eyes. You wish to walk the path of cultivation?\u201d\n\n"
            + "He strokes his beard and continues:\n\n"
            + "\u201cA thousand years ago, the Heaven-Defying Sage rose from these very lands. "
            + "He was born with a crippled spirit root \u2014 no talent at all! But through sheer will, "
            + "he shattered his limits and ascended to the Celestial Realm.\u201d\n\n"
            + "He leans in close.\n\n"
            + "\u201cThey say there is a hidden cave in the Azure Mountains where he left his legacy... "
            + "but it is guarded by a demonic beast.\u201d",
            [
                { text: "Ask more about the cave", action: "cave_rumor" },
                { text: "Go train in the mountains", action: "train_mountains" },
                { text: "Stay in the village and rest", action: "rest_village" },
            ]
        );

        this.scenes["cave_rumor"] = new Scene(
            "cave_rumor", "The Hidden Cave",
            "The storyteller chuckles.\n\n"
            + "\u201cThe cave lies beyond the Misty Falls, three days east of here. "
            + "Many have sought it. Few have returned.\u201d\n\n"
            + "He takes a sip of tea.\n\n"
            + "\u201cBut if you are serious about cultivation, you will need more than rumors. "
            + "You need a technique. You need Qi. And most of all... you need luck.\u201d\n\n"
            + "He hands you a worn jade slip.\n\n"
            + "\u201cThis contains a basic Qi gathering technique. It is not much, but it is a start.\u201d",
            [
                { text: "Accept the jade slip and meditate (+50 Qi)", action: "gain_technique" },
                { text: "Decline \u2014 you will find your own path", action: "proud_path" },
                { text: "Head to the Azure Mountains immediately", action: "travel_azure_mountains" },
            ],
            { qi_gain: 50, technique: "Basic Qi Gathering" }
        );

        this.scenes["explore_village"] = new Scene(
            "explore_village", "Village Exploration",
            "You wander through Cloud Wind Village, taking in the sights.\n\n"
            + "A merchant sells spirit herbs at a stall. A blacksmith hammers away at a blade. "
            + "A young boy practices a martial form by the river. "
            + "A sect recruiter pins a notice to the board.\n\n"
            + "Near the village square, a notice board catches your eye:\n\n"
            + "WANTED: Iron-fanged boar spotted near Misty Falls. Reward: 500 gold "
            + "& 1 Foundation Pill. Apply at the Village Elder\u2019s hall.",
            [
                { text: "Visit the Village Elder", action: "village_elder" },
                { text: "Buy spirit herbs (10 gold)", action: "buy_herbs" },
                { text: "Watch the boy practice martial arts", action: "watch_martial" },
                { text: "Talk to the sect recruiter", action: "sect_recruiter" },
                { text: "Visit the blacksmith", action: "village_blacksmith" },
            ]
        );

        this.scenes["village_elder"] = new Scene(
            "village_elder", "The Village Elder",
            "The Village Elder is an old woman with sharp eyes and a calm demeanor. "
            + "She looks you up and down.\n\n"
            + "\u201cYou are the one asking about immortal paths, are not you?\u201d\n\n"
            + "She sighs.\n\n"
            + "\u201cThe world beyond this village is dangerous. Demonic cultivators hunt "
            + "the weak. Beasts feast on careless travelers. And sects... sects only take "
            + "those with talent.\u201d\n\n"
            + "She holds your gaze.\n\n"
            + "\u201cBut if you insist on walking this path, I will not stop you. "
            + "There is a sect recruiting in the eastern province \u2014 the Azure Peaks Sect. "
            + "It is not the most prestigious, but it is a door.\u201d\n\n"
            + "\u201cOr... you could answer that beast extermination request. Make a name for yourself.\u201d",
            [
                { text: "Head to Azure Peaks Sect", action: "travel_azure_peaks_sect" },
                { text: "Take the beast extermination quest", action: "beast_quest_accept" },
                { text: "Stay and cultivate in the village", action: "train_mountains" },
            ]
        );

        this.scenes["rest_village"] = new Scene(
            "rest_village", "Resting in the Village",
            "You find a quiet inn and rest for the night. "
            + "The simple life has its charms.\n\n"
            + "In the morning, you feel refreshed. (+20 HP restored)",
            [
                { text: "Start your day", action: "cloud_wind_village" },
            ],
            { heal: 20 }
        );

        this.scenes["train_mountains"] = new Scene(
            "train_mountains", "Cultivation in the Mountains",
            "You find a quiet spot among the bamboo groves on the mountain slope. "
            + "Sitting cross-legged, you close your eyes and try to sense the Qi "
            + "flowing through the world around you.\n\n"
            + "At first, there is nothing but the wind and the birdsong.\n\n"
            + "But then \u2014 a faint warmth. A gentle current through your dantian. "
            + "You have taken your first step on the path of cultivation.",
            [
                { text: "Continue meditating", action: "continue_meditate" },
                { text: "Return to the village", action: "cloud_wind_village" },
                { text: "Practice what you have learned", action: "practice_technique" },
            ],
            { type: "meditation_scene", qi_multiplier: 2 }
        );

        this.scenes["continue_meditate"] = new Scene(
            "continue_meditate", "Deep Meditation",
            "You sink deeper into meditation. The world fades away.\n\n"
            + "Qi flows into your dantian like a river returning to the sea. "
            + "You feel yourself growing stronger.",
            [
                { text: "Keep going", action: "train_mountains" },
                { text: "Return to the village", action: "cloud_wind_village" },
            ]
        );

        this.scenes["practice_technique"] = new Scene(
            "practice_technique", "Practice",
            "You spend hours practicing your techniques. "
            + "Sweat drips down your face as you repeat the forms over and over.\n\n"
            + "Your movements grow sharper. Your Qi flows more smoothly.",
            [
                { text: "Continue training", action: "train_mountains" },
                { text: "Return to the village", action: "cloud_wind_village" },
            ],
            { qi: 15 }
        );

        this.scenes["proud_path"] = new Scene(
            "proud_path", "Your Own Path",
            "You refuse the storyteller\u2019s gift. Your path will be your own.\n\n"
            + "The old man shrugs. \u201cPride is a double-edged sword, young one. "
            + "It may cut your enemies... or it may cut you.\u201d\n\n"
            + "You head into the mountains to find your own way.",
            [
                { text: "Meditate to sense Qi", action: "train_mountains" },
            ]
        );

        this.scenes["watch_martial"] = new Scene(
            "watch_martial", "Martial Practice",
            "You watch the boy practice his forms. His movements are crude but earnest.\n\n"
            + "He notices you watching and beams.\n\n"
            + "\u201cMister! You look like a cultivator! Can you teach me a technique?\u201d\n\n"
            + "You smile. You remember being that young, that eager.",
            [
                { text: "Teach him a basic technique (lose: Qi Gathering)", action: "teach_technique" },
                { text: "Decline and head back", action: "cloud_wind_village" },
            ]
        );

        this.scenes["teach_technique"] = new Scene(
            "teach_technique", "A Young Disciple",
            "The boy\u2019s eyes light up as you guide him through the Qi Gathering technique.\n\n"
            + "He fumbles at first, but after a few tries, a faint glow surrounds his hands.\n\n"
            + "\u201cI did it! Mister, thank you!\u201d\n\n"
            + "You feel a warm sense of purpose. Passing on knowledge is its own form of immortality.",
            [
                { text: "Return to the village", action: "cloud_wind_village" },
                { text: "Head to the mountains to train", action: "train_mountains" },
            ]
        );
    }

    // ── AZURE MOUNTAINS ──
    _buildAzureMountains() {
        this.scenes["azure_mountains_entry"] = new Scene(
            "azure_mountains_entry", "Azure Mountains",
            "The Azure Mountains rise before you, their peaks disappearing into the clouds. "
            + "Spirit energy flows thick here. Ancient trees tower overhead, "
            + "their roots weaving through cliffs rich with spiritual ore.\n\n"
            + "The wind carries the distant roar of a waterfall. "
            + "This place is alive with Qi.",
            [
                { text: "Explore deeper into the mountains", action: "azure_mountains_deep" },
                { text: "Search for spirit herbs", action: "azure_herbs" },
                { text: "Return to Cloud Wind Village", action: "travel_cloud_wind_village" },
            ]
        );

        this.scenes["azure_mountains_deep"] = new Scene(
            "azure_mountains_deep", "Mountain Depths",
            "You venture deeper into the Azure Mountains. The mist thickens. "
            + "The sounds of civilisation fade entirely.\n\n"
            + "A narrow path leads to a cliffside cave. Faint spiritual light "
            + "pulses from within.\n\n"
            + "Suddenly, a Shadow Viper drops from the canopy above!",
            [
                { text: "Fight the viper!", action: "combat:shadow_viper" },
                { text: "Dodge into the cave", action: "hidden_cave_entrance" },
                { text: "Flee back", action: "cloud_wind_village" },
            ]
        );

        this.scenes["azure_herbs"] = new Scene(
            "azure_herbs", "Gathering Spirit Herbs",
            "You search the mountain slopes for spiritual herbs. "
            + "After an hour of careful hunting, you find a patch of Azure Grass "
            + "growing beneath an ancient pine.\n\n"
            + "You gather several stalks. They pulse with gentle Qi.",
            [
                { text: "Return to the village entrance", action: "azure_mountains_entry" },
                { text: "Keep exploring deeper", action: "azure_mountains_deep" },
            ],
            { items: ["Azure Grass"], message: "Gathered Azure Grass. It can be used for pill refining." }
        );
    }

    // ── MISTY FALLS ──
    _buildMistyFalls() {
        this.scenes["misty_falls_entry"] = new Scene(
            "misty_falls_entry", "Misty Falls",
            "A magnificent waterfall cascades from a height that seems to touch the heavens. "
            + "The mist carries dense spiritual energy, making every breath a meditation.\n\n"
            + "Rainbows dance in the spray. Ancient stone formations surround the pool below, "
            + "carved with faded runes. This is a place of power.",
            [
                { text: "Meditate beneath the waterfall", action: "misty_meditate" },
                { text: "Examine the ancient runes", action: "misty_runes" },
                { text: "Search for the hidden cave entrance", action: "hidden_cave_entrance" },
                { text: "Return to the village", action: "travel_cloud_wind_village" },
            ]
        );

        this.scenes["misty_meditate"] = new Scene(
            "misty_meditate", "Waterfall Meditation",
            "You sit beneath the cascading water, letting the freezing torrent "
            + "crash against your shoulders. The pain fades as Qi floods into your dantian.\n\n"
            + "The water carries spiritual energy from the mountain peaks above. "
            + "Each drop is a tiny infusion of power.\n\n"
            + "You feel significantly stronger.",
            [
                { text: "Continue meditating", action: "misty_meditate" },
                { text: "Examine the runes", action: "misty_runes" },
                { text: "Return to the falls edge", action: "misty_falls_entry" },
            ],
            { qi: 30 }
        );

        this.scenes["misty_runes"] = new Scene(
            "misty_runes", "Ancient Runes",
            "You trace your fingers over the weathered stone runes. They are ancient \u2014 "
            + "predating the Azure Peaks Sect by millennia.\n\n"
            + "One rune glows as you touch it, and a vision flashes through your mind: "
            + "a figure in white robes standing at the cave entrance beyond the falls, "
            + "a key of light in their hand.\n\n"
            + "The rune fades. But you remember the image clearly.",
            [
                { text: "Look for the cave behind the waterfall", action: "hidden_cave_entrance" },
                { text: "Meditate on what you saw", action: "misty_meditate" },
                { text: "Return to the village", action: "travel_cloud_wind_village" },
            ],
            { flag: "saw_rune_vision" }
        );
    }

    // ── HIDDEN CAVE DUNGEON ──
    _buildHiddenCaveDungeon() {
        this.scenes["hidden_cave_entrance"] = new Scene(
            "hidden_cave_entrance", "Hidden Cave Entrance",
            "You stand before the entrance of the Hidden Cave. Ancient runes glow "
            + "faintly on the stone walls, pulsing like a heartbeat.\n\n"
            + "The air hums with millennia-old formation arrays. The passage splits "
            + "into three paths ahead:\n\n"
            + "Left \u2014 a corridor lined with pressure plates and arrow slits.\n"
            + "Right \u2014 a narrow passage that glows with a warm golden light.\n"
            + "Forward \u2014 the main hall, where a deep roar echoes from within.",
            [
                { text: "Take the left passage (traps)", action: "hidden_cave_traps" },
                { text: "Take the right passage (treasure)", action: "hidden_cave_treasure" },
                { text: "March forward (boss)", action: "hidden_cave_boss" },
                { text: "Leave the cave", action: "travel_cloud_wind_village" },
            ]
        );

        this.scenes["hidden_cave_traps"] = new Scene(
            "hidden_cave_traps", "Trap Corridor",
            "You step carefully into the left corridor. The floor tiles shift beneath your feet.\n\n"
            + "Arrows fly from the walls! You throw yourself to the side, "
            + "but one grazes your arm.\n\n"
            + "At the end of the corridor, you find a small chamber with a stone pedastal. "
            + "A jade scroll rests upon it.",
            [
                { text: "Take the jade scroll and continue", action: "hidden_cave_treasure" },
                { text: "Retreat and take the right passage", action: "hidden_cave_treasure" },
                { text: "Head forward to the main hall", action: "hidden_cave_boss" },
            ],
            { damage: 15, items: ["Ancient Scroll"], message: "You lose 15 HP to the traps but find an ancient scroll!" }
        );

        this.scenes["hidden_cave_treasure"] = new Scene(
            "hidden_cave_treasure", "Treasure Chamber",
            "The right passage opens into a small chamber filled with ancient treasures. "
            + "Gold coins are scattered across the floor. Spirit stones pulse with "
            + "stored energy. A jade bottle sits on an altar.\n\n"
            + "But a guardian \u2014 a Wood Elemental animated by formation energy \u2014 "
            + "rises from the floor to defend the hoard!",
            [
                { text: "Fight the guardian!", action: "combat:wood_elemental" },
                { text: "Grab what you can and flee", action: "hidden_cave_entrance" },
            ]
        );

        this.scenes["hidden_cave_boss"] = new Scene(
            "hidden_cave_boss", "Guardian Beast\u2019s Lair",
            "The main hall opens into a vast cavern. At its center, a massive beast \u2014 "
            + "part lion, part serpent, covered in scales that shimmer with formation light \u2014 "
            + "turns its gaze toward you.\n\n"
            + "This is the Guardian Beast, tasked with protecting the Sage\u2019s legacy.\n\n"
            + "Its roar shakes the very foundations of the mountain.",
            [
                { text: "Face the Guardian Beast!", action: "combat:guardian_beast" },
                { text: "Retreat while you can", action: "hidden_cave_entrance" },
            ]
        );

        this.scenes["hidden_cave_legacy"] = new Scene(
            "hidden_cave_legacy", "The Sage\u2019s Legacy",
            "Beyond the guardian\u2019s lair, a final chamber shimmers with starlight.\n\n"
            + "At its center, a skeleton sits in lotus position, wearing tattered white robes. "
            + "A jade slip rests in its lap.\n\n"
            + "A voice echoes in your mind:\n\n"
            + "\u201cThis one has waited long for a worthy inheritor. "
            + "Take my technique, and may it serve you better than it served me.\u201d\n\n"
            + "The jade slip contains the Heaven-Defying Palm technique, "
            + "a legendary skill that ignores all defenses.",
            [
                { text: "Learn the Heaven-Defying Palm and leave", action: "hidden_cave_exit" },
            ],
            { technique: "Heaven-Defying Palm", qi: 200, flag: "sage_legacy_claimed" }
        );

        this.scenes["hidden_cave_exit"] = new Scene(
            "hidden_cave_exit", "Leaving the Cave",
            "You emerge from the Hidden Cave, blinking in the sunlight. "
            + "The runes at the entrance have gone dark, their purpose fulfilled.\n\n"
            + "You are richer in both treasure and knowledge. The path of cultivation "
            + "stretches before you.",
            [
                { text: "Return to Cloud Wind Village", action: "travel_cloud_wind_village" },
                { text: "Head to Azure Peaks Sect", action: "travel_azure_peaks_sect" },
                { text: "Meditate to consolidate your gains", action: "train_mountains" },
            ],
            { gold: 300, message: "You found 300 gold in the cave." }
        );
    }

    // ── EASTERN ROAD ──
    _buildEasternRoad() {
        this.scenes["eastern_road_entry"] = new Scene(
            "eastern_road_entry", "Eastern Road",
            "The Eastern Road stretches across the plains, connecting Cloud Wind Village "
            + "to Zhao City. Merchants, travelers, and sect disciples pass along this route.\n\n"
            + "The road is well-maintained but still dangerous \u2014 bandits and rogue cultivators "
            + "prey on the unwary.",
            [
                { text: "Travel toward Zhao City", action: "travel_zhao_city" },
                { text: "Head back to the village", action: "travel_cloud_wind_village" },
                { text: "Search for herbs along the roadside", action: "road_herbs" },
            ]
        );

        this.scenes["road_herbs"] = new Scene(
            "road_herbs", "Roadside Gathering",
            "You search the roadside ditches and find some common medicinal herbs. "
            + "Nothing special, but they might be useful.",
            [
                { text: "Continue to Zhao City", action: "travel_zhao_city" },
                { text: "Return to the village", action: "travel_cloud_wind_village" },
            ],
            { items: ["Medicinal Herb"], message: "Gathered some common herbs." }
        );
    }

    // ── ZHAO CITY ──
    _buildZhaoCity() {
        this.scenes["zhao_city_entry"] = new Scene(
            "zhao_city_entry", "Zhao City",
            "Zhao City is the largest settlement in the region, a bustling metropolis "
            + "under the Zhao Kingdom. The streets are crowded with merchants, "
            + "cultivators, scholars, and soldiers.\n\n"
            + "Market stalls line every street, selling spirit herbs, pills, "
            + "weapons, and techniques. The Sect Recruitment Hall stands in the "
            + "central plaza.",
            [
                { text: "Visit the market", action: "zhao_market" },
                { text: "Go to the Sect Recruitment Hall", action: "sect_gate" },
                { text: "Look for work at the Adventurer\u2019s Guild", action: "zhao_guild" },
                { text: "Visit the Refining Master", action: "refining_master" },
                { text: "Rest at an inn", action: "zhao_inn" },
            ]
        );

        this.scenes["zhao_market"] = new Scene(
            "zhao_market", "Zhao City Market",
            "The market is a riot of colors, sounds, and spiritual energy. "
            + "A merchant waves you over to his stall.\n\n"
            + "\u201cYoung cultivator! You look like you could use some supplies. "
            + "I have Qi Condensation Pills, spirit herbs, and even a few technique scrolls!\u201d",
            [
                { text: "Buy a Qi Pill (50 gold) - restores 30 HP", action: "buy_qi_pill" },
                { text: "Buy a Spirit Herb (20 gold) - +10 Qi", action: "buy_herb_city" },
                { text: "Browse technique scrolls (200 gold)", action: "buy_technique_scroll" },
                { text: "Leave the market", action: "zhao_city_entry" },
            ]
        );

        this.scenes["zhao_guild"] = new Scene(
            "zhao_guild", "Adventurer\u2019s Guild",
            "The Adventurer\u2019s Guild is a noisy hall filled with mercenaries and rogue cultivators. "
            + "A mission board covers the far wall.\n\n"
            + "A scarred woman at the counter grunts as you approach.\n\n"
            + "\u201cNew face. Looking for work?\u201d",
            [
                { text: "Take a monster extermination mission", action: "guild_monster_hunt" },
                { text: "Ask about information on the Azure Peaks Sect", action: "guild_info" },
                { text: "Leave", action: "zhao_city_entry" },
            ]
        );

        this.scenes["guild_monster_hunt"] = new Scene(
            "guild_monster_hunt", "Guild Hunt",
            "The mission is to clear a den of Corpse Puppets near an abandoned village "
            + "west of the city. Decent pay for decent work.\n\n"
            + "You head out and find the den. A Corpse Puppet shambles toward you.",
            [
                { text: "Engage the Corpse Puppet!", action: "combat:corpse_puppet" },
                { text: "This is too dangerous. Report back.", action: "zhao_city_entry" },
            ]
        );

        this.scenes["guild_info"] = new Scene(
            "guild_info", "Guild Information",
            "The woman snorts.\n\n"
            + "\u201cAzure Peaks? Middle-ranked sect. They take anyone who passes "
            + "their entry trial. Good if you want a roof over your head and "
            + "access to techniques. Bad if you want freedom.\u201d\n\n"
            + "She shrugs.\n\n"
            + "\u201cWord is, their Inner Disciple trials are coming up next month. "
            + "If you hurry, you might make it.\u201d",
            [
                { text: "Head to Azure Peaks Sect", action: "travel_azure_peaks_sect" },
                { text: "Stay in Zhao City", action: "zhao_city_entry" },
            ]
        );

        this.scenes["zhao_inn"] = new Scene(
            "zhao_inn", "City Inn",
            "You rent a room at the Jade Lotus Inn. The bed is soft, the food is good, "
            + "and for a few hours, you forget the dangers of the cultivation path.\n\n"
            + "You wake refreshed. (+40 HP restored)",
            [
                { text: "Start your day in Zhao City", action: "zhao_city_entry" },
            ],
            { heal: 40 }
        );
    }

    // ── AZURE PEAKS SECT ──
    _buildAzurePeaksSect() {
        this.scenes["sect_gate"] = new Scene(
            "sect_gate", "Azure Peaks Sect Gate",
            "The Azure Peaks Sect sprawls across seven mountain peaks, each connected "
            + "by floating stone bridges. The main gate is a massive arch of white jade, "
            + "inscribed with formation characters that shimmer in the sunlight.\n\n"
            + "Two Outer Disciples stand guard at the gate. One steps forward.\n\n"
            + "\u201cState your business at the Azure Peaks Sect.\u201d",
            [
                { text: "I wish to join the sect", action: "sect_entry_trial" },
                { text: "I am just passing through", action: "sect_pass_through" },
                { text: "Return to Cloud Wind Village", action: "travel_cloud_wind_village" },
            ]
        );

        this.scenes["sect_pass_through"] = new Scene(
            "sect_pass_through", "Passing Through",
            "The guard nods. \u201cVisitors are allowed in the outer courtyard only. "
            + "Do not wander into the inner peaks.\u201d\n\n"
            + "You pass through the gate and see the sect\u2019s outer court. "
            + "Disciples practice techniques in the training ground. "
            + "Elders walk with purpose. The sound of bell chimes fills the air.",
            [
                { text: "Watch the disciples train", action: "sect_observe_training" },
                { text: "Reconsider and apply to join", action: "sect_entry_trial" },
                { text: "Leave the sect grounds", action: "travel_zhao_city" },
            ]
        );

        this.scenes["sect_observe_training"] = new Scene(
            "sect_observe_training", "Training Grounds",
            "You watch the Outer Disciples practice their forms. Their techniques "
            + "are refined and precise \u2014 clearly the product of disciplined instruction.\n\n"
            + "An instructor notices you watching.\n\n"
            + "\u201cIf you wish to learn, you must join. Watching from the outside "
            + "will only get you so far.\u201d",
            [
                { text: "Apply to join the sect", action: "sect_entry_trial" },
                { text: "Leave", action: "travel_zhao_city" },
            ]
        );

        this.scenes["sect_entry_trial"] = new Scene(
            "sect_entry_trial", "Entry Trial",
            "The guard leads you to a training arena where an Outer Disciple "
            + "awaits with a wooden sword.\n\n"
            + "\u201cThe trial is simple: prove you have basic combat ability. "
            + "Defeat this disciple in sparring, and you may enter.\u201d\n\n"
            + "The disciple bows and assumes a combat stance.",
            [
                { text: "Accept the trial!", action: "combat:sect_disciple" },
                { text: "I am not ready yet", action: "sect_gate" },
            ]
        );

        this.scenes["sect_outer_disciple"] = new Scene(
            "sect_outer_disciple", "Outer Disciple",
            "You have been accepted as an Outer Disciple of the Azure Peaks Sect!\n\n"
            + "The guard hands you a sect token and a basic robe.\n\n"
            + "\u201cReport to the Outer Disciple dormitory. Your duties include "
            + "chores, guard rotations, and maintaining the sect grounds. "
            + "In exchange, you may attend lectures and use the basic training facilities.\u201d\n\n"
            + "As an Outer Disciple, you have access to the sect\u2019s resources, "
            + "but true power lies with the Inner Disciples.",
            [
                { text: "Explore the sect grounds", action: "sect_explore" },
                { text: "Visit the technique library", action: "sect_library" },
                { text: "Check the mission board", action: "sect_missions" },
                { text: "Train in the disciple courtyard", action: "sect_train" },
            ],
            { flag: "joined_sect", reputation: 20 }
        );

        this.scenes["sect_explore"] = new Scene(
            "sect_explore", "Sect Grounds",
            "You wander through the Azure Peaks Sect\u2019s seven peaks. "
            + "Each peak has a purpose:\n\n"
            + "Peak One \u2014 Administration and Elders\u2019 Hall\n"
            + "Peak Two \u2014 Outer Disciple dormitories and training\n"
            + "Peak Three \u2014 Inner Disciple quarters and advanced training\n"
            + "Peak Four \u2014 Technique Library and Meditation Chambers\n"
            + "Peak Five \u2014 Alchemy Hall and Spirit Herb Gardens\n"
            + "Peak Six \u2014 Mission Hall and Guest Quarters\n"
            + "Peak Seven \u2014 Sect Leader\u2019s Peak (restricted)\n\n"
            + "The spiritual energy here is far denser than in the outside world.",
            [
                { text: "Visit the technique library", action: "sect_library" },
                { text: "Check the mission board", action: "sect_missions" },
                { text: "Train in the courtyard", action: "sect_train" },
            ]
        );

        this.scenes["sect_library"] = new Scene(
            "sect_library", "Technique Library",
            "The sect library is a towering pagoda filled with scrolls, "
            + "jade slips, and ancient tomes. An elderly librarian sits at the entrance.\n\n"
            + "\u201cOuter Disciples may access the first two floors. "
            + "Techniques on the third floor and above require Elder permission.\u201d\n\n"
            + "You browse the shelves and find a technique that suits you.",
            [
                { text: "Study a basic technique", action: "sect_learn_basic" },
                { text: "Study a common technique (requires 100 Qi)", action: "sect_learn_common" },
                { text: "Leave the library", action: "sect_explore" },
            ]
        );

        this.scenes["sect_learn_basic"] = new Scene(
            "sect_learn_basic", "Learning Basics",
            "You study a basic technique scroll. The knowledge flows into your mind "
            + "through the power of the jade slip.\n\n"
            + "You learn a new combat technique.",
            [
                { text: "Return to the library entrance", action: "sect_library" },
            ],
            { technique: "Iron Body", message: "You learned Iron Body technique!" }
        );

        this.scenes["sect_learn_common"] = new Scene(
            "sect_learn_common", "Common Technique",
            "You channel 100 Qi into a jade slip containing a common-grade technique. "
            + "The characters glow and imprint themselves into your mind.",
            [
                { text: "Return to the library entrance", action: "sect_library" },
            ],
            { technique: "Wind Slash", qi_cost: 100, message: "You learned Wind Slash!" }
        );

        this.scenes["sect_missions"] = new Scene(
            "sect_missions", "Mission Board",
            "The mission board is covered with requests:\n\n"
            + "- Gather spirit herbs from Peak Five\u2019s garden (reward: 50 contribution points)\n"
            + "- Patrol the eastern border for demonic activity (reward: 100 points)\n"
            + "- Subdue a rogue cultivator near Zhao City (reward: 200 points, Inner Disciple recommendation)\n"
            + "- Investigate demonic cult sightings at abandoned village (reward: 300 points)\n\n"
            + "Contribution points can be exchanged for techniques, pills, and equipment.",
            [
                { text: "Take the patrol mission", action: "sect_patrol" },
                { text: "Take the rogue cultivator mission", action: "sect_rogue_hunt" },
                { text: "Take the herb gathering mission", action: "sect_herb_gathering" },
                { text: "Return to sect grounds", action: "sect_explore" },
            ]
        );

        this.scenes["sect_patrol"] = new Scene(
            "sect_patrol", "Border Patrol",
            "You patrol the eastern border of the sect\u2019s territory. "
            + "The forest is quiet \u2014 too quiet.\n\n"
            + "You find traces of demonic Qi near the boundary markers. "
            + "Whatever passed through here was powerful.\n\n"
            + "A Demonic Cultivist emerges from the shadows!",
            [
                { text: "Fight the demonic cultivator!", action: "combat:demonic_cultivator" },
                { text: "Retreat and report to the sect", action: "sect_missions" },
            ]
        );

        this.scenes["sect_rogue_hunt"] = new Scene(
            "sect_rogue_hunt", "Rogue Cultivator Hunt",
            "You track the rogue cultivator to a secluded cave near Zhao City. "
            + "He is refining demonic pills using captured villagers\u2019 life essence.\n\n"
            + "He sees you and snarls.\n\n"
            + "\u201cA sect dog! Come to die?\u201d",
            [
                { text: "Attack the rogue cultivator!", action: "combat:rogue_cultivator" },
            ]
        );

        this.scenes["sect_herb_gathering"] = new Scene(
            "sect_herb_gathering", "Herb Gathering",
            "You spend the day in the sect\u2019s spirit herb gardens. "
            + "The Qi-rich soil yields bountiful harvests.\n\n"
            + "The gardener thanks you and gives you a small portion of the harvest.",
            [
                { text: "Return to the mission board", action: "sect_missions" },
            ],
            { items: ["Spirit Herb", "Spirit Herb"], reputation: 5 }
        );

        this.scenes["sect_train"] = new Scene(
            "sect_train", "Courtyard Training",
            "You practice your techniques in the disciple courtyard. "
            + "Other disciples watch as you execute your forms.\n\n"
            + "Your movements grow sharper. Your Qi circulates more efficiently.",
            [
                { text: "Continue training", action: "sect_train" },
                { text: "Visit the library", action: "sect_library" },
                { text: "Check the mission board", action: "sect_missions" },
            ],
            { qi: 20 }
        );

        this.scenes["sect_inner_trial"] = new Scene(
            "sect_inner_trial", "Inner Disciple Trial",
            "You have proven yourself as an Outer Disciple. The Elders "
            + "have approved you for the Inner Disciple Trial.\n\n"
            + "The trial requires you to face three challenges:\n"
            + "1. Defeat an Inner Disciple in combat\n"
            + "2. Demonstrate mastery of a technique\n"
            + "3. Survive the sect\u2019s formation maze\n\n"
            + "First challenge: an Inner Disciple steps into the arena.",
            [
                { text: "Face the Inner Disciple!", action: "combat:inner_disciple" },
                { text: "I need more preparation", action: "sect_explore" },
            ],
            { flag: "inner_trial_started" }
        );

        this.scenes["sect_inner_disciple"] = new Scene(
            "sect_inner_disciple", "Inner Disciple",
            "Congratulations! You have been promoted to Inner Disciple "
            + "of the Azure Peaks Sect.\n\n"
            + "The Sect Elder presents you with a new robe, a personal "
            + "cultivation chamber, and access to all techniques "
            + "within the sect\u2019s library.\n\n"
            + "Inner Disciples are the backbone of the sect. You will "
            + "be sent on important missions and may one day become an Elder yourself.\n\n"
            + "The path ahead is bright.",
            [
                { text: "Access the Inner Disciple library", action: "sect_library" },
                { text: "Train in the Inner Disciple courtyard", action: "sect_train" },
                { text: "Visit the Sect Elder", action: "sect_elder_audience" },
            ],
            { flag: "inner_disciple", reputation: 100, qi: 150 }
        );

        this.scenes["sect_elder_audience"] = new Scene(
            "sect_elder_audience", "Elder\u2019s Audience",
            "The Sect Elder is a wizened man with long white hair and eyes "
            + "that seem to pierce through reality itself.\n\n"
            + "\u201cYou have done well, disciple. But the path of cultivation "
            + "has no end. I sense a great destiny within you \u2014 "
            + "and a great danger.\u201d\n\n"
            + "He hands you a jade compass.\n\n"
            + "\u201cThe demonic cults are stirring in the east. This compass "
            + "will point you toward their strongholds when the time comes. "
            + "Grow stronger, disciple. You will be needed.\u201d",
            [
                { text: "Thank the Elder and continue training", action: "sect_inner_disciple" },
                { text: "Ask about the Heaven-Defying Sage", action: "sect_sage_question" },
            ],
            { items: ["Jade Compass"] }
        );

        this.scenes["sect_sage_question"] = new Scene(
            "sect_sage_question", "The Sage\u2019s Legacy",
            "The Elder\u2019s eyes narrow.\n\n"
            + "\u201cThe Heaven-Defying Sage? You know of him?\u201d\n\n"
            + "He strokes his beard.\n\n"
            + "\u201cHe was a disciple of this very sect, thousands of years ago. "
            + "He was expelled for his unorthodox methods. "
            + "But he went on to become the greatest cultivator this region has ever seen.\u201d\n\n"
            + "\u201cThey say he left his legacy somewhere in the Azure Mountains. "
            + "If you find it... guard it well.\u201d",
            [
                { text: "Search for the legacy in the Hidden Cave", action: "hidden_cave_entrance" },
                { text: "Return to training", action: "sect_inner_disciple" },
            ]
        );
    }

    // ── BEAST HUNT QUEST CHAIN ──
    _buildBeastHuntQuest() {
        this.scenes["beast_quest_accept"] = new Scene(
            "beast_quest_accept", "Beast Extermination Quest",
            "The Village Elder nods approvingly.\n\n"
            + "\u201cGood. The beast was last seen near Misty Falls. "
            + "It is an Iron-Fanged Boar \u2014 aggressive, tough, "
            + "and driven mad by something in the spiritual energy.\u201d\n\n"
            + "She hands you a tracking talisman.\n\n"
            + "\u201cFollow the trail, slay the beast, and bring back its tusk "
            + "as proof. The reward will be waiting.\u201d",
            [
                { text: "Head to Misty Falls to track the beast", action: "beast_track" },
                { text: "Prepare first at the training grounds", action: "train_mountains" },
            ],
            { quest: "beast_hunt", reputation: 5 }
        );

        this.scenes["beast_track"] = new Scene(
            "beast_track", "Tracking the Beast",
            "You follow the trail into the Misty Falls wilderness. "
            + "The tracking talisman glows, pulling you eastward.\n\n"
            + "The forest grows darker as you go deeper. Broken branches, "
            + "claw marks on trees, and the occasional splatter of blood "
            + "mark the beast\u2019s path.\n\n"
            + "You hear heavy breathing ahead. The beast is close.",
            [
                { text: "Move forward cautiously", action: "beast_ambush" },
                { text: "Set a trap and wait", action: "beast_trap" },
                { text: "Return to the village for backup", action: "cloud_wind_village" },
            ]
        );

        this.scenes["beast_trap"] = new Scene(
            "beast_trap", "Setting a Trap",
            "You quickly set a snare using spirit rope from your pack. "
            + "The beast charges into your trap!\n\n"
            + "The Iron-Fanged Boar is caught but enraged. "
            + "It breaks free and turns on you!",
            [
                { text: "Fight the wounded beast!", action: "combat:iron_fanged_boar" },
            ]
        );

        this.scenes["beast_ambush"] = new Scene(
            "beast_ambush", "Beast Encounter",
            "The Iron-Fanged Boar bursts from the underbrush! "
            + "Its tusks gleam like metal, and its eyes burn with feral rage.\n\n"
            + "There is no time to run. It charges!",
            [
                { text: "Stand your ground and fight!", action: "combat:iron_fanged_boar" },
            ]
        );

        this.scenes["beast_return"] = new Scene(
            "beast_return", "Quest Complete",
            "You return to Cloud Wind Village with the Iron-Fanged Boar\u2019s tusk. "
            + "The Village Elder examines it and nods.\n\n"
            + "\u201cWell done. The beast will terrorize our lands no more.\u201d\n\n"
            + "She hands you a pouch of gold and a small pill bottle.\n\n"
            + "\u201c500 gold, as promised. And a Foundation Pill "
            + "to help with your cultivation. You have earned it.\u201d\n\n"
            + "The villagers cheer as word spreads of your deed.",
            [
                { text: "Thank the Elder and train", action: "train_mountains" },
                { text: "Ask about the Azure Peaks Sect", action: "sect_gate" },
                { text: "Investigate what drove the beast mad", action: "beast_aftermath" },
            ],
            { gold: 500, quest_complete: "beast_hunt", reputation: 30, items: ["Foundation Pill"] }
        );

        this.scenes["beast_aftermath"] = new Scene(
            "beast_aftermath", "The Deeper Mystery",
            "You ask the Elder what could have driven the beast mad.\n\n"
            + "She frowns.\n\n"
            + "\u201cI have sensed it too. The spiritual energy in the region "
            + "has been... disturbed. Something dark is seeping into the land "
            + "from the east.\u201d\n\n"
            + "She looks toward the mountains.\n\n"
            + "\u201cIf you want answers, the Azure Peaks Sect may have them. "
            + "Or you could investigate the source yourself.\u201d\n\n"
            + "A new quest appears in your mind: find the source of the corruption.",
            [
                { text: "Head to Azure Peaks Sect for answers", action: "travel_azure_peaks_sect" },
                { text: "Investigate the eastern wilderness", action: "eastern_road_entry" },
                { text: "Cultivate and grow stronger first", action: "train_mountains" },
            ],
            { quest: "source_of_corruption", reputation: 10 }
        );
    }

    // ── NPCS ──
    _buildNPCs() {
        this.scenes["mountain_hermit"] = new Scene(
            "mountain_hermit", "The Mountain Hermit",
            "Deep in the Azure Mountains, you find a solitary old man "
            + "sitting cross-legged on a cliff edge, facing the sunset.\n\n"
            + "He does not turn as you approach.\n\n"
            + "\u201cYou have traveled far to find an old fool like me.\u201d\n\n"
            + "His voice is calm, carrying wisdom accumulated over centuries.\n\n"
            + "\u201cI can teach you something, if you have the capacity to learn.\u201d",
            [
                { text: "Ask him to teach you", action: "hermit_teach" },
                { text: "Ask about the Heaven-Defying Sage", action: "hermit_sage" },
                { text: "Leave the hermit in peace", action: "azure_mountains_entry" },
            ]
        );

        this.scenes["hermit_teach"] = new Scene(
            "hermit_teach", "Hermit\u2019s Teaching",
            "The old man waves his hand. A jade slip floats toward you.\n\n"
            + "\u201cThis technique was mine in my youth. It may serve you better "
            + "than it served me. Go now, and walk the dao with an open heart.\u201d",
            [
                { text: "Thank the hermit and leave", action: "azure_mountains_entry" },
            ],
            { technique: "Meridian Cleanse", message: "You learned Meridian Cleanse from the mountain hermit!" }
        );

        this.scenes["hermit_sage"] = new Scene(
            "hermit_sage", "Hermit on the Sage",
            "The hermit chuckles softly.\n\n"
            + "\u201cThe Heaven-Defying Sage? I knew him. We were disciples together, "
            + "once. He was brash, arrogant, and utterly brilliant.\u201d\n\n"
            + "His eyes grow distant.\n\n"
            + "\u201cHe sought to defy the heavens themselves. And in many ways, "
            + "he succeeded. But defiance comes with a price.\u201d\n\n"
            + "He turns to face you for the first time.\n\n"
            + "\u201cHis legacy lies in the Hidden Cave. But be warned \u2014 "
            + "the guardian is not the only thing protecting it. "
            + "The cave itself tests the heart.\u201d",
            [
                { text: "Head to the Hidden Cave", action: "hidden_cave_entrance" },
                { text: "Ask him to teach you a technique", action: "hermit_teach" },
                { text: "Return to the mountains", action: "azure_mountains_entry" },
            ],
            { flag: "hermit_sage_info" }
        );

        this.scenes["wandering_merchant"] = new Scene(
            "wandering_merchant", "Wandering Merchant",
            "A gaudily dressed merchant with a wide smile waves you over "
            + "to his stall, set up at a crossroads.\n\n"
            + "\u201cAh, a fellow traveler! You have the look of a cultivator "
            + "about you. I have wares that might interest you.\u201d\n\n"
            + "He gestures to his array of goods: pills, scrolls, "
            + "spirit stones, and a few items that glow with faint power.",
            [
                { text: "Browse his wares", action: "merchant_browse" },
                { text: "Ask if he has any information", action: "merchant_info" },
                { text: "Politely decline and move on", action: "eastern_road_entry" },
            ]
        );

        this.scenes["merchant_browse"] = new Scene(
            "merchant_browse", "Merchant\u2019s Wares",
            "\u201cExcellent choices!\u201d he claps his hands.\n\n"
            + "He shows you:\n"
            + "- Foundation Pill: 200 gold (boosts breakthrough chance)\n"
            + "- Qi Stone: 100 gold (restores 50 Qi)\n"
            + "- Map Fragment: 50 gold (rumored to lead to treasure)\n"
            + "- Spirit Compass: 300 gold (points to nearby spiritual phenomena)",
            [
                { text: "Buy Foundation Pill (200 gold)", action: "buy_foundation_pill" },
                { text: "Buy Qi Stone (100 gold)", action: "buy_qi_stone" },
                { text: "Buy Map Fragment (50 gold)", action: "buy_map_fragment" },
                { text: "Not interested", action: "eastern_road_entry" },
            ]
        );

        this.scenes["merchant_info"] = new Scene(
            "merchant_info", "Merchant\u2019s Information",
            "The merchant leans in conspiratorially.\n\n"
            + "\u201cI hear things on the road. Strange things.\u201d\n\n"
            + "\u201cA demonic cult called the Soul Banners is gathering "
            + "in the eastern wastes. They worship an ancient evil "
            + "sealed beneath the Azure Mountains.\u201d\n\n"
            + "\u201cAnd the sects? They argue amongst themselves while "
            + "the darkness grows. Mark my words, cultivator \u2014 "
            + "a storm is coming.\u201d",
            [
                { text: "Thank him for the warning", action: "eastern_road_entry" },
                { text: "Ask more about the Soul Banners", action: "merchant_soul_banners" },
            ]
        );

        this.scenes["merchant_soul_banners"] = new Scene(
            "merchant_soul_banners", "Soul Banners",
            "The merchant\u2019s smile fades.\n\n"
            + "\u201cThe Soul Banners are not a cult to be taken lightly. "
            + "They use forbidden techniques that bind souls to banners, "
            + "creating an army of the damned.\u201d\n\n"
            + "\u201cRumor says their leader, a demonic elder known as the "
            + "Flying Head Elder, is a Core Formation cultivator who "
            + "murdered his own sect and stole their techniques.\u201d\n\n"
            + "\u201cIf you encounter them, run. Or be prepared to fight "
            + "for your very soul.\u201d",
            [
                { text: "I will keep that in mind", action: "eastern_road_entry" },
            ],
            { flag: "soul_banner_info" }
        );

        this.scenes["village_blacksmith"] = new Scene(
            "village_blacksmith", "Village Blacksmith",
            "The blacksmith is a burly man with arms like tree trunks. "
            + "He wipes sweat from his brow as you approach.\n\n"
            + "\u201cCultivator, eh? I can forge weapons that channel Qi. "
            + "But good materials are hard to come by around here.\u201d\n\n"
            + "His forge blazes with spiritual fire. A few finished blades "
            + "hang on the wall, each etched with basic formation characters.",
            [
                { text: "Buy an Iron Sword (50 gold) - +3 ATK in combat", action: "buy_sword" },
                { text: "Ask about forging a custom weapon", action: "smith_custom" },
                { text: "Leave", action: "cloud_wind_village" },
            ]
        );

        this.scenes["sect_recruiter"] = new Scene(
            "sect_recruiter", "Sect Recruiter",
            "The recruiter is a young man in Azure Peaks Sect robes. "
            + "He smiles warmly.\n\n"
            + "\u201cYou look like you have potential. Have you considered "
            + "joining the Azure Peaks Sect? We offer training, "
            + "techniques, and protection.\u201d\n\n"
            + "\u201cThe entry trial is straightforward \u2014 defeat a disciple "
            + "in sparring. If you are interested, head to the sect "
            + "at the eastern edge of the Azure Mountains.\u201d",
            [
                { text: "Head to the sect now", action: "travel_azure_peaks_sect" },
                { text: "I will consider it", action: "cloud_wind_village" },
            ]
        );

        this.scenes["refining_master"] = new Scene(
            "refining_master", "The Refining Master",
            "In a smoky workshop on the eastern edge of Zhao City, an old master "
            + "hammers away at a glowing blade. He looks up as you enter.\n\n"
            + "\u201cEquipment can be refined, young one. Each refinement strengthens "
            + "the item, but the path is treacherous. Fail, and your treasure may break.\u201d\n\n"
            + "He gestures to a stone table covered with tools and materials.\n\n"
            + "\u201cBring me refinement stones, and I will attempt to upgrade your equipment. "
            + "Mortal stones for mortal gear, earth stones for earth gear, and so on. "
            + "The higher the tier, the more stones required.\u201d\n\n"
            + "He chuckles darkly.\n\n"
            + "\u201cAnd remember \u2014 refinement is never certain. "
            + "Even I cannot guarantee success.\u201d",
            [
                { text: "Ask about refinement materials", action: "refine_materials" },
                { text: "Refine your equipped items (click the \u2191 button)", action: "zhao_city_entry" },
                { text: "Leave", action: "zhao_city_entry" },
            ],
            { flag: "met_refining_master" }
        );

        this.scenes["refine_materials"] = new Scene(
            "refine_materials", "Refinement Materials",
            "The master lists the required materials:\n\n"
            + "- Mortal Refinement Stone (for mortal items) \u2014 1 per attempt\n"
            + "- Earth Refinement Stone (for earth items) \u2014 2 per attempt\n"
            + "- Profound Refinement Stone (for profound items) \u2014 3 per attempt\n"
            + "- Heaven Refinement Stone (for heaven items) \u2014 4 per attempt\n"
            + "- Celestial Refinement Stone (for celestial items) \u2014 5 per attempt\n\n"
            + "\u201cStones can be found in spirit ore veins, dropped by powerful beasts, "
            + "or purchased from traveling merchants. Good luck.\u201d",
            [
                { text: "Return to the refining master", action: "refining_master" },
                { text: "Leave the workshop", action: "zhao_city_entry" },
            ]
        );
    }

    getScene(sceneId) {
        return (this.scenes[sceneId] || this.scenes["cloud_wind_village"]).toDict();
    }

    processAction(player, action) {
        const al = action.toLowerCase().replace(/ /g, "_");

        const sceneMap = {
            // Phase 1 - Intro/Village
            start: "cloud_wind_village",
            storyteller: "storyteller", cave_rumor: "cave_rumor",
            train_mountains: "train_mountains", explore_village: "explore_village",
            village_elder: "village_elder", gain_technique: "cave_rumor",
            proud_path: "proud_path",
            continue_meditate: "continue_meditate", practice_technique: "practice_technique",
            rest_village: "rest_village", buy_herbs: "explore_village",
            watch_martial: "watch_martial", teach_technique: "teach_technique",

            // Phase 3 - Village NPC additions
            village_blacksmith: "village_blacksmith",
            sect_recruiter: "sect_recruiter",

            // Phase 3 - Azure Mountains
            azure_mountains_entry: "azure_mountains_entry",
            azure_mountains_deep: "azure_mountains_deep",
            azure_herbs: "azure_herbs",
            mountain_hermit: "mountain_hermit",
            hermit_teach: "hermit_teach",
            hermit_sage: "hermit_sage",

            // Phase 3 - Misty Falls
            misty_falls_entry: "misty_falls_entry",
            misty_meditate: "misty_meditate",
            misty_runes: "misty_runes",

            // Phase 3 - Hidden Cave Dungeon
            hidden_cave_entrance: "hidden_cave_entrance",
            hidden_cave_traps: "hidden_cave_traps",
            hidden_cave_treasure: "hidden_cave_treasure",
            hidden_cave_boss: "hidden_cave_boss",
            hidden_cave_legacy: "hidden_cave_legacy",
            hidden_cave_exit: "hidden_cave_exit",

            // Phase 3 - Eastern Road
            eastern_road_entry: "eastern_road_entry",
            road_herbs: "road_herbs",
            wandering_merchant: "wandering_merchant",
            merchant_browse: "merchant_browse",
            merchant_info: "merchant_info",
            merchant_soul_banners: "merchant_soul_banners",

            // Phase 3 - Zhao City
            zhao_city_entry: "zhao_city_entry",
            zhao_market: "zhao_market",
            zhao_guild: "zhao_guild",
            guild_monster_hunt: "guild_monster_hunt",
            guild_info: "guild_info",
            zhao_inn: "zhao_inn",
            refining_master: "refining_master",
            refine_materials: "refine_materials",

            // Phase 3 - Azure Peaks Sect
            sect_gate: "sect_gate",
            sect_pass_through: "sect_pass_through",
            sect_observe_training: "sect_observe_training",
            sect_entry_trial: "sect_entry_trial",
            sect_outer_disciple: "sect_outer_disciple",
            sect_explore: "sect_explore",
            sect_library: "sect_library",
            sect_learn_basic: "sect_learn_basic",
            sect_learn_common: "sect_learn_common",
            sect_missions: "sect_missions",
            sect_patrol: "sect_patrol",
            sect_rogue_hunt: "sect_rogue_hunt",
            sect_herb_gathering: "sect_herb_gathering",
            sect_train: "sect_train",
            sect_inner_trial: "sect_inner_trial",
            sect_inner_disciple: "sect_inner_disciple",
            sect_elder_audience: "sect_elder_audience",
            sect_sage_question: "sect_sage_question",

            // Phase 3 - Beast Hunt Quest
            beast_quest_accept: "beast_quest_accept",
            beast_track: "beast_track",
            beast_trap: "beast_trap",
            beast_ambush: "beast_ambush",
            beast_return: "beast_return",
            beast_aftermath: "beast_aftermath",
        };

        // Handle travel actions (route through world system)
        if (al.startsWith("travel_")) {
            return { action_type: "travel", destination: al.slice(7) };
        }

        // Handle combat actions (intercepted by client)
        if (al.startsWith("combat:")) {
            return { scene: this.getScene("cloud_wind_village") };
        }

        let effects = {};

        // === PHASE 1 EFFECTS ===
        if (al === "gain_technique") {
            const tech = "Qi Gathering";
            if (!player.techniques.includes(tech)) player.techniques.push(tech);
            player.qi += 50;
            player.faction.righteous = (player.faction.righteous || 0) + 2;
            effects = { qi: 50, message: "You gained 50 Qi and learned Qi Gathering! (+2 Righteous)" };
        }
        if (al === "buy_herbs" && player.gold >= 10) {
            player.gold -= 10;
            player.items.push("Spirit Herb");
            effects = { message: "You bought some spirit herbs." };
        }
        if (al === "proud_path") {
            player.faction.transcendent = (player.faction.transcendent || 0) + 2;
            effects = { message: "You refuse outside help. (+2 Transcendent)" };
        }
        if (al === "teach_technique") {
            if (player.techniques.includes("Qi Gathering")) {
                player.techniques = player.techniques.filter(t => t !== "Qi Gathering");
            }
            player.reputation += 5;
            player.faction.righteous = (player.faction.righteous || 0) + 3;
            effects = { message: "You teach the boy Qi Gathering. (+5 Reputation, +3 Righteous)" };
        }

        // === PHASE 3 EFFECTS ===
        if (al === "misty_runes") {
            player.flags.saw_rune_vision = true;
        }
        if (al === "hidden_cave_traps") {
            player.takeDamage(15);
            if (!player.items.includes("Ancient Scroll")) player.items.push("Ancient Scroll");
            effects = { message: "You lose 15 HP to the traps but find an ancient scroll!" };
        }
        if (al === "hidden_cave_entrance") {
            player.faction.transcendent = (player.faction.transcendent || 0) + 2;
        }
        if (al === "hidden_cave_legacy") {
            player.qi += 200;
            player.flags.sage_legacy_claimed = true;
            if (!player.techniques.includes("Heaven-Defying Palm")) {
                player.techniques.push("Heaven-Defying Palm");
            }
            if (!player.inventory.some(i => (typeof i === "string" ? i : i.id) === "heaven_defying_blade")) {
                player.inventory.push({ id: "heaven_defying_blade", refineLevel: 0 });
            }
            effects = { message: "You gain 200 Qi, learn Heaven-Defying Palm, and find a Heaven-Defying Blade!", qi: 200 };
        }
        if (al === "hidden_cave_exit") {
            player.gold += 300;
            if (!player.inventory.some(i => (typeof i === "string" ? i : i.id) === "starlight_mantle")) {
                player.inventory.push({ id: "starlight_mantle", refineLevel: 0 });
            }
            effects = { message: "You found 300 gold and a Starlight Mantle in the treasure hoard!", gold: 300 };
        }
        if (al === "azure_herbs") {
            if (!player.items.includes("Azure Grass")) player.items.push("Azure Grass");
            effects = { message: "Gathered Azure Grass. Useful for pill refining." };
        }
        if (al === "road_herbs") {
            if (!player.items.includes("Medicinal Herb")) player.items.push("Medicinal Herb");
            effects = { message: "Gathered some common roadside herbs." };
        }
        if (al === "misty_meditate") {
            player.qi += 30;
            effects = { qi: 30, message: "The waterfall's spiritual energy flows into you. (+30 Qi)" };
        }
        if (al === "beast_quest_accept") {
            player.quests.active.beast_hunt = "tracking";
            player.reputation += 5;
            player.faction.righteous = (player.faction.righteous || 0) + 3;
            effects = { message: "Quest accepted: Slay the Iron-Fanged Boar near Misty Falls. (+3 Righteous)" };
        }
        if (al === "beast_return") {
            if (player.quests.active.beast_hunt) delete player.quests.active.beast_hunt;
            if (!player.quests.completed.beast_hunt) player.quests.completed.beast_hunt = true;
            player.gold += 500;
            player.reputation += 30;
            if (!player.items.includes("Foundation Pill")) player.items.push("Foundation Pill");
            if (!player.inventory.some(i => (typeof i === "string" ? i : i.id) === "iron_sword")) {
                player.inventory.push({ id: "iron_sword", refineLevel: 0 });
            }
            effects = { message: "Quest complete! Gained 500 gold, Foundation Pill, Iron Sword, and 30 reputation!", gold: 500 };
        }
        if (al === "beast_aftermath") {
            player.quests.active.source_of_corruption = "investigating";
            player.reputation += 10;
            player.faction.righteous = (player.faction.righteous || 0) + 2;
            effects = { message: "New quest: Find the source of the corruption plaguing the land. (+2 Righteous)" };
        }
        if (al === "zhao_inn") {
            player.heal(40);
            effects = { message: "You rest at the Jade Lotus Inn. (+40 HP)" };
        }
        if (al === "buy_qi_pill" && player.gold >= 50) {
            player.gold -= 50;
            if (!player.items.includes("Qi Pill")) player.items.push("Qi Pill");
            effects = { message: "Bought a Qi Pill for 50 gold." };
        }
        if (al === "buy_herb_city" && player.gold >= 20) {
            player.gold -= 20;
            if (!player.items.includes("Spirit Herb")) player.items.push("Spirit Herb");
            player.qi += 10;
            effects = { qi: 10, message: "Bought a Spirit Herb for 20 gold. (+10 Qi)" };
        }
        if (al === "buy_technique_scroll" && player.gold >= 200) {
            player.gold -= 200;
            if (!player.techniques.includes("Qi Shield")) player.techniques.push("Qi Shield");
            effects = { message: "Bought a technique scroll and learned Qi Shield!" };
        }
        if (al === "buy_foundation_pill" && player.gold >= 200) {
            player.gold -= 200;
            if (!player.items.includes("Foundation Pill")) player.items.push("Foundation Pill");
            effects = { message: "Bought a Foundation Pill for 200 gold." };
        }
        if (al === "buy_qi_stone" && player.gold >= 100) {
            player.gold -= 100;
            if (!player.items.includes("Qi Stone")) player.items.push("Qi Stone");
            effects = { message: "Bought a Qi Stone for 100 gold." };
        }
        if (al === "buy_map_fragment" && player.gold >= 50) {
            player.gold -= 50;
            if (!player.items.includes("Map Fragment")) player.items.push("Map Fragment");
            effects = { message: "Bought a Map Fragment for 50 gold." };
        }
        if (al === "buy_sword" && player.gold >= 50) {
            player.gold -= 50;
            if (!player.items.includes("Iron Sword")) player.items.push("Iron Sword");
            effects = { message: "Bought an Iron Sword for 50 gold. (+3 ATK in combat)" };
        }
        if (al === "smith_custom") {
            effects = { message: "The blacksmith needs rare materials first. Bring him Spirit Ore or Beast Cores." };
        }
        if (al === "hermit_teach") {
            if (!player.techniques.includes("Meridian Cleanse")) player.techniques.push("Meridian Cleanse");
            effects = { message: "The hermit teaches you Meridian Cleanse!" };
        }
        if (al === "hermit_sage") {
            player.flags.hermit_sage_info = true;
            effects = { message: "The hermit shares his knowledge of the Heaven-Defying Sage." };
        }
        if (al === "sect_outer_disciple") {
            player.flags.joined_sect = true;
            player.reputation += 20;
            player.faction.righteous = (player.faction.righteous || 0) + 5;
            effects = { message: "You have joined the Azure Peaks Sect as an Outer Disciple! (+20 Reputation, +5 Righteous)" };
        }
        if (al === "sect_inner_disciple") {
            player.flags.inner_disciple = true;
            player.reputation += 100;
            player.qi += 150;
            player.faction.righteous = (player.faction.righteous || 0) + 10;
            effects = { qi: 150, message: "Promoted to Inner Disciple! (+100 Reputation, +150 Qi, +10 Righteous)" };
        }
        if (al === "sect_elder_audience") {
            if (!player.items.includes("Jade Compass")) player.items.push("Jade Compass");
            effects = { message: "The Elder gives you a Jade Compass." };
        }
        if (al === "sect_learn_basic") {
            if (!player.techniques.includes("Iron Body")) player.techniques.push("Iron Body");
            effects = { message: "You learned Iron Body technique from the library!" };
        }
        if (al === "sect_learn_common") {
            if (player.qi >= 100) {
                player.qi -= 100;
                if (!player.techniques.includes("Wind Slash")) player.techniques.push("Wind Slash");
                effects = { qi: -100, message: "You spent 100 Qi to learn Wind Slash!" };
            } else {
                effects = { message: "You do not have enough Qi (100 needed)." };
            }
        }
        if (al === "sect_herb_gathering") {
            if (!player.items.includes("Spirit Herb")) player.items.push("Spirit Herb");
            if (player.items.filter(i => i === "Spirit Herb").length < 2) player.items.push("Spirit Herb");
            player.reputation += 5;
            effects = { message: "You gathered herbs for the sect. (+2 Spirit Herbs, +5 Reputation)" };
        }
        if (al === "sect_train") {
            player.qi += 20;
            effects = { qi: 20, message: "Training in the courtyard sharpens your skills. (+20 Qi)" };
        }
        if (al === "sect_inner_trial") {
            player.flags.inner_trial_started = true;
            effects = { message: "The Inner Disciple Trial begins!" };
        }
        if (al === "herb_mission") {
            if (!player.items.includes("Spirit Herb")) player.items.push("Spirit Herb");
            effects = { message: "Gathered some spirit herbs." };
        }
        if (al === "merchant_soul_banners") {
            player.flags.soul_banner_info = true;
            effects = { message: "You learn of the Soul Banner cult and the Flying Head Elder." };
        }
        if (al === "refining_master") {
            player.flags.met_refining_master = true;
        }
        if (al === "hidden_cave_treasure") {
            player.gold += 150;
            if (!player.inventory.some(i => (typeof i === "string" ? i : i.id) === "spirit_blade")) {
                player.inventory.push({ id: "spirit_blade", refineLevel: 0 });
            }
            effects = { message: "You grab 150 gold and a Spirit Blade from the treasure chamber!" };
        }
        if (al === "talk_bandits") {
            player.faction.transcendent = (player.faction.transcendent || 0) + 2;
            effects.faction = { transcendent: 2 };
        }
        if (al === "hidden_cave_entrance") {
            player.faction.transcendent = (player.faction.transcendent || 0) + 2;
            effects.faction = { transcendent: 2 };
        }
        if (al === "sect_entry_trial") {
            player.faction.righteous = (player.faction.righteous || 0) + 2;
            effects.faction = { righteous: 2 };
        }
        if (al === "refining_master") {
            player.faction.transcendent = (player.faction.transcendent || 0) + 1;
        }

        // Handle insufficient gold cases
        if (al === "buy_herbs" && player.gold < 10) {
            effects = { message: "You do not have enough gold (10 needed)." };
        }
        if (al === "buy_qi_pill" && player.gold < 50) {
            effects = { message: "You do not have enough gold (50 needed)." };
        }
        if (al === "buy_herb_city" && player.gold < 20) {
            effects = { message: "You do not have enough gold (20 needed)." };
        }
        if (al === "buy_technique_scroll" && player.gold < 200) {
            effects = { message: "You do not have enough gold (200 needed)." };
        }

        if (al === "check_state") {
            return { scene: this.getLocationScene(player.location), player_stats: player.stats, effects: {} };
        }

        const targetScene = sceneMap[al];
        if (!targetScene) {
            return { scene: this.getLocationScene(player.location), player_stats: player.stats, effects };
        }

        return { scene: this.getScene(targetScene), player_stats: player.stats, effects };
    }
}

module.exports = { StoryEngine, Scene };
