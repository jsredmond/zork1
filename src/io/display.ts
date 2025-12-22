/**
 * Output formatting
 * Handles formatting and displaying game output
 */

import { Room } from '../game/rooms.js';
import { GameObject } from '../game/objects.js';
import { GameState } from '../game/state.js';
import { isRoomLit, getDarknessMessage } from '../engine/lighting.js';

/**
 * Display class handles formatting and displaying game output
 * Provides methods for formatting rooms, objects, and messages
 */
export class Display {
  /**
   * Format a room description for display
   * @param room - The room to format
   * @param state - Game state (needed to check lighting)
   * @param verbose - Whether to show full description (true) or brief (false)
   * @returns Formatted room description
   */
  formatRoom(room: Room, state: GameState, verbose: boolean = true): string {
    const lines: string[] = [];

    // Check if room is lit
    if (!isRoomLit(state, room.id)) {
      // Room is dark - show darkness message
      return getDarknessMessage();
    }

    // Room name
    lines.push(room.name);

    // Room description (full if verbose or not visited, brief otherwise)
    if (verbose || !room.visited) {
      lines.push(room.description);
    }

    return lines.join('\n');
  }

  /**
   * Format a list of objects for display
   * @param objects - Objects to format
   * @returns Formatted object list
   */
  formatObjectList(objects: GameObject[]): string {
    if (objects.length === 0) {
      return '';
    }

    const lines: string[] = [];
    
    for (const obj of objects) {
      lines.push(`  ${obj.name}`);
    }

    return lines.join('\n');
  }

  /**
   * Format inventory display
   * @param objects - Objects in inventory
   * @param allObjects - All game objects (for finding nested items)
   * @returns Formatted inventory
   */
  formatInventory(objects: GameObject[], allObjects?: Map<string, GameObject>): string {
    if (objects.length === 0) {
      return 'You are empty-handed.';
    }

    const lines: string[] = ['You are carrying:'];
    
    for (const obj of objects) {
      lines.push(`  ${obj.name}`);
      
      // Show nested items (items inside this container)
      if (allObjects && obj.capacity && obj.capacity > 0) {
        const nestedItems = Array.from(allObjects.values()).filter(
          item => item.location === obj.id
        );
        
        for (const nested of nestedItems) {
          lines.push(`    ${nested.name}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Format an action result message
   * @param message - The message to format
   * @returns Formatted message
   */
  formatMessage(message: string): string {
    return message;
  }

  /**
   * Format the game title and introduction
   * @returns Formatted title screen
   */
  formatTitle(): string {
    const lines: string[] = [
      '',
      'ZORK I: The Great Underground Empire',
      'Copyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.',
      'ZORK is a registered trademark of Infocom, Inc.',
      'Revision 88 / Serial number 840726',
      'This source port by: @jsredmond https://github.com/jsredmond/zork1',
      ''
    ];

    return lines.join('\n');
  }

  /**
   * Format a score display
   * @param score - Current score
   * @param moves - Number of moves
   * @param maxScore - Maximum possible score
   * @returns Formatted score
   */
  formatScore(score: number, moves: number, maxScore: number = 350): string {
    const rank = this.getRank(score, maxScore);
    return `Your score is ${score} (total of ${maxScore} points), in ${moves} moves.\nThis gives you the rank of ${rank}.`;
  }

  /**
   * Get rank based on score
   * @param score - Current score
   * @param maxScore - Maximum possible score
   * @returns Rank title
   */
  private getRank(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 100) return 'Master Adventurer';
    if (percentage >= 90) return 'Wizard';
    if (percentage >= 80) return 'Master';
    if (percentage >= 70) return 'Winner';
    if (percentage >= 60) return 'Hacker';
    if (percentage >= 50) return 'Adventurer';
    if (percentage >= 40) return 'Junior Adventurer';
    if (percentage >= 30) return 'Novice Adventurer';
    if (percentage >= 20) return 'Amateur Adventurer';
    if (percentage >= 10) return 'Beginner';
    return 'Beginner';
  }

  /**
   * Wrap text to a specified width
   * @param text - Text to wrap
   * @param width - Maximum line width
   * @returns Wrapped text
   */
  wrapText(text: string, width: number = 80): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine.length > 0 ? ' ' : '') + word;
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }
}
