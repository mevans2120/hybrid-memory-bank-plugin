#!/usr/bin/env node

const path = require('path');
const TeamHelper = require('../lib/teamHelper');

/**
 * Team Patterns Script
 *
 * Manage shared team pattern library
 */

const USAGE = `
Usage: node team-patterns.js [options]

Options:
  --list [type]           List team patterns (all types or specific type)
  --add <type> <key>      Add pattern to team library (from stdin JSON)
  --get <type> <key>      Get specific pattern
  --types                 Show available pattern types
  --dry-run              Show what would be done without saving
  --help                 Show this help message

Pattern Types:
  - api-patterns
  - error-handling
  - ui-patterns
  - database-patterns

Examples:
  # List all team patterns
  node team-patterns.js --list

  # List specific type
  node team-patterns.js --list api-patterns

  # Add pattern from JSON
  echo '{"description":"JWT auth","example":"..."}' | node team-patterns.js --add api-patterns jwt-auth

  # Get specific pattern
  node team-patterns.js --get api-patterns jwt-auth
`;

const PATTERN_TYPES = ['api-patterns', 'error-handling', 'ui-patterns', 'database-patterns'];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    action: null,
    type: null,
    key: null,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--list') {
      options.action = 'list';
      options.type = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : null;
    } else if (arg === '--add') {
      options.action = 'add';
      options.type = args[++i];
      options.key = args[++i];
    } else if (arg === '--get') {
      options.action = 'get';
      options.type = args[++i];
      options.key = args[++i];
    } else if (arg === '--types') {
      options.action = 'types';
    }
  }

  return options;
}

function validatePatternType(type) {
  if (!PATTERN_TYPES.includes(type)) {
    console.error(`Error: Invalid pattern type '${type}'`);
    console.error(`Valid types: ${PATTERN_TYPES.join(', ')}`);
    process.exit(1);
  }
}

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function listPatterns(team, type) {
  if (type) {
    validatePatternType(type);
    const patterns = team.loadTeamPatterns(type);
    console.log(`\n📚 Team ${type}:\n`);

    if (Object.keys(patterns).length === 0) {
      console.log('  (no patterns yet)');
    } else {
      Object.entries(patterns).forEach(([key, pattern]) => {
        console.log(`  ${key}:`);
        console.log(`    Description: ${pattern.description || '(no description)'}`);
        console.log(`    Added: ${pattern.addedToTeam || 'unknown'}`);
        console.log(`    By: ${pattern.addedBy || 'unknown'}`);
        console.log();
      });
    }
  } else {
    const allPatterns = team.getAllTeamPatterns();
    console.log('\n📚 All Team Patterns:\n');

    PATTERN_TYPES.forEach(type => {
      const patterns = allPatterns[type] || {};
      const count = Object.keys(patterns).length;
      console.log(`  ${type}: ${count} pattern${count !== 1 ? 's' : ''}`);
    });
    console.log('\nUse --list <type> to see details for a specific type');
  }
}

async function getPattern(team, type, key) {
  validatePatternType(type);
  const patterns = team.loadTeamPatterns(type);

  if (!patterns[key]) {
    console.error(`Error: Pattern '${key}' not found in ${type}`);
    process.exit(1);
  }

  console.log(JSON.stringify(patterns[key], null, 2));
}

async function addPattern(team, type, key, options) {
  validatePatternType(type);

  // Read pattern data from stdin
  const stdinData = await readStdin();
  let patternData;

  try {
    patternData = JSON.parse(stdinData);
  } catch (error) {
    console.error('Error: Invalid JSON input');
    console.error('Provide pattern data as JSON via stdin');
    process.exit(1);
  }

  if (options.dryRun) {
    console.log('\n[DRY RUN] Would add pattern:');
    console.log(`  Type: ${type}`);
    console.log(`  Key: ${key}`);
    console.log(`  Data:`, JSON.stringify(patternData, null, 2));
    return;
  }

  const filePath = team.addTeamPattern(type, key, patternData);

  console.log(`\n✅ Pattern added to team library`);
  console.log(`  Type: ${type}`);
  console.log(`  Key: ${key}`);
  console.log(`  File: ${filePath}`);
  console.log(`\n💡 Commit and push to share with team`);
}

async function showTypes() {
  console.log('\n📋 Available Pattern Types:\n');
  PATTERN_TYPES.forEach(type => {
    console.log(`  - ${type}`);
  });
}

async function main() {
  const options = parseArgs();
  const team = new TeamHelper();

  if (!options.action) {
    console.log(USAGE);
    process.exit(1);
  }

  try {
    switch (options.action) {
      case 'list':
        await listPatterns(team, options.type);
        break;
      case 'get':
        if (!options.type || !options.key) {
          console.error('Error: --get requires type and key');
          process.exit(1);
        }
        await getPattern(team, options.type, options.key);
        break;
      case 'add':
        if (!options.type || !options.key) {
          console.error('Error: --add requires type and key');
          process.exit(1);
        }
        await addPattern(team, options.type, options.key, options);
        break;
      case 'types':
        await showTypes();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs, validatePatternType, PATTERN_TYPES };
