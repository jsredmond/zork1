# Implementation Plan: npm Production Release

## Overview

Prepare the Zork I TypeScript rewrite for npm publication by cleaning up the repository, configuring proper packaging, and ensuring only distribution files are published.

## Tasks

- [x] 1. Create directory structure for archived files
  - Create `reference/zil/` directory for ZIL source files
  - Create `dev-artifacts/parity-reports/` for parity analysis files
  - Create `dev-artifacts/test-outputs/` for test output files
  - _Requirements: 4.1, 5.2_

- [x] 1.1 Create reference and dev-artifacts directories
  - Run: `mkdir -p reference/zil dev-artifacts/parity-reports dev-artifacts/test-outputs`
  - _Requirements: 4.1_

- [x] 1.2 Commit to Git
  - Commit message: "chore: Create directory structure for archived files"
  - _Requirements: 4.1, 5.2_

---

- [x] 2. Move ZIL source files to reference directory
  - Move all *.zil files to reference/zil/
  - Move zork1.chart, zork1.errors, zork1.record, zork1.serial to reference/zil/
  - Move zork1freq.xzap and parser.cmp to reference/zil/
  - _Requirements: 4.1, 4.3, 5.1_

- [x] 2.1 Move ZIL files
  - Move: 1actions.zil, 1dungeon.zil, gclock.zil, gglobals.zil, gmacros.zil, gmain.zil, gparser.zil, gsyntax.zil, gverbs.zil, zork1.zil
  - _Requirements: 4.1_

- [x] 2.2 Move ZIL artifacts
  - Move: zork1.chart, zork1.errors, zork1.record, zork1.serial, zork1freq.xzap, parser.cmp
  - _Requirements: 4.1_

- [x] 2.3 Commit to Git
  - Commit message: "chore: Move ZIL source files to reference/zil/"
  - _Requirements: 4.1_

---

- [x] 3. Move development artifacts to dev-artifacts directory
  - Move parity JSON files to dev-artifacts/parity-reports/
  - Move parity markdown reports to dev-artifacts/parity-reports/
  - Move test output files to dev-artifacts/test-outputs/
  - _Requirements: 5.2, 5.4_

- [x] 3.1 Move parity JSON files
  - Move: parity-baseline-iteration-*.json, parity-differences-iteration-*.json, parity-fix-priorities-iteration-*.json, parity-difference-analysis.json, parity-final-results.json, parity-status-bar-results.json, spot-test-*.json, test-progress.json
  - _Requirements: 5.4_

- [x] 3.2 Move parity markdown files
  - Move: parity-difference-analysis.md, parity-logic-differences-analysis.md, single-difference-analysis.md, parity-status-bar-results.txt, parity-validation-output.txt
  - _Requirements: 5.2_

- [x] 3.3 Move report markdown files
  - Move: PARITY_*.md, PERFECT_PARITY_*.md, comprehensive-parity-achievement-report.md, object-behavior-improvements-report.md, parser-improvements-report.md, puzzle-solutions-analysis.md, PERFORMANCE_REGRESSION_REPORT.md
  - _Requirements: 5.2_

- [x] 3.4 Commit to Git
  - Commit message: "chore: Move development artifacts to dev-artifacts/"
  - _Requirements: 5.2, 5.4_

---

- [-] 4. Delete temporary and debug files
  - Delete troll combat debug outputs (troll-*.txt)
  - Delete ad-hoc test scripts in root (test-*.ts, test-*.sh)
  - Delete recording scripts (record-*.sh)
  - Delete temporary files (temp-*.txt, 0)
  - _Requirements: 5.3_

- [x] 4.1 Delete troll debug files
  - Delete: troll-attempt-1.txt, troll-attempt.txt, troll-combat-full.txt, troll-combat-output.txt, troll-run-*.txt (1-20), troll-success.txt, troll-test.txt
  - _Requirements: 5.3_

- [x] 4.2 Delete ad-hoc test files
  - Delete: test-coffin-debug.ts, test-combat-daemon.ts, test-death-resurrection.ts, test-egg-nest.ts, test-full-daemon-sequence.ts, test-mirror-room.ts, test-multiple-daemons.ts, test-se-direction.ts, test-thief-daemon.ts, test-treasure-removal.ts, test-troll-attack.ts, test-troll-combat.ts, test-window-entry.ts
  - Delete: test-game.sh, test-troll-multiple.sh, test-troll-combat.txt
  - _Requirements: 5.3_

- [x] 4.3 Delete recording and temp files
  - Delete: record-troll-combat.sh, record-troll-multi-attack.sh, record-troll-success.sh
  - Delete: temp-new-rooms.txt, 0
  - _Requirements: 5.3_

- [-] 4.4 Commit to Git
  - Commit message: "chore: Delete temporary and debug files"
  - _Requirements: 5.3_

---

- [ ] 5. Update .gitignore for new structure
  - Add .kiro/ to gitignore
  - Add reference/ to gitignore
  - Add dev-artifacts/ to gitignore
  - Add saves/ to gitignore
  - Keep existing ignores for node_modules, dist, coverage, etc.
  - _Requirements: 2.1, 4.2_

- [ ] 5.1 Update .gitignore file
  - Add patterns: `.kiro/`, `reference/`, `dev-artifacts/`, `saves/`
  - _Requirements: 2.1, 4.2_

- [ ] 5.2 Commit to Git
  - Commit message: "chore: Update .gitignore for production structure"
  - _Requirements: 2.1, 4.2_

---

- [ ] 6. Update package.json for npm publishing
  - Change name to "zork-ts"
  - Update bin field with proper "zork" command mapping
  - Add files field to specify distribution contents
  - Add prepublishOnly script
  - Add repository, engines, and other metadata
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 6.1, 7.1_

- [ ] 6.1 Update package.json
  - Change name from "zork-rewrite" to "zork-ts"
  - Update bin to: `{ "zork": "dist/main.js" }`
  - Add files: `["dist/**/*.js", "dist/**/*.d.ts", "README.md", "LICENSE"]`
  - Add prepublishOnly: `"npm run build"`
  - Add engines: `{ "node": ">=18.0.0" }`
  - Add repository field
  - _Requirements: 1.2, 3.1, 6.1, 7.1_

- [ ] 6.2 Commit to Git
  - Commit message: "feat: Configure package.json for npm publishing"
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

---

- [ ] 7. Update tsconfig.json for production build
  - Exclude src/testing/ from compilation
  - Exclude src/parity/ from compilation
  - Exclude property test files from compilation
  - Ensure declaration files are generated
  - _Requirements: 3.3, 3.4, 7.2, 7.4_

- [ ] 7.1 Update tsconfig.json
  - Update exclude to: `["node_modules", "dist", "**/*.test.ts", "**/*.property.test.ts", "src/testing/**/*", "src/parity/**/*"]`
  - _Requirements: 3.3, 3.4_

- [ ] 7.2 Commit to Git
  - Commit message: "chore: Update tsconfig.json to exclude test files from build"
  - _Requirements: 3.3, 3.4_

---

- [ ] 8. Create user-focused documentation
  - Update README.md for end users with installation instructions
  - Create CONTRIBUTING.md for developers
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8.1 Update README.md
  - Add npm installation instructions: `npm install -g zork-ts`
  - Focus on gameplay and user experience
  - Remove internal development details
  - Keep game description and basic usage
  - _Requirements: 8.1, 8.2_

- [ ] 8.2 Create CONTRIBUTING.md
  - Document development setup
  - Explain testing infrastructure
  - Reference moved files and structure
  - Include parity validation instructions
  - _Requirements: 8.3_

- [ ] 8.3 Commit to Git
  - Commit message: "docs: Update documentation for production release"
  - _Requirements: 8.1, 8.2, 8.3_

---

- [ ] 9. Move remaining cleanup files
  - Move internal documentation to dev-artifacts/docs/
  - Clean up any remaining non-essential root files
  - _Requirements: 5.1, 5.5_

- [ ] 9.1 Move internal docs
  - Move to dev-artifacts/docs/: CROSS_PLATFORM_SUMMARY.md, DISTRIBUTION_CHECKLIST.md, INSTALL.md, MACOS_TEST_REPORT.md, PACKAGING.md, PLAYTHROUGH_CHECKLIST.md, README-rewrite.md, WINDOWS_TEST_INSTRUCTIONS.md, WINDOWS_TEST_REPORT.md, zork1_scoring_guide.md
  - _Requirements: 5.1_

- [ ] 9.2 Move build scripts
  - Move to dev-artifacts/: build-releases.ps1, build-releases.sh
  - _Requirements: 5.1_

- [ ] 9.3 Handle COMPILED directory and zork1.zip
  - Move COMPILED/ to reference/
  - Move zork1.zip to reference/
  - _Requirements: 5.1_

- [ ] 9.4 Commit to Git
  - Commit message: "chore: Final cleanup of root directory"
  - _Requirements: 5.1_

---

- [ ] 10. Verify build and package
  - Run npm run build and verify dist/ output
  - Run npm pack and verify tarball contents
  - Test installation from tarball
  - _Requirements: 1.5, 6.6, 7.3, 7.4_

- [ ] 10.1 Test build process
  - Run `npm run build`
  - Verify dist/ contains expected files (main.js, engine/, game/, io/, parser/, persistence/)
  - Verify no test files in dist/ (no testing/, no parity/, no *.test.js)
  - _Requirements: 7.2, 7.4_

- [ ] 10.2 Test package contents
  - Run `npm pack`
  - Extract and verify tarball contents with `tar -tzf zork-ts-1.0.0.tgz`
  - Ensure only distribution files included (dist/, README.md, LICENSE, package.json)
  - _Requirements: 1.3, 6.6_

- [ ] 10.3 Test installation
  - Install from tarball: `npm install -g ./zork-ts-1.0.0.tgz`
  - Run `zork` command and verify game starts
  - Uninstall after test: `npm uninstall -g zork-ts`
  - _Requirements: 1.1, 1.5_

- [ ] 10.4 Commit to Git
  - Commit message: "chore: Verify production build and package"
  - Tag: v1.0.0
  - _Requirements: 1.1, 1.5_

---

- [ ] 11. Final checkpoint
  - Ensure all tests pass with `npm test`
  - Verify clean root directory (only essential files remain)
  - Confirm package ready for npm publish
  - _Requirements: All_

## Notes

- The `reference/` and `dev-artifacts/` directories will be gitignored but remain locally for maintainers
- Testing infrastructure remains in `src/testing/` for maintainers but is excluded from npm distribution
- The `scripts/` directory remains for development but is excluded from npm distribution
- After completing all tasks, the package can be published with `npm publish`
- The `docs/` directory in the repo can remain for GitHub documentation but won't be in npm package
