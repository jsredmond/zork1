/**
 * Storage Module
 * Handles file I/O for save/restore functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import { GameState } from '../game/state.js';
import { Serializer } from './serializer.js';

/**
 * Storage class handles file operations for saving and restoring game state
 */
export class Storage {
  private serializer: Serializer;
  private saveDirectory: string;

  constructor(saveDirectory: string = './saves') {
    this.serializer = new Serializer();
    this.saveDirectory = saveDirectory;
    this.ensureSaveDirectoryExists();
  }

  /**
   * Ensure the save directory exists
   */
  private ensureSaveDirectoryExists(): void {
    if (!fs.existsSync(this.saveDirectory)) {
      fs.mkdirSync(this.saveDirectory, { recursive: true });
    }
  }

  /**
   * Save game state to a file
   * @param state The game state to save
   * @param filename The filename (without path)
   * @returns Success message or throws error
   */
  save(state: GameState, filename: string): string {
    try {
      // Ensure filename has .sav extension
      if (!filename.endsWith('.sav')) {
        filename = filename + '.sav';
      }

      const filepath = path.join(this.saveDirectory, filename);
      const serialized = this.serializer.serialize(state);
      
      fs.writeFileSync(filepath, serialized, 'utf-8');
      
      return `Game saved to ${filename}`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save game: ${error.message}`);
      }
      throw new Error('Failed to save game: Unknown error');
    }
  }

  /**
   * Restore game state from a file
   * @param filename The filename (without path)
   * @returns The restored game state or throws error
   */
  restore(filename: string): GameState {
    try {
      // Ensure filename has .sav extension
      if (!filename.endsWith('.sav')) {
        filename = filename + '.sav';
      }

      const filepath = path.join(this.saveDirectory, filename);
      
      // Check if file exists
      if (!fs.existsSync(filepath)) {
        throw new Error(`Save file not found: ${filename}`);
      }

      const data = fs.readFileSync(filepath, 'utf-8');
      
      // Validate before deserializing
      if (!this.serializer.validate(data)) {
        throw new Error(`Invalid or corrupted save file: ${filename}`);
      }

      const state = this.serializer.deserialize(data);
      
      return state;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to restore game: ${error.message}`);
      }
      throw new Error('Failed to restore game: Unknown error');
    }
  }

  /**
   * List all save files in the save directory
   * @returns Array of save file names
   */
  listSaves(): string[] {
    try {
      if (!fs.existsSync(this.saveDirectory)) {
        return [];
      }

      const files = fs.readdirSync(this.saveDirectory);
      return files.filter(file => file.endsWith('.sav'));
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete a save file
   * @param filename The filename (without path)
   * @returns Success message or throws error
   */
  deleteSave(filename: string): string {
    try {
      // Ensure filename has .sav extension
      if (!filename.endsWith('.sav')) {
        filename = filename + '.sav';
      }

      const filepath = path.join(this.saveDirectory, filename);
      
      if (!fs.existsSync(filepath)) {
        throw new Error(`Save file not found: ${filename}`);
      }

      fs.unlinkSync(filepath);
      
      return `Save file deleted: ${filename}`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete save: ${error.message}`);
      }
      throw new Error('Failed to delete save: Unknown error');
    }
  }

  /**
   * Check if a save file exists
   * @param filename The filename (without path)
   * @returns True if file exists, false otherwise
   */
  saveExists(filename: string): boolean {
    if (!filename.endsWith('.sav')) {
      filename = filename + '.sav';
    }

    const filepath = path.join(this.saveDirectory, filename);
    return fs.existsSync(filepath);
  }
}
