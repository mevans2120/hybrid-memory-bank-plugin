#!/usr/bin/env node

/**
 * Session Show Script
 *
 * Displays the current session state with formatted output.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');
const { formatDate, formatRelativeTime } = require('../../shared-lib/utils');

async function showSession(workingDirectory = process.cwd()) {
  const memory = new MemoryStore(workingDirectory);

  try {
    const session = await memory.getCurrentSession();

    if (!session) {
      console.log('\n❌ No active session found\n');
      console.log('💡 Tip: Run the init script to create a new session\n');
      return { success: false, error: 'No active session' };
    }

    // Calculate session duration
    const startTime = new Date(session.startedAt);
    const now = new Date();
    const durationMs = now - startTime;
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const durationStr = hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;

    // Calculate time until expiry
    const expiryTime = new Date(session.expiresAt);
    const timeUntilExpiry = expiryTime - now;
    const hoursUntilExpiry = Math.floor(timeUntilExpiry / 3600000);
    const expiryStr = hoursUntilExpiry > 0
      ? `${hoursUntilExpiry}h remaining`
      : 'Expiring soon!';

    // Display formatted session
    console.log('\n' + '='.repeat(70));
    console.log('📝 Current Session');
    console.log('='.repeat(70));

    console.log(`\nSession ID:      ${session.sessionId}`);
    console.log(`Started:         ${formatDate(session.startedAt)} (${formatRelativeTime(session.startedAt)})`);
    console.log(`Duration:        ${durationStr}`);
    console.log(`Expires:         ${formatDate(session.expiresAt)} (${expiryStr})`);

    // Current Task
    console.log('\n' + '-'.repeat(70));
    console.log('🎯 Current Task');
    console.log('-'.repeat(70));

    if (session.currentTask.feature) {
      console.log(`Feature:         ${session.currentTask.feature}`);
      console.log(`Progress:        ${session.currentTask.progress}`);

      if (session.currentTask.files.length > 0) {
        console.log(`\nFiles (${session.currentTask.files.length}):`);
        session.currentTask.files.forEach((file, i) => {
          const shortPath = file.replace(workingDirectory, '.');
          console.log(`  ${i + 1}. ${shortPath}`);
        });
      }

      if (session.currentTask.nextSteps.length > 0) {
        console.log(`\nNext Steps (${session.currentTask.nextSteps.length}):`);
        session.currentTask.nextSteps.forEach((step, i) => {
          console.log(`  ${i + 1}. ${step}`);
        });
      }
    } else {
      console.log('No current task set');
      console.log('💡 Tip: Add a task with the update script');
    }

    // Active Bugs
    if (session.activeBugs && session.activeBugs.length > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log('🐛 Active Bugs');
      console.log('-'.repeat(70));
      session.activeBugs.forEach((bug, i) => {
        console.log(`  ${i + 1}. ${bug}`);
      });
    }

    // Recent Changes
    console.log('\n' + '-'.repeat(70));
    console.log(`📁 Recent Changes (${session.recentChanges.length}/20)`);
    console.log('-'.repeat(70));

    if (session.recentChanges.length > 0) {
      // Group by file
      const fileGroups = {};
      session.recentChanges.forEach(change => {
        const shortPath = change.file.replace(workingDirectory, '.');
        if (!fileGroups[shortPath]) {
          fileGroups[shortPath] = [];
        }
        fileGroups[shortPath].push(change);
      });

      Object.entries(fileGroups).forEach(([file, changes]) => {
        console.log(`\n${file}`);
        changes.forEach(change => {
          const time = formatRelativeTime(change.timestamp);
          const action = change.action.padEnd(15);
          console.log(`  • ${action} ${time}`);
        });
      });
    } else {
      console.log('No changes recorded yet');
      console.log('💡 Tip: Changes will be tracked automatically or manually');
    }

    // Context Notes
    if (session.contextNotes && session.contextNotes.length > 0) {
      console.log('\n' + '-'.repeat(70));
      console.log(`💡 Context Notes (${session.contextNotes.length})`);
      console.log('-'.repeat(70));
      session.contextNotes.forEach((note, i) => {
        console.log(`  ${i + 1}. ${note}`);
      });
    }

    console.log('\n' + '='.repeat(70) + '\n');

    return {
      success: true,
      session,
      summary: {
        sessionId: session.sessionId,
        duration: durationStr,
        filesTracked: session.currentTask.files.length,
        changesRecorded: session.recentChanges.length,
        notesCount: session.contextNotes.length
      }
    };

  } catch (error) {
    console.error('\n❌ Error displaying session:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  const workingDir = process.argv[2] || process.cwd();
  showSession(workingDir)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { showSession };
