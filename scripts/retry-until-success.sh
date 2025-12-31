#!/bin/bash
# Retry playing the game until we get a successful transcript
# Usage: ./retry-until-success.sh <commands-file> <success-pattern> <max-attempts>

COMMANDS_FILE=$1
SUCCESS_PATTERN=$2
MAX_ATTEMPTS=${3:-50}
OUTPUT_FILE="/tmp/game-output-$$.txt"

for i in $(seq 1 $MAX_ATTEMPTS); do
    echo "Attempt $i of $MAX_ATTEMPTS..."
    
    # Run the game
    cat "$COMMANDS_FILE" | dfrotz -m -p reference/COMPILED/zork1.z3 > "$OUTPUT_FILE" 2>&1
    
    # Check if success pattern is in output
    if grep -q "$SUCCESS_PATTERN" "$OUTPUT_FILE"; then
        echo "SUCCESS on attempt $i!"
        cat "$OUTPUT_FILE"
        exit 0
    fi
    
    echo "Failed (no '$SUCCESS_PATTERN' found), retrying..."
done

echo "FAILED after $MAX_ATTEMPTS attempts"
echo "Last output:"
cat "$OUTPUT_FILE"
exit 1
