# Hybrid Memory Bank Plugin

Hybrid memory system for Claude Code that combines automated JSON-based memory with human-readable markdown documentation.

## 🚀 Features

- **Auto Session Management**: Automatically initializes and archives sessions
- **Proactive Memory Tracking**: UserPromptSubmit hook monitors git status on every prompt and guides memory bank updates
- **Pattern Learning**: Remembers code patterns and conventions
- **Smart Reminders**: PreToolUse hook provides gentle reminders when running git status
- **Cross-Platform**: Pure Node.js, works on Windows, Mac, and Linux
- **Zero Config**: Works out of the box with sensible defaults

## 📦 Installation

### For New Users

#### Option 1: From GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/mevans2120/hybrid-memory-bank-plugin.git
cd hybrid-memory-bank-plugin

# Install dependencies
npm install

# Make hook scripts executable
chmod +x .claude/hooks/*.js

# The plugin hooks are automatically registered via .claude/settings.json
```

### For Existing Users (Updating from v0.1.0)

If you already have the plugin installed, update to v0.2.0 with these steps:

```bash
# Navigate to your plugin directory
cd hybrid-memory-bank-plugin

# Pull the latest changes
git pull

# Make the new hook scripts executable
chmod +x .claude/hooks/*.js

# Restart your Claude Code session for hooks to take effect
```

**Note**: No new dependencies were added in v0.2.0, so `npm install` is not required.

**Important**: The plugin now uses Claude Code's native hook system. The old plugin API approach no longer works.

### ⚠️ Important: Enable Hooks in Claude Code

**You must enable hooks in your Claude Code settings for the plugin to work:**

1. Open Claude Code settings (use `/config` command or manually edit)
2. Ensure hooks are enabled by setting `"hooksEnabled": true`
3. Restart Claude Code after making this change

Without hooks enabled, the plugin will not function as none of the automatic tracking, initialization, or documentation reminders will trigger.

### Option 2: Manual Installation

```bash
# Clone to your project directory
git clone https://github.com/mevans2120/hybrid-memory-bank-plugin.git .hybrid-memory-plugin

# Install dependencies
cd .hybrid-memory-plugin && npm install

# Copy the .claude directory to your project root
cp -r .claude ../

# Make hook scripts executable
chmod +x ../.claude/hooks/*.js
```

**Note**: The plugin now uses Claude Code's native hook system via `.claude/settings.json`. No additional plugin installation commands are needed.

## 🎯 Quick Start

1. **Plugin Auto-Initializes**: When Claude Code starts, the SessionStart hook automatically:
   - Initializes `.claude-memory/` directory structure
   - Creates `memory-bank/` directory with template files if not present:
     - `CURRENT.md` - Current project status
     - `progress.md` - Session summaries
     - `CHANGELOG.md` - Major features/deployments
     - `ARCHITECTURE.md` - Architecture decisions
   - Cleans up expired sessions
   - Displays current session state
   - Shows Memory Bank status from `memory-bank/CURRENT.md`

2. **Work Normally**: UserPromptSubmit hook monitors changes on every prompt and provides actionable instructions

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

The plugin uses Claude Code's native hook system via `.claude/settings.json`. Each hook is a Node.js script that receives JSON via stdin and responds via stdout.

### SessionStart Hook
**Location**: `.claude/hooks/sessionStart.js`
**Trigger**: When Claude Code starts a new session
**Action**:
- Initializes `.claude-memory/` directories
- Creates `memory-bank/` directory with template files (CURRENT.md, progress.md, CHANGELOG.md, ARCHITECTURE.md) if not present
- Cleans expired sessions
- Creates new session if none exists
- Displays Memory Bank status
- Shows tech stack summary

### PreToolUse Hook
**Location**: `.claude/hooks/preToolUse.js`
**Trigger**: Before `git status` commands
**Action**:
- Checks current session data
- Provides gentle reminder to consider updating memory bank
- Non-intrusive, informational approach

### UserPromptSubmit Hook
**Location**: `.claude/hooks/userPromptSubmit.js`
**Trigger**: On every user prompt
**Action**:
- Automatically detects git status (uncommitted changes)
- When changes detected, provides actionable instructions to Claude:
  - Update `.claude-memory/session/current.json`
  - Update `memory-bank/CURRENT.md`
  - Update `memory-bank/progress.md`
- When no changes, confirms memory bank is up to date
- Proactive approach ensures memory stays current

### Hook Architecture
The plugin uses a hybrid bridge approach:
- `.claude/hooks/*.js` - Shell wrappers that Claude Code calls
- `.claude/hooks/wrapper.js` - Bridge infrastructure for stdin/stdout
- `src/hooks/*.js` - Original JavaScript implementations

**Note**: The UserPromptSubmit hook actively monitors git status on every prompt and directs Claude to update documentation when changes are detected. The PreToolUse hook provides gentle reminders when running git status. This dual approach ensures memory bank stays current throughout the workflow.

## 🧠 How It Works

### Session Lifecycle

1. **Session Start** (Automatic)
   ```
   Claude Code starts → SessionStart hook fires
   → Initialize .claude-memory/ directories
   → Create memory-bank/ template files if not present
   → Check for expired sessions
   → Create/load current session
   → Display status
   ```

2. **During Work** (Automatic Hook Assistance)
   ```
   You: Write/Edit files → Work on features
   You: Any prompt → UserPromptSubmit hook fires
   → Checks git status for uncommitted changes
   → If changes found, instructs Claude to update memory bank
   → If no changes, confirms memory bank is up to date

   You: git status → PreToolUse hook fires
   → Provides gentle reminder about memory bank
   → Informational, non-blocking
   ```

3. **Session End** (Manual)
   ```
   You: /memory end-session
   → Display session summary
   → Archive session to .claude-memory/session/archive/
   → Show documentation reminders
   → Prompt to update memory-bank/ files
   ```

### Proactive Memory Update Flow

```javascript
// Hook-assisted workflow example:
You: (use Write tool to create src/api/users.ts)
You: (make more changes)
You: "Can you commit and push please"

UserPromptSubmit Hook fires on your prompt:
{
  gitStatus: {
    hasChanges: true,
    files: [
      { status: "M ", file: "src/api/users.ts" },
      { status: " M", file: "other/files.ts" }
    ],
    modifiedCount: 2
  },
  actionRequired: true
}

→ Claude receives instruction to update memory bank first
→ Claude updates .claude-memory/session/current.json
→ Claude updates memory-bank/CURRENT.md
→ Claude updates memory-bank/progress.md
→ Then proceeds with git add, commit, push
```

## 📚 Best Practices

### Daily Workflow

1. **Start**: Plugin auto-initializes ✅
2. **Work**: Make changes and edits as needed
3. **Note**: Add context notes as you go
4. **Automatic Tracking**: UserPromptSubmit hook monitors changes on every prompt ✅
5. **Document**: Memory bank updates guided by hook instructions
6. **End**: Run `/memory end-session` when done

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

### ✅ Completed (v0.2.0)

- [x] Plugin directory structure
- [x] MemoryStore library (enhanced from existing memory-utils.js)
- [x] SessionStart hook (auto-initialization)
- [x] PreToolUse hook (pre-commit memory bank updates)
- [x] UserPromptSubmit hook (documentation reminders)
- [x] All 9 commands (show, note, patterns, tech-stack, archive, clean, list-archives, end-session, checklist)
- [x] Main index.js entry point
- [x] Integration with Claude Code hook system via shell bridge
- [x] Hook wrappers for stdin/stdout communication
- [x] Automatic hook registration via .claude/settings.json

### 🚧 In Progress

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

### Hooks Not Working

**Problem**: Hooks don't seem to trigger
**Solution**:
1. **First, ensure hooks are enabled in Claude Code settings:**
   - Open Claude Code settings with `/config` command
   - Set `"hooksEnabled": true`
   - Restart Claude Code
2. Ensure `.claude/settings.json` exists and has correct hook configuration
3. Make sure hook scripts are executable:
```bash
chmod +x .claude/hooks/*.js
```

### Session Not Initializing

**Problem**: Plugin doesn't auto-start
**Solution**: Check that `.claude/settings.json` properly registers the sessionStart hook

### Memory Bank Updates Not Triggered

**Problem**: Claude not prompting to update memory bank when changes detected
**Solution**: Verify UserPromptSubmit hook is registered in `.claude/settings.json` and fires on every user prompt

### Can't Find Archives

**Problem**: `/memory list-archives` shows nothing
**Solution**: Sessions archived after 24h or use `/memory archive` manually

## 📖 Documentation

### File Structure
- `.claude/settings.json` - Hook registration for Claude Code
- `.claude/hooks/*.js` - Shell wrapper scripts for hooks
- `.claude/hooks/wrapper.js` - Bridge infrastructure for stdin/stdout
- `src/lib/memoryStore.js` - Core memory operations
- `src/hooks/` - Original JavaScript implementations
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

**Status**: v0.2.0 - Working with Claude Code hook system via hybrid bridge
