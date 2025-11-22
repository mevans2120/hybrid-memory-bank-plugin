#!/usr/bin/env node

/**
 * Show Changes Script
 *
 * Displays recent file changes from the current session.
 * Groups changes by file and shows chronological history.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');
const { formatRelativeTime } = require('../../shared-lib/utils');

async function showChanges(workingDirectory = process.cwd(), options = {}) {
  const memory = new MemoryStore(workingDirectory);

  try {
    const session = await memory.getCurrentSession();

    if (!session) {
      console.log('\n❌ No active session found\n');
      console.log('💡 Tip: Create a session with the init script\n');
      return { success: false, error: 'No active session' };
    }

    const { recentChanges } = session;
    const limit = options.limit || recentChanges.length;
    const filterFile = options.file;

    // Filter by file if specified
    let changes = recentChanges;
    if (filterFile) {
      const absoluteFilter = path.resolve(workingDirectory, filterFile);
      changes = changes.filter(c => c.file === absoluteFilter);
    }

    // Apply limit
    const displayChanges = changes.slice(0, limit);

    console.log('\n' + '='.repeat(70));
    console.log(`📁 Recent Changes (${displayChanges.length}/${recentChanges.length})`);
    console.log('='.repeat(70));

    if (displayChanges.length === 0) {
      console.log('\nNo changes recorded yet');
      console.log('💡 Tip: Use track-change.js to record file changes\n');
      return {
        success: true,
        changes: [],
        total: 0
      };
    }

    // Group by file for better display
    if (options.groupByFile !== false) {
      const fileGroups = {};

      displayChanges.forEach(change => {
        const shortPath = change.file.replace(workingDirectory, '.');
        if (!fileGroups[shortPath]) {
          fileGroups[shortPath] = [];
        }
        fileGroups[shortPath].push(change);
      });

      // Display grouped by file
      Object.entries(fileGroups).forEach(([file, fileChanges]) => {
        console.log(`\n${file}`);
        fileChanges.forEach(change => {
          const time = formatRelativeTime(change.timestamp);
          const action = change.action.padEnd(17);
          console.log(`  • ${action} ${time}`);
        });
      });
    } else {
      // Display chronologically
      console.log();
      displayChanges.forEach((change, i) => {
        const shortPath = change.file.replace(workingDirectory, '.');
        const time = formatRelativeTime(change.timestamp);
        const action = change.action.padEnd(17);
        console.log(`${i + 1}. ${shortPath}`);
        console.log(`   ${action} ${time}`);
      });
    }

    // Summary statistics
    console.log('\n' + '-'.repeat(70));
    console.log('Summary');
    console.log('-'.repeat(70));

    const actionCounts = {};
    displayChanges.forEach(change => {
      actionCounts[change.action] = (actionCounts[change.action] || 0) + 1;
    });

    console.log('\nActions:');
    Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([action, count]) => {
        console.log(`  ${action}: ${count}`);
      });

    const uniqueFiles = new Set(displayChanges.map(c => c.file)).size;
    console.log(`\nUnique Files: ${uniqueFiles}`);
    console.log(`Total Changes: ${displayChanges.length}`);

    if (recentChanges.length === 20) {
      console.log('\n💡 Tip: Buffer is full (20/20). Older changes have been removed.');
    }

    console.log();

    return {
      success: true,
      changes: displayChanges,
      total: displayChanges.length,
      stats: {
        uniqueFiles,
        actionCounts
      }
    };

  } catch (error) {
    console.error('\n❌ Error showing changes:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    limit: null,
    file: null,
    groupByFile: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--limit':
      case '-l':
        options.limit = parseInt(nextArg, 10);
        i++;
        break;
      case '--file':
      case '-f':
        options.file = nextArg;
        i++;
        break;
      case '--chronological':
      case '-c':
        options.groupByFile = false;
        break;
      case '--help':
      case '-h':
        console.log('\nShow Changes Script\n');
        console.log('Displays recent file changes from the current session.\n');
        console.log('Usage: show-changes.js [options]\n');
        console.log('Options:');
        console.log('  --limit, -l <n>       Show only N most recent changes');
        console.log('  --file, -f <path>     Filter by specific file');
        console.log('  --chronological, -c   Show in chronological order (not grouped)');
        console.log('  --help, -h            Show this help\n');
        console.log('Examples:');
        console.log('  show-changes.js');
        console.log('  show-changes.js --limit 10');
        console.log('  show-changes.js --file src/auth/middleware.ts');
        console.log('  show-changes.js --chronological\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  showChanges(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { showChanges };
