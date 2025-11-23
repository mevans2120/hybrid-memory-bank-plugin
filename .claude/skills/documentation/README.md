# Documentation Skill

Smart markdown documentation management for memory bank files.

## What It Does

- **Update CURRENT.md** - Refresh current status from session data
- **Add Progress** - Generate session summaries for progress.md
- **Add Changelog** - Format changelog entries (Keep a Changelog)
- **End Session** - Complete session documentation workflow

## Installation

```bash
# Personal installation
cp -r skills/documentation ~/.claude/skills/

# Project installation
mkdir -p .claude/skills
cp -r skills/documentation .claude/skills/
```

## Usage

### Update CURRENT.md
```bash
node ~/.claude/skills/documentation/scripts/update-current.js
node ~/.claude/skills/documentation/scripts/update-current.js --dry-run
```

### Add Progress Summary
```bash
node ~/.claude/skills/documentation/scripts/add-progress.js
node ~/.claude/skills/documentation/scripts/add-progress.js --focus "Phase 6 complete"
```

### Add Changelog Entry
```bash
node ~/.claude/skills/documentation/scripts/add-changelog.js --entry "New feature"
node ~/.claude/skills/documentation/scripts/add-changelog.js --entry "Bug fix" --category Fixed
```

### End Session Workflow
```bash
node ~/.claude/skills/documentation/scripts/end-session.js
```

Runs complete workflow:
1. Archive session (memory-core)
2. Update CURRENT.md
3. Add progress summary
4. Show documentation checklist

## Data Sources

- Session data from memory-core (`.claude-memory/session/current.json`)
- Git data from git-workflow
- Existing markdown files

## Templates

Located in `templates/`:
- `current.md` - CURRENT.md structure
- `progress-entry.md` - Session summary format
- `changelog-entry.md` - Keep a Changelog format

## Test Results

✓ update-current.js updates CURRENT.md correctly
✓ add-progress.js generates formatted session summaries
✓ add-changelog.js follows Keep a Changelog format
✓ end-session.js runs complete workflow
✓ Templates load and render correctly
✓ Markdown syntax valid
✓ No duplicate entries
✓ Performance: all operations < 1s

## Version

**Current**: 1.0.0 (Phase 6 - Documentation)
**Compatible with**: memory-core v1.3.0, git-workflow v1.0.0

## License

Same as parent project
