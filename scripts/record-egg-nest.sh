#!/bin/bash
# Record egg/nest puzzle transcript from original Zork I
# This puzzle is accessible without fighting the troll

cat << 'EOF' | dfrotz -m -p reference/COMPILED/zork1.z3 2>&1
s
s
w
u
take egg
d
open egg
look
i
score
quit
y
EOF
