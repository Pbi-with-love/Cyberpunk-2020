"""Generate seed data JSON for the CP2020 character generator.

Descriptions and lifepath entries are written in our own words.
Entries marked "verify": true were compiled from memory and must be
checked against the Cyberpunk 2020 rulebook before release.
"""
import json, os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "data"
os.makedirs(OUT, exist_ok=True)

def dump(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")

# ---------------------------------------------------------------- stats
stats = {
  "version": 1,
  "range": {"min": 2, "max": 10},
  "pointMethods": [
    {"id": "random", "name": "Random", "description": "Roll 9d10; the total is the pool you distribute across the nine stats.", "dice": "9d10"},
    {"id": "fast", "name": "Fast", "description": "Roll 1d10 for each stat in order; reroll any result of 2 or less. No distribution step.", "dice": "1d10", "rerollAtOrBelow": 2},
    {"id": "cinematic", "name": "Cinematic", "description": "The GM picks a fixed pool based on how important the character is.",
     "presets": [
       {"id": "major_hero", "name": "Major hero", "points": 80},
       {"id": "major_supporting", "name": "Major supporting character", "points": 70},
       {"id": "minor_hero", "name": "Minor hero", "points": 75},
       {"id": "minor_supporting", "name": "Minor supporting character", "points": 60},
       {"id": "average", "name": "Average person", "points": 50}
     ], "verify": True}
  ],
  "stats": [
    {"key": "INT", "name": "Intelligence", "short": "Brains, memory, perception and problem solving.", "usedFor": ["Awareness/Notice", "Education", "Programming", "pickup skill points"]},
    {"key": "REF", "name": "Reflexes", "short": "Speed, coordination and hand-eye control. The key combat stat.", "usedFor": ["Firearms", "Brawling", "Dodge", "Driving", "Initiative", "pickup skill points"]},
    {"key": "TECH", "name": "Technical Ability", "short": "Building, repairing and operating machines and tools.", "usedFor": ["Basic Tech", "CyberTech", "First Aid", "Pick Lock"]},
    {"key": "COOL", "name": "Cool / Willpower", "short": "Nerve under pressure and how intimidating you are.", "usedFor": ["Intimidate", "Interrogation", "Streetwise", "Resist Torture/Drugs"]},
    {"key": "ATTR", "name": "Attractiveness", "short": "Looks and first impressions.", "usedFor": ["Personal Grooming", "Wardrobe & Style"]},
    {"key": "LUCK", "name": "Luck", "short": "A pool of points per session you can add to important rolls; refills each session.", "usedFor": ["Bonus to any roll"]},
    {"key": "MA", "name": "Movement Allowance", "short": "How fast you move.", "usedFor": ["Run", "Leap"]},
    {"key": "BODY", "name": "Body Type", "short": "Strength, toughness and endurance.", "usedFor": ["Save", "BTM", "BDM", "Lift", "Endurance", "Swimming"]},
    {"key": "EMP", "name": "Empathy", "short": "Understanding and connecting with people. Tied to Humanity.", "usedFor": ["Persuasion", "Leadership", "Human Perception", "Humanity"]}
  ],
  "derived": [
    {"key": "run", "name": "Run", "formula": "MA * 3", "unit": "m"},
    {"key": "leap", "name": "Leap", "formula": "run / 4", "unit": "m"},
    {"key": "lift", "name": "Lift", "formula": "BODY * 40", "unit": "kg"},
    {"key": "humanity", "name": "Humanity", "formula": "EMP * 10"},
    {"key": "save", "name": "Save", "formula": "BODY"},
    {"key": "btm", "name": "Body Type Modifier", "table": [
      {"min": 2, "max": 2, "value": 0, "label": "Very weak"},
      {"min": 3, "max": 4, "value": -1, "label": "Weak"},
      {"min": 5, "max": 7, "value": -2, "label": "Average"},
      {"min": 8, "max": 9, "value": -3, "label": "Strong"},
      {"min": 10, "max": 10, "value": -4, "label": "Very strong"}]},
    {"key": "bdm", "name": "Body Damage Modifier", "table": [
      {"min": 2, "max": 2, "value": -2},
      {"min": 3, "max": 4, "value": -1},
      {"min": 5, "max": 7, "value": 0},
      {"min": 8, "max": 9, "value": 1},
      {"min": 10, "max": 10, "value": 2}]}
  ],
  "difficulty": [
    {"name": "Easy", "value": 10}, {"name": "Average", "value": 15},
    {"name": "Difficult", "value": 20}, {"name": "Very Difficult", "value": 25},
    {"name": "Nearly Impossible", "value": 30}
  ]
}
dump("stats.json", stats)

# ---------------------------------------------------------------- skills
def S(id, name, stat, desc, **kw):
    d = {"id": id, "name": name, "stat": stat, "description": desc}
    d.update(kw)
    return d

special = [
  S("authority", "Authority", "SPECIAL", "Use the weight of the badge to make people comply.", role="cop"),
  S("charismatic_leadership", "Charismatic Leadership", "SPECIAL", "Sway and command a crowd through performance.", role="rocker"),
  S("combat_sense", "Combat Sense", "SPECIAL", "Trained danger sense; adds to Initiative and Awareness.", role="solo"),
  S("credibility", "Credibility", "SPECIAL", "How far the public believes the stories you break.", role="media"),
  S("family", "Family", "SPECIAL", "Call on your nomad pack for help and resources.", role="nomad"),
  S("interface", "Interface", "SPECIAL", "Skill at running programs and moving through the Net.", role="netrunner"),
  S("jury_rig", "Jury Rig", "SPECIAL", "Patch anything together fast, at least for a while.", role="techie"),
  S("medical_tech", "Medical Tech", "SPECIAL", "Surgery and serious medical care.", role="medtechie"),
  S("resources", "Resources", "SPECIAL", "Pull company money, people and equipment.", role="corporate"),
  S("streetdeal", "Streetdeal", "SPECIAL", "Find goods, people and rumors on the street.", role="fixer"),
]

general = [
  # ATTR
  S("personal_grooming", "Personal Grooming", "ATTR", "Looking your best, from skin care to hair."),
  S("wardrobe_style", "Wardrobe & Style", "ATTR", "Knowing what to wear and how to wear it."),
  # BODY
  S("endurance", "Endurance", "BODY", "Pushing through pain, hunger and exhaustion."),
  S("strength_feat", "Strength Feat", "BODY", "Bending, lifting and breaking things."),
  S("swimming", "Swimming", "BODY", "Moving through water."),
  # COOL
  S("interrogation", "Interrogation", "COOL", "Pulling information out of unwilling people."),
  S("intimidate", "Intimidate", "COOL", "Scaring people into doing what you want."),
  S("oratory", "Oratory", "COOL", "Public speaking and speeches."),
  S("resist_torture_drugs", "Resist Torture/Drugs", "COOL", "Holding out against pain and chemicals."),
  S("streetwise", "Streetwise", "COOL", "Knowing the unwritten rules of the street."),
  # EMP
  S("human_perception", "Human Perception", "EMP", "Reading people and spotting lies."),
  S("interview", "Interview", "EMP", "Getting people to open up in conversation."),
  S("leadership", "Leadership", "EMP", "Leading and motivating a group."),
  S("seduction", "Seduction", "EMP", "Romantic and physical charm."),
  S("social", "Social", "EMP", "Handling formal and high-society situations."),
  S("persuasion", "Persuasion & Fast Talk", "EMP", "Talking people into things."),
  S("perform", "Perform", "EMP", "Acting, singing and stage presence."),
  # INT
  S("accounting", "Accounting", "INT", "Bookkeeping and money trails."),
  S("anthropology", "Anthropology", "INT", "Cultures and customs."),
  S("awareness_notice", "Awareness/Notice", "INT", "Spotting clues, ambushes and hidden things."),
  S("biology", "Biology", "INT", "Living systems."),
  S("botany", "Botany", "INT", "Plants."),
  S("chemistry", "Chemistry", "INT", "Chemicals and reactions."),
  S("composition", "Composition", "INT", "Writing songs, articles and stories."),
  S("diagnose_illness", "Diagnose Illness", "INT", "Identifying diseases and injuries."),
  S("education", "Education & General Knowledge", "INT", "Book learning and general facts."),
  S("expert", "Expert", "INT", "Deep knowledge of one chosen field.", needsDetail=True, detailLabel="Field", repeatable=True),
  S("gamble", "Gamble", "INT", "Games of chance and reading the odds."),
  S("geology", "Geology", "INT", "Rocks, soil and minerals."),
  S("hide_evade", "Hide/Evade", "INT", "Losing pursuers and lying low."),
  S("history", "History", "INT", "Past events."),
  S("know_language", "Know Language", "INT", "Speaking and reading another language.", needsDetail=True, detailLabel="Language", repeatable=True),
  S("library_search", "Library Search", "INT", "Finding information in databases and archives."),
  S("mathematics", "Mathematics", "INT", "Math and calculation."),
  S("physics", "Physics", "INT", "Physical laws."),
  S("programming", "Programming", "INT", "Writing software and Net programs."),
  S("shadow_track", "Shadow/Track", "INT", "Following someone without being seen."),
  S("stock_market", "Stock Market", "INT", "Trading and markets."),
  S("system_knowledge", "System Knowledge", "INT", "Layout and landmarks of the Net."),
  S("teaching", "Teaching", "INT", "Passing skills on to others."),
  S("wilderness_survival", "Wilderness Survival", "INT", "Living off the land."),
  S("zoology", "Zoology", "INT", "Animals."),
  # REF
  S("archery", "Archery", "REF", "Bows and crossbows."),
  S("athletics", "Athletics", "REF", "Running, climbing, jumping and throwing."),
  S("brawling", "Brawling", "REF", "Street fighting."),
  S("dance", "Dance", "REF", "Dancing."),
  S("dodge_escape", "Dodge & Escape", "REF", "Avoiding attacks and slipping out of holds."),
  S("driving", "Driving", "REF", "Cars and trucks."),
  S("fencing", "Fencing", "REF", "Swords and blades in formal style."),
  S("handgun", "Handgun", "REF", "Pistols."),
  S("heavy_weapons", "Heavy Weapons", "REF", "Rocket launchers, grenade launchers and similar."),
  S("martial_arts", "Martial Arts", "REF", "Trained unarmed fighting in one style.", needsDetail=True, detailLabel="Style", repeatable=True),
  S("melee", "Melee", "REF", "Knives, clubs and close weapons."),
  S("motorcycle", "Motorcycle", "REF", "Bikes."),
  S("heavy_machinery", "Operate Heavy Machinery", "REF", "Cranes, loaders and construction equipment."),
  S("pilot_gyro", "Pilot (Gyro)", "REF", "Gyrocopters and helicopters."),
  S("pilot_fixed_wing", "Pilot (Fixed Wing)", "REF", "Airplanes."),
  S("pilot_dirigible", "Pilot (Dirigible)", "REF", "Airships."),
  S("pilot_vtol", "Pilot (Vectored Thrust Vehicle)", "REF", "AVs and other vectored-thrust craft."),
  S("rifle", "Rifle", "REF", "Rifles and shotguns."),
  S("stealth", "Stealth", "REF", "Moving silently and unseen."),
  S("submachinegun", "Submachinegun", "REF", "SMGs."),
  # TECH
  S("aero_tech", "Aero Tech", "TECH", "Repairing aircraft."),
  S("av_tech", "AV Tech", "TECH", "Repairing AVs."),
  S("basic_tech", "Basic Tech", "TECH", "General repair of simple machines and electronics."),
  S("cryotank_operation", "Cryotank Operation", "TECH", "Running medical cryo equipment."),
  S("cyberdeck_design", "Cyberdeck Design", "TECH", "Designing and building cyberdecks."),
  S("cybertech", "CyberTech", "TECH", "Maintaining and repairing cyberware."),
  S("demolitions", "Demolitions", "TECH", "Setting and defusing explosives."),
  S("disguise", "Disguise", "TECH", "Changing your appearance."),
  S("electronics", "Electronics", "TECH", "Building and fixing electronic devices."),
  S("electronic_security", "Electronic Security", "TECH", "Alarms, cameras and electronic locks."),
  S("first_aid", "First Aid", "TECH", "Basic emergency care."),
  S("forgery", "Forgery", "TECH", "Faking documents and IDs."),
  S("gyro_tech", "Gyro Tech", "TECH", "Repairing gyros and helicopters."),
  S("paint_draw", "Paint or Draw", "TECH", "Visual art."),
  S("photo_film", "Photo & Film", "TECH", "Cameras, photos and video."),
  S("pharmaceuticals", "Pharmaceuticals", "TECH", "Making and identifying drugs."),
  S("pick_lock", "Pick Lock", "TECH", "Opening mechanical locks."),
  S("pick_pocket", "Pick Pocket", "TECH", "Lifting things off people unnoticed."),
  S("play_instrument", "Play Instrument", "TECH", "Playing a musical instrument.", needsDetail=True, detailLabel="Instrument", repeatable=True),
  S("weaponsmith", "Weaponsmith", "TECH", "Repairing and modifying weapons."),
]

skills = {"version": 1, "maxLevel": 10,
          "statGroups": ["SPECIAL", "ATTR", "BODY", "COOL", "EMP", "INT", "REF", "TECH"],
          "skills": special + general}
dump("skills.json", skills)
skill_ids = {s["id"] for s in skills["skills"]}

# ---------------------------------------------------------------- roles
roles = {"version": 1, "careerPoints": 40, "pickupPointsFormula": "INT + REF", "roles": [
  {"id": "solo", "name": "Solo", "tagline": "Hired gun",
   "description": "A professional fighter: bodyguard, mercenary or assassin who sells combat skill to the highest bidder.",
   "specialAbility": "combat_sense",
   "careerSkills": ["combat_sense", "awareness_notice", "handgun", "melee", "weaponsmith", "rifle", "athletics", "submachinegun", "stealth"],
   "careerChoices": [{"pick": 1, "from": ["brawling", "martial_arts"]}],
   "priorityStats": ["REF", "BODY", "COOL"]},
  {"id": "rocker", "name": "Rockerboy", "tagline": "Rebel musician",
   "description": "A performer who uses music and fame to stir up crowds and fight the system.",
   "specialAbility": "charismatic_leadership",
   "careerSkills": ["charismatic_leadership", "awareness_notice", "perform", "wardrobe_style", "composition", "brawling", "play_instrument", "streetwise", "persuasion", "seduction"],
   "priorityStats": ["COOL", "EMP", "ATTR"]},
  {"id": "netrunner", "name": "Netrunner", "tagline": "Hacker",
   "description": "A hacker who jacks straight into the Net to steal data, crack systems and fight other runners.",
   "specialAbility": "interface",
   "careerSkills": ["interface", "awareness_notice", "basic_tech", "education", "system_knowledge", "cybertech", "cyberdeck_design", "composition", "electronics", "programming"],
   "priorityStats": ["INT", "TECH", "REF"]},
  {"id": "media", "name": "Media", "tagline": "Journalist",
   "description": "A reporter who digs up the truth and gets it out to the public, whatever the corporations want.",
   "specialAbility": "credibility",
   "careerSkills": ["credibility", "awareness_notice", "composition", "education", "persuasion", "human_perception", "social", "streetwise", "photo_film", "interview"],
   "priorityStats": ["INT", "EMP", "COOL"]},
  {"id": "nomad", "name": "Nomad", "tagline": "Road warrior",
   "description": "A member of a roaming clan living on the highways, loyal to family above all.",
   "specialAbility": "family",
   "careerSkills": ["family", "awareness_notice", "endurance", "melee", "rifle", "driving", "basic_tech", "wilderness_survival", "brawling", "athletics"],
   "priorityStats": ["REF", "BODY", "TECH"]},
  {"id": "fixer", "name": "Fixer", "tagline": "Dealmaker",
   "description": "A street broker who can get anything or anyone, for a price.",
   "specialAbility": "streetdeal",
   "careerSkills": ["streetdeal", "awareness_notice", "forgery", "handgun", "brawling", "melee", "pick_lock", "pick_pocket", "intimidate", "persuasion"],
   "priorityStats": ["COOL", "INT", "EMP"]},
  {"id": "cop", "name": "Cop", "tagline": "Law on the street",
   "description": "An officer trying to keep some order in a city that has mostly given up on it.",
   "specialAbility": "authority",
   "careerSkills": ["authority", "awareness_notice", "handgun", "human_perception", "athletics", "education", "brawling", "melee", "interrogation", "streetwise"],
   "priorityStats": ["REF", "COOL", "INT"]},
  {"id": "corporate", "name": "Corporate", "tagline": "Executive",
   "description": "A company climber with access to money and power, playing a ruthless game of office politics.",
   "specialAbility": "resources",
   "careerSkills": ["resources", "awareness_notice", "human_perception", "education", "library_search", "social", "persuasion", "stock_market", "wardrobe_style", "personal_grooming"],
   "priorityStats": ["INT", "COOL", "ATTR"]},
  {"id": "techie", "name": "Techie", "tagline": "Fixer of machines",
   "description": "A mechanic and inventor who can build, repair or improvise almost any device.",
   "specialAbility": "jury_rig",
   "careerSkills": ["jury_rig", "awareness_notice", "basic_tech", "cybertech", "teaching", "education", "electronics"],
   "careerFreePicks": [{"count": 3, "stat": "TECH"}],
   "priorityStats": ["TECH", "INT"], "verify": True},
  {"id": "medtechie", "name": "Medtechie", "tagline": "Street doctor",
   "description": "A medic who patches up the wounded and installs cyberware, licensed or not.",
   "specialAbility": "medical_tech",
   "careerSkills": ["medical_tech", "awareness_notice", "basic_tech", "diagnose_illness", "education", "cryotank_operation", "library_search", "pharmaceuticals", "zoology", "human_perception"],
   "priorityStats": ["TECH", "INT", "EMP"], "verify": True}
]}
dump("roles.json", roles)

# ---------------------------------------------------------------- lifepath (own words)
def T(*entries):  # d10 table: entry i <-> roll i+1
    assert len(entries) == 10, entries
    return [{"roll": i + 1, "text": e} for i, e in enumerate(entries)]

lifepath = {"version": 1, "dice": "1d10", "sections": [
  {"id": "style", "name": "Style", "tables": [
    {"id": "clothes", "name": "Clothes", "entries": T(
      "Torn-up street gear and patched denim", "Sleek corporate suits", "Military surplus and cargo pockets",
      "Glowing smart-fabric that shifts color", "Leather, chains and band patches", "Loose, layered streetwear",
      "Vintage 20th-century thrift finds", "Armored jacket over everything", "Minimal monochrome designer pieces",
      "Whatever was clean that morning")},
    {"id": "hair", "name": "Hairstyle", "entries": T(
      "Shaved clean", "Neon-dyed mohawk", "Long and wild", "Short and military", "Slicked back",
      "Braids with data-bead charms", "Asymmetric undercut", "Chrome-plated scalp", "Messy and unwashed", "Perfect salon styling")},
    {"id": "affectation", "name": "Affectation", "entries": T(
      "Mirrorshades, day and night", "Tattoos that crawl across the skin", "Always chewing something",
      "A visible, unhidden cyberlimb", "Speaks very quietly", "Cracks knuckles constantly",
      "Wears a single strange earring", "Never takes off gloves", "Hums old songs", "Glowing subdermal lights")},
    {"id": "origin", "name": "Cultural origin", "entries": T(
      "North American", "South American", "Western European", "Eastern European", "Middle Eastern / North African",
      "Sub-Saharan African", "East Asian", "South Asian", "Southeast Asian", "Pacific Islander / Oceanian")},
    {"id": "language", "name": "Language", "derivedFrom": "origin", "note": "Suggest a first language from the origin; the user may override.",
     "byOrigin": {
       "1": ["English", "Spanish", "French"], "2": ["Spanish", "Portuguese"], "3": ["English", "French", "German", "Italian", "Spanish"],
       "4": ["Russian", "Polish", "Ukrainian", "Czech"], "5": ["Arabic", "Farsi", "Turkish", "Hebrew"],
       "6": ["Swahili", "Yoruba", "Zulu", "Amharic"], "7": ["Mandarin", "Cantonese", "Japanese", "Korean"],
       "8": ["Hindi", "Bengali", "Tamil", "Urdu"], "9": ["Vietnamese", "Thai", "Tagalog", "Indonesian"],
       "10": ["English", "Maori", "Samoan"]}}
  ]},
  {"id": "family", "name": "Family", "tables": [
    {"id": "ranking", "name": "Family background", "entries": T(
      "Corporate executives", "Corporate middle managers", "Corporate office workers", "Nomad pack members",
      "Gang family", "Combat zone squatters", "Urban homeless", "Arcology residents", "Farmers in the outlands", "Wealthy old-money aristocrats")},
    {"id": "parents", "name": "Parents", "dice": "1d10",
     "ranges": [{"min": 1, "max": 6, "text": "Both parents are alive"},
                {"min": 7, "max": 10, "text": "Something happened to one or both parents", "next": "parentFate"}]},
    {"id": "parentFate", "name": "What happened to your parents", "entries": T(
      "Died in a corporate war", "Killed in a street accident", "Murdered", "Lost their memory and never came back",
      "Never knew them", "In hiding to protect you", "Left you with relatives", "Grew up on the street after they vanished",
      "Gave you up for adoption", "Sold you for money")},
    {"id": "familyStatus", "name": "Family status", "dice": "1d10",
     "ranges": [{"min": 1, "max": 6, "text": "Your family is in danger", "next": "familyTragedy"},
                {"min": 7, "max": 10, "text": "Your family is doing fine"}]},
    {"id": "familyTragedy", "name": "Family tragedy", "entries": T(
      "Lost everything through betrayal", "Lost everything through bad management", "Exiled or driven out of their home",
      "Imprisoned, and you alone escaped", "Vanished; you are the last one left", "Murdered, and you saw it happen",
      "Caught up in a long-running conspiracy", "Scattered by misfortune", "Cursed by a hereditary feud", "You inherited a big debt")},
    {"id": "childhood", "name": "Childhood environment", "entries": T(
      "Spent on the street with no adult supervision", "In a safe corporate suburb", "Moving from town to town in a nomad pack",
      "In a decaying, once-upscale neighborhood", "Defending a home in the combat zone", "In a huge arcology tower",
      "In a ruined, bombed-out city", "In a small farming town", "In a big city full of chances and danger", "In an orbital habitat")},
    {"id": "siblings", "name": "Siblings", "dice": "1d10",
     "rule": "1-7 = that many siblings; 8-10 = only child",
     "sibling": {
       "gender": {"dice": "1d10", "ranges": [{"min": 1, "max": 5, "text": "Male"}, {"min": 6, "max": 10, "text": "Female"}]},
       "age": {"dice": "1d10", "ranges": [{"min": 1, "max": 5, "text": "Older"}, {"min": 6, "max": 9, "text": "Younger"}, {"min": 10, "max": 10, "text": "Twin"}]},
       "feeling": {"dice": "1d10", "ranges": [{"min": 1, "max": 2, "text": "Dislikes you"}, {"min": 3, "max": 4, "text": "Likes you"},
                                              {"min": 5, "max": 6, "text": "Neutral"}, {"min": 7, "max": 8, "text": "Hero-worships you"},
                                              {"min": 9, "max": 10, "text": "Hates you"}]}}}
  ]},
  {"id": "motivations", "name": "Motivations", "tables": [
    {"id": "personality", "name": "Personality", "entries": T(
      "Shy and secretive", "Rebellious and antisocial", "Arrogant and proud", "Moody and impulsive", "Picky and nervous",
      "Stable and serious", "Silly and scatterbrained", "Sneaky and deceptive", "Intellectual and detached", "Friendly and outgoing")},
    {"id": "valuedPerson", "name": "Person you value most", "entries": T(
      "A parent", "A brother or sister", "A lover", "A friend", "Yourself", "A pet", "A teacher or mentor",
      "A public figure", "A personal hero", "No one")},
    {"id": "valueMost", "name": "What you value most", "entries": T(
      "Money", "Honor", "Your word", "Honesty", "Knowledge", "Vengeance", "Love", "Power", "Having a good time", "Friendship")},
    {"id": "feelAboutPeople", "name": "How you feel about people", "entries": T(
      "Neutral", "Neutral", "Everyone is valuable", "People are tools to be used", "Every life is sacred",
      "People are obstacles to remove", "People are untrustworthy", "Wipe them all out", "People are wonderful", "People are wonderful")},
    {"id": "valuedPossession", "name": "Most valued possession", "entries": T(
      "A weapon", "A tool", "A piece of clothing", "A photograph", "A book or diary", "A recording",
      "A musical instrument", "A piece of jewelry", "A toy", "A letter")}
  ]},
  {"id": "lifeEvents", "name": "Life events", "rule": "One event per year from age 16 to the character's current age.",
   "eventType": {"dice": "1d10", "ranges": [
     {"min": 1, "max": 3, "text": "Big problems, big wins", "next": "problemsOrWins"},
     {"min": 4, "max": 6, "text": "Friends and enemies", "next": "friendsOrEnemies"},
     {"min": 7, "max": 8, "text": "Romantic involvement", "next": "romance"},
     {"min": 9, "max": 10, "text": "Nothing happened that year"}]},
   "tables": [
     {"id": "problemsOrWins", "name": "Problem or win", "dice": "1d10",
      "ranges": [{"min": 1, "max": 5, "text": "Big problem", "next": "bigProblem"}, {"min": 6, "max": 10, "text": "Big win", "next": "bigWin"}],
      "note": "Even/odd split also works; pick one rule and keep it."},
     {"id": "bigProblem", "name": "Big problem", "entries": T(
       "Lost a large amount of money", "Framed for something you didn't do", "Hunted by a corporation",
       "Betrayed by someone close", "Badly injured and still carry the scars", "Hooked on a drug for a while",
       "Lost your job or position", "A close friend or lover died", "Lost your memory of that year", "Spent time in prison")},
     {"id": "bigWin", "name": "Big win", "entries": T(
       "Made a powerful connection", "Found a large sum of money", "Landed a big deal", "Found a mentor who taught you",
       "Earned a favor from a corporate insider", "Became friends with a cop", "Became friends with a nomad pack",
       "Gained a local reputation", "Found a rare piece of tech", "Saved someone important")},
     {"id": "friendsOrEnemies", "name": "Friend or enemy", "dice": "1d10",
      "ranges": [{"min": 1, "max": 5, "text": "Made a friend", "next": "friend"}, {"min": 6, "max": 10, "text": "Made an enemy", "next": "enemy"}]},
     {"id": "friend", "name": "Friend", "entries": T(
       "Like a sibling to you", "Like a big brother or sister", "A teacher figure", "A partner or coworker",
       "An old lover", "An old enemy who came around", "Like a parent to you", "Someone you know from childhood",
       "Someone you met online", "Someone with shared interests")},
     {"id": "enemy", "name": "Enemy", "subTables": [
       {"id": "who", "name": "Who", "entries": T(
         "An ex-friend", "An ex-lover", "A relative", "A childhood rival", "A corporate executive",
         "A gang boss", "A cop", "A booster gang", "A rival in your role", "A former partner")},
       {"id": "cause", "name": "Cause", "entries": T(
         "Caused the other to lose face", "Caused a loss of a lover or friend", "Caused a big humiliation",
         "Accused the other of cowardice", "Left the other for dead", "Turned down an offer of work",
         "Insulted them publicly", "Romantic rivalry", "Foiled a plan of theirs", "Stole something from them")},
       {"id": "response", "name": "What they will do", "entries": T(
         "Avoid you", "Avoid you", "Go into a murderous rage on sight", "Go into a murderous rage on sight",
         "Backstab you indirectly", "Backstab you indirectly", "Verbally attack you", "Verbally attack you",
         "Set you up for a fall", "Hunt you down")}]},
     {"id": "romance", "name": "Romance", "dice": "1d10",
      "ranges": [{"min": 1, "max": 4, "text": "Happy love affair"},
                 {"min": 5, "max": 5, "text": "Love affair ended in tragedy", "next": "tragicLove"},
                 {"min": 6, "max": 7, "text": "Love affair with problems", "next": "problemLove"},
                 {"min": 8, "max": 10, "text": "Quick affairs and hot dates"}]},
     {"id": "tragicLove", "name": "Tragic ending", "entries": T(
       "Your lover died in an accident", "Your lover vanished without a trace", "It just didn't work out",
       "A personal goal or vendetta came between you", "Your lover was imprisoned or exiled",
       "Your lover was kidnapped", "Your lover went insane or cyberpsycho", "Your lover committed suicide",
       "Your lover was murdered by an enemy", "Your lover is now your rival")},
     {"id": "problemLove", "name": "Problem", "entries": T(
       "Your lover's family hates you", "Your lover's friends hate you", "You fight all the time",
       "You are on opposite sides of a war", "Your lover is jealous", "Your lover is the jealous kind and dangerous",
       "You have conflicting backgrounds", "Your lover has a past they won't talk about",
       "Your lover is involved with someone else", "Your lover is a criminal")}
   ]}
]}
dump("lifepath.json", lifepath)

# ---------------------------------------------------------------- gear (generic names, numbers to verify)
gear = {"version": 1, "currency": "eb", "verify": True,
  "note": "Generic item names. Stats approximate the CP2020 rulebook and must be verified.",
  "startingMoney": {
    "method": "monthlySalary * multiplier",
    "multiplierDice": "1d6", "multiplierNote": "Roll 1d6 and divide by 3 (round up) for months of savings; adjust to taste.",
    "salaryBySpecialAbilityLevel": {
      "solo":      [2000, 2500, 3000, 4500, 7000, 8000, 9000, 10000, 12000, 15000],
      "rocker":    [1000, 1500, 2000, 5000, 8000, 10000, 12000, 15000, 20000, 25000],
      "netrunner": [1000, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 10000, 15000],
      "media":     [1000, 1200, 1500, 2000, 3000, 4000, 5000, 7000, 10000, 12000],
      "nomad":     [1000, 1000, 1000, 1500, 1500, 2000, 2000, 3000, 4000, 5000],
      "fixer":     [1500, 2000, 3000, 3500, 4000, 5000, 7000, 8000, 9000, 10000],
      "cop":       [1000, 1200, 3000, 3000, 4000, 5000, 7000, 9000, 12000, 15000],
      "corporate": [1500, 3000, 3500, 4000, 5000, 6000, 7500, 9000, 12000, 15000],
      "techie":    [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
      "medtechie": [1600, 3000, 4000, 5000, 7000, 8000, 10000, 12000, 15000, 20000]}},
  "weapons": [
    {"id": "light_pistol", "name": "Light pistol", "type": "pistol", "skill": "handgun", "wa": 0, "damage": "1d6+1", "shots": 10, "rof": 2, "cost": 150},
    {"id": "medium_pistol", "name": "Medium pistol", "type": "pistol", "skill": "handgun", "wa": 0, "damage": "2d6+1", "shots": 10, "rof": 2, "cost": 250},
    {"id": "heavy_pistol", "name": "Heavy pistol", "type": "pistol", "skill": "handgun", "wa": 0, "damage": "3d6", "shots": 8, "rof": 2, "cost": 350},
    {"id": "very_heavy_pistol", "name": "Very heavy pistol", "type": "pistol", "skill": "handgun", "wa": -1, "damage": "4d6", "shots": 6, "rof": 1, "cost": 500},
    {"id": "light_smg", "name": "Light SMG", "type": "smg", "skill": "submachinegun", "wa": 0, "damage": "1d6+1", "shots": 30, "rof": 20, "cost": 400},
    {"id": "medium_smg", "name": "Medium SMG", "type": "smg", "skill": "submachinegun", "wa": 0, "damage": "2d6+1", "shots": 40, "rof": 20, "cost": 500},
    {"id": "heavy_smg", "name": "Heavy SMG", "type": "smg", "skill": "submachinegun", "wa": -1, "damage": "3d6", "shots": 35, "rof": 25, "cost": 700},
    {"id": "assault_rifle", "name": "Assault rifle", "type": "rifle", "skill": "rifle", "wa": 1, "damage": "5d6", "shots": 35, "rof": 30, "cost": 1000},
    {"id": "sniper_rifle", "name": "Sniper rifle", "type": "rifle", "skill": "rifle", "wa": 2, "damage": "6d6", "shots": 5, "rof": 1, "cost": 1500},
    {"id": "shotgun", "name": "Combat shotgun", "type": "shotgun", "skill": "rifle", "wa": 0, "damage": "4d6", "shots": 8, "rof": 1, "cost": 600},
    {"id": "knife", "name": "Knife", "type": "melee", "skill": "melee", "wa": 0, "damage": "1d6", "cost": 20},
    {"id": "club", "name": "Club / baton", "type": "melee", "skill": "melee", "wa": 0, "damage": "1d6", "cost": 10},
    {"id": "sword", "name": "Sword", "type": "melee", "skill": "melee", "wa": 0, "damage": "2d6+2", "cost": 200},
    {"id": "monoblade", "name": "Monoblade", "type": "melee", "skill": "melee", "wa": 1, "damage": "4d6", "cost": 600},
    {"id": "grenade", "name": "Fragmentation grenade", "type": "thrown", "skill": "athletics", "wa": 0, "damage": "7d6", "cost": 30}
  ],
  "armor": [
    {"id": "leather_jacket", "name": "Heavy leather jacket", "sp": 4, "covers": ["torso", "arms"], "ev": 0, "cost": 50},
    {"id": "kevlar_tshirt", "name": "Kevlar T-shirt / vest", "sp": 10, "covers": ["torso"], "ev": 0, "cost": 90},
    {"id": "light_armor_jacket", "name": "Light armor jacket", "sp": 14, "covers": ["torso", "arms"], "ev": 0, "cost": 150},
    {"id": "medium_armor_jacket", "name": "Medium armor jacket", "sp": 18, "covers": ["torso", "arms"], "ev": 1, "cost": 200},
    {"id": "flak_vest", "name": "Flak vest", "sp": 20, "covers": ["torso"], "ev": 1, "cost": 200},
    {"id": "flak_pants", "name": "Flak pants", "sp": 20, "covers": ["legs"], "ev": 1, "cost": 200},
    {"id": "heavy_vest", "name": "Heavy combat vest", "sp": 25, "covers": ["torso"], "ev": 3, "cost": 250},
    {"id": "steel_helmet", "name": "Steel helmet", "sp": 14, "covers": ["head"], "ev": 0, "cost": 20},
    {"id": "nylon_helmet", "name": "Nylon combat helmet", "sp": 20, "covers": ["head"], "ev": 0, "cost": 100},
    {"id": "full_body_armor", "name": "Full body armor suit", "sp": 25, "covers": ["head", "torso", "arms", "legs"], "ev": 2, "cost": 600}
  ],
  "cyberware": [
    {"id": "interface_plugs", "name": "Interface plugs", "category": "neuralware", "humanityCost": "1d6", "cost": 200, "note": "Required for netrunning."},
    {"id": "neural_processor", "name": "Neural processor", "category": "neuralware", "humanityCost": "1d6", "cost": 1000, "note": "Base for most neuralware."},
    {"id": "reflex_booster", "name": "Reflex booster", "category": "neuralware", "humanityCost": "2d6", "cost": 1000, "effect": "+1 Initiative", "requires": ["neural_processor"]},
    {"id": "smartgun_link", "name": "Smartgun link", "category": "neuralware", "humanityCost": "2d6", "cost": 100, "effect": "+2 to hit with smartguns", "requires": ["interface_plugs"]},
    {"id": "cyberoptic", "name": "Cyberoptic (per eye)", "category": "cyberoptics", "humanityCost": "2d6", "cost": 500},
    {"id": "low_light", "name": "Low-light vision option", "category": "cyberoptics", "humanityCost": "1", "cost": 200, "requires": ["cyberoptic"]},
    {"id": "cyberaudio", "name": "Cyberaudio", "category": "cyberaudio", "humanityCost": "2d6", "cost": 500},
    {"id": "cyberarm", "name": "Cyberarm", "category": "cyberlimbs", "humanityCost": "2d6+2", "cost": 3000},
    {"id": "cyberleg", "name": "Cyberleg", "category": "cyberlimbs", "humanityCost": "2d6", "cost": 2000},
    {"id": "muscle_bone_lace", "name": "Muscle & bone lace", "category": "implants", "humanityCost": "2d6", "cost": 1500, "effect": "+2 BODY"},
    {"id": "skinweave", "name": "Skinweave", "category": "implants", "humanityCost": "2d6", "cost": 2000, "effect": "SP 12 all locations"},
    {"id": "subdermal_armor", "name": "Subdermal armor", "category": "implants", "humanityCost": "3d6", "cost": 1200, "effect": "SP 18 torso"},
    {"id": "rippers", "name": "Rippers (finger blades)", "category": "fashionware_weapons", "humanityCost": "1d6", "cost": 400, "effect": "1d6+3 melee damage"},
    {"id": "wolvers", "name": "Wolvers (knuckle blades)", "category": "fashionware_weapons", "humanityCost": "2d6", "cost": 600, "effect": "3d6 melee damage"},
    {"id": "light_tattoo", "name": "Light tattoo", "category": "fashionware", "humanityCost": "1", "cost": 40},
    {"id": "biomonitor", "name": "Biomonitor", "category": "fashionware", "humanityCost": "0", "cost": 700}
  ]
}
dump("gear.json", gear)

# ---------------------------------------------------------------- validation
errors = []
for r in roles["roles"]:
    for s in r["careerSkills"] + [s for c in r.get("careerChoices", []) for s in c["from"]]:
        if s not in skill_ids:
            errors.append(f"role {r['id']}: unknown skill {s}")
    if r["specialAbility"] not in r["careerSkills"]:
        errors.append(f"role {r['id']}: special ability not in career list")
    total = len(r["careerSkills"]) + sum(c["pick"] for c in r.get("careerChoices", [])) + sum(p["count"] for p in r.get("careerFreePicks", []))
    if total != 10:
        errors.append(f"role {r['id']}: career skill count {total} != 10")
ids = [s["id"] for s in skills["skills"]]
if len(ids) != len(set(ids)):
    errors.append("duplicate skill ids")
role_ids = {r["id"] for r in roles["roles"]}
if set(gear["startingMoney"]["salaryBySpecialAbilityLevel"]) != role_ids:
    errors.append("salary table roles mismatch")
for r, row in gear["startingMoney"]["salaryBySpecialAbilityLevel"].items():
    if len(row) != 10:
        errors.append(f"salary {r}: needs 10 levels")
cw = {c["id"] for c in gear["cyberware"]}
for c in gear["cyberware"]:
    for req in c.get("requires", []):
        if req not in cw:
            errors.append(f"cyberware {c['id']}: unknown requirement {req}")

print("skills:", len(ids), "roles:", len(role_ids), "weapons:", len(gear["weapons"]),
      "armor:", len(gear["armor"]), "cyberware:", len(gear["cyberware"]))
if errors:
    print("ERRORS:"); [print(" -", e) for e in errors]; sys.exit(1)
print("OK")
