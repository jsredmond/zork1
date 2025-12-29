/**
 * StatusDisplayManager implementation for Z-Machine compatible status display
 */

import { GameState } from '../game/state';
import { StatusDisplayManager } from './interfaces';

export class ZMachineStatusDisplay implements StatusDisplayManager {
  private readonly STATUS_LINE_WIDTH = 80;
  private readonly ROOM_NAME_WIDTH = 45;

  /**
   * Formats a response with Z-Machine compatible status line
   */
  formatResponse(message: string, gameState: GameState): string {
    if (!this.shouldIncludeStatus('default')) {
      return message;
    }

    const statusLine = this.formatStatusLine(
      gameState.currentRoom?.name || 'Unknown',
      gameState.score || 0,
      gameState.moves || 0
    );

    return `${statusLine}\n\n${message}`;
  }

  /**
   * Determines if status should be included for a command type
   */
  shouldIncludeStatus(commandType: string): boolean {
    // For now, include status for all commands to match Z-Machine behavior
    // This can be refined based on specific command types if needed
    return true;
  }

  /**
   * Formats the status line to match Z-Machine format exactly
   * Format: "Room Name (padded to 45 chars)Score: X        Moves: Y"
   */
  formatStatusLine(room: string, score: number, moves: number): string {
    // Pad room name to exactly 45 characters
    const paddedRoom = this.padRoomName(room);
    
    // Format score and moves sections
    const scoreSection = `Score: ${score}`;
    const movesSection = `Moves: ${moves}`;
    
    // Calculate spacing between score and moves
    const usedWidth = paddedRoom.length + scoreSection.length + movesSection.length;
    const remainingWidth = this.STATUS_LINE_WIDTH - usedWidth;
    const spacing = Math.max(1, remainingWidth);
    const spacer = ' '.repeat(spacing);
    
    return `${paddedRoom}${scoreSection}${spacer}${movesSection}`;
  }

  /**
   * Pads room name to the standard width
   */
  private padRoomName(room: string): string {
    if (room.length >= this.ROOM_NAME_WIDTH) {
      return room.substring(0, this.ROOM_NAME_WIDTH);
    }
    return room.padEnd(this.ROOM_NAME_WIDTH);
  }

  /**
   * Configuration for status display behavior
   */
  static createConfig() {
    return {
      statusLineWidth: 80,
      roomNameWidth: 45,
      includeStatusByDefault: true,
      formatStyle: 'zmachine'
    };
  }
}