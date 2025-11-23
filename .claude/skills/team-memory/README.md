# Team Memory Skill

Team collaboration features for sharing patterns, generating onboarding docs, and synchronizing team knowledge.

## Features

- **Shared Pattern Library** - Team-wide patterns accessible by all members
- **Onboarding Documentation** - Auto-generate comprehensive onboarding guides
- **Team Memory Sync** - Synchronize individual patterns to team knowledge base
- **Cross-Project Access** - Team patterns available across all projects

## Installation

Install dependencies (uses shared node_modules):

```bash
cd skills/team-memory
npm install
```

## Usage

### Manage Team Patterns

```bash
# List all team patterns
npm run team-patterns -- --list

# List specific pattern type
npm run team-patterns -- --list api-patterns

# Show available pattern types
npm run team-patterns -- --types

# Add pattern to team library
echo '{"description":"JWT authentication","example":"..."}' | \
  npm run team-patterns -- --add api-patterns jwt-auth

# Get specific pattern
npm run team-patterns -- --get api-patterns jwt-auth
```

### Generate Onboarding Documentation

```bash
# Generate onboarding guide
npm run onboarding -- --project "My Project"

# Preview without saving
npm run onboarding -- --project "My Project" --dry-run

# Custom output file
npm run onboarding -- --project "My Project" --output custom-name.md
```

### Sync Personal Patterns to Team

```bash
# Interactive sync (prompts for each pattern)
npm run team-sync

# Sync from specific project
npm run team-sync -- --cwd /path/to/project

# Preview without changes
npm run team-sync -- --dry-run

# Auto-approve all patterns
npm run team-sync -- --auto-approve
```

## Data Storage

### Team Patterns (Git-Tracked)

Stored in `.claude/skills/team-memory/patterns/`:
- `api-patterns.json` - Team API design patterns
- `error-handling.json` - Team error handling approaches
- `ui-patterns.json` - Team UI component patterns
- `database-patterns.json` - Team database patterns

**Commit and push** these files to share with team.

### Team Documentation (Git-Tracked)

Stored in `.claude/skills/team-memory/docs/`:
- `ONBOARDING.md` - Generated onboarding guide
- `CONVENTIONS.md` - Team coding conventions
- `ARCHITECTURE.md` - Architecture decisions
- `WORKFLOWS.md` - Team development workflows

### Integration with Individual Memory

- Reads from `.claude-memory/patterns/` (personal patterns from memory-core)
- Can promote personal patterns to team patterns
- Team patterns override personal patterns when conflicts exist

## Workflow

### Promoting a Pattern to Team Library

1. **Learn pattern** - Use memory-core to save personal pattern
2. **Test pattern** - Use in multiple projects to validate
3. **Promote to team** - Run team-sync to add to team library
4. **Share with team** - Commit and push pattern files
5. **Team access** - All team members can use pattern

### Creating Onboarding Documentation

1. **Add team patterns** - Build up shared pattern library
2. **Generate docs** - Run onboarding script for project
3. **Customize** - Edit generated ONBOARDING.md as needed
4. **Commit** - Share onboarding guide with team
5. **Maintain** - Update as project evolves

## Script Details

### team-patterns.js

Manage the shared team pattern library:
- List all patterns or filter by type
- Add new patterns to team library
- Retrieve specific patterns
- Show available pattern types

### onboarding.js

Generate comprehensive onboarding documentation:
- Loads team patterns and formats them
- Uses template with placeholders
- Saves to team docs directory
- Customizable project information

### team-sync.js

Sync personal patterns to team library:
- Compares personal vs team patterns
- Finds new patterns to share
- Interactive approval workflow
- Batch operations supported

## Best Practices

1. **Pattern Quality** - Only promote well-tested patterns
2. **Documentation** - Add clear descriptions and examples
3. **Regular Sync** - Sync patterns weekly or after major features
4. **Team Review** - Review onboarding docs with new team members
5. **Version Control** - Always commit pattern changes with descriptive messages

## Examples

### Example: Adding an API Pattern

```bash
# Create pattern JSON
cat > pattern.json <<EOF
{
  "description": "Standard REST endpoint with error handling",
  "example": "app.get('/api/users', async (req, res) => { try { ... } catch (err) { ... } })",
  "when": "Creating new REST API endpoints",
  "benefits": ["Consistent error handling", "Async/await pattern", "Standard response format"]
}
EOF

# Add to team library
cat pattern.json | npm run team-patterns -- --add api-patterns rest-endpoint

# Commit to share
git add skills/team-memory/patterns/api-patterns.json
git commit -m "feat: add REST endpoint pattern"
git push
```

### Example: Complete Onboarding Workflow

```bash
# 1. Generate onboarding docs
npm run onboarding -- --project "E-Commerce Platform"

# 2. Review and customize
# Edit skills/team-memory/docs/ONBOARDING.md

# 3. Commit to share
git add skills/team-memory/docs/ONBOARDING.md
git commit -m "docs: add team onboarding guide"
git push
```

### Example: Syncing After Sprint

```bash
# Review what would be synced
npm run team-sync -- --dry-run

# Interactively sync patterns
npm run team-sync

# Commit synced patterns
git add skills/team-memory/patterns/
git commit -m "feat: add sprint 12 patterns to team library"
git push
```

## Team Collaboration

### Concurrent Usage

Multiple team members can update patterns simultaneously:
- Last write wins (simple conflict resolution)
- Use git to merge conflicts if needed
- Communication recommended for large changes

### Cross-Project Patterns

Team patterns are stored in the skill directory, not project-specific:
- Install skill once per machine
- Patterns available across all projects
- Consistent patterns team-wide

## Testing

All scripts support dry-run mode:

```bash
# Test without making changes
npm run team-patterns -- --add api-patterns test --dry-run < pattern.json
npm run onboarding -- --project "Test" --dry-run
npm run team-sync -- --dry-run
```

## Performance

- Pattern retrieval: < 500ms
- Team sync: < 3s (for 50 patterns)
- Onboarding generation: < 10s

## Integration with Other Skills

- **memory-core**: Reads personal patterns for sync
- **documentation**: Can update team documentation files
- **git-workflow**: Commits team pattern changes

---

Part of the hybrid-memory-bank skills suite - enabling team collaboration and knowledge sharing.
