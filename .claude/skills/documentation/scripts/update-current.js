#!/usr/bin/env node

/**
 * Update CURRENT.md Script
 *
 * Updates CURRENT.md with fresh session data from memory-core.
 * Preserves existing content and updates specific sections.
 */

const DocHelper = require('../lib/docHelper');
const path = require('path');

async function updateCurrent(workingDirectory = process.cwd(), options = {}) {
  const doc = new DocHelper(workingDirectory);

  try {
    console.log('\n' + '='.repeat(70));
    console.log('📝 Update CURRENT.md');
    console.log('='.repeat(70));

    // Load session data
    const session = doc.loadSessionData();
    if (!session) {
      console.log('\n⚠️  No active session found');
      console.log('💡 Tip: Initialize a session with memory-core init script\n');
      return { success: false, error: 'No session data' };
    }

    // Read existing CURRENT.md
    const existing = doc.readMarkdownFile('CURRENT.md');
    if (!existing) {
      console.log('\n⚠️  CURRENT.md not found');
      console.log('💡 Tip: Create CURRENT.md first\n');
      return { success: false, error: 'CURRENT.md not found' };
    }

    console.log(`\nSession: ${session.sessionId}`);
    console.log(`Started: ${new Date(session.startedAt).toLocaleString()}`);

    // Parse existing sections
    const sections = doc.parseMarkdownSections(existing);

    // Update Recent Changes section
    if (options.updateChanges !== false) {
      const recentChanges = formatRecentChanges(session, doc);
      sections[`Recent Changes (${doc.formatDate()})`] = recentChanges;
      console.log('\n✓ Updated Recent Changes section');
    }

    // Update Context section (if provided)
    if (options.context) {
      sections['Context'] = options.context;
      console.log('✓ Updated Context section');
    }

    // Update Next Steps (if provided)
    if (options.nextSteps) {
      sections['Next Steps'] = options.nextSteps;
      console.log('✓ Updated Next Steps section');
    }

    // Assemble updated content
    let updated = existing;
    Object.entries(sections).forEach(([name, content]) => {
      updated = doc.updateSection(updated, name, content);
    });

    // Add last updated timestamp
    updated = updated.replace(
      /\*Last updated:.*?\*/,
      `*Last updated: ${doc.formatDate()}*`
    );

    // Write updated file
    if (options.dryRun) {
      console.log('\n' + '-'.repeat(70));
      console.log('Preview (dry-run):');
      console.log('-'.repeat(70));
      console.log(updated);
      console.log('-'.repeat(70));
      console.log('\n✓ Dry run complete - no file written\n');
      return { success: true, dryRun: true, content: updated };
    }

    doc.writeMarkdownFile('CURRENT.md', updated);
    console.log('\n✅ CURRENT.md updated successfully\n');

    return {
      success: true,
      updated: true,
      file: path.join(doc.memoryBankPath, 'CURRENT.md')
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function formatRecentChanges(session, doc) {
  const lines = [];

  // Current task
  if (session.currentTask && session.currentTask.feature) {
    lines.push(`- **${session.currentTask.feature}**:`);

    if (session.currentTask.progress) {
      lines.push(`  - Status: ${session.currentTask.progress}`);
    }

    if (session.currentTask.files && session.currentTask.files.length > 0) {
      lines.push(`  - Files: ${session.currentTask.files.length}`);
    }
  }

  // Recent file changes
  if (session.recentChanges && session.recentChanges.length > 0) {
    lines.push('');
    lines.push('- **File Changes**:');

    // Group by action type
    const byAction = {};
    session.recentChanges.forEach(change => {
      const action = change.action || 'modified';
      if (!byAction[action]) byAction[action] = [];
      byAction[action].push(change);
    });

    Object.entries(byAction).forEach(([action, changes]) => {
      lines.push(`  - ${action}: ${changes.length} file${changes.length !== 1 ? 's' : ''}`);
    });
  }

  // Context notes
  if (session.contextNotes && session.contextNotes.length > 0) {
    lines.push('');
    lines.push('- **Notes**:');
    session.contextNotes.slice(-3).forEach(note => {
      lines.push(`  - ${note}`);
    });
  }

  return lines.length > 0 ? lines.join('\n') : 'No recent changes';
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    dryRun: false,
    updateChanges: true,
    context: null,
    nextSteps: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--dry-run':
      case '-n':
        options.dryRun = true;
        break;
      case '--context':
      case '-c':
        options.context = nextArg;
        i++;
        break;
      case '--next-steps':
      case '-s':
        options.nextSteps = nextArg;
        i++;
        break;
      case '--no-changes':
        options.updateChanges = false;
        break;
      case '--help':
      case '-h':
        console.log('\nUpdate CURRENT.md Script\n');
        console.log('Updates CURRENT.md with session data from memory-core.\n');
        console.log('Usage: update-current.js [options]\n');
        console.log('Options:');
        console.log('  --dry-run, -n           Preview without writing file');
        console.log('  --context, -c <text>    Update Context section');
        console.log('  --next-steps, -s <text> Update Next Steps section');
        console.log('  --no-changes            Skip updating Recent Changes');
        console.log('  --help, -h              Show this help\n');
        console.log('Examples:');
        console.log('  update-current.js                    # Update with session data');
        console.log('  update-current.js --dry-run          # Preview changes');
        console.log('  update-current.js --context "Phase 6 complete"\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  updateCurrent(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { updateCurrent };
