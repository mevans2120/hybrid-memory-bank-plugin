#!/usr/bin/env node

const path = require('path');
const readline = require('readline');
const TeamHelper = require('../lib/teamHelper');

/**
 * Team Memory Sync
 *
 * Synchronize personal patterns from memory-core to team library
 */

const USAGE = `
Usage: node team-sync.js [options]

Options:
  --cwd <path>           Working directory with .claude-memory (default: cwd)
  --auto-approve         Automatically approve all patterns
  --dry-run              Show what would be synced without making changes
  --help                 Show this help message

The script will:
  1. Load personal patterns from .claude-memory/patterns/
  2. Compare with team patterns
  3. Prompt for approval to add new patterns to team library

Examples:
  # Interactive sync
  node team-sync.js

  # Sync from specific directory
  node team-sync.js --cwd /path/to/project

  # Preview without changes
  node team-sync.js --dry-run

  # Auto-approve all (use with caution)
  node team-sync.js --auto-approve
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    cwd: process.cwd(),
    autoApprove: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--auto-approve') {
      options.autoApprove = true;
    } else if (arg === '--cwd') {
      options.cwd = args[++i];
    }
  }

  return options;
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function promptForPattern(rl, pattern) {
  console.log(`\n📋 New pattern found:`);
  console.log(`   Type: ${pattern.type}`);
  console.log(`   Key: ${pattern.key}`);
  console.log(`   Description: ${pattern.pattern.description || '(no description)'}`);

  const answer = await askQuestion(rl, '\n   Add to team library? (y/n/q): ');

  if (answer === 'q') {
    return 'quit';
  }

  return answer === 'y' || answer === 'yes';
}

async function syncPatterns(team, options) {
  console.log('\n🔄 Syncing personal patterns to team library...\n');

  // Load personal and team patterns
  const personalPatterns = team.loadPersonalPatterns(options.cwd);
  const teamPatterns = team.getAllTeamPatterns();

  // Find new patterns
  const newPatterns = team.findNewPatterns(personalPatterns, teamPatterns);

  if (newPatterns.length === 0) {
    console.log('✅ All personal patterns are already in team library');
    console.log('   No sync needed');
    return;
  }

  console.log(`Found ${newPatterns.length} new pattern${newPatterns.length !== 1 ? 's' : ''} to sync:`);

  if (options.dryRun) {
    console.log('\n[DRY RUN] Would sync:');
    newPatterns.forEach(p => {
      console.log(`  - ${p.type}/${p.key}`);
    });
    return;
  }

  let approved = 0;
  let skipped = 0;
  const rl = options.autoApprove ? null : createInterface();

  try {
    for (const pattern of newPatterns) {
      let shouldAdd = options.autoApprove;

      if (!shouldAdd) {
        const response = await promptForPattern(rl, pattern);

        if (response === 'quit') {
          console.log('\n⏸️  Sync cancelled by user');
          break;
        }

        shouldAdd = response;
      }

      if (shouldAdd) {
        team.addTeamPattern(pattern.type, pattern.key, pattern.pattern);
        approved++;
        console.log(`   ✅ Added ${pattern.type}/${pattern.key}`);
      } else {
        skipped++;
        console.log(`   ⏭️  Skipped ${pattern.type}/${pattern.key}`);
      }
    }

    console.log(`\n📊 Sync Summary:`);
    console.log(`   Added: ${approved}`);
    console.log(`   Skipped: ${skipped}`);

    if (approved > 0) {
      console.log(`\n💡 Commit and push to share with team`);
    }

  } finally {
    if (rl) {
      rl.close();
    }
  }
}

async function main() {
  const options = parseArgs();
  const team = new TeamHelper();

  try {
    await syncPatterns(team, options);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs, syncPatterns };
