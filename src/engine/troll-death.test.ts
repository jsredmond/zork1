/**
 * Test troll death/unconscious sequence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from '../game/factories/gameFactory.js';
import { GameState } from '../game/state.js';
import { ActorState } from './actors.js';
import { applyCombatResult, CombatResult } from './combat.js';
import { VILLAIN_DATA } from './villainData.js';

describe('Troll Death Sequence', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState();
    // Move player to troll room
    state.currentRoom = 'TROLL-ROOM';
  });

  it('should set troll to unconscious state when knocked out', () => {
    const troll = state.getObject('TROLL');
    expect(troll).toBeDefined();
    expect(troll?.location).toBe('TROLL-ROOM');

    // Get troll villain data
    const trollData = VILLAIN_DATA.find(v => v.villainId === 'TROLL');
    expect(trollData).toBeDefined();

    // Apply unconscious result
    applyCombatResult(state, 'TROLL', CombatResult.UNCONSCIOUS, trollData!);

    // Check troll is still in room
    const trollAfter = state.getObject('TROLL');
    expect(trollAfter?.location).toBe('TROLL-ROOM');

    // Check troll state is unconscious
    const actor = state.actorManager.getActor('TROLL');
    expect(actor?.getState()).toBe(ActorState.UNCONSCIOUS);

    // Check troll description shows unconscious
    const longDesc = trollAfter?.getProperty('longDescription');
    expect(longDesc).toContain('unconscious');
  });

  it('should remove troll from room when killed', () => {
    const troll = state.getObject('TROLL');
    expect(troll).toBeDefined();
    expect(troll?.location).toBe('TROLL-ROOM');

    // Get troll villain data
    const trollData = VILLAIN_DATA.find(v => v.villainId === 'TROLL');
    expect(trollData).toBeDefined();

    // Set troll strength to 1 (so next hit kills it)
    troll?.setProperty('strength', 1);

    // Apply killed result
    applyCombatResult(state, 'TROLL', CombatResult.KILLED, trollData!);

    // Check troll is removed from game
    const trollAfter = state.getObject('TROLL');
    expect(trollAfter?.location).toBeNull();

    // Check troll state is dead
    const actor = state.actorManager.getActor('TROLL');
    expect(actor?.getState()).toBe(ActorState.DEAD);
  });

  it('should drop axe when troll becomes unconscious', () => {
    const troll = state.getObject('TROLL');
    const axe = state.getObject('AXE');
    
    // Ensure axe starts with troll
    state.moveObject('AXE', 'TROLL');
    expect(axe?.location).toBe('TROLL');

    // Get troll villain data
    const trollData = VILLAIN_DATA.find(v => v.villainId === 'TROLL');
    expect(trollData).toBeDefined();

    // Apply unconscious result
    applyCombatResult(state, 'TROLL', CombatResult.UNCONSCIOUS, trollData!);

    // Check axe is now in room
    const axeAfter = state.getObject('AXE');
    expect(axeAfter?.location).toBe('TROLL-ROOM');
  });

  it('should open passages when troll becomes unconscious', () => {
    // Passages should be blocked initially
    expect(state.getFlag('TROLL_FLAG')).toBe(false);

    // Get troll villain data
    const trollData = VILLAIN_DATA.find(v => v.villainId === 'TROLL');
    expect(trollData).toBeDefined();

    // Apply unconscious result
    applyCombatResult(state, 'TROLL', CombatResult.UNCONSCIOUS, trollData!);

    // Check passages are now open
    expect(state.getFlag('TROLL_FLAG')).toBe(true);
  });
});
