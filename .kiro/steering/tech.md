# Technology Stack

## Language

**ZIL (Zork Implementation Language)** - A dialect of MDL (Muddle), which itself is a LISP variant created by MIT. ZIL was Infocom's proprietary language for developing interactive fiction games.

## Build System

### Historical Compiler
- **ZILCH**: The original Infocom compiler that ran on TOPS20 mainframes
- **Note**: The original ZILCH compiler is no longer available

### Modern Alternative
- **ZILF** (http://zilf.io): A user-maintained open-source compiler that can compile these .ZIL files with minor issues
- ZILF is currently the only known way to compile this source code into playable Z-machine files

## Target Platform

**Z-machine**: A virtual machine designed by Infocom for running interactive fiction games. The compiled output is a .z3 file (Z-machine version 3) that can be played using modern Z-machine interpreters.

## Common Commands

### Compilation
There is no standard build command included in this repository. To compile with ZILF:
```bash
# Using ZILF (must be installed separately)
zilf zork1.zil
```

### Playing the Game
The compiled game (COMPILED/zork1.z3) can be played using any Z-machine interpreter such as:
- Frotz
- Gargoyle
- Zoom
- Web-based interpreters

## File Types

- `.zil` - ZIL source code files
- `.z3` - Compiled Z-machine version 3 game file
- `.chart` - Compilation statistics
- `.errors` - Compilation error log
- `.record` - Build record
- `.serial` - Serial number tracking
