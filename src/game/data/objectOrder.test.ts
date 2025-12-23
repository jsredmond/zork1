/**
 * Tests for object display order
 */

import { describe, it, expect } from 'vitest';
import { sortObjectsByDisplayOrder, getObjectDisplayOrder, OBJECT_DISPLAY_ORDER } from './objectOrder.js';

describe('Object Display Order', () => {
  describe('getObjectDisplayOrder', () => {
    it('should return defined order for known objects', () => {
      expect(getObjectDisplayOrder('BOTTLE')).toBe(1);
      expect(getObjectDisplayOrder('SANDWICH-BAG')).toBe(2);
      expect(getObjectDisplayOrder('ROPE')).toBe(1);
      expect(getObjectDisplayOrder('KNIFE')).toBe(2);
    });

    it('should return high number for unknown objects', () => {
      expect(getObjectDisplayOrder('UNKNOWN-OBJECT')).toBe(1000);
    });
  });

  describe('sortObjectsByDisplayOrder', () => {
    it('should sort kitchen objects correctly (bottle before sack)', () => {
      const objects = [
        { id: 'SANDWICH-BAG', name: 'brown sack' },
        { id: 'BOTTLE', name: 'glass bottle' },
      ];
      
      const sorted = sortObjectsByDisplayOrder(objects);
      
      expect(sorted[0].id).toBe('BOTTLE');
      expect(sorted[1].id).toBe('SANDWICH-BAG');
    });

    it('should sort attic objects correctly (rope before knife)', () => {
      const objects = [
        { id: 'KNIFE', name: 'nasty knife' },
        { id: 'ROPE', name: 'rope' },
      ];
      
      const sorted = sortObjectsByDisplayOrder(objects);
      
      expect(sorted[0].id).toBe('ROPE');
      expect(sorted[1].id).toBe('KNIFE');
    });

    it('should sort living room objects correctly (sword before lamp)', () => {
      const objects = [
        { id: 'LAMP', name: 'brass lantern' },
        { id: 'SWORD', name: 'sword' },
        { id: 'TROPHY-CASE', name: 'trophy case' },
      ];
      
      const sorted = sortObjectsByDisplayOrder(objects);
      
      expect(sorted[0].id).toBe('SWORD');
      expect(sorted[1].id).toBe('LAMP');
      expect(sorted[2].id).toBe('TROPHY-CASE');
    });

    it('should place unknown objects after known objects', () => {
      const objects = [
        { id: 'UNKNOWN', name: 'unknown' },
        { id: 'BOTTLE', name: 'glass bottle' },
      ];
      
      const sorted = sortObjectsByDisplayOrder(objects);
      
      expect(sorted[0].id).toBe('BOTTLE');
      expect(sorted[1].id).toBe('UNKNOWN');
    });

    it('should not modify the original array', () => {
      const objects = [
        { id: 'SANDWICH-BAG', name: 'brown sack' },
        { id: 'BOTTLE', name: 'glass bottle' },
      ];
      
      const sorted = sortObjectsByDisplayOrder(objects);
      
      expect(objects[0].id).toBe('SANDWICH-BAG');
      expect(sorted[0].id).toBe('BOTTLE');
    });
  });
});
