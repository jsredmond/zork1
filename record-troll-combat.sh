#!/bin/bash

# Record troll combat with multiple attacks until troll dies
cat > troll-combat-full.txt << 'EOF'
north
east
open window
enter
west
take lamp
take sword
turn on lamp
move rug
open trap door
down
north
east
kill troll with sword
kill troll with sword
kill troll with sword
kill troll with sword
kill troll with sword
kill troll with sword
kill troll with sword
kill troll with sword
kill troll with sword
kill troll with sword
look
quit
y
EOF

echo "Recording troll combat sequence..."
frotz -p COMPILED/zork1.z3 < troll-combat-full.txt 2>&1 > troll-combat-output.txt

echo "Output saved to troll-combat-output.txt"
