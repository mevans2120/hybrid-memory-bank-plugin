#!/usr/bin/env node

/**
 * Session Archive Script
 *
 * Archives the current session and displays a summary.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');
const { formatDate, formatRelativeTime } = require('../../shared-lib/utils');

async function archiveSession(workingDirectory = process.cwd()) {
  const memory = new MemoryStore(workingDirectory);

  try {
    const session = await memory.getCurrentSession();

    if (!session) {
      console.log('\n❌ No active session to archive\n');
      console.log('💡 Tip: Create a new session with the init script\n');
      return { success: false, error: 'No active session' };
    }

    // Calculate session statistics
    const startTime = new Date(session.startedAt);
    const now = new Date();
    const durationMs = now - startTime;
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const durationStr = hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;

    // Display session summary before archiving
    console.log('\n' + '='.repeat(70));
    console.log('📦 Archiving Session');
    console.log('='.repeat(70));

    console.log(`\nSession ID:           ${session.sessionId}`);
    console.log(`Started:              ${formatDate(session.startedAt)}`);
    console.log(`Duration:             ${durationStr}`);

    if (session.currentTask.feature) {
      console.log(`\nCompleted Task:       ${session.currentTask.feature}`);
      console.log(`Final Status:         ${session.currentTask.progress}`);
    }

    console.log(`\nFiles Tracked:        ${session.currentTask.files.length}`);
    console.log(`Changes Recorded:     ${session.recentChanges.length}`);
    console.log(`Context Notes:        ${session.contextNotes.length}`);

    if (session.activeBugs && session.activeBugs.length > 0) {
      console.log(`Active Bugs:          ${session.activeBugs.length}`);
    }

    // Files worked on
    if (session.currentTask.files.length > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log('Files Worked On:');
      console.log('-'.repeat(70));
      session.currentTask.files.forEach((file, i) => {
        const shortPath = file.replace(workingDirectory, '.');
        console.log(`  ${i + 1}. ${shortPath}`);
      });
    }

    // Recent changes summary
    if (session.recentChanges.length > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log('Change Summary:');
      console.log('-'.repeat(70));

      const actions = {};
      session.recentChanges.forEach(change => {
        actions[change.action] = (actions[change.action] || 0) + 1;
      });

      Object.entries(actions).forEach(([action, count]) => {
        console.log(`  ${action}: ${count} file${count > 1 ? 's' : ''}`);
      });
    }

    // Context notes
    if (session.contextNotes && session.contextNotes.length > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log('Context Notes:');
      console.log('-'.repeat(70));
      session.contextNotes.forEach((note, i) => {
        console.log(`  ${i + 1}. ${note}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('📋 Documentation Reminders');
    console.log('='.repeat(70));
    console.log('\nBefore moving on, consider updating:');
    console.log('  1. memory-bank/CURRENT.md - Update current project status');
    console.log('  2. memory-bank/progress.md - Add session summary');
    console.log('  3. memory-bank/CHANGELOG.md - Document major features (if applicable)');
    console.log('  4. memory-bank/ARCHITECTURE.md - Note architectural decisions (if applicable)');
    console.log();

    // Archive the session
    const result = await memory.archiveSession();

    if (result.archived) {
      console.log(`✅ Session archived successfully!`);
      console.log(`   Archive: ${result.archiveFile}\n`);

      return {
        success: true,
        sessionId: session.sessionId,
        archiveFile: result.archiveFile,
        summary: {
          duration: durationStr,
          filesTracked: session.currentTask.files.length,
          changesRecorded: session.recentChanges.length,
          notesCount: session.contextNotes.length
        }
      };
    } else {
      console.log(`⚠️  Session archiving failed\n`);
      return { success: false, error: 'Archive operation failed' };
    }

  } catch (error) {
    console.error('\n❌ Error archiving session:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  const workingDir = process.argv[2] || process.cwd();
  archiveSession(workingDir)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { archiveSession };
