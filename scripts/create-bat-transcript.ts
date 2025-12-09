import * as fs from 'fs';

const rawOutput = fs.readFileSync('.kiro/testing/bat-encounter-output.txt', 'utf-8');

const transcript = {
  id: "31-bat-encounter",
  title: "Bat Encounter - Bat Carries Player",
  description: "Trigger bat encounter without garlic, causing bat to carry player to random location",
  difficulty: "high",
  tags: ["bat", "creature", "transport", "random"],
  commands: [
    { input: "s", location: "West of House" },
    { input: "e", location: "South of House" },
    { input: "open window", location: "Behind House" },
    { input: "w", location: "Behind House" },
    { input: "w", location: "Kitchen" },
    { input: "get lamp", location: "Living Room" },
    { input: "get sword", location: "Living Room" },
    { input: "e", location: "Kitchen" },
    { input: "turn on lamp", location: "Kitchen" },
    { input: "u", location: "Attic" },
    { input: "get rope", location: "Attic" },
    { input: "d", location: "Kitchen" },
    { input: "w", location: "Living Room" },
    { input: "move rug", location: "Living Room" },
    { input: "open trap door", location: "Living Room" },
    { input: "d", location: "Cellar" },
    { input: "n", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "attack troll with sword", location: "The Troll Room" },
    { input: "e", location: "East-West Passage" },
    { input: "e", location: "Round Room" },
    { input: "s", location: "Narrow Passage" },
    { input: "s", location: "Mirror Room" },
    { input: "touch mirror", location: "Mirror Room" },
    { input: "n", location: "Cold Passage" },
    { input: "w", location: "Slide Room" },
    { input: "n", location: "Mine Entrance" },
    { input: "w", location: "Squeaky Room" },
    { input: "n", location: "Bat Room" }
  ],
  expectedBehavior: {
    batEncounter: "A large vampire bat, hanging from the ceiling, swoops down at you!",
    batCarries: "The bat grabs you by the scruff of your neck and lifts you away....",
    result: "Player is transported to a random underground location",
    note: "This only happens when player does NOT have garlic"
  },
  notes: [
    "Bat encounter requires NOT having garlic from the kitchen sack",
    "With garlic, bat will not attack and player can safely get jade figurine",
    "Bat drops player at random location in the dungeon",
    "Jade figurine (5 points) is in the Bat Room",
    "Troll combat is random - may need multiple attempts"
  ]
};

fs.writeFileSync(
  '.kiro/transcripts/high/31-bat-encounter.json',
  JSON.stringify(transcript, null, 2)
);

console.log('Created .kiro/transcripts/high/31-bat-encounter.json');
