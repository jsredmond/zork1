# Requirements Document

## Introduction

This specification covers preparing the Zork I TypeScript rewrite for production release as an npm package. Users should be able to install and play the game with a simple `npm install -g zork-ts` command. The release must be clean, professional, and free of development artifacts while preserving testing infrastructure for maintainers.

## Glossary

- **Package**: The npm package that users will install
- **Development_Artifacts**: Files used during development that should not be distributed (test outputs, debug files, parity reports)
- **Kiro_Data**: Configuration and spec files in the `.kiro` directory used by Kiro IDE
- **ZIL_Source**: Original Zork Implementation Language source files (*.zil) used as reference
- **Testing_Infrastructure**: Scripts, test files, and data used for parity validation and testing
- **Distribution_Files**: Files that should be included in the npm package for end users

## Requirements

### Requirement 1: npm Package Configuration

**User Story:** As a user, I want to install the game with `npm install -g zork-ts`, so that I can play Zork I from my terminal.

#### Acceptance Criteria

1. WHEN a user runs `npm install -g zork-ts`, THE Package SHALL install successfully and create a `zork` command
2. THE Package SHALL have a proper `bin` field pointing to the compiled entry point
3. THE Package SHALL include only Distribution_Files necessary for gameplay
4. THE Package SHALL have appropriate metadata (name, description, keywords, author, license)
5. WHEN a user runs the `zork` command after installation, THE Package SHALL start the game immediately

### Requirement 2: Gitignore Kiro Data

**User Story:** As a maintainer, I want Kiro_Data to be gitignored, so that IDE-specific configuration doesn't pollute the repository.

#### Acceptance Criteria

1. THE .gitignore SHALL include `.kiro/` directory to exclude all Kiro_Data
2. THE .gitignore SHALL include exceptions for essential steering files if needed for documentation
3. WHEN a developer clones the repository, THE repository SHALL not contain Kiro_Data artifacts

### Requirement 3: Separate Testing Infrastructure

**User Story:** As a maintainer, I want Testing_Infrastructure separated from distribution code, so that users don't download unnecessary test files.

#### Acceptance Criteria

1. THE Package SHALL use `files` field in package.json to include only Distribution_Files
2. THE Testing_Infrastructure SHALL remain in the repository for maintainer use
3. WHEN the package is published, THE Package SHALL not include test files, scripts, or parity data
4. THE Package SHALL not include the `src/testing/` directory in distribution
5. THE Package SHALL not include the `scripts/` directory in distribution

### Requirement 4: Archive ZIL Source Files

**User Story:** As a maintainer, I want ZIL_Source files archived separately, so that they're available for reference but not distributed to users.

#### Acceptance Criteria

1. THE ZIL_Source files SHALL be moved to a `reference/zil/` directory
2. THE .gitignore SHALL include the `reference/` directory
3. THE Package SHALL not include ZIL_Source files in distribution
4. WHEN a maintainer needs ZIL reference, THE ZIL_Source files SHALL be accessible locally

### Requirement 5: Clean Root Directory

**User Story:** As a contributor, I want a clean root directory, so that the project structure is professional and easy to navigate.

#### Acceptance Criteria

1. THE root directory SHALL contain only essential project files (README, LICENSE, package.json, tsconfig.json, etc.)
2. THE Development_Artifacts (parity reports, test outputs, debug files) SHALL be moved or deleted
3. THE root directory SHALL not contain temporary test files (troll-*.txt, test-*.ts, etc.)
4. THE root directory SHALL not contain iteration-specific JSON files (parity-*-iteration-*.json)
5. WHEN a user views the repository, THE root directory SHALL present a clean, professional appearance

### Requirement 6: npmignore Configuration

**User Story:** As a package maintainer, I want proper npmignore configuration, so that only necessary files are published.

#### Acceptance Criteria

1. THE Package SHALL have an `.npmignore` file OR use `files` field in package.json
2. THE Package SHALL exclude all Development_Artifacts from publication
3. THE Package SHALL exclude Testing_Infrastructure from publication
4. THE Package SHALL exclude ZIL_Source files from publication
5. THE Package SHALL exclude documentation files not needed for gameplay
6. WHEN `npm pack` is run, THE resulting tarball SHALL contain only Distribution_Files

### Requirement 7: Build and Distribution Scripts

**User Story:** As a maintainer, I want clear build scripts, so that I can easily prepare releases.

#### Acceptance Criteria

1. THE Package SHALL have a `prepublishOnly` script that builds the project
2. THE Package SHALL have a `build` script that compiles TypeScript to JavaScript
3. WHEN `npm publish` is run, THE Package SHALL automatically build before publishing
4. THE Package SHALL output compiled files to a `dist/` directory

### Requirement 8: Documentation Cleanup

**User Story:** As a user, I want clear documentation, so that I understand how to install and play the game.

#### Acceptance Criteria

1. THE README.md SHALL focus on installation and gameplay for end users
2. THE README.md SHALL include npm installation instructions
3. THE Package SHALL include a separate CONTRIBUTING.md for developers
4. THE Package SHALL not include internal development reports in distribution
