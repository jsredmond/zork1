import * as fs from 'fs';

const transcript = {
  id: "32-mirror-room",
  title: "Mirror Room - Teleportation Puzzle",
  description: "Demonstrate mirror teleportation between North and South Mirror Rooms",
  difficulty: "high",
  tags: ["mirror", "teleportation", "puzzle", "navigation"],
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
    { input: "s", location: "Mirror Room (South)" },
    { input: "look", location: "Mirror Room (South)" },
    { input: "examine mirror", location: "Mirror Room (South)" },
    { input: "touch mirror", location: "Mirror Room (South)" },
    { input: "look", location: "Mirror Room (North)" }
  ],
  expectedBehavior: {
    southMirrorRoom: "Large square room with tall ceilings, enormous mirror on south wall",
    examineResponse: "There is an amazing mirror on the wall. It appears to be a gate to another world.",
    touchResponse: "There is a rumble from deep within the earth and the room shakes...",
    northMirrorRoom: "Narrow north-south passageway with large mirror to the south",
    teleportation: "Touching mirror teleports player between North and South Mirror Rooms"
  },
  notes: [
    "Two separate Mirror Rooms exist: South (large square) and North (narrow passage)",
    "Touching mirror in either room teleports to the other",
    "Mirror can be used repeatedly for bidirectional travel",
    "Examining mirror shows it's a 'gate to another world'",
    "Troll combat is random - may need multiple attempts"
  ]
};

fs.writeFileSync(
  '.kiro/transcripts/high/32-mirror-room.json',
  JSON.stringify(transcript, null, 2)
);

console.log('Created .kiro/transcripts/high/32-mirror-room.json');
