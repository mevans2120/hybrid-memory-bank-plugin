---
name: git-workflow
description: Safe git operations with approval gates - commit, push, branch management with security checks
---

# Git Workflow Skill

Smart git operations with mandatory approval gates and security checks.

## What It Does

The git-workflow skill provides safe, AI-powered git operations:

- **Smart Commits** - AI-generated commit messages with user approval
- **Safe Push** - Mandatory approval gate before pushing to remote
- **Branch Management** - Create and switch branches with naming conventions
- **Enhanced Status** - Rich git status with file grouping and stats

## Security Guarantees

🔒 **Never commits without user approval**
🔒 **Never pushes without explicit user approval**
🔒 **Never force-pushes without explicit request**
🔒 **Blocks sensitive files** (.env, credentials, etc.)
🔒 **Warns on large files** (> 1MB)

## Invocation Triggers

The skill activates when you mention:
- "commit" or "create a commit"
- "push" or "push to remote"
- "branch" or "create branch"
- "git status" or "what changed"
- "stage files" or "add files"

## Commit Message Format

Follows Conventional Commits:
```
<type>(<scope>): <description>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

## Data Storage

### Config (`.claude/skills/git-workflow/config/`)
- `commit-conventions.json` - Commit message templates
- Git-tracked, customizable per project

### No persistent data
All operations use git directly, no additional storage needed.

## Usage Examples

### Smart Commit
```
You: "Create a commit for this work"
Claude: [Analyzes changes, generates message, shows preview]
Claude: "Ready to commit with message: 'feat(auth): add login validation'. Approve?"
You: "Yes"
Claude: [Creates commit with co-author metadata]
```

### Safe Push
```
You: "Push to remote"
Claude: "Ready to push 3 commits to origin/main. Approve?"
You: "Yes"
Claude: [Pushes to remote]
```

### Branch Management
```
You: "Create a branch for the new feature"
Claude: [Creates branch like "feature/new-feature"]

You: "Switch to main branch"
Claude: [Switches to main]
```

### Enhanced Status
```
You: "What files did I change?"
Claude: [Shows grouped changes: staged, unstaged, untracked]
Claude: [Shows stats: +120 lines, -45 lines, 8 files]
```

## Approval Flow

1. **Analyze Changes** - Read git status, diff, log
2. **Generate Action** - Create commit message, identify files
3. **Show Preview** - Display what will happen
4. **Request Approval** - Ask user to approve/deny
5. **Execute** - Only proceed if approved
6. **Confirm** - Show result of operation

## Integration

Works seamlessly with memory-core skill:
- Commits reference current session
- Change tracking updated after commits
- Session notes included in commit body (optional)

## Performance

- Status check: < 500ms
- Commit generation: < 2s
- Commit execution: < 1s
- Push: varies (network dependent)

## Error Handling

Gracefully handles:
- Merge conflicts (shows status, suggests resolution)
- Network errors (retry with user approval)
- Invalid branch names (suggests corrections)
- Sensitive file detection (blocks and warns)
- Large file warnings (asks for confirmation)

## Compatibility

- Works with any git repository
- Compatible with GitHub, GitLab, Bitbucket
- Supports git hooks (if configured)
- Respects .gitignore

---

*Part of hybrid-memory-bank skills suite - reliable git operations with safety guarantees*
