# Instructions for Claude Code

## Memory System

This project uses a hybrid memory bank:
- **`.claude-memory/`** - Auto-managed JSON (gitignored)
- **`memory-bank/`** - Human docs (git-tracked)

## Workflow

**Session Start**: Review context from session initialization message

**During Work**:
- Use `/memory note "text"` for important context
- Run `git status` after changes (triggers auto-update)
- Use `/memory show` to check session state

**Session End**: Run `/memory end-session`

## Documentation Updates

- **CURRENT.md** - Every session (current focus, next steps)
- **progress.md** - Every session (session summary)
- **CHANGELOG.md** - Major features/deployments only
- **ARCHITECTURE.md** - Architectural decisions only

## Key Commands

- `/memory show` - Current session state
- `/memory note "<text>"` - Add context note
- `/memory end-session` - End session properly
- `/memory patterns [type]` - View learned patterns
- `/memory tech-stack` - View tech stack

## Development Preferences

- Keep file system organized and follow existing patterns
- Recommend new file organization patterns when folders become cluttered or contain unrelated files
- Use Tailwind CSS (only use vanilla CSS when necessary)
- No inline CSS unless given explicit permission
- Always plan for tests when implementing features
- Write implementation plans to a .md file for reference

## Best Practices

- Run `git status` after file changes
- Use `/memory note` for user preferences and decisions
- Always run `/memory end-session` when done
- Don't manually edit `.claude-memory/` files
- Review context at session start
