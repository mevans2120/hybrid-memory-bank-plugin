#!/usr/bin/env node

/**
 * Add Changelog Script
 *
 * Adds entries to CHANGELOG.md following Keep a Changelog format.
 */

const DocHelper = require('../lib/docHelper');
const path = require('path');

async function addChangelog(workingDirectory = process.cwd(), options = {}) {
  const doc = new DocHelper(workingDirectory);

  try {
    console.log('\n' + '='.repeat(70));
    console.log('📝 Add Changelog Entry');
    console.log('='.repeat(70));

    if (!options.entry) {
      console.log('\n⚠️  No entry provided');
      console.log('💡 Tip: Use --entry to specify what changed\n');
      return { success: false, error: 'No entry provided' };
    }

    const version = options.version || 'Unreleased';
    const date = options.date || doc.formatDate();
    const category = options.category || 'Added';

    console.log(`\nVersion: ${version}`);
    console.log(`Date: ${date}`);
    console.log(`Category: ${category}`);
    console.log(`Entry: ${options.entry}`);

    // Read or create CHANGELOG.md
    let changelog = doc.readMarkdownFile('CHANGELOG.md');
    if (!changelog) {
      changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
      console.log('\n✓ Creating new CHANGELOG.md');
    }

    // Find or create version section
    const versionHeader = `## [${version}] - ${date}`;
    const categoryHeader = `### ${category}`;
    const entry = `- ${options.entry}`;

    let updated;
    if (changelog.includes(versionHeader)) {
      // Version exists, add to category
      if (changelog.includes(categoryHeader)) {
        // Category exists, add entry
        const categoryIndex = changelog.indexOf(categoryHeader);
        const nextSectionIndex = changelog.indexOf('\n###', categoryIndex + 1);
        const insertPoint = nextSectionIndex > 0 ? nextSectionIndex : changelog.length;

        updated = changelog.slice(0, insertPoint) + `\n${entry}` + changelog.slice(insertPoint);
      } else {
        // Category doesn't exist, create it
        const versionIndex = changelog.indexOf(versionHeader);
        const nextVersionIndex = changelog.indexOf('\n##', versionIndex + 1);
        const insertPoint = nextVersionIndex > 0 ? nextVersionIndex : changelog.length;

        updated = changelog.slice(0, insertPoint) + `\n\n${categoryHeader}\n${entry}` + changelog.slice(insertPoint);
      }
    } else {
      // Version doesn't exist, create it
      const insertPoint = changelog.indexOf('\n## ');
      const newSection = `${versionHeader}\n\n${categoryHeader}\n${entry}\n\n`;

      if (insertPoint > 0) {
        updated = changelog.slice(0, insertPoint) + `\n${newSection}` + changelog.slice(insertPoint);
      } else {
        updated = changelog + `\n${newSection}`;
      }
    }

    if (options.dryRun) {
      console.log('\n' + '-'.repeat(70));
      console.log('Preview (dry-run):');
      console.log('-'.repeat(70));
      console.log(updated);
      console.log('-'.repeat(70));
      console.log('\n✓ Dry run complete - no file written\n');
      return { success: true, dryRun: true, content: updated };
    }

    doc.writeMarkdownFile('CHANGELOG.md', updated);
    console.log('\n✅ Added entry to CHANGELOG.md\n');

    return {
      success: true,
      added: true,
      version,
      category,
      file: path.join(doc.memoryBankPath, 'CHANGELOG.md')
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    dryRun: false,
    entry: null,
    version: 'Unreleased',
    date: null,
    category: 'Added'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--dry-run':
      case '-n':
        options.dryRun = true;
        break;
      case '--entry':
      case '-e':
        options.entry = nextArg;
        i++;
        break;
      case '--version':
      case '-v':
        options.version = nextArg;
        i++;
        break;
      case '--date':
      case '-d':
        options.date = nextArg;
        i++;
        break;
      case '--category':
      case '-c':
        options.category = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        console.log('\nAdd Changelog Script\n');
        console.log('Adds entries to CHANGELOG.md in Keep a Changelog format.\n');
        console.log('Usage: add-changelog.js --entry "<description>" [options]\n');
        console.log('Options:');
        console.log('  --entry, -e <text>      Entry description (required)');
        console.log('  --version, -v <ver>     Version number (default: Unreleased)');
        console.log('  --date, -d <date>       Release date (default: today)');
        console.log('  --category, -c <cat>    Category (default: Added)');
        console.log('  --dry-run, -n           Preview without writing file');
        console.log('  --help, -h              Show this help\n');
        console.log('Categories:');
        console.log('  Added       - New features');
        console.log('  Changed     - Changes in existing functionality');
        console.log('  Deprecated  - Soon-to-be removed features');
        console.log('  Removed     - Removed features');
        console.log('  Fixed       - Bug fixes');
        console.log('  Security    - Security fixes\n');
        console.log('Examples:');
        console.log('  add-changelog.js --entry "User authentication system"');
        console.log('  add-changelog.js --entry "Login bug fix" --category Fixed');
        console.log('  add-changelog.js --entry "API v2" --version "2.0.0"\n');
        process.exit(0);
      default:
        // First non-option arg is entry
        if (!arg.startsWith('-') && !options.entry) {
          options.entry = arg;
        }
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  addChangelog(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { addChangelog };
