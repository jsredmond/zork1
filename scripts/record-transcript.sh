#!/bin/bash

# Script to record a Zork I transcript by piping commands to frotz
# Usage: ./record-transcript.sh <commands-file> <output-file>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <commands-file> <output-file>"
    exit 1
fi

COMMANDS_FILE=$1
OUTPUT_FILE=$2

# Run frotz with commands and capture output
frotz -p reference/COMPILED/zork1.z3 < "$COMMANDS_FILE" > "$OUTPUT_FILE" 2>&1

echo "Transcript recorded to $OUTPUT_FILE"
