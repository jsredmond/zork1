/**
 * Object Display Order
 * 
 * Defines the order in which objects should be displayed in room descriptions
 * to match the Z-Machine behavior. In the original ZIL, objects defined later
 * in the source file appear first in room descriptions (reverse definition order).
 * 
 * This map assigns a display priority to each object. Lower numbers appear first.
 * Objects not in this map will be displayed after all mapped objects.
 */

/**
 * Object display order map
 * Based on analysis of Z-Machine output vs ZIL source order
 * 
 * Key observations from ZIL source (1dungeon.zil):
 * - KITCHEN-TABLE is defined at line 271
 * - SANDWICH-BAG (sack) is IN KITCHEN-TABLE, defined at line 287
 * - BOTTLE is IN KITCHEN-TABLE, defined at line 443
 * - Z-Machine shows: bottle first, then sack (reverse of definition order)
 * 
 * - ATTIC-TABLE is defined at line 279
 * - KNIFE is IN ATTIC-TABLE, defined at line 509
 * - ROPE is IN ATTIC, defined at line 798
 * - Z-Machine shows: rope first, then knife (reverse of definition order)
 * 
 * The pattern: objects defined LATER in ZIL appear FIRST in room descriptions
 */
export const OBJECT_DISPLAY_ORDER: Record<string, number> = {
  // Kitchen objects (on KITCHEN-TABLE)
  // BOTTLE defined at line 443, SANDWICH-BAG at line 287
  // Z-Machine order: bottle (1), sack (2)
  'BOTTLE': 1,
  'SANDWICH-BAG': 2,
  
  // West of House objects
  // Z-Machine order: leaflet (1), mailbox (2)
  'ADVERTISEMENT': 0,  // leaflet - Should be first
  'MAILBOX': 1,  // Should be after leaflet
  
  // Attic objects (when all objects are present)
  // Z-Machine room order: leaflet (1), brass lantern (2), sword (3), rope (4), knife (5), table (6)
  // This order is used for "take all" and room descriptions
  // Inventory displays in reverse order (LIFO)
  'LAMP': 2,     // brass lantern
  'SWORD': 3,
  'ROPE': 4,
  'KNIFE': 5,
  'ATTIC-TABLE': 6,
  
  // Living room objects
  // Z-Machine order: sword (1), lamp (2), trophy-case (3)
  // Note: When sword/lamp are in living room, they use different ordering
  'TROPHY-CASE': 7,
  
  // Maze-5 objects
  // BURNED-OUT-LANTERN, BONES, BAG-OF-COINS, KEYS, RUSTY-KNIFE
  'BAG-OF-COINS': 1,
  'KEYS': 2,
  'RUSTY-KNIFE': 3,
  'BURNED-OUT-LANTERN': 4,
  'BONES': 5,
  
  // Dam Lobby objects
  'MATCH': 1,
  'GUIDE': 2,
  
  // Maintenance Room objects
  'TUBE': 1,
  'SCREWDRIVER': 2,
  'WRENCH': 3,
};

/**
 * Get the display order for an object
 * Returns a high number for objects not in the map (they appear last)
 */
export function getObjectDisplayOrder(objectId: string): number {
  return OBJECT_DISPLAY_ORDER[objectId] ?? 1000;
}

/**
 * Sort objects by their display order
 * Objects with lower order numbers appear first
 */
export function sortObjectsByDisplayOrder<T extends { id: string }>(objects: T[]): T[] {
  return [...objects].sort((a, b) => {
    const orderA = getObjectDisplayOrder(a.id);
    const orderB = getObjectDisplayOrder(b.id);
    return orderA - orderB;
  });
}
