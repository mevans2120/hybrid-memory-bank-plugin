#!/usr/bin/env node

/**
 * Add Progress Script
 *
 * Adds session summary to progress.md from memory-core session data.
 * Formats as standardized session entry.
 */

const DocHelper = require('../lib/docHelper');
const path = require('path');

async function addProgress(workingDirectory = process.cwd(), options = {}) {
  const doc = new DocHelper(workingDirectory);

  try {
    console.log('\n' + '='.repeat(70));
    console.log('📝 Add Progress Entry');
    console.log('='.repeat(70));

    // Load session data
    const session = doc.loadSessionData();
    if (!session) {
      console.log('\n⚠️  No active session found');
      console.log('💡 Tip: Initialize a session with memory-core init script\n');
      return { success: false, error: 'No session data' };
    }

    // Read existing progress.md
    const existing = doc.readMarkdownFile('progress.md') || '';

    // Check for duplicate
    const sessionHeader = `## Session ${session.sessionId}`;
    if (doc.contentExists(existing, sessionHeader)) {
      console.log('\n⚠️  Session entry already exists in progress.md');
      console.log(`Session: ${session.sessionId}`);
      console.log('\n💡 Tip: Archive this session first, or use --force to override\n');

      if (!options.force) {
        return { success: false, error: 'Duplicate session entry' };
      }
      console.log('⚠️  Force mode: will add anyway\n');
    }

    console.log(`\nSession: ${session.sessionId}`);

    // Calculate duration
    const duration = doc.formatDuration(session.startedAt);
    console.log(`Duration: ${duration}`);

    // Generate entry from template
    const template = doc.loadTemplate('progress-entry');

    const data = {
      sessionId: session.sessionId,
      duration: duration,
      focus: options.focus || session.currentTask?.feature || 'Development work',
      completed: formatCompleted(session, options),
      filesCreated: formatFilesCreated(session),
      filesModified: formatFilesModified(session),
      testResults: options.testResults || 'Not specified',
      notes: formatNotes(session, options)
    };

    let entry = doc.renderTemplate(template, data);

    // Preview
    console.log('\n' + '-'.repeat(70));
    console.log('Entry Preview:');
    console.log('-'.repeat(70));
    console.log(entry);
    console.log('-'.repeat(70));

    if (options.dryRun) {
      console.log('\n✓ Dry run complete - no file written\n');
      return { success: true, dryRun: true, entry };
    }

    // Append to progress.md
    doc.appendToMarkdownFile('progress.md', entry);
    console.log('\n✅ Added entry to progress.md\n');

    return {
      success: true,
      added: true,
      session: session.sessionId,
      file: path.join(doc.memoryBankPath, 'progress.md')
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

function formatCompleted(session, options) {
  const items = [];

  if (options.completed) {
    // Use provided completed items
    const completedItems = options.completed.split(',').map(s => s.trim());
    completedItems.forEach(item => items.push(`- ${item}`));
  } else {
    // Generate from session data
    if (session.currentTask?.feature) {
      items.push(`- ${session.currentTask.feature}`);
    }

    if (session.recentChanges && session.recentChanges.length > 0) {
      items.push(`- Modified ${session.recentChanges.length} files`);
    }
  }

  return items.length > 0 ? items.join('\n') : '- No specific tasks recorded';
}

function formatFilesCreated(session) {
  if (!session.recentChanges) return 'None';

  const created = session.recentChanges
    .filter(c => c.action === 'created' || c.action === 'created/updated')
    .map(c => c.file.replace(process.cwd(), '.'));

  if (created.length === 0) return 'None';

  return created.map(f => `- ${f}`).join('\n');
}

function formatFilesModified(session) {
  if (!session.recentChanges) return 'None';

  const modified = session.recentChanges
    .filter(c => c.action === 'modified')
    .map(c => c.file.replace(process.cwd(), '.'));

  if (modified.length === 0) return 'None';

  return modified.map(f => `- ${f}`).join('\n');
}

function formatNotes(session, options) {
  const notes = [];

  if (options.notes) {
    const noteItems = options.notes.split(',').map(s => s.trim());
    noteItems.forEach(note => notes.push(`- ${note}`));
  } else if (session.contextNotes && session.contextNotes.length > 0) {
    session.contextNotes.forEach(note => notes.push(`- ${note}`));
  }

  return notes.length > 0 ? notes.join('\n') : '- No additional notes';
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    dryRun: false,
    force: false,
    focus: null,
    completed: null,
    testResults: null,
    notes: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--dry-run':
      case '-n':
        options.dryRun = true;
        break;
      case '--force':
      case '-f':
        options.force = true;
        break;
      case '--focus':
        options.focus = nextArg;
        i++;
        break;
      case '--completed':
      case '-c':
        options.completed = nextArg;
        i++;
        break;
      case '--test-results':
      case '-t':
        options.testResults = nextArg;
        i++;
        break;
      case '--notes':
        options.notes = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        console.log('\nAdd Progress Script\n');
        console.log('Adds session summary to progress.md from session data.\n');
        console.log('Usage: add-progress.js [options]\n');
        console.log('Options:');
        console.log('  --dry-run, -n               Preview without writing file');
        console.log('  --force, -f                 Add even if session exists');
        console.log('  --focus <text>              Session focus description');
        console.log('  --completed, -c <list>      Comma-separated completed items');
        console.log('  --test-results, -t <text>   Test results summary');
        console.log('  --notes <list>              Comma-separated notes');
        console.log('  --help, -h                  Show this help\n');
        console.log('Examples:');
        console.log('  add-progress.js                                  # Auto-generate from session');
        console.log('  add-progress.js --dry-run                        # Preview entry');
        console.log('  add-progress.js --focus "Phase 6 complete"');
        console.log('  add-progress.js --completed "Script A,Script B,Tests"');
        console.log('  add-progress.js --test-results "All tests passing"\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  addProgress(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { addProgress };
