#!/bin/bash

# Hybrid Memory Bank - Skills Installation Script
# Installs skills to ~/.claude/skills/ for cross-project use

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SOURCE="$SCRIPT_DIR/.claude/skills"
SKILLS_TARGET="$HOME/.claude/skills"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Hybrid Memory Bank - Skills Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will install 4 skills to: $SKILLS_TARGET"
echo ""
echo "Skills to be installed:"
echo "  • memory-core      - Session management, patterns, tech stack"
echo "  • git-workflow     - Safe git operations with approval gates"
echo "  • documentation    - Markdown management and session docs"
echo "  • team-memory      - Team collaboration and knowledge sharing"
echo ""

# Check if target directory exists
if [ -d "$SKILLS_TARGET" ]; then
    echo "⚠️  Warning: $SKILLS_TARGET already exists"
    echo ""
    echo "Installation options:"
    echo "  1) Backup existing and install fresh"
    echo "  2) Merge (keep existing, add new skills)"
    echo "  3) Cancel installation"
    echo ""
    read -p "Choose option (1/2/3): " choice

    case $choice in
        1)
            BACKUP_DIR="$HOME/.claude/skills.backup.$(date +%Y%m%d-%H%M%S)"
            echo "📦 Backing up existing skills to: $BACKUP_DIR"
            mv "$SKILLS_TARGET" "$BACKUP_DIR"
            ;;
        2)
            echo "📝 Merging with existing skills..."
            ;;
        3)
            echo "❌ Installation cancelled"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Installation cancelled."
            exit 1
            ;;
    esac
fi

# Create target directory if it doesn't exist
mkdir -p "$SKILLS_TARGET"

# Copy each skill
echo ""
echo "📥 Installing skills..."
echo ""

for skill in memory-core git-workflow documentation team-memory shared-lib; do
    if [ -d "$SKILLS_SOURCE/$skill" ]; then
        echo "  ✓ Installing $skill..."
        cp -r "$SKILLS_SOURCE/$skill" "$SKILLS_TARGET/"
    else
        echo "  ⚠️  Warning: $skill not found in source"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Skills installed to: $SKILLS_TARGET"
echo ""
echo "Usage examples:"
echo ""
echo "  # Memory Core"
echo "  npm run --prefix ~/.claude/skills/memory-core session-show"
echo "  npm run --prefix ~/.claude/skills/memory-core learn-pattern"
echo ""
echo "  # Git Workflow"
echo "  npm run --prefix ~/.claude/skills/git-workflow status"
echo "  npm run --prefix ~/.claude/skills/git-workflow commit"
echo ""
echo "  # Documentation"
echo "  npm run --prefix ~/.claude/skills/documentation update-current"
echo "  npm run --prefix ~/.claude/skills/documentation end-session"
echo ""
echo "  # Team Memory"
echo "  npm run --prefix ~/.claude/skills/team-memory team-patterns -- --list"
echo "  npm run --prefix ~/.claude/skills/team-memory onboarding -- --project 'Your Project'"
echo ""
echo "📚 For detailed documentation, see:"
echo "   ~/.claude/skills/memory-core/README.md"
echo "   ~/.claude/skills/git-workflow/README.md"
echo "   ~/.claude/skills/documentation/README.md"
echo "   ~/.claude/skills/team-memory/README.md"
echo ""
echo "🎉 Skills are now available in ALL your projects!"
echo ""
