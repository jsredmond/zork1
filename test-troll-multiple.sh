#!/bin/bash

for i in {1..5}; do
  echo "=== Test Run $i ==="
  frotz -p COMPILED/zork1.z3 < test-troll-combat.txt 2>&1 | \
    strings | \
    grep -A 1 "kill troll with sword" | \
    head -4
  echo ""
done
