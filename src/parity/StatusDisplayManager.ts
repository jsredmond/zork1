/**
 * StatusDisplayManager implementation for Z-Machine compatible status display
 */

import { GameState } from '../game/state';
import { StatusDisplayManager } from './interfaces';

export class ZMachineStatusDisplay implements StatusDisplayManager {
  private readonly STATUS_LINE_WIDTH = 80;
  private readonly ROOM_NAME_WIDTH = 49;

  /**
   * Formats a response with Z-Machine compatible status line
   */
  formatResponse(message: string, gameState: GameState): string {
    if (!this.shouldIncludeStatus('default')) {
      return message;
    }

    // Get the current room object to access its name
    const currentRoom = gameState.getCurrentRoom();
    const roomName = currentRoom?.name || 'Unknown';

    const statusLine = this.formatStatusLine(
      roomName,
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
   * Format: "Room Name (padded to 49 chars)Score: X        Moves: Y"
   * The spacing between Score and Moves is exactly 8 spaces
   */
  formatStatusLine(room: string, score: number, moves: number): string {
    // Pad room name to exactly 49 characters
    const paddedRoom = this.padRoomName(room);
    
    // Format score and moves sections with fixed spacing
    const scoreSection = `Score: ${score}`;
    const movesSection = `Moves: ${moves}`;
    
    // Use exactly 8 spaces between Score and Moves (Z-Machine standard)
    const fixedSpacing = '        '; // 8 spaces
    
    return `${paddedRoom}${scoreSection}${fixedSpacing}${movesSection}`;
  }

  /**
   * Pads room name to the standard width (49 characters)
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
      roomNameWidth: 49,
      includeStatusByDefault: true,
      formatStyle: 'zmachine'
    };
  }
}