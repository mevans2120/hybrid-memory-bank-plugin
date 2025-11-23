#!/usr/bin/env node

/**
 * Safe Push Script
 *
 * Pushes to remote with mandatory user approval gate.
 * Shows what will be pushed and requires explicit confirmation.
 */

const GitHelper = require('../lib/gitHelper');

async function safePush(workingDirectory = process.cwd(), options = {}) {
  const git = new GitHelper(workingDirectory);

  try {
    // Check if git repo
    if (!git.isGitRepo()) {
      console.log('\n❌ Not a git repository\n');
      return { success: false, error: 'Not a git repository' };
    }

    const currentBranch = git.getCurrentBranch();
    if (!currentBranch) {
      console.log('\n❌ Could not determine current branch\n');
      return { success: false, error: 'No current branch' };
    }

    const remote = options.remote || 'origin';

    console.log('\n' + '='.repeat(70));
    console.log('🚀 Safe Push');
    console.log('='.repeat(70));

    // Get remote status
    const remoteStatus = git.getRemoteStatus();
    if (!remoteStatus) {
      console.log('\n⚠️  Remote tracking not set up');
      console.log(`Current branch: ${currentBranch}`);
      console.log(`Remote: ${remote}\n`);

      if (options.setupUpstream) {
        console.log('Setting up remote tracking...');
        const result = git.exec(`git push -u ${remote} ${currentBranch}`);
        if (!result.success) {
          console.log('\n❌ Failed to push:', result.error, '\n');
          return { success: false, error: result.error };
        }
        console.log('\n✅ Pushed and set up remote tracking\n');
        return { success: true, pushed: true, setupUpstream: true };
      }

      console.log('💡 Tip: Run with --setup-upstream to set up remote tracking\n');
      return { success: false, error: 'Remote tracking not set up' };
    }

    const { ahead, behind, branch } = remoteStatus;

    console.log(`\nBranch: ${branch}`);
    console.log(`Remote: ${remote}/${branch}`);
    console.log(`Ahead: ${ahead} commit${ahead !== 1 ? 's' : ''}`);
    console.log(`Behind: ${behind} commit${behind !== 1 ? 's' : ''}`);

    // Check if behind remote
    if (behind > 0) {
      console.log('\n⚠️  Your branch is behind the remote');
      console.log('💡 Tip: Pull changes first with "git pull"\n');

      if (!options.force) {
        return { success: false, error: 'Branch behind remote' };
      }

      console.log('⚠️  Force push requested - this will overwrite remote changes!\n');
    }

    // Check if there's anything to push
    if (ahead === 0) {
      console.log('\n✓ Already up to date - nothing to push\n');
      return { success: true, upToDate: true };
    }

    // Show commits that will be pushed
    const commits = git.getRecentCommits(Math.min(ahead, 10));
    console.log('\n📝 Commits to Push:');
    commits.forEach(({ hash, subject, author, date }) => {
      console.log(`  ${hash} ${subject}`);
      console.log(`       by ${author} ${date}`);
    });

    if (ahead > 10) {
      console.log(`  ... and ${ahead - 10} more commits`);
    }

    console.log();

    // Dry run - stop here
    if (options.dryRun) {
      console.log('✓ Dry run complete - no push executed\n');
      return {
        success: true,
        dryRun: true,
        ahead,
        behind,
        commits
      };
    }

    // Auto-approve
    if (options.yes) {
      return executePush(git, remote, currentBranch, options.force, ahead);
    }

    // Interactive approval
    console.log('❓ Ready to push to remote?');
    console.log('   Run with --yes to approve\n');

    return {
      success: true,
      requiresApproval: true,
      ahead,
      commits
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function executePush(git, remote, branch, force, commitCount) {
  console.log('⏳ Pushing to remote...');

  const pushCmd = force
    ? `git push --force ${remote} ${branch}`
    : `git push ${remote} ${branch}`;

  const result = git.exec(pushCmd);

  if (!result.success) {
    console.log('\n❌ Push failed:', result.error);
    if (result.stderr) {
      console.log(result.stderr);
    }
    console.log();
    return { success: false, error: result.error };
  }

  console.log('\n✅ Successfully pushed!');
  console.log(`   ${commitCount} commit${commitCount !== 1 ? 's' : ''} pushed to ${remote}/${branch}`);
  console.log();

  return {
    success: true,
    pushed: true,
    commitCount,
    remote,
    branch
  };
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    remote: 'origin',
    dryRun: false,
    yes: false,
    force: false,
    setupUpstream: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--remote':
      case '-r':
        options.remote = nextArg;
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
      case '--force':
      case '-f':
        options.force = true;
        break;
      case '--setup-upstream':
      case '-u':
        options.setupUpstream = true;
        options.yes = true; // Auto-approve when setting up upstream
        break;
      case '--help':
      case '-h':
        console.log('\nSafe Push Script\n');
        console.log('Pushes to remote with mandatory approval gate.\n');
        console.log('Usage: push.js [options]\n');
        console.log('Options:');
        console.log('  --remote, -r <name>    Remote name (default: origin)');
        console.log('  --dry-run, -n          Show what would be pushed without pushing');
        console.log('  --yes, -y              Skip approval and push immediately');
        console.log('  --force, -f            Force push (overwrite remote)');
        console.log('  --setup-upstream, -u   Set up remote tracking and push');
        console.log('  --help, -h             Show this help\n');
        console.log('Examples:');
        console.log('  push.js                      # Preview what will be pushed');
        console.log('  push.js --dry-run            # Show commits without pushing');
        console.log('  push.js --yes                # Push with approval');
        console.log('  push.js --setup-upstream     # Set up tracking and push');
        console.log('  push.js --force --yes        # Force push (use with caution!)\n');
        console.log('Security:');
        console.log('  • Never pushes without --yes flag');
        console.log('  • Warns when branch is behind remote');
        console.log('  • Requires explicit --force for force push\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  safePush(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { safePush };
