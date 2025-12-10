# Implementation Plan

- [x] 1. Update Terminal class with ANSI escape code support
  - Add ANSI escape code constants and helper methods
  - Implement screen initialization with scroll region
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 1.1 Add ANSI escape code constants to Terminal
  - Define constants for cursor movement, scroll region, colors
  - Add helper method to check if terminal supports ANSI codes
  - _Requirements: 2.1_

- [x] 1.2 Implement initializeScreen() method
  - Clear screen and set up scroll region (line 2 to bottom)
  - Draw initial status bar on line 1
  - Position cursor in content area
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 1.3 Implement updateStatusBar() method
  - Save cursor position
  - Move to line 1 and clear it
  - Write formatted status bar (location left, score/moves right)
  - Restore cursor position
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 1.4 Write property test for status bar content
  - **Property 1: Status bar contains current room name**
  - **Property 2: Status bar contains score and moves**
  - **Validates: Requirements 1.2, 1.3, 1.5**

- [x] 1.5 Commit to Git
  - Commit message: "feat: Add ANSI escape code support to Terminal"
  - Include terminal.ts changes
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

---

- [x] 2. Update prompt to use `>` character
  - Change prompt from default to `> `
  - Ensure commands are echoed with prompt in history
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 2.1 Update showPrompt() to use `>` character
  - Change readline prompt to "> "
  - Ensure prompt appears on new line after output
  - _Requirements: 3.1, 3.3_

- [x] 2.2 Ensure command echo includes prompt
  - Verify readline echoes input after `>` prompt
  - Commands should appear as ">command" in scrollback
  - _Requirements: 3.2, 4.1, 4.2_

- [x] 2.3 Write property test for prompt format
  - **Property 3: Commands are prefixed with prompt**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 2.4 Commit to Git
  - Commit message: "feat: Update prompt to use > character"
  - Include terminal.ts changes
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

---

- [x] 3. Update main.ts to use new Terminal features
  - Initialize screen on startup
  - Update status bar after each command
  - Remove inline status bar display
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 3.1 Call initializeScreen() on game startup
  - Initialize screen after terminal.initialize()
  - Set up scroll region before displaying title
  - _Requirements: 1.1, 2.1_

- [x] 3.2 Update status bar after each command
  - Call updateStatusBar() with current room, score, moves
  - Remove existing inline showStatusBar() calls
  - _Requirements: 1.4, 1.5_

- [x] 3.3 Remove duplicate status bar display
  - Remove inline status bar from processCommand
  - Status bar now updates in place at top
  - _Requirements: 1.4_

- [x] 3.4 Commit to Git
  - Commit message: "feat: Integrate status bar UI into main game loop"
  - Include main.ts changes
  - _Requirements: 1.1, 1.4, 1.5_

---

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

- [-] 5. Final testing and polish
  - Manual testing of status bar behavior
  - Verify parity with original Zork display
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.1, 4.1_

- [x] 5.1 Test status bar updates correctly
  - Test on game start
  - Test after movement commands
  - Test after score changes
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 5.2 Test scroll behavior
  - Verify status bar stays fixed during scrolling
  - Test with long output that exceeds terminal height
  - _Requirements: 2.1, 2.2_

- [x] 5.3 Test prompt display
  - Verify `>` prompt appears correctly
  - Verify commands show with prompt in history
  - _Requirements: 3.1, 3.2, 4.1, 4.2_

- [-] 5.4 Final commit and tag
  - Commit message: "feat: Complete status bar UI implementation"
  - Tag: v1.0.0-status-bar-ui
  - _Requirements: All_
