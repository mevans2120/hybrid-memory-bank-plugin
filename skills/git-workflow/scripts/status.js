#!/usr/bin/env node

/**
 * Enhanced Git Status Script
 *
 * Rich git status display with file grouping, statistics, and remote status.
 */

const GitHelper = require('../lib/gitHelper');

async function enhancedStatus(workingDirectory = process.cwd(), options = {}) {
  const git = new GitHelper(workingDirectory);

  try {
    // Check if git repo
    if (!git.isGitRepo()) {
      console.log('\n❌ Not a git repository\n');
      return { success: false, error: 'Not a git repository' };
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 Git Status');
    console.log('='.repeat(70));

    // Current branch
    const currentBranch = git.getCurrentBranch();
    console.log(`\nBranch: ${currentBranch || 'unknown'}`);

    // Remote status
    const remoteStatus = git.getRemoteStatus();
    if (remoteStatus) {
      const { ahead, behind } = remoteStatus;

      if (ahead === 0 && behind === 0) {
        console.log('Remote: ✓ Up to date');
      } else {
        const parts = [];
        if (ahead > 0) parts.push(`${ahead} ahead`);
        if (behind > 0) parts.push(`${behind} behind`);
        console.log(`Remote: ${parts.join(', ')}`);
      }
    } else {
      console.log('Remote: No tracking branch');
    }

    // Get status
    const status = git.getStatus();
    if (!status.success) {
      console.log('\n❌ Error getting status:', status.error, '\n');
      return { success: false, error: status.error };
    }

    const { staged, unstaged, untracked } = status;

    // Show staged files
    if (staged.length > 0) {
      console.log('\n📝 Staged Changes:');
      staged.forEach(({ file, status }) => {
        const statusSymbol = getStatusSymbol(status);
        console.log(`  ${statusSymbol} ${file}`);
      });
    }

    // Show unstaged files
    if (unstaged.length > 0) {
      console.log('\n📄 Unstaged Changes:');
      unstaged.forEach(({ file, status }) => {
        const statusSymbol = getStatusSymbol(status);
        console.log(`  ${statusSymbol} ${file}`);
      });
    }

    // Show untracked files
    if (untracked.length > 0) {
      console.log('\n❓ Untracked Files:');
      const displayLimit = options.showAll ? untracked.length : 10;
      untracked.slice(0, displayLimit).forEach(file => {
        console.log(`  • ${file}`);
      });

      if (untracked.length > displayLimit) {
        console.log(`  ... and ${untracked.length - displayLimit} more`);
        console.log('  💡 Tip: Use --show-all to see all untracked files');
      }
    }

    // Summary statistics
    if (staged.length > 0 || unstaged.length > 0 || untracked.length > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log('Summary:');
      console.log(`  Staged: ${staged.length}`);
      console.log(`  Unstaged: ${unstaged.length}`);
      console.log(`  Untracked: ${untracked.length}`);

      // Diff stats for staged changes
      if (staged.length > 0 && options.stats) {
        const diff = git.getStagedDiff();
        const analysis = git.analyzeChanges(diff);
        console.log('\nStaged Changes Stats:');
        console.log(`  +${analysis.linesAdded} lines added`);
        console.log(`  -${analysis.linesRemoved} lines removed`);
        console.log(`  ${analysis.filesChanged} files changed`);
      }
    } else {
      console.log('\n✓ Working tree clean - no changes');
    }

    // Recent commits
    if (options.commits) {
      const commits = git.getRecentCommits(options.commits);
      if (commits.length > 0) {
        console.log('\n' + '-'.repeat(70));
        console.log('Recent Commits:');
        commits.forEach(({ hash, subject, author, date }) => {
          console.log(`  ${hash} ${subject}`);
          console.log(`       by ${author} ${date}`);
        });
      }
    }

    console.log();

    return {
      success: true,
      branch: currentBranch,
      remoteStatus,
      staged,
      unstaged,
      untracked,
      hasChanges: staged.length > 0 || unstaged.length > 0 || untracked.length > 0
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function getStatusSymbol(status) {
  const symbols = {
    'M': '📝', // Modified
    'A': '✨', // Added
    'D': '🗑️ ', // Deleted
    'R': '🔄', // Renamed
    'C': '📋', // Copied
    'U': '⚠️ ', // Unmerged
  };
  return symbols[status] || '•';
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    stats: false,
    commits: 0,
    showAll: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--stats':
      case '-s':
        options.stats = true;
        break;
      case '--commits':
      case '-c':
        options.commits = parseInt(nextArg, 10) || 5;
        i++;
        break;
      case '--show-all':
      case '-a':
        options.showAll = true;
        break;
      case '--help':
      case '-h':
        console.log('\nEnhanced Git Status Script\n');
        console.log('Rich git status display with grouping and statistics.\n');
        console.log('Usage: status.js [options]\n');
        console.log('Options:');
        console.log('  --stats, -s          Show diff statistics for staged changes');
        console.log('  --commits, -c <n>    Show N recent commits (default: 5)');
        console.log('  --show-all, -a       Show all untracked files (no limit)');
        console.log('  --help, -h           Show this help\n');
        console.log('Examples:');
        console.log('  status.js                  # Basic status');
        console.log('  status.js --stats          # With diff statistics');
        console.log('  status.js --commits 10     # With 10 recent commits');
        console.log('  status.js --show-all       # Show all untracked files\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  enhancedStatus(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { enhancedStatus };
