---
name: team-memory
description: Team collaboration features - shared patterns, onboarding docs, and team memory synchronization
---

# Team Memory Skill

Team-wide knowledge sharing and collaboration for development teams.

## What It Does

The team-memory skill provides collaborative features:

- **Shared Pattern Library** - Team-wide patterns accessible by all members
- **Onboarding Documentation** - Auto-generate comprehensive onboarding guides
- **Team Memory Sync** - Synchronize individual memory to team knowledge base
- **Cross-Project Access** - Team patterns available across all projects

## Invocation Triggers

The skill activates when you mention:
- "team patterns" or "what patterns does the team use"
- "share with team" or "add to team library"
- "onboarding" or "generate onboarding docs"
- "team sync" or "sync team memory"
- "team conventions" or "team practices"

## Data Storage

### Team Patterns (`.claude/skills/team-memory/patterns/`)
Git-tracked, shared across team:
- `api-patterns.json` - Team API design patterns
- `error-handling.json` - Team error handling approaches
- `ui-patterns.json` - Team UI component patterns
- `database-patterns.json` - Team database patterns

### Team Documentation (`.claude/skills/team-memory/docs/`)
Git-tracked, team-maintained:
- `ONBOARDING.md` - Generated onboarding guide
- `CONVENTIONS.md` - Team coding conventions
- `ARCHITECTURE.md` - Architecture decisions
- `WORKFLOWS.md` - Team development workflows

### Integration with Individual Memory
- Reads from memory-core personal patterns
- Can promote personal patterns to team patterns
- Team patterns override personal patterns (when conflict)

## Usage Examples

### Query Team Patterns
```
You: "What error handling patterns does the team use?"
Claude: [Shows team-wide error handling patterns]
Claude: "Team uses 3 error handling patterns:
  1. try-catch-async - Standard async error handling
  2. error-boundary - React error boundaries
  3. api-error-wrapper - API error formatting"
```

### Share Pattern with Team
```
You: "Share this authentication pattern with the team"
Claude: [Adds to team-memory/patterns/api-patterns.json]
Claude: "Added 'jwt-auth' pattern to team library
  File: .claude/skills/team-memory/patterns/api-patterns.json
  Ready to commit and push for team access"
```

### Generate Onboarding Docs
```
You: "Generate onboarding docs for new developer"
Claude: [Analyzes tech stack, patterns, conventions]
Claude: "Created ONBOARDING.md with:
  - Tech stack overview (React, TypeScript, PostgreSQL)
  - 12 team patterns
  - Git workflow
  - Development setup
  - Common tasks and troubleshooting"
```

### Sync Team Memory
```
You: "Sync my patterns to team memory"
Claude: [Reviews personal patterns, suggests additions]
Claude: "Found 3 new patterns to share:
  - modal-component (UI pattern)
  - rate-limiter (API pattern)
  - query-optimizer (Database pattern)
  Add to team library?"
```

## Features

### Concurrent Usage
- Multiple team members can update simultaneously
- Conflict resolution (last write wins with notification)
- No file locking issues
- Git-based synchronization

### Cross-Project Access
- Team patterns stored in git-tracked skill directory
- Available across all projects using the skill
- Install once, use everywhere

### Pattern Promotion
- Personal patterns (memory-core) can be promoted to team patterns
- Review and approval workflow
- Maintains individual experimentation space

## Performance

- Pattern retrieval: < 500ms
- Team sync: < 3s
- Onboarding generation: < 10s

## Integration

Works with other skills:
- **memory-core**: Reads personal patterns, promotes to team
- **documentation**: Can update team documentation files
- **git-workflow**: Commits team pattern changes

## Team Workflow

1. **Developer learns pattern** (memory-core)
2. **Pattern proven useful** (used multiple times)
3. **Promote to team** (team-memory)
4. **Commit and push** (git-workflow)
5. **Team pulls changes** (git pull)
6. **All team members have access**

---

*Part of hybrid-memory-bank skills suite - team collaboration and knowledge sharing*
