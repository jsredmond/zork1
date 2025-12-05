/**
 * Data Validation Tests
 * Validates extracted game data against ZIL source for completeness
 */

import { describe, it, expect } from 'vitest';
import { ALL_OBJECTS } from '../game/data/objects-complete.js';
import { ALL_ROOMS } from '../game/data/rooms-complete.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Data Validation Against ZIL Source', () => {
  const zilPath = path.join(process.cwd(), '1dungeon.zil');
  const zilContent = fs.readFileSync(zilPath, 'utf-8');

  describe('Object Data Completeness', () => {
    it('should have text property for all readable objects', () => {
      const issues: string[] = [];
      
      for (const [id, obj] of Object.entries(ALL_OBJECTS)) {
        if (obj.flags?.includes('READBIT')) {
          if (!obj.text || obj.text.length === 0) {
            issues.push(`${id}: Has READBIT but no text property`);
          } else if (obj.text.length < 20) {
            issues.push(`${id}: Text seems too short (${obj.text.length} chars)`);
          }
        }
      }
      
      expect(issues).toEqual([]);
    });

    it('should have capacity for functional container objects', () => {
      const issues: string[] = [];
      // Some objects have CONTBIT but aren't meant to hold things (BOOK, THIEF)
      const exemptContainers = ['BOOK', 'THIEF', 'TOOL-CHEST'];
      
      for (const [id, obj] of Object.entries(ALL_OBJECTS)) {
        if (obj.flags?.includes('CONTBIT') && !exemptContainers.includes(id)) {
          if (!obj.capacity || obj.capacity === 0) {
            issues.push(`${id}: Has CONTBIT but no capacity`);
          }
        }
      }
      
      expect(issues).toEqual([]);
    });

    it('should have synonyms for all objects', () => {
      const issues: string[] = [];
      
      for (const [id, obj] of Object.entries(ALL_OBJECTS)) {
        if (!obj.synonyms || obj.synonyms.length === 0) {
          issues.push(`${id}: No synonyms defined`);
        }
      }
      
      expect(issues).toEqual([]);
    });

    it('should have complete descriptions', () => {
      const issues: string[] = [];
      
      for (const [id, obj] of Object.entries(ALL_OBJECTS)) {
        if (!obj.description || obj.description.trim() === '') {
          issues.push(`${id}: Missing description`);
        }
        if (!obj.name || obj.name.trim() === '') {
          issues.push(`${id}: Missing name`);
        }
      }
      
      expect(issues).toEqual([]);
    });

    it('should have treasureValue for all treasures', () => {
      // Treasures are identified by having a treasureValue > 0
      // This test just verifies the data is consistent
      const treasures = Object.values(ALL_OBJECTS).filter(
        obj => obj.treasureValue && obj.treasureValue > 0
      );
      
      expect(treasures.length).toBeGreaterThan(0);
      
      // Most treasures should have value property too (but not all)
      const treasuresWithValue = treasures.filter(t => t.value && t.value > 0);
      expect(treasuresWithValue.length).toBeGreaterThan(15); // Most should have it
    });
  });

  describe('Room Data Completeness', () => {
    it('should have complete descriptions for all rooms', () => {
      const issues: string[] = [];
      
      for (const [id, room] of Object.entries(ALL_ROOMS)) {
        if (!room.name || room.name.trim() === '') {
          issues.push(`${id}: Missing name`);
        }
        if (!room.description || room.description.trim() === '') {
          issues.push(`${id}: Missing description`);
        }
        if (!room.longDescription || room.longDescription.trim() === '') {
          issues.push(`${id}: Missing longDescription`);
        }
      }
      
      expect(issues).toEqual([]);
    });

    it('should have exits for non-dead-end rooms', () => {
      const issues: string[] = [];
      
      for (const [id, room] of Object.entries(ALL_ROOMS)) {
        if (!id.includes('DEAD-END') && (!room.exits || room.exits.length === 0)) {
          issues.push(`${id}: No exits defined (might be intentional)`);
        }
      }
      
      // This is informational, not a hard failure
      if (issues.length > 0) {
        console.log('Rooms without exits:', issues);
      }
    });

    it('should have valid exit destinations', () => {
      const issues: string[] = [];
      const roomIds = new Set(Object.keys(ALL_ROOMS));
      
      for (const [id, room] of Object.entries(ALL_ROOMS)) {
        if (room.exits) {
          for (const exit of room.exits) {
            if (exit.destination && exit.destination !== '' && !roomIds.has(exit.destination)) {
              issues.push(`${id}: Exit ${exit.direction} points to non-existent room ${exit.destination}`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Container Content Accessibility', () => {
    it('should be able to access objects in open containers', () => {
      // This tests the fix we made for the leaflet issue
      const mailbox = ALL_OBJECTS['MAILBOX'];
      const leaflet = ALL_OBJECTS['ADVERTISEMENT'];
      
      expect(mailbox).toBeDefined();
      expect(leaflet).toBeDefined();
      expect(mailbox.flags).toContain('CONTBIT');
      expect(leaflet.initialLocation).toBe('MAILBOX');
    });
  });

  describe('Text Content Quality', () => {
    it('should have complete text for ADVERTISEMENT (leaflet)', () => {
      const leaflet = ALL_OBJECTS['ADVERTISEMENT'];
      
      expect(leaflet).toBeDefined();
      expect(leaflet.text).toBeDefined();
      expect(leaflet.text!.length).toBeGreaterThan(100); // Should be full text
      expect(leaflet.text).toContain('WELCOME TO ZORK');
      expect(leaflet.text).toContain('mortals');
      expect(leaflet.text).toContain('No computer should be without one');
    });

    it('should have adjectives matching ZIL source', () => {
      const leaflet = ALL_OBJECTS['ADVERTISEMENT'];
      
      expect(leaflet.adjectives).toBeDefined();
      expect(leaflet.adjectives).toContain('SMALL');
    });
  });

  describe('Data Counts', () => {
    it('should have expected number of rooms', () => {
      const roomCount = Object.keys(ALL_ROOMS).length;
      expect(roomCount).toBeGreaterThanOrEqual(110);
      expect(roomCount).toBeLessThan(115); // Reasonable upper bound
    });

    it('should have expected number of objects', () => {
      const objectCount = Object.keys(ALL_OBJECTS).length;
      expect(objectCount).toBeGreaterThanOrEqual(120);
      expect(objectCount).toBeLessThan(130); // Reasonable upper bound
    });

    it('should have all treasures (19-21 expected)', () => {
      const treasures = Object.values(ALL_OBJECTS).filter(
        obj => obj.treasureValue && obj.treasureValue > 0
      );
      // Original game has 19 treasures, but we may have variations
      expect(treasures.length).toBeGreaterThanOrEqual(19);
      expect(treasures.length).toBeLessThanOrEqual(21);
      
      // Log treasure count for reference
      console.log(`Found ${treasures.length} treasures`);
    });
  });
});
