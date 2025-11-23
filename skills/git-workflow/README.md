# Git Workflow Skill

Safe git operations with approval gates and security checks.

## What It Does

The git-workflow skill provides smart, secure git operations:

- **Smart Commits** - AI-suggested commit messages with Conventional Commits format
- **Safe Push** - Mandatory approval gates before pushing to remote
- **Branch Management** - Create and switch branches with naming conventions
- **Enhanced Status** - Rich git status with file grouping and statistics

## Security Guarantees

🔒 **Never commits without user approval**
🔒 **Never pushes without explicit user approval**
🔒 **Never force-pushes without explicit request**
🔒 **Blocks sensitive files** (.env, credentials, etc.)
🔒 **Warns on large files** (> 1MB)

## Installation

### Personal Installation (All Projects)
```bash
# Copy to personal skills directory
cp -r skills/git-workflow ~/.claude/skills/

# Restart Claude Code to load the skill
```

### Project Installation (Team Sharing)
```bash
# Copy to project skills directory
mkdir -p .claude/skills
cp -r skills/git-workflow .claude/skills/

# Commit to share with team
git add .claude/skills/git-workflow
git commit -m "Add git-workflow skill for team"
```

## Usage

### Enhanced Status

```bash
# Basic status
node ~/.claude/skills/git-workflow/scripts/status.js

# With diff statistics
node ~/.claude/skills/git-workflow/scripts/status.js --stats

# With recent commits
node ~/.claude/skills/git-workflow/scripts/status.js --commits 5

# Show all untracked files
node ~/.claude/skills/git-workflow/scripts/status.js --show-all
```

### Smart Commit

```bash
# Preview commit (dry-run)
node ~/.claude/skills/git-workflow/scripts/commit.js --dry-run

# Auto-generated commit message
node ~/.claude/skills/git-workflow/scripts/commit.js --yes

# Custom commit type and scope
node ~/.claude/skills/git-workflow/scripts/commit.js \
  --type feat \
  --scope auth \
  --description "add login validation" \
  --yes

# Full custom message
node ~/.claude/skills/git-workflow/scripts/commit.js \
  --message "fix: resolve authentication bug" \
  --yes
```

### Safe Push

```bash
# Preview push (dry-run)
node ~/.claude/skills/git-workflow/scripts/push.js --dry-run

# Push with approval
node ~/.claude/skills/git-workflow/scripts/push.js --yes

# Set up remote tracking and push
node ~/.claude/skills/git-workflow/scripts/push.js --setup-upstream

# Push to different remote
node ~/.claude/skills/git-workflow/scripts/push.js --remote upstream --yes
```

### Branch Management

```bash
# Show current branch
node ~/.claude/skills/git-workflow/scripts/branch.js

# List all branches
node ~/.claude/skills/git-workflow/scripts/branch.js --list

# Create new branch (and checkout)
node ~/.claude/skills/git-workflow/scripts/branch.js --create feature/new-feature

# Create branch without checking out
node ~/.claude/skills/git-workflow/scripts/branch.js --create fix/bug --no-checkout

# Switch to existing branch
node ~/.claude/skills/git-workflow/scripts/branch.js --switch main
```

## Commit Message Format

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or dependency changes
- `ci` - CI/CD configuration changes
- `chore` - Other changes

**Examples**:
```
feat(auth): add JWT token validation
fix(api): resolve race condition in user login
docs(readme): update installation instructions
test(auth): add unit tests for login flow
```

## Security Checks

### Sensitive File Detection

Blocks commit if any of these patterns are detected:
- `.env`, `.env.local`, `.env.*`
- `credentials`, `secrets`
- `*.key`, `*.pem`, `*.p12`, `*.pfx`
- `id_rsa`, `id_dsa`
- Files containing `password`, `aws_.*_key`

### Large File Warnings

- **Warning**: Files > 1MB
- **Error** (blocks commit): Files > 10MB

💡 Tip: Use Git LFS for large files

## Configuration

Edit `config/commit-conventions.json` to customize:
- Commit types and descriptions
- Common scopes for your project
- Sensitive file patterns
- Large file thresholds

## Integration

Works seamlessly with memory-core skill:
- Commits can reference current session
- File tracking updated after commits
- Session notes included in commit body (optional)

## Test Results

✓ status.js displays formatted git status correctly
✓ branch.js lists and manages branches correctly
✓ commit.js analyzes changes and blocks sensitive files
✓ commit.js warns on large files
✓ commit.js generates valid commit messages
✓ push.js shows commits and requires approval
✓ push.js never pushes without --yes flag
✓ All security checks working correctly
✓ Performance: all operations < 2s

## Examples

### Complete Workflow

```bash
# 1. Make changes to your code
...

# 2. Check status
node ~/.claude/skills/git-workflow/scripts/status.js --stats

# 3. Stage your changes
git add src/auth/login.ts src/auth/middleware.ts

# 4. Preview commit
node ~/.claude/skills/git-workflow/scripts/commit.js --dry-run

# 5. Commit with custom message
node ~/.claude/skills/git-workflow/scripts/commit.js \
  --type feat \
  --scope auth \
  --description "add JWT authentication" \
  --yes

# 6. Preview push
node ~/.claude/skills/git-workflow/scripts/push.js --dry-run

# 7. Push to remote
node ~/.claude/skills/git-workflow/scripts/push.js --yes
```

### Branch Workflow

```bash
# Create feature branch
node ~/.claude/skills/git-workflow/scripts/branch.js --create feature/user-profile

# Work on feature...
# ...commit changes...

# Switch back to main
node ~/.claude/skills/git-workflow/scripts/branch.js --switch main

# Merge feature (manual)
git merge feature/user-profile
```

## Troubleshooting

### Commit Blocked - Sensitive Files
```
🔒 SECURITY WARNING: Sensitive files detected!
❌ .env
   Matches pattern: \.env
```

**Solution**: Remove sensitive files from staging
```bash
git reset HEAD .env
```

### Push Failed - Behind Remote
```
⚠️  Your branch is behind the remote
💡 Tip: Pull changes first with "git pull"
```

**Solution**: Pull changes first
```bash
git pull --rebase
```

### Permission Denied
Ensure scripts are executable:
```bash
chmod +x ~/.claude/skills/git-workflow/scripts/*.js
```

## Performance

- Status check: < 500ms
- Commit generation: < 2s
- Commit execution: < 1s
- Push: varies (network dependent)

## Support

- See [SKILLS-IMPLEMENTATION-PLAN.md](../../docs/SKILLS-IMPLEMENTATION-PLAN.md) for full plan
- See [FEASIBILITY-ASSESSMENT.md](../../docs/FEASIBILITY-ASSESSMENT.md) for background
- Report issues in parent repo

## Version

**Current**: 1.0.0 (Phase 5 - Git Workflow)
**Compatible with**: Git 2.0+

## License

Same as parent project
