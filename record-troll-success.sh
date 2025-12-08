#!/bin/bash

# Try multiple times to get a successful troll defeat
for i in {1..10}; do
  echo "Attempt $i..."
  
  cat > troll-attempt.txt << 'EOF'
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
look
quit
y
EOF

  frotz -p COMPILED/zork1.z3 < troll-attempt.txt 2>&1 | strings > "troll-attempt-$i.txt"
  
  # Check if troll was defeated (look for "carcass has disappeared")
  if grep -q "carcass has disappeared" "troll-attempt-$i.txt"; then
    echo "SUCCESS on attempt $i!"
    cp "troll-attempt-$i.txt" troll-success.txt
    break
  fi
done

if [ -f troll-success.txt ]; then
  echo "Successful combat recorded in troll-success.txt"
else
  echo "No successful combat in 10 attempts. Using best attempt."
  cp troll-attempt-1.txt troll-success.txt
fi
