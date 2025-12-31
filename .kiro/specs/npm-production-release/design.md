# Design Document: npm Production Release

## Overview

This design prepares the Zork I TypeScript rewrite for npm publication. The approach involves:
1. Restructuring the repository to separate distribution files from development artifacts
2. Configuring npm packaging to include only necessary files
3. Cleaning up the root directory by archiving or removing temporary files
4. Setting up proper gitignore rules for Kiro data and reference materials

## Architecture

```
zork-ts/
├── dist/                    # Compiled output (gitignored, built on publish)
├── src/                     # Source code
│   ├── engine/              # Game engine (distributed)
│   ├── game/                # Game content (distributed)
│   ├── io/                  # I/O handling (distributed)
│   ├── parser/              # Command parser (distributed)
│   ├── persistence/         # Save/load (distributed)
│   ├── parity/              # Parity tools (NOT distributed)
│   └── testing/             # Test infrastructure (NOT distributed)
├── reference/               # Reference materials (gitignored)
│   └── zil/                 # Original ZIL source files
├── scripts/                 # Development scripts (NOT distributed)
├── dev-artifacts/           # Development outputs (gitignored)
│   ├── parity-reports/      # Parity analysis files
│   └── test-outputs/        # Test output files
├── .kiro/                   # Kiro IDE data (gitignored)
├── package.json             # npm configuration
├── tsconfig.json            # TypeScript config
├── README.md                # User documentation
├── CONTRIBUTING.md          # Developer documentation
└── LICENSE                  # MIT license
```

## Components and Interfaces

### Package.json Configuration

```json
{
  "name": "zork-ts",
  "version": "1.0.0",
  "description": "Zork I: The Great Underground Empire - TypeScript Edition",
  "main": "dist/main.js",
  "bin": {
    "zork": "dist/main.js"
  },
  "type": "module",
  "files": [
    "dist/**/*.js",
    "dist/**/*.d.ts",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "start": "node dist/main.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "zork",
    "interactive-fiction",
    "text-adventure",
    "game",
    "cli"
  ],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/[owner]/zork-ts.git"
  }
}
```

### Gitignore Updates

```gitignore
# Kiro IDE
.kiro/

# Reference materials (ZIL source)
reference/

# Development artifacts
dev-artifacts/

# Build output
dist/

# Dependencies
node_modules/

# Test outputs
*.log
coverage/

# OS files
.DS_Store
Thumbs.db

# Save files
saves/
*.sav

# IDE
.vscode/
.idea/
```

### File Organization Strategy

#### Files to KEEP in root:
- `package.json` - npm configuration
- `package-lock.json` - dependency lock
- `tsconfig.json` - TypeScript config
- `vitest.config.ts` - Test config (for maintainers)
- `README.md` - User documentation
- `LICENSE` - MIT license
- `CONTRIBUTING.md` - Developer guide (new)

#### Files to MOVE to `reference/zil/`:
- `*.zil` - All ZIL source files
- `zork1.chart`, `zork1.errors`, `zork1.record`, `zork1.serial` - ZIL artifacts
- `zork1freq.xzap` - ZIL frequency data
- `parser.cmp` - Parser comparison data

#### Files to MOVE to `dev-artifacts/`:
- `parity-*.json` - Parity analysis data
- `parity-*.md` - Parity reports
- `spot-test-*.json` - Spot test results
- `test-progress.json` - Test progress tracking
- `PARITY_*.md` - Parity documentation
- `PERFECT_PARITY_*.md` - Achievement reports
- `*-report.md` - Various reports

#### Files to DELETE (temporary/debug):
- `troll-*.txt` - Troll combat debug outputs
- `test-*.ts` (in root) - Ad-hoc test scripts
- `test-*.sh` - Test shell scripts
- `record-*.sh` - Recording scripts
- `temp-*.txt` - Temporary files
- `0` - Empty/debug file

### Distribution Contents

When a user runs `npm pack` or `npm publish`, only these files will be included:

```
zork-ts-1.0.0.tgz
├── package.json
├── README.md
├── LICENSE
└── dist/
    ├── main.js
    ├── engine/
    ├── game/
    ├── io/
    ├── parser/
    └── persistence/
```

Excluded from distribution:
- `src/testing/` - Test infrastructure
- `src/parity/` - Parity validation tools
- `scripts/` - Development scripts
- `reference/` - ZIL source files
- `dev-artifacts/` - Development outputs
- `.kiro/` - Kiro IDE data
- `docs/` - Internal documentation

## Data Models

### tsconfig.json Updates

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": [
    "src/**/*.test.ts",
    "src/**/*.property.test.ts",
    "src/testing/**/*",
    "src/parity/**/*"
  ]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Package Installation Completeness

*For any* valid npm installation of the package, running the `zork` command SHALL start the game without missing module errors.

**Validates: Requirements 1.1, 1.5**

### Property 2: Distribution File Minimality

*For any* npm pack operation, the resulting tarball SHALL contain only files specified in the `files` field of package.json, and SHALL NOT contain testing, parity, or development files.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 6.2, 6.3, 6.4, 6.5**

### Property 3: Build Idempotency

*For any* sequence of `npm run build` executions, the resulting `dist/` directory SHALL contain identical output (excluding timestamps).

**Validates: Requirements 7.2, 7.4**

### Property 4: Gitignore Completeness

*For any* fresh clone of the repository, the working directory SHALL NOT contain `.kiro/`, `reference/`, or `dev-artifacts/` directories.

**Validates: Requirements 2.1, 2.3, 4.2**

## Error Handling

### Missing Build Output
- If `dist/` doesn't exist when running `npm publish`, the `prepublishOnly` script will build it
- If build fails, publish will be aborted with clear error message

### Invalid Package Configuration
- npm validates package.json before publish
- Missing required fields will cause publish to fail with descriptive errors

## Testing Strategy

### Unit Tests
- Verify package.json has correct `files` field
- Verify tsconfig.json excludes test files from build
- Verify gitignore patterns match expected files

### Integration Tests
- Run `npm pack` and verify tarball contents
- Run `npm install` from tarball and verify game starts
- Verify no test/parity files in distribution

### Manual Verification
- Clone fresh repo and verify no Kiro data
- Install package globally and run `zork` command
- Verify game plays correctly without development dependencies
