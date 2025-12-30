# Agent Best Practices

## File Writing

### DO: Use Kiro's File Tools
Always use `fsWrite` and `fsAppend` tools for creating and modifying files. These write directly to the filesystem and are safe for files of any size.

```
✅ fsWrite to create new files
✅ fsAppend to add content to existing files
✅ strReplace for targeted edits
```

### DON'T: Use Bash Heredocs for Large Files
Never use `cat << 'EOF'` or similar heredoc patterns to write files through the terminal. This can crash the PTY (pseudo-terminal) host.

```bash
# ❌ AVOID - Can crash terminal with large content
cat > file.ts << 'ENDOFFILE'
... large file content ...
ENDOFFILE

# ❌ AVOID - Same problem with different syntax
cat << EOF > file.ts
... large file content ...
EOF
```

### Why Heredocs Crash the Terminal
1. Heredocs send entire content through the terminal buffer at once
2. Large files (100+ lines) can exceed PTY buffer limits
3. The terminal host process crashes trying to handle the overflow
4. Requires manual terminal reconnection to recover

### Safe Bash Alternatives (if file tools unavailable)
For small content only:
```bash
# Small single-line writes are OK
echo 'small content' > file.txt

# Multiple small appends are OK
echo 'line 1' > file.txt
echo 'line 2' >> file.txt
```

### File Size Guidelines
- **< 10 lines**: Bash echo is acceptable
- **10-50 lines**: Prefer file tools, bash may work
- **> 50 lines**: Always use file tools (`fsWrite`/`fsAppend`)

## Command Execution

### Avoid Long-Running Commands
Don't run commands that don't terminate quickly:
- Development servers (`npm run dev`, `yarn start`)
- Watch modes (`vitest --watch`, `webpack --watch`)
- Interactive programs (`vim`, `nano`)

Use `controlBashProcess` with `action: "start"` for these instead.

### No Command Chaining
Don't use `&&`, `||`, or `;` to chain commands. Make separate tool calls instead.

```bash
# ❌ AVOID
npm install && npm test

# ✅ DO - Separate calls
npm install
# then
npm test
```
