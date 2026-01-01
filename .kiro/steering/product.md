# Product Overview

This repository contains both the **original ZIL source code** and a **modern TypeScript source port** of **Zork I: The Great Underground Empire**, a 1980 interactive fiction game by Infocom.

## Dual Codebase

1. **Original ZIL Source** - Historical reference files (*.zil) from Infocom in `reference/zil/`
2. **TypeScript Source Port** - Modern implementation in `src/` achieving 100% logic parity with the original

## Purpose

- Preserve and study the original Zork I implementation
- Provide a playable, maintainable TypeScript version
- Enable testing and verification against original game behavior

## TypeScript Source Port Goals

The TypeScript implementation achieves complete behavioral parity with the original:
- Same room descriptions and object interactions
- Same puzzle solutions and game mechanics
- Same NPC behaviors (troll, thief, cyclops)
- Same timing systems (lamp fuel, candle burning, daemons)
- Same scoring and win conditions (all 350 points achievable)

## Repository

- **GitHub**: [jsredmond/zork-ts](https://github.com/jsredmond/zork-ts)
- **Author**: [@jsredmond](https://github.com/jsredmond)
- **License**: MIT
