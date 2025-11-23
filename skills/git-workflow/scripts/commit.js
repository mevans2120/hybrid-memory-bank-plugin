#!/usr/bin/env node

/**
 * Smart Commit Script
 *
 * Analyzes staged changes, checks for issues, and creates commits
 * with AI-suggested messages. Includes security checks and approval gates.
 */

const GitHelper = require('../lib/gitHelper');
const readline = require('readline');

async function smartCommit(workingDirectory = process.cwd(), options = {}) {
  const git = new GitHelper(workingDirectory);

  try {
    // Check if git repo
    if (!git.isGitRepo()) {
      console.log('\n❌ Not a git repository\n');
      return { success: false, error: 'Not a git repository' };
    }

    // Get status
    const status = git.getStatus();
    if (!status.success) {
      console.log('\n❌ Error getting git status:', status.error, '\n');
      return { success: false, error: status.error };
    }

    // Check if there are staged changes
    if (status.staged.length === 0) {
      console.log('\n⚠️  No staged changes to commit\n');

      if (status.unstaged.length > 0) {
        console.log(`Found ${status.unstaged.length} unstaged changes:`);
        status.unstaged.slice(0, 5).forEach(({ file }) => console.log(`  • ${file}`));
        if (status.unstaged.length > 5) {
          console.log(`  ... and ${status.unstaged.length - 5} more`);
        }
        console.log('\n💡 Tip: Use "git add <files>" to stage changes\n');
      }

      return { success: false, error: 'No staged changes' };
    }

    const stagedFiles = git.getStagedFiles();

    console.log('\n' + '='.repeat(70));
    console.log('📝 Smart Commit');
    console.log('='.repeat(70));

    // Security checks
    const sensitiveFiles = git.checkSensitiveFiles(stagedFiles);
    if (sensitiveFiles.length > 0) {
      console.log('\n🔒 SECURITY WARNING: Sensitive files detected!\n');
      sensitiveFiles.forEach(({ file, reason }) => {
        console.log(`  ❌ ${file}`);
        console.log(`     ${reason}`);
      });
      console.log('\n⛔ Commit blocked for security reasons');
      console.log('💡 Tip: Remove sensitive files from staging with "git reset <file>"\n');
      return { success: false, error: 'Sensitive files detected' };
    }

    // Large file warnings
    const largeFiles = git.checkLargeFiles(stagedFiles);
    if (largeFiles.length > 0) {
      console.log('\n⚠️  Large files detected:\n');
      largeFiles.forEach(({ file, sizeHuman, isError }) => {
        console.log(`  ${isError ? '❌' : '⚠️ '} ${file} (${sizeHuman})`);
      });

      const hasErrors = largeFiles.some(f => f.isError);
      if (hasErrors) {
        console.log('\n⛔ Files larger than 10MB detected - commit blocked');
        console.log('💡 Tip: Use Git LFS for large files\n');
        return { success: false, error: 'Large files detected' };
      }

      console.log('\n⚠️  Continue with caution - large files will increase repo size\n');
    }

    // Analyze changes
    const diff = git.getStagedDiff();
    const analysis = git.analyzeChanges(diff);

    console.log('\n📊 Changes Summary:');
    console.log(`  Files changed: ${analysis.filesChanged}`);
    console.log(`  Lines added: +${analysis.linesAdded}`);
    console.log(`  Lines removed: -${analysis.linesRemoved}`);
    console.log(`  Suggested type: ${analysis.type}`);

    // Show staged files
    console.log('\n📁 Staged Files:');
    stagedFiles.forEach(file => console.log(`  • ${file}`));

    // Generate or use provided commit message
    let commitMessage = options.message;

    if (!commitMessage) {
      const scope = options.scope || '';
      const description = options.description || 'update files';
      const type = options.type || analysis.type;

      const subject = scope
        ? `${type}(${scope}): ${description}`
        : `${type}: ${description}`;

      const body = options.body || '';
      const footer = `\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;

      commitMessage = body
        ? `${subject}\n\n${body}${footer}`
        : `${subject}${footer}`;
    }

    console.log('\n📝 Commit Message:');
    console.log('-'.repeat(70));
    console.log(commitMessage);
    console.log('-'.repeat(70));

    // If dry-run, stop here
    if (options.dryRun) {
      console.log('\n✓ Dry run complete - no commit created\n');
      return {
        success: true,
        dryRun: true,
        message: commitMessage,
        analysis
      };
    }

    // If auto-approve, commit directly
    if (options.yes) {
      return executeCommit(git, commitMessage, analysis);
    }

    // Interactive approval
    console.log('\n❓ Ready to commit with this message?');
    console.log('   Run with --yes to approve, or edit the message and run again\n');

    return {
      success: true,
      requiresApproval: true,
      message: commitMessage,
      analysis
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function executeCommit(git, message, analysis) {
  console.log('\n⏳ Creating commit...');

  const result = git.commit(message);

  if (!result.success) {
    console.log('\n❌ Commit failed:', result.error, '\n');
    return { success: false, error: result.error };
  }

  console.log('\n✅ Commit created successfully!');

  // Show recent commits
  const recent = git.getRecentCommits(1);
  if (recent.length > 0) {
    const { hash, subject } = recent[0];
    console.log(`   ${hash} ${subject}`);
  }

  console.log();

  return {
    success: true,
    committed: true,
    message,
    analysis
  };
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    message: null,
    type: null,
    scope: null,
    description: null,
    body: null,
    dryRun: false,
    yes: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--message':
      case '-m':
        options.message = nextArg;
        i++;
        break;
      case '--type':
      case '-t':
        options.type = nextArg;
        i++;
        break;
      case '--scope':
      case '-s':
        options.scope = nextArg;
        i++;
        break;
      case '--description':
      case '-d':
        options.description = nextArg;
        i++;
        break;
      case '--body':
      case '-b':
        options.body = nextArg;
        i++;
        break;
      case '--dry-run':
      case '-n':
        options.dryRun = true;
        break;
      case '--yes':
      case '-y':
        options.yes = true;
        break;
      case '--help':
      case '-h':
        console.log('\nSmart Commit Script\n');
        console.log('Analyzes staged changes and creates commits with security checks.\n');
        console.log('Usage: commit.js [options]\n');
        console.log('Options:');
        console.log('  --message, -m <text>      Full commit message (overrides generation)');
        console.log('  --type, -t <type>         Commit type (feat, fix, docs, etc.)');
        console.log('  --scope, -s <scope>       Commit scope (api, ui, auth, etc.)');
        console.log('  --description, -d <text>  Commit description');
        console.log('  --body, -b <text>         Commit body (optional)');
        console.log('  --dry-run, -n             Show what would be committed without committing');
        console.log('  --yes, -y                 Skip approval and commit immediately');
        console.log('  --help, -h                Show this help\n');
        console.log('Examples:');
        console.log('  commit.js                                    # Analyze and preview commit');
        console.log('  commit.js --dry-run                          # Preview without committing');
        console.log('  commit.js --yes                              # Auto-commit with generated message');
        console.log('  commit.js -t feat -s auth -d "add login"     # Custom commit message');
        console.log('  commit.js -m "fix: resolve auth bug" --yes   # Full custom message\n');
        console.log('Security:');
        console.log('  • Blocks sensitive files (.env, credentials, etc.)');
        console.log('  • Warns on files larger than 1MB');
        console.log('  • Blocks files larger than 10MB\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  smartCommit(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { smartCommit };
