import * as fs from 'fs';

const transcript = {
  id: "35-cyclops-feeding",
  title: "Cyclops Puzzle - Scaring Cyclops with Ulysses",
  description: "Reach Cyclops Room and scare cyclops away by saying 'Ulysses' (Odyssey reference)",
  difficulty: "high",
  tags: ["cyclops", "ulysses", "odyssey", "puzzle", "maze"],
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
    { input: "w", location: "Maze" },
    { input: "s", location: "Maze" },
    { input: "e", location: "Maze" },
    { input: "u", location: "Maze" },
    { input: "sw", location: "Maze" },
    { input: "e", location: "Maze" },
    { input: "s", location: "Maze" },
    { input: "se", location: "Cyclops Room" },
    { input: "ulysses", location: "Cyclops Room" }
  ],
  expectedBehavior: {
    cyclopsRoom: "Room with exit northwest and staircase up, cyclops blocks staircase",
    cyclopsDescription: "Cyclops looks prepared to eat horses, not very friendly",
    ulyssesCommand: "The cyclops, hearing the name of his father's deadly nemesis, flees the room by knocking down the wall on the east of the room.",
    result: "New exit EAST opens to Living Room (shortcut)",
    treasureRoom: "Staircase UP leads to Treasure Room (Thief's lair)",
    literaryReference: "References Homer's Odyssey where Odysseus/Ulysses blinded Polyphemus the cyclops"
  },
  notes: [
    "Cyclops is NOT fed - he is scared away by saying 'Ulysses' or 'Odysseus'",
    "References The Odyssey: Odysseus blinded Polyphemus (cyclops son of Poseidon)",
    "Cyclops knocks down east wall, creating shortcut to Living Room",
    "Staircase up leads to Treasure Room where Thief stores stolen items",
    "Must navigate maze to reach Cyclops Room from Troll Room",
    "Troll combat is random - may need multiple attempts",
    "Alternative commands: 'odysseus', 'say ulysses', 'say odysseus'"
  ]
};

fs.writeFileSync(
  '.kiro/transcripts/high/35-cyclops-feeding.json',
  JSON.stringify(transcript, null, 2)
);

console.log('Created .kiro/transcripts/high/35-cyclops-feeding.json');
