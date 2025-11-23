---
name: documentation
description: Smart markdown documentation management - auto-generate CURRENT.md updates, session summaries, and changelog entries
---

# Documentation Skill

Intelligent markdown documentation management for memory bank files.

## What It Does

The documentation skill provides smart documentation automation:

- **CURRENT.md Updates** - Generate current status from session data
- **Progress Summaries** - Create session summaries for progress.md
- **Changelog Entries** - Format changelog entries (Keep a Changelog format)
- **Session End Workflow** - Complete session documentation automation

## Invocation Triggers

The skill activates when you mention:
- "update CURRENT" or "update current status"
- "add to progress" or "session summary"
- "update changelog" or "add changelog entry"
- "end session" or "finish session"
- "document my work" or "help me document"

## Data Sources

### Session Data (from memory-core)
- Current session ID and timing
- Current task and progress
- Files changed (from recentChanges)
- Context notes
- Active bugs
- Next steps

### Git Data (from git-workflow)
- Recent commits
- Files staged/modified
- Branch information

## Output Files

### memory-bank/CURRENT.md
Sections:
- Overview
- Current Focus
- Active Tasks (with checkboxes)
- Recent Changes
- Context
- Next Steps
- Known Issues

### memory-bank/progress.md
Format:
```markdown
## Session YYYY-MM-DD-{period}

**Duration**: Xh Ym
**Focus**: [What you worked on]

### Completed
- Feature/fix description

### Files Modified
- path/to/file.js

### Notes
- Important context for next session
```

### memory-bank/CHANGELOG.md
Format (Keep a Changelog):
```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Modified feature description

### Fixed
- Bug fix description
```

## Usage Examples

### Update CURRENT.md
```
You: "Update CURRENT.md with today's work"
Claude: [Reads session data, generates summary, updates file]
Claude: "Updated CURRENT.md with:
  - Current Focus: Phase 6 Documentation Skill
  - Recent Changes: 4 scripts created
  - Active Tasks: Updated checklist"
```

### Add Progress Summary
```
You: "Add session summary to progress.md"
Claude: [Generates summary from session, appends to progress.md]
Claude: "Added session 2025-11-22-afternoon to progress.md:
  - Duration: 2h 15m
  - Focus: Skills suite Phase 5-6
  - 8 files created, 1500+ lines"
```

### Add Changelog Entry
```
You: "Add to changelog: deployed authentication system"
Claude: [Formats entry, updates CHANGELOG.md]
Claude: "Added to CHANGELOG.md under version 2.1.0:
  ### Added
  - Deployed authentication system"
```

### End Session Workflow
```
You: "End session and help me document"
Claude: [Runs complete workflow]
Claude: "Session end checklist:
  ✓ Archived session to archive/2025-11-22-afternoon.json
  ✓ Updated CURRENT.md with final status
  ✓ Added session summary to progress.md
  ✓ Staged documentation files
  Ready to commit?"
```

## Templates

### CURRENT.md Template
- Standard sections with placeholders
- Checkbox format for tasks
- Consistent structure

### Progress Entry Template
- Session header with date/period
- Duration calculation
- Structured sections

### Changelog Template
- Keep a Changelog format
- Semantic versioning
- Category sections (Added, Changed, Fixed, etc.)

## Integration

Works seamlessly with other skills:
- **memory-core**: Reads session data, file changes, patterns
- **git-workflow**: Reads commits, branch info, file stats
- Combines data sources for rich summaries

## Performance

- CURRENT.md generation: < 1s
- Progress entry: < 500ms
- Changelog entry: < 500ms
- Session end workflow: < 3s total

## Features

### Smart Formatting
- Markdown syntax validation
- Consistent structure
- Proper linking
- Code block formatting

### Data Preservation
- Never overwrites existing content
- Appends to progress.md
- Updates sections in CURRENT.md
- Adds to changelog categories

### Conflict Prevention
- Checks for duplicate entries
- Validates section structure
- Preserves manual edits

---

*Part of hybrid-memory-bank skills suite - intelligent documentation automation*
