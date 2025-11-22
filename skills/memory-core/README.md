# Memory Core Skill

Reliable project memory management for Claude Code - session tracking, file history, and pattern learning.

## What It Does

The memory-core skill provides persistent memory across development sessions:

- **Session Management** - Track current tasks, files, and progress
- **File Change History** - Record and retrieve file modifications
- **Pattern Learning** - Remember and reuse code patterns
- **Project Information** - Maintain tech stack and conventions

## Installation

### Personal Installation (All Projects)
```bash
# Copy to personal skills directory
cp -r skills/memory-core ~/.claude/skills/

# Restart Claude Code to load the skill
```

### Project Installation (Team Sharing)
```bash
# Copy to project skills directory
mkdir -p .claude/skills
cp -r skills/memory-core .claude/skills/

# Commit to share with team
git add .claude/skills/memory-core
git commit -m "Add memory-core skill for team"
```

## Usage

The skill activates automatically when you ask memory-related questions. No slash commands needed!

### Session Management

```
You: "Show my current session"
Claude: [Displays session ID, current task, files, recent changes, notes]

You: "Start a new session"
Claude: [Creates new session with timestamp and ID]

You: "Add a note: refactored auth to use middleware"
Claude: [Adds note to context for next session]

You: "Archive my session"
Claude: [Archives session and shows summary]
```

### File Tracking

```
You: "Track this change to src/auth/middleware.ts"
Claude: [Records file change with timestamp]

You: "What files have I changed?"
Claude: [Lists recent file modifications]

You: "Show recent changes"
Claude: [Displays change history with details]
```

### Pattern Learning

```
You: "Remember this API pattern: RESTful endpoint design"
Claude: [Stores pattern for future reference]

You: "What error handling patterns do we use?"
Claude: [Displays stored error handling patterns]

You: "Show UI patterns"
Claude: [Lists all UI patterns learned]
```

### Project Info

```
You: "What's our tech stack?"
Claude: [Displays framework, language, database, etc.]

You: "Update tech stack: using TanStack Query now"
Claude: [Updates tech stack information]
```

## Data Storage

### JSON Data (`.claude-memory/`)
Gitignored, auto-managed:
- `session/current.json` - Active session
- `session/archive/` - Past sessions
- `patterns/` - Learned patterns
- `project/` - Tech stack info

### Markdown Docs (`memory-bank/`)
Git-tracked, human-edited:
- `CURRENT.md` - Current status
- `progress.md` - Session summaries
- `CHANGELOG.md` - Major changes
- `ARCHITECTURE.md` - Decisions

## Manual Testing

### Initialization
```bash
cd /path/to/your/project
node ~/.claude/skills/memory-core/scripts/init.js
```

### Show Session
```bash
node ~/.claude/skills/memory-core/scripts/session-show.js
```

### Update Session
```bash
# Set current task
node ~/.claude/skills/memory-core/scripts/session-update.js \
  --feature "Building authentication system" \
  --progress "in_progress"

# Add context note
node ~/.claude/skills/memory-core/scripts/session-update.js \
  --note "Remember to test edge cases"

# Add next step
node ~/.claude/skills/memory-core/scripts/session-update.js \
  --next-step "Write unit tests for login flow"
```

### Archive Session
```bash
node ~/.claude/skills/memory-core/scripts/session-archive.js
```

### Track File Changes
```bash
# Track a modified file
node ~/.claude/skills/memory-core/scripts/track-change.js src/auth/middleware.ts

# Track with specific action
node ~/.claude/skills/memory-core/scripts/track-change.js src/new-file.ts --action created
node ~/.claude/skills/memory-core/scripts/track-change.js src/old-file.ts --action deleted
```

### Show Recent Changes
```bash
# Show all changes (grouped by file)
node ~/.claude/skills/memory-core/scripts/show-changes.js

# Show only last 10 changes
node ~/.claude/skills/memory-core/scripts/show-changes.js --limit 10

# Filter by specific file
node ~/.claude/skills/memory-core/scripts/show-changes.js --file src/auth/middleware.ts

# Show chronologically (not grouped)
node ~/.claude/skills/memory-core/scripts/show-changes.js --chronological
```

### Expected Outputs
- ✓ All scripts execute without errors
- ✓ Session data persists correctly
- ✓ Archive creates file in correct location
- ✓ Data format matches plugin schema
- ✓ Changes tracked with timestamps
- ✓ Circular buffer maintains 20 max items
- ✓ File paths converted to absolute

## Compatibility

### With Plugin
- ✓ Uses identical JSON format
- ✓ Same file paths
- ✓ Can coexist safely
- ✓ Reads plugin data
- ✓ Plugin reads skill data

### Requirements
- Node.js (any recent version)
- No external dependencies
- Works on macOS, Linux, Windows

## Performance

- Initialization: < 500ms
- Session operations: < 100ms
- Pattern retrieval: < 50ms

## Development

### File Structure
```
memory-core/
├── SKILL.md           # Skill definition (Claude Code reads this)
├── README.md          # This file
├── package.json       # Dependencies (Node.js built-ins only)
├── lib/
│   └── memoryStore.js # Core library (from plugin)
└── scripts/
    └── init.js        # Initialization script
```

### Adding Features

Phase 2-4 will add:
- Session lifecycle automation
- Enhanced change tracking
- Cross-project pattern search
- Documentation generation

## Troubleshooting

### Skill Not Activating
- Restart Claude Code after installation
- Check skill is in `~/.claude/skills/` or `.claude/skills/`
- Verify SKILL.md has correct frontmatter

### Data Not Found
- Run initialization script manually
- Check `.claude-memory/` exists
- Verify file permissions

### Compatibility Issues
- Ensure using same MemoryStore version as plugin
- Check JSON schema matches plugin format
- Verify absolute file paths being used

## Support

- See [SKILLS-IMPLEMENTATION-PLAN.md](../../docs/SKILLS-IMPLEMENTATION-PLAN.md) for full plan
- See [FEASIBILITY-ASSESSMENT.md](../../docs/FEASIBILITY-ASSESSMENT.md) for background
- Report issues in parent repo

## Version

**Current**: 1.0.0 (Phase 1 - Foundation)
**Compatible with**: hybrid-memory-bank-plugin v2.0.0

## License

Same as parent project
