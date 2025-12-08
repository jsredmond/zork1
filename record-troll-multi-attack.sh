#!/bin/bash

# Record multiple attempts to find a 3+ attack sequence
for i in {1..20}; do
  cat > troll-test.txt << 'EOF'
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
look
quit
y
EOF

  frotz -p COMPILED/zork1.z3 < troll-test.txt 2>&1 > "troll-run-$i.txt"
  
  # Count how many attacks before troll dies
  attacks=$(grep -c "kill troll with sword" "troll-run-$i.txt")
  died=$(grep -c "carcass has disappeared" "troll-run-$i.txt")
  
  if [ "$died" = "1" ]; then
    echo "Run $i: Troll defeated"
  else
    echo "Run $i: Player died"
  fi
done

echo "Check troll-run-*.txt files for different combat sequences"
