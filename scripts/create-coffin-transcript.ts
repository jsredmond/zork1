import * as fs from 'fs';

const transcript = {
  id: "34-coffin-puzzle",
  title: "Coffin Puzzle - Getting the Sceptre",
  description: "Navigate to Egyptian Room, get coffin, open it, and retrieve the sceptre",
  difficulty: "high",
  tags: ["coffin", "sceptre", "egyptian-room", "treasure", "puzzle"],
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
    { input: "se", location: "Dome Room" },
    { input: "e", location: "Dome Room" },
    { input: "tie rope to railing", location: "Dome Room" },
    { input: "d", location: "Torch Room" },
    { input: "s", location: "Temple" },
    { input: "e", location: "Egyptian Room" },
    { input: "get coffin", location: "Egyptian Room" },
    { input: "open coffin", location: "Egyptian Room" },
    { input: "get sceptre", location: "Egyptian Room" }
  ],
  expectedBehavior: {
    egyptianRoom: "Room that looks like an Egyptian tomb with coffin in center",
    getCoffin: "Taken.",
    openCoffin: "The gold coffin opens.",
    getSceptre: "Taken.",
    coffinValue: "Gold coffin is worth 15 points",
    sceptreValue: "Sceptre is worth 4 points",
    sceptreUse: "Wave sceptre at Aragain Falls to solidify rainbow"
  },
  notes: [
    "Coffin is a treasure worth 15 points",
    "Sceptre inside coffin is worth 4 points",
    "Sceptre is needed for rainbow puzzle - wave at falls to solidify rainbow",
    "Must have rope to descend from Dome Room to Torch Room",
    "Troll combat is random - may need multiple attempts",
    "Egyptian Room also contains jeweled scarab in some versions"
  ]
};

fs.writeFileSync(
  '.kiro/transcripts/high/34-coffin-puzzle.json',
  JSON.stringify(transcript, null, 2)
);

console.log('Created .kiro/transcripts/high/34-coffin-puzzle.json');
