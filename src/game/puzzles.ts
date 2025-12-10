/**
 * Special Puzzle Mechanics
 * Implements complex puzzle logic for Zork I
 */

import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';
import { ObjectFlag } from './data/flags.js';
import { ActionResult } from './actions.js';

/**
 * Dam and Flood Control Puzzle
 * Handles the bolt turning mechanism, water level changes, and gate control
 */
export class DamPuzzle {
  /**
   * Handle turning the bolt with the wrench
   */
  static turnBolt(state: GameState, wrenchId?: string): ActionResult {
    const gateFlag = state.getGlobalVariable('GATE_FLAG') || false;
    const gatesOpen = state.getGlobalVariable('GATES_OPEN') || false;

    // Check if wrench is being used
    if (!wrenchId) {
      return {
        success: false,
        message: "The bolt won't turn with your best effort.",
        stateChanges: []
      };
    }
    
    if (wrenchId !== 'WRENCH') {
      return {
        success: false,
        message: `The bolt won't turn using the ${wrenchId.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if player has the wrench
    if (!state.isInInventory(wrenchId)) {
      return {
        success: false,
        message: "You don't have the wrench.",
        stateChanges: []
      };
    }

    // Check if gate flag is set (bubble is glowing)
    if (!gateFlag) {
      return {
        success: false,
        message: "The bolt won't turn.",
        stateChanges: []
      };
    }

    // Toggle gates
    if (gatesOpen) {
      // Close gates
      state.setGlobalVariable('GATES_OPEN', false);
      
      // Update LOW_TIDE flag after gates close
      // Water will start to rise, so LOW_TIDE becomes false
      state.setFlag('LOW_TIDE', false);

      return {
        success: true,
        message: "The sluice gates close and water starts to collect behind the dam.",
        stateChanges: [{
          type: 'GATES_CLOSED',
          oldValue: true,
          newValue: false
        }]
      };
    } else {
      // Open gates
      state.setGlobalVariable('GATES_OPEN', true);

      return {
        success: true,
        message: "The sluice gates open and water pours through the dam.",
        stateChanges: [{
          type: 'GATES_OPENED',
          oldValue: false,
          newValue: true
        }]
      };
    }
  }

  /**
   * Handle pushing buttons in maintenance room
   */
  static pushButton(state: GameState, buttonId: string): ActionResult {
    if (buttonId === 'BLUE-BUTTON') {
      const waterLevel = state.getGlobalVariable('WATER_LEVEL') || 0;
      
      if (waterLevel === 0) {
        // Start the leak
        state.setGlobalVariable('WATER_LEVEL', 1);
        
        // Make leak visible
        const leak = state.getObject('LEAK') as GameObjectImpl;
        if (leak) {
          leak.removeFlag(ObjectFlag.INVISIBLE);
        }

        return {
          success: true,
          message: "The blue button appears to have been recently installed. A thin stream of water begins to trickle from the east wall of the room (apparently, a leak has occurred in a pipe).",
          stateChanges: [{
            type: 'LEAK_STARTED',
            oldValue: 0,
            newValue: 1
          }]
        };
      } else {
        return {
          success: true,
          message: "The water is already leaking.",
          stateChanges: []
        };
      }
    } else if (buttonId === 'BROWN-BUTTON') {
      // Turn off gate flag (bubble stops glowing)
      state.setGlobalVariable('GATE_FLAG', false);
      
      return {
        success: true,
        message: "Click.",
        stateChanges: [{
          type: 'GATE_FLAG_OFF',
          oldValue: true,
          newValue: false
        }]
      };
    } else if (buttonId === 'YELLOW-BUTTON') {
      // Turn on gate flag (bubble starts glowing)
      state.setGlobalVariable('GATE_FLAG', true);
      
      return {
        success: true,
        message: "Click.",
        stateChanges: [{
          type: 'GATE_FLAG_ON',
          oldValue: false,
          newValue: true
        }]
      };
    }

    return {
      success: false,
      message: "Nothing happens.",
      stateChanges: []
    };
  }

  /**
   * Handle putting putty on the leak
   */
  static fixLeak(state: GameState, puttyId: string): ActionResult {
    const waterLevel = state.getGlobalVariable('WATER_LEVEL') || 0;

    if (waterLevel <= 0) {
      return {
        success: false,
        message: "There's no leak here.",
        stateChanges: []
      };
    }

    if (puttyId !== 'PUTTY') {
      return {
        success: false,
        message: "That won't fix the leak.",
        stateChanges: []
      };
    }

    // Fix the leak
    state.setGlobalVariable('WATER_LEVEL', -1);
    
    // Make leak invisible again
    const leak = state.getObject('LEAK') as GameObjectImpl;
    if (leak) {
      leak.addFlag(ObjectFlag.INVISIBLE);
    }

    return {
      success: true,
      message: "The putty seems to have stopped the leak.",
      stateChanges: [{
        type: 'LEAK_FIXED',
        oldValue: waterLevel,
        newValue: -1
      }]
    };
  }

  /**
   * Get dam room description based on gate state
   */
  static getDamRoomDescription(state: GameState): string {
    const gatesOpen = state.getGlobalVariable('GATES_OPEN') || false;
    const lowTide = state.getFlag('LOW_TIDE');

    let desc = "You are standing on the top of the Flood Control Dam #3, which was quite a tourist attraction in times far distant. There are paths to the north, south, and west, and a scramble down.";

    if (lowTide && gatesOpen) {
      desc += "\nThe water level behind the dam is low: The sluice gates have been opened. Water rushes through the dam and downstream.";
    } else if (gatesOpen) {
      desc += "\nThe sluice gates are open, and water rushes through the dam. The water level in the reservoir is still high.";
    } else {
      desc += "\nThe sluice gates are closed. The water level in the reservoir is high.";
    }

    return desc;
  }

  /**
   * Get control panel description
   */
  static getControlPanelDescription(state: GameState): string {
    const gateFlag = state.getGlobalVariable('GATE_FLAG') || false;

    let desc = "There is a control panel here, on which a large metal bolt is mounted. Directly above the bolt is a small green plastic bubble";

    if (gateFlag) {
      desc += " which is glowing serenely";
    }

    desc += ".";

    return desc;
  }

  /**
   * Handle taking the bolt or bubble (they're integral parts)
   */
  static takeBoltOrBubble(): ActionResult {
    return {
      success: false,
      message: "It is an integral part of the control panel.",
      stateChanges: []
    };
  }

  /**
   * Handle trying to open/close the dam
   */
  static openCloseDam(): ActionResult {
    return {
      success: false,
      message: "Sounds reasonable, but this isn't how.",
      stateChanges: []
    };
  }

  /**
   * Handle trying to plug the dam
   */
  static plugDam(toolId?: string): ActionResult {
    if (toolId === 'HANDS') {
      return {
        success: false,
        message: "Are you the little Dutch boy, then? Sorry, this is a big dam.",
        stateChanges: []
      };
    }

    return {
      success: false,
      message: `With a ${toolId?.toLowerCase()}? Do you know how big this dam is? You could only stop a tiny leak with that.`,
      stateChanges: []
    };
  }

  /**
   * Handle oiling the bolt (it's actually glue!)
   */
  static oilBolt(): ActionResult {
    return {
      success: false,
      message: "Hmm. It appears the tube contained glue, not oil. Turning the bolt won't get any easier....",
      stateChanges: []
    };
  }
}

/**
 * Mirror Room Puzzle
 * Handles mirror breaking and room connections
 */
export class MirrorPuzzle {
  /**
   * Handle rubbing the mirror
   * In the original game, rubbing the mirror teleports the player to the other mirror room
   * and swaps all objects between the two rooms
   */
  static rubMirror(state: GameState, _mirrorId: string, toolId?: string): ActionResult {
    const mirrorMung = state.getGlobalVariable('MIRROR_MUNG') || false;

    if (mirrorMung) {
      return {
        success: false,
        message: "The mirror is broken into many pieces.",
        stateChanges: []
      };
    }

    // Check if using a tool (not hands)
    if (toolId && toolId !== 'HANDS') {
      const toolObj = state.getObject(toolId);
      const toolName = toolObj ? toolObj.description : 'tool';
      return {
        success: true,
        message: `You feel a faint tingling transmitted through the ${toolName}.`,
        stateChanges: []
      };
    }

    // Determine current and destination rooms
    const currentRoom = state.currentRoom;
    let destinationRoom: string;
    
    if (currentRoom === 'MIRROR-ROOM-2') {
      destinationRoom = 'MIRROR-ROOM-1';
    } else if (currentRoom === 'MIRROR-ROOM-1') {
      destinationRoom = 'MIRROR-ROOM-2';
    } else {
      // Not in a mirror room
      return {
        success: false,
        message: "You can't see any mirror here!",
        stateChanges: []
      };
    }

    // Get all objects in both rooms (excluding the player)
    const currentRoomObjects: string[] = [];
    const destinationRoomObjects: string[] = [];

    for (const [objId, obj] of state.objects.entries()) {
      if (obj.location === currentRoom) {
        currentRoomObjects.push(objId);
      } else if (obj.location === destinationRoom) {
        destinationRoomObjects.push(objId);
      }
    }

    // Swap objects between rooms
    const stateChanges: StateChange[] = [];

    // Move objects from current room to destination room
    for (const objId of currentRoomObjects) {
      const obj = state.getObject(objId);
      if (obj) {
        obj.location = destinationRoom;
        stateChanges.push({
          type: 'OBJECT_MOVED',
          objectId: objId,
          oldValue: currentRoom,
          newValue: destinationRoom
        });
      }
    }

    // Move objects from destination room to current room
    for (const objId of destinationRoomObjects) {
      const obj = state.getObject(objId);
      if (obj) {
        obj.location = currentRoom;
        stateChanges.push({
          type: 'OBJECT_MOVED',
          objectId: objId,
          oldValue: destinationRoom,
          newValue: currentRoom
        });
      }
    }

    // Teleport player to destination room
    state.currentRoom = destinationRoom;
    stateChanges.push({
      type: 'PLAYER_MOVED',
      oldValue: currentRoom,
      newValue: destinationRoom
    });

    return {
      success: true,
      message: "There is a rumble from deep within the earth and the room shakes.",
      stateChanges
    };
  }

  /**
   * Handle breaking the mirror
   */
  static breakMirror(state: GameState): ActionResult {
    const mirrorMung = state.getGlobalVariable('MIRROR_MUNG') || false;

    if (mirrorMung) {
      return {
        success: false,
        message: "Haven't you done enough damage already?",
        stateChanges: []
      };
    }

    // Break the mirror
    state.setGlobalVariable('MIRROR_MUNG', true);
    state.setGlobalVariable('LUCKY', false);

    return {
      success: true,
      message: "You have broken the mirror. I hope you have a seven years' supply of good luck handy.",
      stateChanges: [{
        type: 'MIRROR_BROKEN',
        oldValue: false,
        newValue: true
      }]
    };
  }

  /**
   * Handle taking/touching the mirror
   */
  static takeMirror(state: GameState): ActionResult {
    const mirrorMung = state.getGlobalVariable('MIRROR_MUNG') || false;

    if (mirrorMung) {
      return {
        success: false,
        message: "Haven't you done enough damage already?",
        stateChanges: []
      };
    }

    return {
      success: false,
      message: "The mirror is many times your size. Give up.",
      stateChanges: []
    };
  }

  /**
   * Handle examining the mirror
   */
  static examineMirror(state: GameState): ActionResult {
    const mirrorMung = state.getGlobalVariable('MIRROR_MUNG') || false;

    if (mirrorMung) {
      return {
        success: true,
        message: "The mirror is broken into many pieces.",
        stateChanges: []
      };
    }

    return {
      success: true,
      message: "There is an ugly person staring back at you. The mirror is many times your size. Give up.",
      stateChanges: []
    };
  }

  /**
   * Get mirror room description
   */
  static getMirrorRoomDescription(state: GameState): string {
    const mirrorMung = state.getGlobalVariable('MIRROR_MUNG') || false;

    let desc = "You are in a large square room with tall ceilings. On the south wall is an enormous mirror which fills the entire wall. There are exits on the other three sides of the room.";

    if (mirrorMung) {
      desc += "\nUnfortunately, the mirror has been destroyed by your recklessness.";
    }

    return desc;
  }
}

/**
 * Rainbow and Pot of Gold Puzzle
 * Handles rainbow appearance and pot of gold visibility
 */
export class RainbowPuzzle {
  /**
   * Handle waving the sceptre to make rainbow appear/disappear
   */
  static waveSceptre(state: GameState, _sceptreId: string): ActionResult {
    const currentRoom = state.getCurrentRoom();
    
    if (!currentRoom) {
      return {
        success: false,
        message: "You can't do that here.",
        stateChanges: []
      };
    }

    // Check if in appropriate location (Aragain Falls or End of Rainbow)
    if (currentRoom.id !== 'ARAGAIN-FALLS' && currentRoom.id !== 'END-OF-RAINBOW' && currentRoom.id !== 'ON-RAINBOW') {
      return {
        success: false,
        message: "A faint rainbow appears in the mist, but it quickly fades.",
        stateChanges: []
      };
    }

    const rainbowFlag = state.getFlag('RAINBOW_FLAG');

    if (!rainbowFlag) {
      // Make rainbow appear
      state.setFlag('RAINBOW_FLAG', true);

      // Make pot of gold visible if at end of rainbow
      if (currentRoom.id === 'END-OF-RAINBOW') {
        const pot = state.getObject('POT-OF-GOLD') as GameObjectImpl;
        if (pot && pot.location === 'END-OF-RAINBOW') {
          pot.removeFlag(ObjectFlag.INVISIBLE);
        }
      }

      let message = "Suddenly, the rainbow appears to become solid and, I venture, walkable";
      
      // Note: Pot of gold becomes visible but no message is shown
      // The player will see it when they look or try to take it

      return {
        success: true,
        message: message,
        stateChanges: [{
          type: 'RAINBOW_APPEARED',
          oldValue: false,
          newValue: true
        }]
      };
    } else {
      // Make rainbow disappear
      state.setFlag('RAINBOW_FLAG', false);

      // If player is on rainbow, move them
      if (currentRoom.id === 'ON-RAINBOW') {
        // Move player to Aragain Falls
        state.setCurrentRoom('ARAGAIN-FALLS');
        
        return {
          success: true,
          message: "The rainbow seems to have become somewhat run-of-the-mill.\nYou fall to the ground.",
          stateChanges: [{
            type: 'RAINBOW_DISAPPEARED',
            oldValue: true,
            newValue: false
          }]
        };
      }

      return {
        success: true,
        message: "The rainbow seems to have become somewhat run-of-the-mill.",
        stateChanges: [{
          type: 'RAINBOW_DISAPPEARED',
          oldValue: true,
          newValue: false
        }]
      };
    }
  }

  /**
   * Handle climbing the rainbow
   */
  static climbRainbow(state: GameState): ActionResult {
    const rainbowFlag = state.getFlag('RAINBOW_FLAG');

    if (!rainbowFlag) {
      return {
        success: false,
        message: "The rainbow is not solid enough to climb.",
        stateChanges: []
      };
    }

    return {
      success: true,
      message: "You climb up onto the rainbow.",
      stateChanges: []
    };
  }
}

/**
 * Rope and Basket Puzzle
 * Handles raising/lowering basket and rope mechanics
 */
export class RopeBasketPuzzle {
  /**
   * Handle raising the basket
   */
  static raiseBasket(state: GameState): ActionResult {
    const cageTop = state.getGlobalVariable('CAGE_TOP');

    if (cageTop === true || cageTop === undefined) {
      return {
        success: false,
        message: "The basket is already at the top.",
        stateChanges: []
      };
    }

    // Move basket to top position
    state.setGlobalVariable('CAGE_TOP', true);

    // Move raised basket to shaft room
    const raisedBasket = state.getObject('RAISED-BASKET');
    const loweredBasket = state.getObject('LOWERED-BASKET');

    if (raisedBasket && loweredBasket) {
      state.moveObject('RAISED-BASKET', 'SHAFT-ROOM');
      state.moveObject('LOWERED-BASKET', 'LOWER-SHAFT');
    }

    return {
      success: true,
      message: "The basket is raised to the top of the shaft.",
      stateChanges: [{
        type: 'BASKET_RAISED',
        oldValue: false,
        newValue: true
      }]
    };
  }

  /**
   * Handle lowering the basket
   */
  static lowerBasket(state: GameState): ActionResult {
    const cageTop = state.getGlobalVariable('CAGE_TOP');

    if (cageTop === false) {
      return {
        success: false,
        message: "The basket is already at the bottom.",
        stateChanges: []
      };
    }

    // Move basket to bottom position
    state.setGlobalVariable('CAGE_TOP', false);

    // Move lowered basket to lower shaft
    const raisedBasket = state.getObject('RAISED-BASKET');
    const loweredBasket = state.getObject('LOWERED-BASKET');

    if (raisedBasket && loweredBasket) {
      state.moveObject('LOWERED-BASKET', 'LOWER-SHAFT');
      state.moveObject('RAISED-BASKET', 'SHAFT-ROOM');
    }

    return {
      success: true,
      message: "The basket is lowered to the bottom of the shaft.",
      stateChanges: [{
        type: 'BASKET_LOWERED',
        oldValue: true,
        newValue: false
      }]
    };
  }

  /**
   * Handle tying the rope
   */
  static tieRope(state: GameState, ropeId: string, objectId: string): ActionResult {
    if (ropeId !== 'ROPE') {
      return {
        success: false,
        message: "You can't tie that.",
        stateChanges: []
      };
    }

    // Check if player has the rope
    if (!state.isInInventory(ropeId)) {
      return {
        success: false,
        message: "You don't have the rope.",
        stateChanges: []
      };
    }

    // Check what object we're tying to
    if (objectId === 'RAILING' || objectId === 'RAIL') {
      const ropeTied = state.getGlobalVariable('ROPE_TIED') || false;
      
      // Check if rope is already tied
      if (ropeTied) {
        return {
          success: false,
          message: "The rope is already tied to it.",
          stateChanges: []
        };
      }

      // Tie rope to railing in dome room
      state.setGlobalVariable('ROPE_TIED', true);
      state.setFlag('DOME_FLAG', true);

      // Move rope to the room (no longer in inventory)
      const currentRoom = state.getCurrentRoom();
      if (currentRoom) {
        state.moveObject(ropeId, currentRoom.id);
      }

      return {
        success: true,
        message: "The rope drops over the side and comes within ten feet of the floor.",
        stateChanges: [{
          type: 'ROPE_TIED',
          oldValue: false,
          newValue: true
        }]
      };
    }

    return {
      success: false,
      message: "You can't tie the rope to that.",
      stateChanges: []
    };
  }

  /**
   * Handle climbing the rope
   */
  static climbRope(state: GameState): ActionResult {
    const ropeTied = state.getGlobalVariable('ROPE_TIED') || false;

    if (!ropeTied) {
      return {
        success: false,
        message: "The rope isn't tied to anything.",
        stateChanges: []
      };
    }

    return {
      success: true,
      message: "You climb down the rope.",
      stateChanges: []
    };
  }

  /**
   * Handle taking the rope when it's tied
   */
  static takeRope(state: GameState): ActionResult | null {
    const ropeTied = state.getGlobalVariable('ROPE_TIED') || false;

    if (ropeTied) {
      return {
        success: false,
        message: "The rope is tied to the railing.",
        stateChanges: []
      };
    }

    return null; // Let normal take action handle it
  }

  /**
   * Handle untying the rope
   */
  static untieRope(state: GameState): ActionResult {
    const ropeTied = state.getGlobalVariable('ROPE_TIED') || false;

    if (ropeTied) {
      state.setGlobalVariable('ROPE_TIED', false);
      state.setFlag('DOME_FLAG', false);
      
      return {
        success: true,
        message: "The rope is now untied.",
        stateChanges: [{
          type: 'ROPE_UNTIED',
          oldValue: true,
          newValue: false
        }]
      };
    }

    return {
      success: false,
      message: "It is not tied to anything.",
      stateChanges: []
    };
  }

  /**
   * Handle dropping rope in dome room
   */
  static dropRopeInDome(state: GameState): ActionResult | null {
    const ropeTied = state.getGlobalVariable('ROPE_TIED') || false;
    const currentRoom = state.getCurrentRoom();

    if (currentRoom?.id === 'DOME-ROOM' && !ropeTied) {
      // Move rope to torch room below
      state.moveObject('ROPE', 'TORCH-ROOM');
      
      return {
        success: true,
        message: "The rope drops gently to the floor below.",
        stateChanges: [{
          type: 'ROPE_DROPPED',
          oldValue: 'DOME-ROOM',
          newValue: 'TORCH-ROOM'
        }]
      };
    }

    return null; // Let normal drop action handle it
  }

  /**
   * Handle trying to tie up an actor with rope
   */
  static tieUpActor(state: GameState, actorId: string): ActionResult {
    // Check if actor is awake - if so, they struggle
    const actor = state.getObject(actorId);
    
    if (actor) {
      // If actor is awake, they struggle
      const actorName = actor.name || actorId.toLowerCase();
      return {
        success: false,
        message: `Your attempt to tie up the ${actorName} awakens him. The ${actorName} struggles and you cannot tie him up.`,
        stateChanges: []
      };
    }
    
    return {
      success: false,
      message: `The ${actorId.toLowerCase()} struggles and you cannot tie him up.`,
      stateChanges: []
    };
  }

  /**
   * Handle trying to take the basket
   */
  static takeBasket(): ActionResult {
    return {
      success: false,
      message: "The cage is securely fastened to the iron chain.",
      stateChanges: []
    };
  }

  /**
   * Handle interacting with wrong basket (at other end of chain)
   */
  static wrongBasket(): ActionResult {
    return {
      success: false,
      message: "The basket is at the other end of the chain.",
      stateChanges: []
    };
  }
}

/**
 * Trap Door Puzzle
 * Handles trap door opening and revealing
 */
export class TrapDoorPuzzle {
  /**
   * Handle opening the trap door
   */
  static openTrapDoor(state: GameState): ActionResult {
    const trapDoor = state.getObject('TRAP-DOOR') as GameObjectImpl;
    
    if (!trapDoor) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Make trap door visible if not already
    if (trapDoor.hasFlag(ObjectFlag.INVISIBLE)) {
      trapDoor.removeFlag(ObjectFlag.INVISIBLE);
    }

    // Check if already open
    if (trapDoor.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: "It's already open.",
        stateChanges: []
      };
    }

    // Open the trap door
    trapDoor.addFlag(ObjectFlag.OPENBIT);

    return {
      success: true,
      message: "The door reluctantly opens to reveal a rickety staircase descending into darkness.",
      stateChanges: [{
        type: 'TRAP_DOOR_OPENED',
        oldValue: false,
        newValue: true
      }]
    };
  }

  /**
   * Handle moving the rug to reveal trap door
   */
  static moveRug(state: GameState): ActionResult {
    const trapDoor = state.getObject('TRAP-DOOR') as GameObjectImpl;
    
    if (!trapDoor) {
      return {
        success: false,
        message: "Nothing happens.",
        stateChanges: []
      };
    }

    // Reveal the trap door
    if (trapDoor.hasFlag(ObjectFlag.INVISIBLE)) {
      trapDoor.removeFlag(ObjectFlag.INVISIBLE);
      
      return {
        success: true,
        message: "With a great effort, the rug is moved to one side of the room, revealing the dusty cover of a closed trap door.",
        stateChanges: [{
          type: 'TRAP_DOOR_REVEALED',
          oldValue: false,
          newValue: true
        }]
      };
    }

    return {
      success: true,
      message: "The rug is moved.",
      stateChanges: []
    };
  }
}

/**
 * Grating Puzzle
 * Handles grating opening with keys
 */
export class GratingPuzzle {
  /**
   * Handle unlocking the grating with keys
   */
  static unlockGrating(state: GameState, keysId: string): ActionResult {
    const grating = state.getObject('GRATE') as GameObjectImpl;
    
    if (!grating) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (keysId !== 'KEYS') {
      return {
        success: false,
        message: "That won't unlock it.",
        stateChanges: []
      };
    }

    // Check if player has the keys
    if (!state.isInInventory(keysId)) {
      return {
        success: false,
        message: "You don't have the keys.",
        stateChanges: []
      };
    }

    // Check if already open
    if (grating.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: "It's already unlocked.",
        stateChanges: []
      };
    }

    // Unlock and open the grating
    grating.addFlag(ObjectFlag.OPENBIT);
    
    // Make grating visible if not already
    if (grating.hasFlag(ObjectFlag.INVISIBLE)) {
      grating.removeFlag(ObjectFlag.INVISIBLE);
    }

    // Set grate revealed flag
    state.setGlobalVariable('GRATE_REVEALED', true);

    return {
      success: true,
      message: "The grating is unlocked and opens up to reveal a dark passageway.",
      stateChanges: [{
        type: 'GRATING_UNLOCKED',
        oldValue: false,
        newValue: true
      }]
    };
  }

  /**
   * Handle revealing the grating by moving leaves
   */
  static revealGrating(state: GameState): ActionResult {
    const grating = state.getObject('GRATE') as GameObjectImpl;
    
    if (!grating) {
      return {
        success: false,
        message: "Nothing happens.",
        stateChanges: []
      };
    }

    // Reveal the grating
    if (grating.hasFlag(ObjectFlag.INVISIBLE)) {
      grating.removeFlag(ObjectFlag.INVISIBLE);
      state.setGlobalVariable('GRATE_REVEALED', true);
      
      return {
        success: true,
        message: "In disturbing the pile of leaves, a grating is revealed.",
        stateChanges: [{
          type: 'GRATING_REVEALED',
          oldValue: false,
          newValue: true
        }]
      };
    }

    return {
      success: true,
      message: "The leaves are moved.",
      stateChanges: []
    };
  }
}

/**
 * Boat Inflation Puzzle
 * Handles inflating and deflating the boat
 */
export class BoatPuzzle {
  /**
   * Handle inflating the boat with pump
   */
  static inflateBoat(state: GameState, boatId: string, pumpId: string): ActionResult {
    if (boatId !== 'INFLATABLE-BOAT' && boatId !== 'BOAT') {
      return {
        success: false,
        message: "You can't inflate that.",
        stateChanges: []
      };
    }

    if (pumpId !== 'PUMP') {
      return {
        success: false,
        message: "You need a pump to inflate it.",
        stateChanges: []
      };
    }

    // Check if player has both items
    if (!state.isInInventory(boatId) && !state.isInInventory(pumpId)) {
      return {
        success: false,
        message: "You don't have those items.",
        stateChanges: []
      };
    }

    // Check if already inflated
    const deflateFlag = state.getFlag('DEFLATE');
    if (!deflateFlag) {
      return {
        success: false,
        message: "The boat is already inflated.",
        stateChanges: []
      };
    }

    // Inflate the boat
    state.setFlag('DEFLATE', false);

    // Replace deflated boat with inflated boat
    const boatLocation = state.getObject(boatId)?.location;
    
    if (boatLocation) {
      state.moveObject('INFLATABLE-BOAT', 'NOWHERE');
      state.moveObject('INFLATED-BOAT', boatLocation);
    }

    return {
      success: true,
      message: "The boat inflates and appears seaworthy.",
      stateChanges: [{
        type: 'BOAT_INFLATED',
        oldValue: true,
        newValue: false
      }]
    };
  }

  /**
   * Handle deflating the boat
   */
  static deflateBoat(state: GameState): ActionResult {
    const deflateFlag = state.getFlag('DEFLATE');
    
    if (deflateFlag) {
      return {
        success: false,
        message: "The boat is already deflated.",
        stateChanges: []
      };
    }

    // Deflate the boat
    state.setFlag('DEFLATE', true);

    // Replace inflated boat with deflated boat
    const inflatedBoat = state.getObject('INFLATED-BOAT');
    if (inflatedBoat && inflatedBoat.location) {
      const location = inflatedBoat.location;
      state.moveObject('INFLATED-BOAT', 'NOWHERE');
      state.moveObject('INFLATABLE-BOAT', location);
    }

    return {
      success: true,
      message: "The boat deflates.",
      stateChanges: [{
        type: 'BOAT_DEFLATED',
        oldValue: false,
        newValue: true
      }]
    };
  }
}

/**
 * Coffin Puzzle
 * Handles coffin movement and access
 */
export class CoffinPuzzle {
  /**
   * Handle pushing the coffin
   */
  static pushCoffin(state: GameState): ActionResult {
    const coffinCure = state.getFlag('COFFIN_CURE');
    
    if (coffinCure) {
      return {
        success: true,
        message: "The coffin moves, but nothing else happens.",
        stateChanges: []
      };
    }

    // Enable coffin movement
    state.setFlag('COFFIN_CURE', true);

    return {
      success: true,
      message: "The coffin moves, revealing a passage to the northwest.",
      stateChanges: [{
        type: 'COFFIN_MOVED',
        oldValue: false,
        newValue: true
      }]
    };
  }
}

/**
 * Bell Puzzle
 * Handles bell ringing and exorcism ceremony
 */
export class BellPuzzle {
  /**
   * Handle ringing the bell
   */
  static ringBell(state: GameState, _bellId: string): ActionResult {
    const currentRoom = state.getCurrentRoom();
    
    if (!currentRoom) {
      return {
        success: false,
        message: "You can't do that here.",
        stateChanges: []
      };
    }

    // Check if in LLD-ROOM (Entrance to Hades) and ceremony not complete
    const lldFlag = state.getFlag('LLD_FLAG');
    
    if (currentRoom.id === 'ENTRANCE-TO-HADES' && !lldFlag) {
      // Bell becomes hot and transforms
      state.setGlobalVariable('XB', true);
      
      // Move bell to nowhere and hot-bell to current room
      state.moveObject('BELL', 'NOWHERE');
      state.moveObject('HOT-BELL', currentRoom.id);
      
      const message = "The bell suddenly becomes red hot and falls to the ground. The wraith, as if paralyzed, cannot move.";
      
      return {
        success: true,
        message: message,
        stateChanges: [{
          type: 'BELL_HEATED',
          oldValue: false,
          newValue: true
        }]
      };
    }

    // Normal bell ring
    return {
      success: true,
      message: "Ding, dong.",
      stateChanges: []
    };
  }

  /**
   * Handle bell cooling down after time
   */
  static coolBell(state: GameState): ActionResult {
    // Move hot-bell back to nowhere and regular bell to Entrance to Hades
    state.moveObject('HOT-BELL', 'NOWHERE');
    state.moveObject('BELL', 'ENTRANCE-TO-HADES');
    
    const currentRoom = state.getCurrentRoom();
    const inHades = currentRoom && currentRoom.id === 'ENTRANCE-TO-HADES';
    
    return {
      success: true,
      message: inHades ? "The bell appears to have cooled down." : "",
      stateChanges: [{
        type: 'BELL_COOLED',
        oldValue: true,
        newValue: false
      }]
    };
  }
}

/**
 * Cyclops Puzzle
 * Handles cyclops room descriptions and interactions
 */
export class CyclopsPuzzle {
  /**
   * Get cyclops room description based on state
   */
  static getCyclopsRoomDescription(state: GameState): string {
    let desc = "This room has an exit on the northwest, and a staircase leading up.";
    
    const cyclopsFlag = state.getFlag('CYCLOPS_FLAG');
    const magicFlag = state.getFlag('MAGIC_FLAG');
    const cyclowrath = state.getGlobalVariable('CYCLOWRATH') || 0;

    if (cyclopsFlag && !magicFlag) {
      desc += "\nThe cyclops is sleeping blissfully at the foot of the stairs.";
    } else if (magicFlag) {
      desc += "\nThe east wall, previously solid, now has a cyclops-sized opening in it.";
    } else if (cyclowrath === 0) {
      desc += "\nA cyclops, who looks prepared to eat horses (much less mere adventurers), blocks the staircase. From his state of health, and the bloodstains on the walls, you gather that he is not very friendly, though he likes people.";
    } else if (cyclowrath > 0) {
      desc += "\nThe cyclops is standing in the corner, eyeing you closely. I don't think he likes you very much. He looks extremely hungry, even for a cyclops.";
    } else if (cyclowrath < 0) {
      desc += "\nThe cyclops, having eaten the hot peppers, appears to be gasping. His enflamed tongue protrudes from his man-sized mouth.";
    }

    return desc;
  }

  /**
   * Handle trying to take the cyclops
   */
  static takeCyclops(): ActionResult {
    return {
      success: false,
      message: "The cyclops doesn't take kindly to being grabbed.",
      stateChanges: []
    };
  }

  /**
   * Handle trying to tie the cyclops
   */
  static tieCyclops(): ActionResult {
    return {
      success: false,
      message: "You cannot tie the cyclops, though he is fit to be tied.",
      stateChanges: []
    };
  }

  /**
   * Handle listening to the cyclops
   */
  static listenToCyclops(): ActionResult {
    return {
      success: true,
      message: "You can hear his stomach rumbling.",
      stateChanges: []
    };
  }

  /**
   * Handle mung/kill attempts on cyclops
   */
  static mungCyclops(): ActionResult {
    return {
      success: false,
      message: "\"Do you think I'm as stupid as my father was?\", he says, dodging.",
      stateChanges: []
    };
  }
}

/**
 * Machine Puzzle
 * Handles the machine in the machine room
 */
export class MachinePuzzle {
  /**
   * Handle taking the machine
   */
  static takeMachine(): ActionResult {
    return {
      success: false,
      message: "It is far too large to carry.",
      stateChanges: []
    };
  }

  /**
   * Handle opening the machine
   */
  static openMachine(state: GameState): ActionResult {
    const machine = state.getObject('MACHINE') as GameObjectImpl;
    
    if (!machine) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (machine.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: "It's already open.",
        stateChanges: []
      };
    }

    machine.addFlag(ObjectFlag.OPENBIT);

    // For now, just return simple message
    // In full implementation, would check machine contents
    return {
      success: true,
      message: "The lid opens.",
      stateChanges: [{
        type: 'MACHINE_OPENED',
        oldValue: false,
        newValue: true
      }]
    };
  }

  /**
   * Handle closing the machine
   */
  static closeMachine(state: GameState): ActionResult {
    const machine = state.getObject('MACHINE') as GameObjectImpl;
    
    if (!machine) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (!machine.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: "It's already closed.",
        stateChanges: []
      };
    }

    machine.removeFlag(ObjectFlag.OPENBIT);

    return {
      success: true,
      message: "The lid closes.",
      stateChanges: [{
        type: 'MACHINE_CLOSED',
        oldValue: true,
        newValue: false
      }]
    };
  }

  /**
   * Handle turning on the machine
   */
  static turnOnMachine(state: GameState, toolId?: string): ActionResult {
    if (!toolId) {
      return {
        success: false,
        message: "It's not clear how to turn it on with your bare hands.",
        stateChanges: []
      };
    }

    if (toolId !== 'SCREWDRIVER') {
      return {
        success: false,
        message: "That won't work.",
        stateChanges: []
      };
    }

    const machine = state.getObject('MACHINE') as GameObjectImpl;
    
    if (!machine) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (machine.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: "The machine doesn't seem to want to do anything.",
        stateChanges: []
      };
    }

    // Machine operates - transforms coal to diamond or other items to gunk
    const coal = state.getObject('COAL');
    if (coal && coal.location === 'MACHINE') {
      state.moveObject('COAL', 'NOWHERE');
      state.moveObject('DIAMOND', 'MACHINE');
      
      return {
        success: true,
        message: "The machine comes to life (figuratively) with a dazzling display of colored lights and bizarre noises. After a few moments, the excitement abates.",
        stateChanges: [{
          type: 'MACHINE_OPERATED',
          oldValue: 'COAL',
          newValue: 'DIAMOND'
        }]
      };
    }

    // For other items, just return the message
    // In full implementation, would transform items to gunk
    return {
      success: true,
      message: "The machine comes to life (figuratively) with a dazzling display of colored lights and bizarre noises. After a few moments, the excitement abates.",
      stateChanges: [{
        type: 'MACHINE_OPERATED',
        oldValue: 'items',
        newValue: 'GUNK'
      }]
    };
  }
}

/**
 * Rainbow Puzzle Extensions
 * Additional rainbow interaction messages
 */
export class RainbowPuzzleExtensions {
  /**
   * Handle trying to cross rainbow when not solid
   */
  static crossRainbowNotSolid(): ActionResult {
    return {
      success: false,
      message: "Can you walk on water vapor?",
      stateChanges: []
    };
  }

  /**
   * Handle looking under rainbow
   */
  static lookUnderRainbow(): ActionResult {
    return {
      success: true,
      message: "The Frigid River flows under the rainbow.",
      stateChanges: []
    };
  }

  /**
   * Handle trying to cross from wrong location
   */
  static crossFromWrongLocation(): ActionResult {
    return {
      success: false,
      message: "From here?!?",
      stateChanges: []
    };
  }
}

/**
 * Boat Repair Puzzle
 * Handles punctured boat repair
 */
export class BoatRepairPuzzle {
  /**
   * Handle fixing punctured boat with putty
   */
  static fixBoat(state: GameState): ActionResult {
    state.moveObject('PUNCTURED-BOAT', 'NOWHERE');
    const boatLocation = state.getObject('PUNCTURED-BOAT')?.location || state.getCurrentRoom()?.id;
    if (boatLocation) {
      state.moveObject('INFLATABLE-BOAT', boatLocation);
    }

    return {
      success: true,
      message: "Well done. The boat is repaired.",
      stateChanges: [{
        type: 'BOAT_REPAIRED',
        oldValue: 'PUNCTURED-BOAT',
        newValue: 'INFLATABLE-BOAT'
      }]
    };
  }

  /**
   * Handle trying to inflate punctured boat
   */
  static inflatePuncturedBoat(): ActionResult {
    return {
      success: false,
      message: "No chance. Some moron punctured it.",
      stateChanges: []
    };
  }
}

/**
 * Magic Word Puzzle
 * Handles saying the magic word to open passages
 */
export class MagicWordPuzzle {
  /**
   * Handle saying the magic word "ULYSSES"
   */
  static sayMagicWord(state: GameState, word: string): ActionResult {
    const currentRoom = state.getCurrentRoom();
    
    if (!currentRoom) {
      return {
        success: false,
        message: "Nothing happens.",
        stateChanges: []
      };
    }

    // Check if the word is the magic word
    if (word.toUpperCase() !== 'ULYSSES') {
      return {
        success: true,
        message: "Nothing happens.",
        stateChanges: []
      };
    }

    // Check if in appropriate location (Cyclops room)
    if (currentRoom.id === 'CYCLOPS-ROOM') {
      state.setFlag('MAGIC_FLAG', true);
      state.setFlag('CYCLOPS_FLAG', true);
      
      // Remove the cyclops from the room
      const cyclops = state.getObject('CYCLOPS');
      if (cyclops) {
        state.moveObject('CYCLOPS', null);  // Remove from game
      }

      return {
        success: true,
        message: "The cyclops, hearing the name of his ancient nemesis, flees the room in terror.",
        stateChanges: [{
          type: 'MAGIC_WORD_SPOKEN',
          oldValue: false,
          newValue: true
        }]
      };
    }

    return {
      success: true,
      message: "Nothing happens.",
      stateChanges: []
    };
  }
}
