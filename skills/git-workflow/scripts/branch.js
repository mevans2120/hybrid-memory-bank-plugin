#!/usr/bin/env node

/**
 * Branch Management Script
 *
 * Create, switch, and list branches with naming convention support.
 */

const GitHelper = require('../lib/gitHelper');

async function manageBranch(workingDirectory = process.cwd(), options = {}) {
  const git = new GitHelper(workingDirectory);

  try {
    // Check if git repo
    if (!git.isGitRepo()) {
      console.log('\n❌ Not a git repository\n');
      return { success: false, error: 'Not a git repository' };
    }

    console.log('\n' + '='.repeat(70));
    console.log('🌿 Branch Management');
    console.log('='.repeat(70));

    // List branches
    if (options.list) {
      return listBranches(git);
    }

    // Create new branch
    if (options.create) {
      return createBranch(git, options.create, options.checkout);
    }

    // Switch branch
    if (options.switch) {
      return switchBranch(git, options.switch);
    }

    // Show current branch
    const currentBranch = git.getCurrentBranch();
    console.log(`\nCurrent branch: ${currentBranch || 'unknown'}\n`);
    console.log('💡 Tip: Use --list to see all branches, --create to make new branch\n');

    return { success: true, branch: currentBranch };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function listBranches(git) {
  const result = git.exec('git branch -a -vv');

  if (!result.success) {
    console.log('\n❌ Error listing branches:', result.error, '\n');
    return { success: false, error: result.error };
  }

  const currentBranch = git.getCurrentBranch();

  console.log('\n📋 Branches:\n');
  console.log(result.output);

  if (currentBranch) {
    console.log(`\n✓ Current branch: ${currentBranch}`);
  }

  console.log();

  return { success: true, branches: result.output };
}

function createBranch(git, branchName, checkout = true) {
  // Validate branch name
  const validNamePattern = /^[a-zA-Z0-9/_-]+$/;
  if (!validNamePattern.test(branchName)) {
    console.log('\n❌ Invalid branch name');
    console.log('   Branch names can only contain letters, numbers, /, -, and _\n');
    return { success: false, error: 'Invalid branch name' };
  }

  // Suggest conventional naming if not following patterns
  const commonPrefixes = ['feature/', 'fix/', 'hotfix/', 'release/', 'chore/'];
  const hasPrefix = commonPrefixes.some(prefix => branchName.startsWith(prefix));

  if (!hasPrefix) {
    console.log('\n💡 Suggested naming conventions:');
    console.log('   feature/  - New features');
    console.log('   fix/      - Bug fixes');
    console.log('   hotfix/   - Urgent fixes');
    console.log('   release/  - Release branches');
    console.log('   chore/    - Maintenance tasks\n');
  }

  const currentBranch = git.getCurrentBranch();
  console.log(`\nCreating branch: ${branchName}`);
  console.log(`From: ${currentBranch || 'current HEAD'}`);

  let result;
  if (checkout) {
    result = git.createBranch(branchName);
  } else {
    result = git.exec(`git branch ${branchName}`);
  }

  if (!result.success) {
    console.log('\n❌ Failed to create branch:', result.error, '\n');
    return { success: false, error: result.error };
  }

  console.log('\n✅ Branch created successfully');

  if (checkout) {
    console.log(`   Switched to branch: ${branchName}`);
  } else {
    console.log(`   Branch created: ${branchName}`);
    console.log(`   Still on: ${currentBranch}`);
  }

  console.log();

  return {
    success: true,
    created: branchName,
    checkedOut: checkout
  };
}

function switchBranch(git, branchName) {
  const currentBranch = git.getCurrentBranch();

  console.log(`\nSwitching from: ${currentBranch || 'unknown'}`);
  console.log(`           to: ${branchName}`);

  const result = git.checkoutBranch(branchName);

  if (!result.success) {
    console.log('\n❌ Failed to switch branch:', result.error);

    if (result.error.includes('did not match')) {
      console.log('\n💡 Tip: Use --list to see available branches\n');
    }

    console.log();
    return { success: false, error: result.error };
  }

  console.log('\n✅ Switched to branch:', branchName);
  console.log();

  return {
    success: true,
    branch: branchName,
    previousBranch: currentBranch
  };
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    list: false,
    create: null,
    switch: null,
    checkout: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--list':
      case '-l':
        options.list = true;
        break;
      case '--create':
      case '-c':
        options.create = nextArg;
        i++;
        break;
      case '--switch':
      case '-s':
        options.switch = nextArg;
        i++;
        break;
      case '--no-checkout':
        options.checkout = false;
        break;
      case '--help':
      case '-h':
        console.log('\nBranch Management Script\n');
        console.log('Create, switch, and list branches.\n');
        console.log('Usage: branch.js [options]\n');
        console.log('Options:');
        console.log('  --list, -l              List all branches');
        console.log('  --create, -c <name>     Create new branch (and checkout)');
        console.log('  --switch, -s <name>     Switch to existing branch');
        console.log('  --no-checkout           Create branch without checking out');
        console.log('  --help, -h              Show this help\n');
        console.log('Examples:');
        console.log('  branch.js                           # Show current branch');
        console.log('  branch.js --list                    # List all branches');
        console.log('  branch.js --create feature/login    # Create and switch to new branch');
        console.log('  branch.js --switch main             # Switch to main branch');
        console.log('  branch.js -c fix/bug --no-checkout  # Create branch without switching\n');
        console.log('Naming Conventions:');
        console.log('  feature/  - New features');
        console.log('  fix/      - Bug fixes');
        console.log('  hotfix/   - Urgent fixes');
        console.log('  release/  - Release branches');
        console.log('  chore/    - Maintenance tasks\n');
        process.exit(0);
      default:
        // First positional argument is treated as switch
        if (!arg.startsWith('-') && !options.switch && !options.create) {
          options.switch = arg;
        }
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  manageBranch(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { manageBranch };
