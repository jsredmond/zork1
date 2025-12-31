# Zork I: The Great Underground Empire - TypeScript Edition

A faithful TypeScript recreation of the classic 1980 interactive fiction game by Infocom.

> *"You are standing in an open field west of a white house, with a boarded front door. There is a small mailbox here."*

## Installation

```bash
npm install -g zork-ts
```

## Play

```bash
zork
```

That's it! You're now ready to explore the Great Underground Empire.

## About the Game

Zork I is a text adventure game where you explore an underground empire, solve puzzles, collect treasures, and try to survive encounters with various creatures. The game responds to natural language commands like:

- `go north` or just `n`
- `open mailbox`
- `take lamp`
- `examine sword`
- `attack troll with sword`
- `save` / `restore`

### Tips for New Players

1. **Explore thoroughly** - Look at everything, read everything
2. **Map your surroundings** - The underground can be confusing
3. **Save often** - Death lurks around many corners
4. **Be specific** - If a command doesn't work, try rephrasing it
5. **Light is precious** - Keep track of your light sources

## Commands

| Command | Description |
|---------|-------------|
| `look` (or `l`) | Describe your surroundings |
| `inventory` (or `i`) | List what you're carrying |
| `take <item>` | Pick up an item |
| `drop <item>` | Put down an item |
| `examine <item>` | Look closely at something |
| `open/close <item>` | Open or close containers/doors |
| `save` | Save your game |
| `restore` | Load a saved game |
| `quit` | Exit the game |
| `score` | Check your score |

## Requirements

- Node.js 18.0.0 or higher

## About This Implementation

This TypeScript version achieves **100% logic parity** with the original Z-Machine implementation:

- All puzzles are solvable exactly as in the original
- All NPCs (troll, thief, cyclops) behave authentically
- All 350 points are achievable
- Save/restore functionality works seamlessly

The implementation has been verified through exhaustive testing against the original game.

## Running from Source

If you prefer to run from source:

```bash
git clone https://github.com/zork-ts/zork-ts.git
cd zork-ts
npm install
npm run dev
```

## Credits

- **Original Game**: Marc Blank, Dave Lebling, Bruce Daniels, Tim Anderson (Infocom, 1980)
- **TypeScript Implementation**: Community effort

## Learn More

- [Wikipedia - Zork I](https://en.wikipedia.org/wiki/Zork_I)
- [The Interactive Fiction Database](https://ifdb.tads.org/viewgame?id=0dbnusxunq7fw5ro)
- [IFWiki](http://www.ifwiki.org/index.php/Zork_I)

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.
