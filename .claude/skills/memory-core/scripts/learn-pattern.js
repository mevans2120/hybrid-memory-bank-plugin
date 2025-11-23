#!/usr/bin/env node

/**
 * Learn Pattern Script
 *
 * Stores code patterns for future reference.
 * Supports multiple pattern types: api-patterns, error-handling, ui-patterns, database-patterns.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');

async function learnPattern(workingDirectory = process.cwd(), options = {}) {
  const memory = new MemoryStore(workingDirectory);

  try {
    const { patternType, patternKey, pattern, example, usage, description } = options;

    // Validate pattern type
    const validTypes = ['api-patterns', 'error-handling', 'ui-patterns', 'database-patterns'];
    if (!validTypes.includes(patternType)) {
      console.log('\n❌ Invalid pattern type\n');
      console.log(`Valid types: ${validTypes.join(', ')}\n`);
      return { success: false, error: 'Invalid pattern type' };
    }

    // Validate pattern key
    if (!patternKey || patternKey.trim() === '') {
      console.log('\n❌ Pattern key is required\n');
      return { success: false, error: 'Missing pattern key' };
    }

    // Build pattern object
    const patternData = {};

    if (pattern) patternData.pattern = pattern;
    if (description) patternData.description = description;
    if (example) patternData.example = example;
    if (usage) patternData.usage = usage;

    // Require at least one field
    if (Object.keys(patternData).length === 0) {
      console.log('\n❌ At least one of --pattern, --description, --example, or --usage is required\n');
      return { success: false, error: 'Missing pattern data' };
    }

    // Learn the pattern
    await memory.learnPattern(patternType, patternKey, patternData);

    console.log('\n' + '='.repeat(70));
    console.log(`✅ Pattern Learned: ${patternKey}`);
    console.log('='.repeat(70));
    console.log(`\nType: ${patternType}`);
    console.log(`Key: ${patternKey}`);

    if (patternData.pattern) {
      console.log(`\nPattern:\n  ${patternData.pattern}`);
    }
    if (patternData.description) {
      console.log(`\nDescription:\n  ${patternData.description}`);
    }
    if (patternData.example) {
      console.log(`\nExample:\n${patternData.example.split('\n').map(line => '  ' + line).join('\n')}`);
    }
    if (patternData.usage) {
      console.log(`\nUsage:\n  ${patternData.usage}`);
    }

    console.log(`\n💡 Tip: Use "show-patterns.js ${patternType}" to see all ${patternType}\n`);

    return {
      success: true,
      patternType,
      patternKey,
      data: patternData
    };

  } catch (error) {
    console.error('\n❌ Error learning pattern:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    patternType: null,
    patternKey: null,
    pattern: null,
    example: null,
    usage: null,
    description: null
  };

  // First positional arg is pattern type
  // Second positional arg is pattern key
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--pattern':
      case '-p':
        options.pattern = nextArg;
        i++;
        break;
      case '--description':
      case '-d':
        options.description = nextArg;
        i++;
        break;
      case '--example':
      case '-e':
        options.example = nextArg;
        i++;
        break;
      case '--usage':
      case '-u':
        options.usage = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        console.log('\nLearn Pattern Script\n');
        console.log('Stores code patterns for future reference.\n');
        console.log('Usage: learn-pattern.js <type> <key> [options]\n');
        console.log('Arguments:');
        console.log('  type                  Pattern type (api-patterns, error-handling, ui-patterns, database-patterns)');
        console.log('  key                   Unique pattern identifier\n');
        console.log('Options:');
        console.log('  --pattern, -p <text>      Pattern description');
        console.log('  --description, -d <text>  Detailed description');
        console.log('  --example, -e <code>      Code example');
        console.log('  --usage, -u <text>        Usage instructions');
        console.log('  --help, -h                Show this help\n');
        console.log('Examples:');
        console.log('  learn-pattern.js api-patterns rest-endpoint \\');
        console.log('    --pattern "RESTful endpoint with error handling" \\');
        console.log('    --example "app.get(\'/api/users\', async (req, res) => { ... })"');
        console.log('\n  learn-pattern.js error-handling try-catch \\');
        console.log('    --pattern "Standard try-catch with logging" \\');
        console.log('    --usage "Use for all async operations"\n');
        process.exit(0);
      default:
        // Collect positional arguments
        if (!arg.startsWith('-')) {
          positional.push(arg);
        }
    }
  }

  // Assign positional arguments
  if (positional.length >= 1) options.patternType = positional[0];
  if (positional.length >= 2) options.patternKey = positional[1];

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    parseArgs(['--help']);
  }

  const options = parseArgs(args);

  learnPattern(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { learnPattern };
