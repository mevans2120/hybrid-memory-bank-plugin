# Hybrid Memory Bank Plugin

Hybrid memory system for Claude Code that combines automated JSON-based memory with human-readable markdown documentation.

## 🚀 Features

- **Auto Session Management**: Automatically initializes and archives sessions
- **Pattern Learning**: Remembers code patterns and conventions
- **Smart Auto-Updates**: PostToolUse hook automatically updates memory bank after git status
- **Cross-Platform**: Pure Node.js, works on Windows, Mac, and Linux
- **Zero Config**: Works out of the box with sensible defaults

## 📦 Installation

### Prerequisites

Before installing, ensure you have:
- Claude Code installed and working
- Node.js (v16 or higher)
- Git

### Step-by-Step Installation

#### Step 1: Enable Hooks in Claude Code

**⚠️ CRITICAL: This must be done FIRST or the plugin won't work!**

1. Open your **global** Claude Code settings file:
   - **Mac/Linux**: `~/.config/claude-code/settings.json`
   - **Windows**: `%APPDATA%/claude-code/settings.json`

2. Add or modify the following setting:
   ```json
   {
     "hooksEnabled": true
   }
   ```

3. Save the file and restart Claude Code

#### Step 2: Install the Plugin in Your Project

Navigate to the root of your project where you want to use the memory bank:

```bash
# Navigate to your project root
cd /path/to/your/project

# Clone the plugin (choose one option below)
```

**Option A: As a subdirectory (Recommended)**
```bash
git clone https://github.com/mevans2120/hybrid-memory-bank-plugin.git .hybrid-memory-bank
cd .hybrid-memory-bank
npm install
chmod +x .claude/hooks/*.js
cd ..
```

**Option B: Direct installation**
```bash
git clone https://github.com/mevans2120/hybrid-memory-bank-plugin.git
cd hybrid-memory-bank-plugin
npm install
chmod +x .claude/hooks/*.js
cd ..
```

#### Step 3: Set Up Hook Configuration

Copy the `.claude` directory to your project root (if not already there):

```bash
# From your project root
cp -r .hybrid-memory-bank/.claude .
# OR
cp -r hybrid-memory-bank-plugin/.claude .
```

**Verify the setup:**
```bash
ls -la .claude/
# You should see:
# - settings.json
# - hooks/ directory with .js files
```

#### Step 4: Make Hooks Executable

Ensure all hook scripts have execute permissions:

```bash
chmod +x .claude/hooks/*.js
```

#### Step 5: Verify Installation

1. **Start a new Claude Code session** in your project directory
2. You should see the session startup message with:
   ```
   🚀 HYBRID MEMORY BANK - SESSION STARTED
   ```
3. If you see this, the plugin is working!

### Updating an Existing Installation

```bash
# Navigate to plugin directory
cd .hybrid-memory-bank  # or hybrid-memory-bank-plugin

# Pull latest changes
git pull

# Ensure hooks are executable
chmod +x .claude/hooks/*.js

# Restart Claude Code
```

### Quick Verification Checklist

- [ ] Hooks enabled in global Claude Code settings (`hooksEnabled: true`)
- [ ] Plugin cloned to project directory
- [ ] `npm install` completed successfully
- [ ] Hook scripts are executable (`chmod +x .claude/hooks/*.js`)
- [ ] `.claude/settings.json` exists in project root
- [ ] Claude Code restarted after setup
- [ ] Session startup message appears when starting Claude Code

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

2. **Work Normally**: Git status automatically updates memory bank via PostToolUse hook

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

### PostToolUse Hook
**Location**: `.claude/hooks/postToolUse.js`
**Trigger**: After `git status` commands
**Action**:
- Parses git status output to detect changed files
- Automatically updates `.claude-memory/session/current.json` with changed files
- Automatically updates `memory-bank/CURRENT.md` with Recent Changes entry
- Provides informational summary of updates made

### Hook Architecture
The plugin uses a hybrid bridge approach:
- `.claude/hooks/*.js` - Shell wrappers that Claude Code calls
- `.claude/hooks/wrapper.js` - Bridge infrastructure for stdin/stdout
- `src/hooks/*.js` - Original JavaScript implementations

**Note**: The PostToolUse hook automatically updates memory bank after git status, keeping documentation current without manual intervention.

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

2. **During Work** (Automatic Updates)
   ```
   You: Write/Edit files → Work on features
   You: git status → PostToolUse hook fires
   → Parses git status output for changed files
   → Automatically updates session and memory-bank files
   → Displays informational summary
   ```

3. **Session End** (Manual)
   ```
   You: /memory end-session
   → Display session summary
   → Archive session to .claude-memory/session/archive/
   → Show documentation reminders
   → Prompt to update memory-bank/ files
   ```

### Memory Update Workflow

```javascript
// Automatic update workflow:
You: (use Write tool to create src/api/users.ts)
You: (make more changes)
You: "Can you run git status"

PostToolUse Hook fires after git status:
→ Parses git status output for changed files
→ Automatically updates .claude-memory/session/current.json
→ Automatically updates memory-bank/CURRENT.md
→ Displays summary of updates made
```

## 📚 Best Practices

### Daily Workflow

1. **Start**: Plugin auto-initializes ✅
2. **Work**: Make changes and edits as needed
3. **Note**: Add context notes as you go
4. **Check Status**: Run git status - PostToolUse hook automatically updates memory bank
5. **Document**: Memory bank auto-updated; manually enhance if needed
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
- [x] PostToolUse hook (automatic memory bank updates after git status)
- [x] All 9 commands (show, note, patterns, tech-stack, archive, clean, list-archives, end-session, checklist)
- [x] Main index.js entry point
- [x] Integration with Claude Code hook system via shell bridge
- [x] Hook wrappers for stdin/stdout communication
- [x] Automatic hook registration via .claude/settings.json

### ✅ Also Completed

- [x] Memory Manager agent (proactive pattern learning)
- [x] Documentation Writer agent (auto-generate summaries)
- [x] Integration tests
- [x] Example project template

### 🔮 Future Enhancements

- [ ] Pattern auto-detection from code
- [ ] Smart tech stack detection from package.json
- [ ] Multi-project pattern sharing
- [ ] Visual dashboard for memory browsing

## 🐛 Troubleshooting

### No Session Startup Message

**Problem**: You don't see the "🚀 HYBRID MEMORY BANK - SESSION STARTED" message when starting Claude Code

**Solutions**:

1. **Check global hooks are enabled:**
   ```bash
   # Mac/Linux
   cat ~/.config/claude-code/settings.json

   # Windows
   type %APPDATA%/claude-code/settings.json
   ```
   Should contain: `"hooksEnabled": true`

2. **Verify .claude directory exists in project root:**
   ```bash
   ls -la .claude/
   ```
   Should show `settings.json` and `hooks/` directory

3. **Check .claude/settings.json configuration:**
   ```bash
   cat .claude/settings.json
   ```
   Should contain hook registrations for sessionStart and postToolUse

4. **Ensure hook scripts are executable:**
   ```bash
   ls -l .claude/hooks/
   chmod +x .claude/hooks/*.js
   ```

5. **Restart Claude Code** - Hooks are loaded at startup

### Hooks Not Triggering

**Problem**: Hooks don't seem to fire at all

**Diagnostic Steps**:

1. **Test if hooks are enabled globally:**
   ```bash
   # Check global settings
   cat ~/.config/claude-code/settings.json | grep hooksEnabled
   ```

2. **Verify hook scripts exist and are executable:**
   ```bash
   ls -lh .claude/hooks/
   # All .js files should have 'x' permission
   ```

3. **Check for syntax errors in hook scripts:**
   ```bash
   node .claude/hooks/sessionStart.js
   # Should not show syntax errors
   ```

4. **Ensure you're in the correct directory:**
   Claude Code must be started from the project root where `.claude/` exists

### Permission Denied Errors

**Problem**: Getting "Permission denied" errors when hooks try to run

**Solution**:
```bash
# Make all hook scripts executable
chmod +x .claude/hooks/*.js

# Verify permissions
ls -l .claude/hooks/
# Should show -rwxr-xr-x or similar
```

### Plugin Directory Not Found

**Problem**: Commands fail with "directory not found" errors

**Solution**:
1. **Check plugin installation location:**
   ```bash
   ls -la | grep hybrid-memory
   # Should show .hybrid-memory-bank or hybrid-memory-bank-plugin
   ```

2. **Verify .claude directory was copied:**
   ```bash
   ls -la .claude/
   ```

3. **Re-copy .claude directory if missing:**
   ```bash
   cp -r .hybrid-memory-bank/.claude .
   # or
   cp -r hybrid-memory-bank-plugin/.claude .
   ```

### Memory Bank Not Auto-Updating

**Problem**: Memory bank doesn't update after running `git status`

**Solutions**:

1. **Verify PostToolUse hook is registered:**
   ```bash
   cat .claude/settings.json | grep postToolUse
   ```

2. **Check that git status actually ran:**
   The hook only triggers after successful git status commands

3. **Ensure hooks are enabled** (see above)

4. **Restart Claude Code** - PostToolUse hooks are registered at startup

### Module Not Found Errors

**Problem**: Hook scripts fail with "Cannot find module" errors

**Solution**:
```bash
# Navigate to plugin directory
cd .hybrid-memory-bank  # or hybrid-memory-bank-plugin

# Install dependencies
npm install

# Verify node_modules exists
ls -la node_modules/
```

### Sessions Not Being Created

**Problem**: `/memory show` shows no session data

**Solutions**:

1. **Check .claude-memory directory exists:**
   ```bash
   ls -la .claude-memory/
   ```

2. **Manually trigger session creation:**
   Start a new Claude Code session (the SessionStart hook should create it)

3. **Check for write permissions:**
   ```bash
   # Ensure Claude Code can write to project directory
   touch .test-write && rm .test-write
   ```

### Windows-Specific Issues

**Problem**: Hooks not working on Windows

**Solutions**:

1. **Use correct path for global settings:**
   ```
   %APPDATA%/claude-code/settings.json
   ```

2. **Ensure Node.js is in PATH:**
   ```cmd
   node --version
   npm --version
   ```

3. **Use Git Bash or WSL** for running setup commands

4. **Check file permissions** - Windows may require running as administrator

### Still Not Working?

If you've tried all the above:

1. **Collect diagnostic info:**
   ```bash
   echo "=== Node Version ==="
   node --version

   echo "=== Plugin Directory ==="
   ls -la .hybrid-memory-bank/ || ls -la hybrid-memory-bank-plugin/

   echo "=== .claude Directory ==="
   ls -la .claude/

   echo "=== Global Settings ==="
   cat ~/.config/claude-code/settings.json

   echo "=== Local Settings ==="
   cat .claude/settings.json

   echo "=== Hook Permissions ==="
   ls -l .claude/hooks/
   ```

2. **Report an issue** with the diagnostic output at:
   https://github.com/mevans2120/hybrid-memory-bank-plugin/issues

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
