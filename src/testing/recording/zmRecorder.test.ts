/**
 * Unit tests for ZMachineRecorder
 * 
 * Tests interpreter availability check, error handling,
 * output parsing/transcript structure, and process cleanup.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ZMachineRecorder, ZMachineError } from './zmRecorder.js';
import { ZMachineConfig } from './types.js';
import { existsSync } from 'fs';

describe('ZMachineRecorder', () => {
  describe('isAvailable', () => {
    it('should return false when interpreter path does not exist', async () => {
      const config: ZMachineConfig = {
        interpreterPath: '/nonexistent/path/to/dfrotz',
        gameFilePath: 'COMPILED/zork1.z3'
      };
      
      const recorder = new ZMachineRecorder(config);
      const available = await recorder.isAvailable();
      
      expect(available).toBe(false);
    });

    it('should return false when game file does not exist', async () => {
      const config: ZMachineConfig = {
        interpreterPath: '/usr/bin/true',  // A command that exists on most systems
        gameFilePath: '/nonexistent/game.z3'
      };
      
      const recorder = new ZMachineRecorder(config);
      const available = await recorder.isAvailable();
      
      expect(available).toBe(false);
    });

    it('should return true when both paths exist', async () => {
      // Skip if dfrotz is not installed
      const dfrotzPaths = [
        '/usr/local/bin/dfrotz',
        '/usr/bin/dfrotz',
        '/opt/homebrew/bin/dfrotz'
      ];
      
      const interpreterPath = dfrotzPaths.find(p => existsSync(p));
      const gameFileExists = existsSync('COMPILED/zork1.z3');
      
      if (!interpreterPath || !gameFileExists) {
        // Skip test if prerequisites not available
        return;
      }

      const config: ZMachineConfig = {
        interpreterPath,
        gameFilePath: 'COMPILED/zork1.z3'
      };
      
      const recorder = new ZMachineRecorder(config);
      const available = await recorder.isAvailable();
      
      expect(available).toBe(true);
    });
  });

  describe('record', () => {
    it('should throw ZMachineError when interpreter not available', async () => {
      const config: ZMachineConfig = {
        interpreterPath: '/nonexistent/dfrotz',
        gameFilePath: '/nonexistent/game.z3'
      };
      
      const recorder = new ZMachineRecorder(config);
      
      await expect(recorder.record(['look'])).rejects.toThrow(ZMachineError);
    });

    it('should throw error with helpful message about paths', async () => {
      const config: ZMachineConfig = {
        interpreterPath: '/nonexistent/dfrotz',
        gameFilePath: '/nonexistent/game.z3'
      };
      
      const recorder = new ZMachineRecorder(config);
      
      await expect(recorder.record(['look'])).rejects.toThrow(/interpreter not available/i);
    });
  });

  describe('transcript structure', () => {
    // These tests require dfrotz to be installed
    // They verify the transcript structure when recording is possible
    
    it('should produce transcript with correct source type', async () => {
      const dfrotzPaths = [
        '/usr/local/bin/dfrotz',
        '/usr/bin/dfrotz',
        '/opt/homebrew/bin/dfrotz'
      ];
      
      const interpreterPath = dfrotzPaths.find(p => existsSync(p));
      const gameFileExists = existsSync('COMPILED/zork1.z3');
      
      if (!interpreterPath || !gameFileExists) {
        // Skip test if prerequisites not available
        return;
      }

      const config: ZMachineConfig = {
        interpreterPath,
        gameFilePath: 'COMPILED/zork1.z3',
        timeout: 3000
      };
      
      const recorder = new ZMachineRecorder(config);
      const transcript = await recorder.record(['look']);
      
      expect(transcript.source).toBe('z-machine');
    });

    it('should include metadata with interpreter path', async () => {
      const dfrotzPaths = [
        '/usr/local/bin/dfrotz',
        '/usr/bin/dfrotz',
        '/opt/homebrew/bin/dfrotz'
      ];
      
      const interpreterPath = dfrotzPaths.find(p => existsSync(p));
      const gameFileExists = existsSync('COMPILED/zork1.z3');
      
      if (!interpreterPath || !gameFileExists) {
        return;
      }

      const config: ZMachineConfig = {
        interpreterPath,
        gameFilePath: 'COMPILED/zork1.z3',
        timeout: 3000
      };
      
      const recorder = new ZMachineRecorder(config);
      const transcript = await recorder.record(['look']);
      
      expect(transcript.metadata.interpreterPath).toBe(interpreterPath);
    });

    it('should have entries for initial output plus each command', async () => {
      const dfrotzPaths = [
        '/usr/local/bin/dfrotz',
        '/usr/bin/dfrotz',
        '/opt/homebrew/bin/dfrotz'
      ];
      
      const interpreterPath = dfrotzPaths.find(p => existsSync(p));
      const gameFileExists = existsSync('COMPILED/zork1.z3');
      
      if (!interpreterPath || !gameFileExists) {
        return;
      }

      const config: ZMachineConfig = {
        interpreterPath,
        gameFilePath: 'COMPILED/zork1.z3',
        timeout: 3000
      };
      
      const recorder = new ZMachineRecorder(config);
      const commands = ['look', 'inventory'];
      const transcript = await recorder.record(commands);
      
      // Should have initial output (index 0) plus one entry per command
      expect(transcript.entries.length).toBe(commands.length + 1);
      expect(transcript.entries[0].index).toBe(0);
      expect(transcript.entries[0].command).toBe('');  // Initial has no command
      expect(transcript.entries[1].command).toBe('look');
      expect(transcript.entries[2].command).toBe('inventory');
    });

    it('should capture timestamps when option is enabled', async () => {
      const dfrotzPaths = [
        '/usr/local/bin/dfrotz',
        '/usr/bin/dfrotz',
        '/opt/homebrew/bin/dfrotz'
      ];
      
      const interpreterPath = dfrotzPaths.find(p => existsSync(p));
      const gameFileExists = existsSync('COMPILED/zork1.z3');
      
      if (!interpreterPath || !gameFileExists) {
        return;
      }

      const config: ZMachineConfig = {
        interpreterPath,
        gameFilePath: 'COMPILED/zork1.z3',
        timeout: 3000
      };
      
      const recorder = new ZMachineRecorder(config);
      const transcript = await recorder.record(['look'], { captureTimestamps: true });
      
      expect(transcript.entries[0].timestamp).toBeDefined();
      expect(typeof transcript.entries[0].timestamp).toBe('number');
    });

    it('should not include timestamps by default', async () => {
      const dfrotzPaths = [
        '/usr/local/bin/dfrotz',
        '/usr/bin/dfrotz',
        '/opt/homebrew/bin/dfrotz'
      ];
      
      const interpreterPath = dfrotzPaths.find(p => existsSync(p));
      const gameFileExists = existsSync('COMPILED/zork1.z3');
      
      if (!interpreterPath || !gameFileExists) {
        return;
      }

      const config: ZMachineConfig = {
        interpreterPath,
        gameFilePath: 'COMPILED/zork1.z3',
        timeout: 3000
      };
      
      const recorder = new ZMachineRecorder(config);
      const transcript = await recorder.record(['look']);
      
      expect(transcript.entries[0].timestamp).toBeUndefined();
    });
  });
});


describe('process cleanup', () => {
  // Helper to find dfrotz path
  function findDfrotz(): string | undefined {
    const dfrotzPaths = [
      '/usr/local/bin/dfrotz',
      '/usr/bin/dfrotz',
      '/opt/homebrew/bin/dfrotz'
    ];
    return dfrotzPaths.find(p => existsSync(p));
  }

  it('should properly clean up process after recording completes', async () => {
    const interpreterPath = findDfrotz();
    const gameFileExists = existsSync('COMPILED/zork1.z3');
    
    if (!interpreterPath || !gameFileExists) {
      // Skip test if prerequisites not available
      return;
    }

    const config: ZMachineConfig = {
      interpreterPath,
      gameFilePath: 'COMPILED/zork1.z3',
      timeout: 3000
    };
    
    const recorder = new ZMachineRecorder(config);
    
    // Record a session - cleanup should wait for process termination
    const transcript = await recorder.record(['look']);
    
    // If we get here without hanging, cleanup worked properly
    expect(transcript.entries.length).toBeGreaterThan(0);
  });

  it('should handle multiple sequential recordings without process conflicts', async () => {
    const interpreterPath = findDfrotz();
    const gameFileExists = existsSync('COMPILED/zork1.z3');
    
    if (!interpreterPath || !gameFileExists) {
      return;
    }

    const config: ZMachineConfig = {
      interpreterPath,
      gameFilePath: 'COMPILED/zork1.z3',
      timeout: 3000
    };
    
    const recorder = new ZMachineRecorder(config);
    
    // Run multiple recordings in sequence
    // This tests that cleanup properly waits for process termination
    // before allowing the next recording to start
    const transcript1 = await recorder.record(['look']);
    const transcript2 = await recorder.record(['inventory']);
    const transcript3 = await recorder.record(['north']);
    
    // All recordings should complete successfully
    expect(transcript1.entries.length).toBeGreaterThan(0);
    expect(transcript2.entries.length).toBeGreaterThan(0);
    expect(transcript3.entries.length).toBeGreaterThan(0);
    
    // Each should have unique IDs
    expect(transcript1.id).not.toBe(transcript2.id);
    expect(transcript2.id).not.toBe(transcript3.id);
  });

  it('should clean up process even when recording throws an error', async () => {
    const config: ZMachineConfig = {
      interpreterPath: '/nonexistent/dfrotz',
      gameFilePath: '/nonexistent/game.z3'
    };
    
    const recorder = new ZMachineRecorder(config);
    
    // This should throw but not leave any zombie processes
    await expect(recorder.record(['look'])).rejects.toThrow(ZMachineError);
    
    // If we get here without hanging, cleanup worked even on error
  });
});
