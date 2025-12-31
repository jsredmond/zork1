#!/bin/bash
# Record rainbow puzzle transcript from original Zork I

# Get treasures to pay troll toll
cat << 'EOF' | dfrotz -m -p reference/COMPILED/zork1.z3 2>&1
n
e
open window
enter
w
take lamp
take sword
e
take sack
take bottle
w
move rug
open trap door
turn on lamp
d
s
e
take painting
w
n
n
throw sack at troll
e
open coffin
take sceptre
w
s
e
s
w
w
s
w
wave sceptre
on rainbow
take pot
i
score
quit
y
EOF
