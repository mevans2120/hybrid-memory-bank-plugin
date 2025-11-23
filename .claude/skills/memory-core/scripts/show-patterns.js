#!/usr/bin/env node

/**
 * Show Patterns Script
 *
 * Displays learned code patterns by type or all patterns.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');
const { formatRelativeTime } = require('../../shared-lib/utils');

async function showPatterns(workingDirectory = process.cwd(), options = {}) {
  const memory = new MemoryStore(workingDirectory);

  try {
    const { patternType, key } = options;

    // Valid pattern types
    const validTypes = ['api-patterns', 'error-handling', 'ui-patterns', 'database-patterns'];

    // If specific pattern type requested
    if (patternType) {
      if (!validTypes.includes(patternType)) {
        console.log('\n❌ Invalid pattern type\n');
        console.log(`Valid types: ${validTypes.join(', ')}\n`);
        return { success: false, error: 'Invalid pattern type' };
      }

      const patterns = await memory.getPatterns(patternType);

      if (!patterns || Object.keys(patterns).length === 0) {
        console.log('\n' + '='.repeat(70));
        console.log(`📦 ${patternType}`);
        console.log('='.repeat(70));
        console.log('\nNo patterns learned yet');
        console.log(`\n💡 Tip: Use "learn-pattern.js ${patternType} <key>" to add patterns\n`);
        return {
          success: true,
          patternType,
          patterns: {},
          count: 0
        };
      }

      // If specific key requested
      if (key) {
        const pattern = patterns[key];
        if (!pattern) {
          console.log(`\n❌ Pattern "${key}" not found in ${patternType}\n`);
          return { success: false, error: 'Pattern not found' };
        }

        displayPattern(key, pattern, patternType);
        return {
          success: true,
          patternType,
          key,
          pattern
        };
      }

      // Display all patterns of this type
      console.log('\n' + '='.repeat(70));
      console.log(`📦 ${patternType} (${Object.keys(patterns).length})`);
      console.log('='.repeat(70));

      Object.entries(patterns).forEach(([key, pattern], index) => {
        if (index > 0) console.log('\n' + '-'.repeat(70));
        displayPattern(key, pattern, patternType);
      });

      console.log();
      return {
        success: true,
        patternType,
        patterns,
        count: Object.keys(patterns).length
      };
    }

    // Show all pattern types
    console.log('\n' + '='.repeat(70));
    console.log('📚 All Patterns');
    console.log('='.repeat(70));

    let totalCount = 0;
    const allPatterns = {};

    for (const type of validTypes) {
      const patterns = await memory.getPatterns(type);
      const count = patterns ? Object.keys(patterns).length : 0;
      totalCount += count;
      allPatterns[type] = patterns || {};

      console.log(`\n${type}: ${count} pattern${count !== 1 ? 's' : ''}`);

      if (patterns && Object.keys(patterns).length > 0) {
        Object.keys(patterns).forEach(key => {
          console.log(`  • ${key}`);
        });
      }
    }

    if (totalCount === 0) {
      console.log('\n💡 Tip: Use "learn-pattern.js <type> <key>" to add patterns');
    } else {
      console.log(`\nTotal: ${totalCount} pattern${totalCount !== 1 ? 's' : ''} across ${validTypes.length} types`);
      console.log('\n💡 Tip: Use "show-patterns.js <type>" to see pattern details');
    }

    console.log();

    return {
      success: true,
      patterns: allPatterns,
      count: totalCount
    };

  } catch (error) {
    console.error('\n❌ Error showing patterns:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function displayPattern(key, pattern, patternType) {
  console.log(`\n🔖 ${key}`);

  if (pattern.description) {
    console.log(`\nDescription:\n  ${pattern.description}`);
  }

  if (pattern.pattern) {
    console.log(`\nPattern:\n  ${pattern.pattern}`);
  }

  if (pattern.example) {
    console.log('\nExample:');
    pattern.example.split('\n').forEach(line => {
      console.log(`  ${line}`);
    });
  }

  if (pattern.usage) {
    console.log(`\nUsage:\n  ${pattern.usage}`);
  }

  if (pattern.learnedAt) {
    const timeAgo = formatRelativeTime(pattern.learnedAt);
    console.log(`\nLearned: ${timeAgo}`);
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    patternType: null,
    key: null
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        console.log('\nShow Patterns Script\n');
        console.log('Displays learned code patterns by type or all patterns.\n');
        console.log('Usage: show-patterns.js [type] [key]\n');
        console.log('Arguments:');
        console.log('  type    Optional pattern type (api-patterns, error-handling, ui-patterns, database-patterns)');
        console.log('  key     Optional pattern key (requires type)\n');
        console.log('Examples:');
        console.log('  show-patterns.js                    # Show all patterns (summary)');
        console.log('  show-patterns.js api-patterns       # Show all API patterns (detailed)');
        console.log('  show-patterns.js api-patterns rest  # Show specific pattern\n');
        process.exit(0);
      default:
        if (!arg.startsWith('-')) {
          positional.push(arg);
        }
    }
  }

  // Assign positional arguments
  if (positional.length >= 1) options.patternType = positional[0];
  if (positional.length >= 2) options.key = positional[1];

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  showPatterns(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { showPatterns };
