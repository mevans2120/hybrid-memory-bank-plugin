---
name: memory-core
description: Manage project memory, sessions, file tracking, and pattern learning across development sessions
---

# Memory Core Skill

This skill provides reliable memory management for development projects, maintaining session state, tracking file changes, and learning patterns across sessions.

## Capabilities

### Session Management
- Initialize and manage development sessions
- Track current tasks, files, and progress
- Archive completed sessions
- Maintain context notes across sessions

### File Change Tracking
- Record file modifications manually
- Maintain history of recent changes (20 most recent)
- Track files associated with current task
- Support create/modify/delete actions

### Pattern Learning
- Store and retrieve code patterns by type
  - API patterns
  - Error handling patterns
  - UI patterns
  - Database patterns
- Learn from development work
- Share patterns across projects

### Project Information
- Manage tech stack information
- Track project conventions
- Document architecture decisions

## When to Invoke

Activate this skill when the user:
- Asks about their current session ("what am I working on?", "show my session")
- Wants to track file changes ("track this change", "record this file")
- Needs to remember patterns ("remember this pattern", "what patterns do we use?")
- Requests session management ("start session", "end session", "archive session")
- Asks about project information ("what's our tech stack?", "show conventions")
- Wants to add context notes ("note that...", "remember that...")

## Data Storage

### Compatible with Plugin
This skill uses **identical data structures** as the hybrid-memory-bank plugin:

**`.claude-memory/`** (gitignored JSON):
- `session/current.json` - Active session state
- `session/archive/` - Archived sessions
- `patterns/` - Learned patterns by type
- `project/` - Tech stack, conventions, architecture

**`memory-bank/`** (git-tracked Markdown):
- `CURRENT.md` - Current project status
- `progress.md` - Session summaries
- `CHANGELOG.md` - Major features
- `ARCHITECTURE.md` - Architecture decisions

### Session Data Format
```json
{
  "sessionId": "YYYY-MM-DD-{morning|afternoon|evening}",
  "startedAt": "ISO 8601 timestamp",
  "expiresAt": "ISO 8601 timestamp",
  "currentTask": {
    "feature": "Description of current work",
    "files": ["absolute", "file", "paths"],
    "progress": "not_started|in_progress|completed",
    "nextSteps": ["action items"]
  },
  "activeBugs": ["bug descriptions"],
  "recentChanges": [
    {
      "file": "/absolute/path/to/file",
      "action": "created/updated|modified|deleted",
      "timestamp": "ISO 8601",
      "description": "Action description"
    }
  ],
  "contextNotes": ["Important notes for next session"]
}
```

## Usage Examples

### Session Management
```
User: "Show my current session"
Skill: Reads .claude-memory/session/current.json and displays formatted output

User: "Start a new session"
Skill: Creates session with proper ID format and initial state

User: "Add a note: refactored auth to use middleware"
Skill: Adds note to contextNotes array (no duplicates)

User: "Archive my session"
Skill: Moves current.json to archive/ and displays summary
```

### File Change Tracking
```
User: "Track this change to src/auth/middleware.ts"
Skill: Records change to recentChanges with timestamp and absolute path

User: "What files have I changed?"
Skill: Displays recentChanges array formatted by file

User: "Show recent changes"
Skill: Lists all recent changes with timestamps
```

### Pattern Learning
```
User: "Remember this API pattern: RESTful endpoint design"
Skill: Stores pattern in patterns/api-patterns.json with learnedAt timestamp

User: "What error handling patterns do we use?"
Skill: Retrieves and displays patterns from patterns/error-handling.json

User: "Show UI patterns"
Skill: Lists all patterns from patterns/ui-patterns.json
```

### Project Information
```
User: "What's our tech stack?"
Skill: Reads and displays project/tech-stack.json

User: "Update tech stack: using TanStack Query now"
Skill: Updates project/tech-stack.json with new information
```

## Implementation

### Core Library
Uses the **MemoryStore** library from the plugin (pure Node.js):
- Session management functions
- File change tracking
- Pattern storage
- Project info management

### Scripts
- `scripts/init.js` - Initialize directories and session
- (More scripts added in Phase 2-4)

### Dependencies
- **Node.js built-ins only**: fs.promises, path
- **No external packages** required
- **Platform agnostic** - works on macOS, Linux, Windows

## Compatibility

### With Plugin
- ✓ Uses identical JSON schemas
- ✓ Same file paths and structure
- ✓ Same session ID format
- ✓ Can read plugin-created data
- ✓ Plugin can read skill-created data
- ✓ Safe concurrent usage

### Interoperability
- Plugin hooks (when working) and skill commands can coexist
- Both write to same data files
- No conflicts or data corruption
- Graceful handling of mixed usage

## Benefits Over Plugin

### Reliability
- **Direct tool execution** vs unreliable hooks
- **Visible errors** vs silent failures
- **Consistent operation** every invocation

### Intelligence
- **AI-powered summaries** - Context-aware session descriptions
- **Smart suggestions** - "Should I track this change?"
- **Pattern analysis** - Cross-session learning

### Accessibility
- **Natural language** - No need to remember slash commands
- **Cross-project** - Works in all projects automatically
- **Team sharing** - Simple git commit to share

## Performance Targets

- Initialization: < 500ms
- Session read/write: < 100ms
- File tracking: < 100ms
- Pattern retrieval: < 50ms
- Pattern storage: < 100ms

## Testing

All operations tested for:
- ✓ Plugin compatibility
- ✓ Data format correctness
- ✓ Performance requirements
- ✓ Error handling
- ✓ Edge cases

## Future Enhancements

Phase 2-4 will add:
- Session lifecycle automation
- Enhanced change tracking with AI detection
- Cross-project pattern search
- Smart documentation updates

---

**Version**: 1.0.0 (Phase 1 - Foundation)
**Compatible with**: hybrid-memory-bank-plugin v2.0.0
**License**: Same as parent project
