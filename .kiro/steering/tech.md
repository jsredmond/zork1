# Technology Stack

## TypeScript Source Port

### Runtime
- **Node.js >=25.0.3** with TypeScript
- **tsx** for TypeScript execution
- **Vitest 4.x** for testing

### Common Commands

```bash
# Run the game
npm run dev

# Run tests
npm test

# Run specific test file
npx vitest run src/game/actions.test.ts

# Build for distribution
npm run build
```

### Key Dependencies
- `tsx` ^4.7.0 - TypeScript execution
- `vitest` ^4.0.16 - Test framework
- `fast-check` ^4.5.3 - Property-based testing
- `zod` ^4.3.4 - Schema validation
- `typescript` ^5.3.0 - TypeScript compiler

### Dev Dependencies
- `@types/node` ^25.0.3 - Node.js type definitions
- `pkg` ^5.8.1 - Binary packaging

## CI/CD

### GitHub Actions Workflows
- **lint.yml** - Super-Linter v8 for TypeScript, JSON, YAML, Markdown
- **release.yml** - Automated npm publish and binary builds on release

### Linting
Uses Super-Linter with:
- TypeScript ES linting
- JSON validation
- YAML validation
- Markdown linting

## Original ZIL Source (Reference Only)

### Language
**ZIL (Zork Implementation Language)** - Infocom's proprietary LISP dialect

### Historical Compiler
- **ZILCH**: Original compiler (no longer available)
- **ZILF** ([zilf.io](http://zilf.io)): Modern open-source alternative

### File Types
- `.zil` - ZIL source code (in `reference/zil/`)
- `.z3` - Compiled Z-machine game file (in `reference/COMPILED/`)

## Playing Options

1. **TypeScript version**: `npm run dev`
2. **Original compiled**: Use `reference/COMPILED/zork1.z3` with Frotz, Gargoyle, or other Z-machine interpreters
