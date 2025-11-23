#!/usr/bin/env node

/**
 * Tech Stack Script
 *
 * Display and update project tech stack information.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');
const { formatRelativeTime } = require('../../shared-lib/utils');

async function techStack(workingDirectory = process.cwd(), options = {}) {
  const memory = new MemoryStore(workingDirectory);

  try {
    const { show, update } = options;

    // If updating
    if (update && Object.keys(update).length > 0) {
      const updated = await memory.updateTechStack(update);

      console.log('\n' + '='.repeat(70));
      console.log('✅ Tech Stack Updated');
      console.log('='.repeat(70));

      displayTechStack(updated);
      console.log();

      return {
        success: true,
        action: 'updated',
        techStack: updated
      };
    }

    // Show tech stack
    const techStack = await memory.getTechStack();

    if (!techStack || Object.keys(techStack).length === 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📦 Tech Stack');
      console.log('='.repeat(70));
      console.log('\nNo tech stack information recorded yet');
      console.log('\n💡 Tip: Use "tech-stack.js --framework React --language TypeScript" to add tech stack info\n');
      return {
        success: true,
        action: 'show',
        techStack: null,
        isEmpty: true
      };
    }

    console.log('\n' + '='.repeat(70));
    console.log('📦 Tech Stack');
    console.log('='.repeat(70));

    displayTechStack(techStack);
    console.log();

    return {
      success: true,
      action: 'show',
      techStack
    };

  } catch (error) {
    console.error('\n❌ Error managing tech stack:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function displayTechStack(techStack) {
  const { lastUpdated, ...fields } = techStack;

  console.log();

  // Common tech stack fields in order
  const commonFields = [
    'framework',
    'language',
    'runtime',
    'database',
    'orm',
    'stateManagement',
    'styling',
    'testing',
    'buildTool',
    'packageManager',
    'deployment',
    'cicd'
  ];

  // Display common fields first
  commonFields.forEach(field => {
    if (fields[field]) {
      const label = field.replace(/([A-Z])/g, ' $1').trim();
      const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);
      console.log(`${displayLabel.padEnd(18)}: ${fields[field]}`);
    }
  });

  // Display any custom fields
  Object.entries(fields).forEach(([key, value]) => {
    if (!commonFields.includes(key)) {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);
      console.log(`${displayLabel.padEnd(18)}: ${value}`);
    }
  });

  if (lastUpdated) {
    const timeAgo = formatRelativeTime(lastUpdated);
    console.log(`\nLast Updated: ${timeAgo}`);
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    show: true,
    update: {}
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--framework':
        options.update.framework = nextArg;
        i++;
        break;
      case '--language':
        options.update.language = nextArg;
        i++;
        break;
      case '--runtime':
        options.update.runtime = nextArg;
        i++;
        break;
      case '--database':
        options.update.database = nextArg;
        i++;
        break;
      case '--orm':
        options.update.orm = nextArg;
        i++;
        break;
      case '--state-management':
        options.update.stateManagement = nextArg;
        i++;
        break;
      case '--styling':
        options.update.styling = nextArg;
        i++;
        break;
      case '--testing':
        options.update.testing = nextArg;
        i++;
        break;
      case '--build-tool':
        options.update.buildTool = nextArg;
        i++;
        break;
      case '--package-manager':
        options.update.packageManager = nextArg;
        i++;
        break;
      case '--deployment':
        options.update.deployment = nextArg;
        i++;
        break;
      case '--cicd':
        options.update.cicd = nextArg;
        i++;
        break;
      case '--custom':
        // Custom field: --custom key=value
        if (nextArg && nextArg.includes('=')) {
          const [key, ...valueParts] = nextArg.split('=');
          const value = valueParts.join('=');
          options.update[key] = value;
          i++;
        }
        break;
      case '--help':
      case '-h':
        console.log('\nTech Stack Script\n');
        console.log('Display and update project tech stack information.\n');
        console.log('Usage: tech-stack.js [options]\n');
        console.log('Options:');
        console.log('  --framework <name>          Frontend/backend framework');
        console.log('  --language <name>           Programming language');
        console.log('  --runtime <name>            Runtime environment');
        console.log('  --database <name>           Database system');
        console.log('  --orm <name>                ORM/database client');
        console.log('  --state-management <name>   State management solution');
        console.log('  --styling <name>            CSS framework/solution');
        console.log('  --testing <name>            Testing framework');
        console.log('  --build-tool <name>         Build tool');
        console.log('  --package-manager <name>    Package manager');
        console.log('  --deployment <name>         Deployment platform');
        console.log('  --cicd <name>               CI/CD platform');
        console.log('  --custom key=value          Custom field');
        console.log('  --help, -h                  Show this help\n');
        console.log('Examples:');
        console.log('  tech-stack.js                                    # Show current tech stack');
        console.log('  tech-stack.js --framework React --language TypeScript');
        console.log('  tech-stack.js --database PostgreSQL --orm Prisma');
        console.log('  tech-stack.js --custom apiClient=TanStack Query\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  techStack(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { techStack };
