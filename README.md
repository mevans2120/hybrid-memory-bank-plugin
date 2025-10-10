# Hybrid Memory Bank Plugin

Hybrid memory system for Claude Code that combines automated JSON-based memory with human-readable markdown documentation.

## 🚀 Features

- **Auto Session Management**: Automatically initializes and archives sessions
- **File Change Tracking**: Records all edits, creates, and deletions via PostToolUse hook
- **Pattern Learning**: Remembers code patterns and conventions
- **Smart Reminders**: Prompts for documentation updates when appropriate
- **Cross-Platform**: Pure Node.js, works on Windows, Mac, and Linux
- **Zero Config**: Works out of the box with sensible defaults

## 📦 Installation

### Option 1: From GitHub (Recommended)

```bash
# Add the marketplace
/plugin marketplace add https://github.com/mevans2120/hybrid-memory-bank.git

# Install the plugin
/plugin install hybrid-memory-bank
```

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/mevans2120/hybrid-memory-bank.git

# Add local marketplace
/plugin marketplace add /path/to/hybrid-memory-bank

# Install the plugin
/plugin install hybrid-memory-bank@hybrid-memory-bank-dev-marketplace
```

## 🎯 Quick Start

1. **Plugin Auto-Initializes**: When Claude Code starts, the SessionStart hook automatically:
   - Initializes `.claude-memory/` directory structure
   - Cleans up expired sessions
   - Displays current session state
   - Shows Memory Bank status from `memory-bank/CURRENT.md`

2. **Work Normally**: File changes are tracked automatically via PostToolUse hook

3. **Add Notes**: `/memory note "Important context for next session"`

4. **End Session**: `/memory end-session` for guided session end with documentation reminders

## 🏗️ Memory System Architecture

### Two Memory Systems

```
.claude-memory/          (Auto-managed JSON, .gitignored)
├── session/
│   ├── current.json    # Active session state
│   └── archive/        # Past sessions
├── patterns/           # Learned code patterns
│   ├── api-patterns.json
│   ├── error-handling.json
│   ├── ui-patterns.json
│   └── database-patterns.json
└── project/            # Tech stack, conventions
    ├── tech-stack.json
    ├── conventions.json
    └── architecture.json

memory-bank/            (Human documentation, git-tracked)
├── CURRENT.md         # Current project status
├── progress.md        # Session summaries
├── CHANGELOG.md       # Major features
└── ARCHITECTURE.md    # Architecture decisions
```

### What Goes Where?

| Content Type | .claude-memory/ | memory-bank/ |
|--------------|-----------------|--------------|
| Active session state | ✅ | ❌ |
| File change tracking | ✅ | ❌ |
| Learned patterns | ✅ | ❌ |
| Temporary notes | ✅ | ❌ |
| Architecture decisions | ❌ | ✅ |
| Deployment records | ❌ | ✅ |
| Onboarding docs | ❌ | ✅ |
| Session summaries | ❌ | ✅ |

## 📝 Commands

### `/memory show`
Display current session state with files, notes, and recent changes.

```bash
/memory show
```

### `/memory note <text>`
Add a context note to remember for next session.

```bash
/memory note "User prefers functional components"
/memory note "API uses RESTful patterns"
```

### `/memory patterns [type]`
Show learned code patterns.

```bash
/memory patterns api-patterns
/memory patterns error-handling
/memory patterns ui-patterns
/memory patterns database-patterns
```

### `/memory tech-stack`
Display project tech stack.

```bash
/memory tech-stack
```

### `/memory archive`
Manually archive current session.

```bash
/memory archive
```

### `/memory clean`
Clean up expired sessions (auto-runs on session start).

```bash
/memory clean
```

### `/memory list-archives`
List all archived sessions.

```bash
/memory list-archives
```

### `/memory end-session`
End session with documentation reminders.

```bash
/memory end-session
```

### `/memory checklist`
Show documentation checklist template.

```bash
/memory checklist
```

## 🔗 Hooks

### SessionStart Hook
**Trigger**: When Claude Code starts
**Action**:
- Initializes `.claude-memory/` directories
- Cleans expired sessions
- Creates new session if none exists
- Displays Memory Bank status
- Shows tech stack summary

### PostToolUse Hook
**Trigger**: After Write, Edit, or Bash commands
**Action**:
- Records file changes to session
- Updates current task files
- Tracks action type (created/modified/deleted)

### UserPromptSubmit Hook
**Trigger**: When user says "done", "finished", "goodbye"
**Action**:
- Shows documentation reminder
- Suggests which memory-bank/ files to update
- Recommends `/memory end-session` command

## 🧠 How It Works

### Session Lifecycle

1. **Session Start** (Automatic)
   ```
   Claude Code starts → SessionStart hook fires
   → Check for expired sessions
   → Create/load current session
   → Display status
   ```

2. **During Work** (Automatic)
   ```
   You: Write/Edit files → PostToolUse hook fires
   → Record file change
   → Update session.recentChanges
   → Add to session.currentTask.files
   ```

3. **Session End** (Manual)
   ```
   You: /memory end-session
   → Display session summary
   → Archive session to .claude-memory/session/archive/
   → Show documentation reminders
   → Prompt to update memory-bank/ files
   ```

### File Change Tracking

```javascript
// Automatic tracking example:
You: (use Write tool to create src/api/users.ts)

PostToolUse Hook:
{
  file: "src/api/users.ts",
  action: "created/updated",
  timestamp: "2025-10-10T15:30:00Z",
  description: "Write: created/updated"
}

// Now visible in /memory show:
Recent Changes:
  [3:30 PM] created/updated: src/api/users.ts
```

## 📚 Best Practices

### Daily Workflow

1. **Start**: Plugin auto-initializes ✅
2. **Work**: Changes tracked automatically ✅
3. **Note**: Add context notes as you go
4. **End**: Run `/memory end-session`
5. **Document**: Update `memory-bank/` files

### When to Update Documentation

**CURRENT.md**: Every session if project state changed
**progress.md**: Every session with summary
**CHANGELOG.md**: Major features/deployments only
**ARCHITECTURE.md**: Architectural decisions only

### Memory Bank Templates

Create `memory-bank/SESSION_CHECKLIST.md`:

```markdown
# Session Checklist

## End of Session

- [ ] Run `/memory end-session`
- [ ] Update CURRENT.md with new focus
- [ ] Add session summary to progress.md
- [ ] Update CHANGELOG.md if deployed
- [ ] Document architecture changes

## Session Summary Template

\`\`\`markdown
## Session YYYY-MM-DD

**Duration**: Xh Ym
**Focus**: [What you worked on]

### Completed
- Feature/fix description

### Files Modified
- path/to/file.js
- path/to/other.ts

### Notes
- Important context for next session
\`\`\`
```

## 🔧 Development Status

### ✅ Completed (v0.1.0)

- [x] Plugin directory structure
- [x] MemoryStore library (enhanced from existing memory-utils.js)
- [x] SessionStart hook (auto-initialization)
- [x] PostToolUse hook (file change tracking)
- [x] UserPromptSubmit hook (documentation reminders)
- [x] All 9 commands (show, note, patterns, tech-stack, archive, clean, list-archives, end-session, checklist)
- [x] Main index.js entry point

### 🚧 In Progress

- [ ] Integration with Claude Code plugin system (waiting for API availability)
- [ ] Memory Manager agent (proactive pattern learning)
- [ ] Documentation Writer agent (auto-generate summaries)
- [ ] Integration tests
- [ ] Example project template

### 🔮 Future Enhancements

- [ ] Pattern auto-detection from code
- [ ] Smart tech stack detection from package.json
- [ ] Multi-project pattern sharing
- [ ] Visual dashboard for memory browsing

## 🐛 Troubleshooting

### Session Not Initializing

**Problem**: Plugin doesn't auto-start
**Solution**: Ensure Claude Code plugin system is enabled

### File Changes Not Tracked

**Problem**: Edits not appearing in session
**Solution**: Verify PostToolUse hook is enabled in plugin.json

### Can't Find Archives

**Problem**: `/memory list-archives` shows nothing
**Solution**: Sessions archived after 24h or use `/memory archive` manually

## 📖 Documentation

### File Structure
- `src/lib/memoryStore.js` - Core memory operations
- `src/hooks/` - SessionStart, PostToolUse, UserPromptSubmit
- `src/commands/` - All 9 slash commands
- `src/index.js` - Main plugin entry point

### Configuration
Edit `.claude-plugin/plugin.json`:

```json
{
  "config": {
    "memoryDir": ".claude-memory",
    "memoryBankDir": "memory-bank",
    "sessionExpiryHours": 24,
    "maxRecentChanges": 20,
    "autoArchiveOnExit": true
  }
}
```

## 🤝 Contributing

This plugin is currently in development within the care-tracker repository. Once complete, it will be moved to its own repository.

### Current Location
```
/Users/michaelevans/codymd-hacknback-main/claude-memory-bank-plugin/
```

### Migration Plan
When ready to publish:
```bash
# Copy to new repo
cp -r claude-memory-bank-plugin ~/claude-memory-bank-plugin
cd ~/claude-memory-bank-plugin
git init
git add .
git commit -m "Initial plugin implementation"
```

## 📄 License

MIT License

## 🙏 Acknowledgments

- Built for Claude Code
- Inspired by existing memory-bank system in care-tracker project
- Uses hybrid approach: automated JSON + human documentation

---

**Status**: Development Complete (v0.1.0) - Ready for Claude Code plugin integration testing
