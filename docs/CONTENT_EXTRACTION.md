# Zork I Content Extraction Documentation

This document summarizes the game content extracted from the original ZIL source files.

## Source Files

- **1dungeon.zil** - Main game content file containing all rooms, objects, and world layout
- **gverbs.zil** - Generic verb implementations
- **gsyntax.zil** - Syntax definitions for command parsing
- **gglobals.zil** - Global variable declarations

## Extracted Content

### 1. Rooms (110+ locations)

All room definitions have been extracted from 1dungeon.zil and organized into `src/game/data/rooms.ts`.

#### Room Categories:
- **Forest and Outside House** (10 rooms): WEST-OF-HOUSE, NORTH-OF-HOUSE, SOUTH-OF-HOUSE, EAST-OF-HOUSE, FOREST-1, FOREST-2, FOREST-3, PATH, UP-A-TREE, GRATING-CLEARING, CLEARING, STONE-BARROW
- **Inside House** (4 rooms): KITCHEN, ATTIC, LIVING-ROOM, CELLAR
- **Cellar and Vicinity** (4 rooms): CELLAR, TROLL-ROOM, EAST-OF-CHASM, GALLERY, STUDIO
- **Maze** (15 rooms): MAZE-1 through MAZE-15, DEAD-END-1 through DEAD-END-4, GRATING-ROOM
- **Cyclops Area** (3 rooms): CYCLOPS-ROOM, STRANGE-PASSAGE, TREASURE-ROOM
- **Reservoir Area** (5 rooms): RESERVOIR-SOUTH, RESERVOIR, RESERVOIR-NORTH, STREAM-VIEW, IN-STREAM
- **Mirror Rooms** (8 rooms): MIRROR-ROOM-1, MIRROR-ROOM-2, SMALL-CAVE, TINY-CAVE, COLD-PASSAGE, NARROW-PASSAGE, WINDING-PASSAGE, TWISTING-PASSAGE, ATLANTIS-ROOM
- **Round Room Area** (7 rooms): EW-PASSAGE, ROUND-ROOM, DEEP-CANYON, DAMP-CAVE, LOUD-ROOM, NS-PASSAGE, CHASM-ROOM
- **Hades** (2 rooms): ENTRANCE-TO-HADES, LAND-OF-LIVING-DEAD
- **Temple/Egypt** (5 rooms): ENGRAVINGS-CAVE, EGYPT-ROOM, DOME-ROOM, TORCH-ROOM, NORTH-TEMPLE, SOUTH-TEMPLE
- **Dam Area** (3 rooms): DAM-ROOM, DAM-LOBBY, MAINTENANCE-ROOM
- **River Area** (13 rooms): DAM-BASE, RIVER-1 through RIVER-5, WHITE-CLIFFS-NORTH, WHITE-CLIFFS-SOUTH, SHORE, SANDY-BEACH, SANDY-CAVE, ARAGAIN-FALLS, ON-RAINBOW, END-OF-RAINBOW, CANYON-BOTTOM, CLIFF-MIDDLE, CANYON-VIEW
- **Coal Mine** (14 rooms): MINE-ENTRANCE, SQUEEKY-ROOM, BAT-ROOM, SHAFT-ROOM, SMELLY-ROOM, GAS-ROOM, LADDER-TOP, LADDER-BOTTOM, DEAD-END-5, TIMBER-ROOM, LOWER-SHAFT, MACHINE-ROOM, MINE-1 through MINE-4, SLIDE-ROOM

#### Room Properties:
- **ID**: Unique identifier
- **Name**: Display name
- **Description**: Short description
- **Long Description**: Full description shown on first visit or LOOK
- **Exits**: Array of directional exits with destinations and conditions
- **Flags**: Room properties (RLANDBIT, ONBIT, SACREDBIT, MAZEBIT, NONLANDBIT)
- **Global Objects**: Objects visible from this room
- **Pseudo Objects**: Non-takeable scenery objects
- **Action**: Special action handler function
- **Value**: Score value for reaching this room

### 2. Objects (100+ items)

All object definitions have been extracted and organized into `src/game/data/objects.ts`.

#### Object Categories:

**Treasures (19 items)**:
- SKULL (10 points)
- CHALICE (10/5 points)
- TRIDENT (4/11 points)
- DIAMOND (10/10 points)
- JADE (5/5 points)
- EMERALD (5/10 points)
- BAG-OF-COINS (10/5 points)
- PAINTING (4/6 points)
- SCEPTRE (4/6 points)
- COFFIN (10/15 points)
- TORCH (14/6 points)
- BRACELET (5/5 points)
- SCARAB (5/5 points)
- BAR (10/5 points)
- POT-OF-GOLD (10/10 points)
- TRUNK (15/5 points)
- EGG (5/5 points)
- CANARY (6/4 points)
- BAUBLE (1/1 point)

**Tools and Equipment**:
- LAMP (brass lantern with battery)
- SWORD (elvish weapon)
- KNIFE (nasty knife)
- RUSTY-KNIFE
- AXE (bloody axe)
- STILETTO
- ROPE
- SHOVEL
- SCREWDRIVER
- WRENCH
- PUMP (hand-held air pump)
- KEYS (skeleton key)

**Containers**:
- TROPHY-CASE (capacity 10000)
- BOTTLE (capacity 4)
- CHALICE (capacity 5)
- COFFIN (capacity 35)
- BUOY (capacity 20)
- NEST (capacity 20)
- EGG (capacity 6)
- SANDWICH-BAG (capacity 9)
- TOOL-CHEST
- TUBE (capacity 7)
- LARGE-BAG (thief's bag)
- RAISED-BASKET (capacity 50)
- MACHINE (capacity 50)
- INFLATED-BOAT (capacity 100)
- MAILBOX (capacity 10)

**Consumables**:
- WATER
- LUNCH (hot pepper sandwich)
- GARLIC
- COAL

**Readable Items**:
- ADVERTISEMENT (leaflet)
- MATCH (matchbook)
- GUIDE (tour guidebook)
- PRAYER
- ENGRAVINGS
- OWNERS-MANUAL
- MAP
- BOAT-LABEL
- BOOK (black book)
- TUBE (toothpaste tube)

**NPCs/Actors**:
- THIEF (strength 5)
- TROLL (strength 2)
- CYCLOPS (strength 10000)
- GHOSTS
- BAT

**Scenery/Environment**:
- WHITE-HOUSE
- FOREST
- TREE
- WALL
- GRANITE-WALL
- SONGBIRD
- RAINBOW
- RIVER
- CRACK
- GRATE
- Various doors and windows

#### Object Properties:
- **ID**: Unique identifier
- **Name**: Display name
- **Synonyms**: Words that refer to this object
- **Adjectives**: Descriptive words
- **Description**: Short description
- **Long Description**: Detailed description
- **First Description**: Description on first encounter
- **Initial Location**: Starting location
- **Flags**: Object properties (see flags section)
- **Action**: Special action handler
- **Size**: Weight/size value
- **Capacity**: How much it can hold (for containers)
- **Value**: Base point value
- **Treasure Value**: Points when placed in trophy case
- **Text**: Readable text content
- **Strength**: Combat strength (for NPCs)

### 3. Flags

All flags have been documented in `src/game/data/flags.ts`.

#### Object Flags (24 flags):
- **TAKEBIT**: Object can be picked up
- **CONTBIT**: Object is a container
- **OPENBIT**: Container is open
- **LIGHTBIT**: Object provides light
- **ONBIT**: Light is on
- **WEAPONBIT**: Can be used as weapon
- **ACTORBIT**: Is an NPC
- **DOORBIT**: Is a door
- **BURNBIT**: Can burn
- **FOODBIT**: Can be eaten
- **DRINKBIT**: Can be drunk
- **NDESCBIT**: Not described in room
- **INVISIBLE**: Not visible
- **TRANSBIT**: Transparent
- **READBIT**: Can be read
- **SURFACEBIT**: Is a surface
- **TOOLBIT**: Is a tool
- **TURNBIT**: Can be turned
- **CLIMBBIT**: Can be climbed
- **SACREDBIT**: Special handling
- **VEHBIT**: Is a vehicle
- **TRYTAKEBIT**: Special take handling
- **SEARCHBIT**: Can be searched
- **FLAMEBIT**: Is a flame

#### Room Flags (5 flags):
- **RLANDBIT**: Room is on land
- **ONBIT**: Room is lit
- **SACREDBIT**: Room is special
- **MAZEBIT**: Part of maze
- **NONLANDBIT**: Water room

#### Global Conditional Flags (11 flags):
- **CYCLOPS_FLAG**: Cyclops defeated
- **DEFLATE**: Boat deflated
- **DOME_FLAG**: Dome rope tied
- **EMPTY_HANDED**: Player carrying nothing
- **LLD_FLAG**: Hades gate open
- **LOW_TIDE**: Reservoir drained
- **MAGIC_FLAG**: Magic word spoken
- **RAINBOW_FLAG**: Rainbow present
- **TROLL_FLAG**: Troll defeated
- **WON_FLAG**: Game won
- **COFFIN_CURE**: Coffin moveable

### 4. Text and Messages

All game text has been extracted to `src/game/data/messages.ts`:

- **Readable Texts**: Content from books, signs, labels (10+ items)
- **Error Messages**: Parser and game error messages
- **Standard Responses**: Common game responses
- **Directions**: All valid direction words
- **Game Constants**: MAX_SCORE (350), LAMP_LIFETIME (200), etc.

## Data File Organization

```
src/game/data/
├── rooms.ts          # All room definitions
├── objects.ts        # All object definitions
├── flags.ts          # Flag enums and descriptions
└── messages.ts       # Text strings and messages
```

## Implementation Notes

### Room Exits
- Exits can be unconditional or conditional (based on flags)
- Some exits have custom messages instead of destinations
- Conditional exits use global flags (e.g., WON_FLAG, MAGIC_FLAG)

### Object Locations
- Objects can be in rooms, containers, or held by actors
- Special locations: LOCAL-GLOBALS, GLOBAL-OBJECTS
- Initial locations determine starting game state

### Treasures
- Total of 19 treasures worth 350 points
- Each has a base value and treasure value (when in trophy case)
- Some treasures are containers (EGG, COFFIN, CHALICE)

### Special Mechanics
- **Maze**: 15 interconnected rooms with similar descriptions
- **River**: Boat navigation system with 5 river rooms
- **Dam**: Water level control affects reservoir access
- **Rainbow**: Conditional access based on RAINBOW_FLAG
- **Thief**: Steals treasures and moves around
- **Troll**: Blocks passage until defeated
- **Cyclops**: Guards treasure room

## Next Steps

This extracted content will be used to implement:
1. Core data models (Task 3)
2. Room navigation system (Task 8)
3. Object system and inventory (Task 7)
4. Parser vocabulary (Task 5)
5. Game state initialization (Task 3)

## Validation

To ensure accuracy, the implementation should:
- Cross-reference with original ZIL source
- Verify all room connections are bidirectional where appropriate
- Confirm all treasure values sum to 350 points
- Test that all conditional exits work correctly
- Validate object flag combinations make sense
