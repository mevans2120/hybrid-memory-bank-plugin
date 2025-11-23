#!/usr/bin/env node

/**
 * Session Update Script
 *
 * Updates the current session with task info, notes, or next steps.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');

async function updateSession(workingDirectory = process.cwd(), updates = {}) {
  const memory = new MemoryStore(workingDirectory);

  try {
    let session = await memory.getCurrentSession();

    if (!session) {
      console.log('⚠️  No active session found, creating new session...');
      session = await memory.createSession();
      console.log(`✅ Created new session: ${session.sessionId}\n`);
    }

    const changes = [];

    // Update current task
    if (updates.feature !== undefined) {
      changes.push(`Feature: "${updates.feature}"`);
      updates.currentTask = updates.currentTask || {};
      updates.currentTask.feature = updates.feature;
    }

    if (updates.progress !== undefined) {
      if (!['not_started', 'in_progress', 'completed'].includes(updates.progress)) {
        console.error('❌ Invalid progress value. Must be: not_started, in_progress, or completed');
        return { success: false, error: 'Invalid progress value' };
      }
      changes.push(`Progress: ${updates.progress}`);
      updates.currentTask = updates.currentTask || {};
      updates.currentTask.progress = updates.progress;
    }

    if (updates.addNextStep) {
      changes.push(`Added next step: "${updates.addNextStep}"`);
      const currentSteps = session.currentTask.nextSteps || [];
      updates.currentTask = updates.currentTask || {};
      updates.currentTask.nextSteps = [...currentSteps, updates.addNextStep];
    }

    if (updates.clearNextSteps) {
      changes.push('Cleared all next steps');
      updates.currentTask = updates.currentTask || {};
      updates.currentTask.nextSteps = [];
    }

    // Add context note
    if (updates.note) {
      const result = await memory.addNote(updates.note);
      if (result.added) {
        changes.push(`Added note: "${updates.note}"`);
      } else {
        changes.push(`Note already exists: "${updates.note}"`);
      }
    }

    // Add bug
    if (updates.addBug) {
      const currentBugs = session.activeBugs || [];
      if (!currentBugs.includes(updates.addBug)) {
        changes.push(`Added bug: "${updates.addBug}"`);
        updates.activeBugs = [...currentBugs, updates.addBug];
      } else {
        changes.push(`Bug already exists: "${updates.addBug}"`);
      }
    }

    // Remove bug
    if (updates.removeBug) {
      const currentBugs = session.activeBugs || [];
      const index = currentBugs.indexOf(updates.removeBug);
      if (index > -1) {
        changes.push(`Removed bug: "${updates.removeBug}"`);
        updates.activeBugs = currentBugs.filter(b => b !== updates.removeBug);
      } else {
        changes.push(`Bug not found: "${updates.removeBug}"`);
      }
    }

    // Apply updates if any were made
    if (Object.keys(updates).length > 0) {
      // Filter out temporary update keys
      const filteredUpdates = { ...updates };
      delete filteredUpdates.feature;
      delete filteredUpdates.progress;
      delete filteredUpdates.note;
      delete filteredUpdates.addNextStep;
      delete filteredUpdates.clearNextSteps;
      delete filteredUpdates.addBug;
      delete filteredUpdates.removeBug;

      await memory.updateSession(filteredUpdates);
    }

    // Display results
    if (changes.length > 0) {
      console.log('\n✅ Session updated successfully!\n');
      console.log('Changes made:');
      changes.forEach((change, i) => {
        console.log(`  ${i + 1}. ${change}`);
      });
      console.log();
    } else {
      console.log('\n⚠️  No updates provided\n');
      console.log('Usage:');
      console.log('  --feature "description"     Set current feature/task');
      console.log('  --progress <status>         Set progress (not_started|in_progress|completed)');
      console.log('  --note "text"               Add context note');
      console.log('  --next-step "text"          Add next step');
      console.log('  --clear-steps               Clear all next steps');
      console.log('  --add-bug "description"     Add active bug');
      console.log('  --remove-bug "description"  Remove active bug');
      console.log();
    }

    // Get updated session
    const updatedSession = await memory.getCurrentSession();

    return {
      success: true,
      session: updatedSession,
      changes: changes
    };

  } catch (error) {
    console.error('\n❌ Error updating session:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Parse command line arguments
function parseArgs(args) {
  const updates = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--feature':
        updates.feature = nextArg;
        i++;
        break;
      case '--progress':
        updates.progress = nextArg;
        i++;
        break;
      case '--note':
        updates.note = nextArg;
        i++;
        break;
      case '--next-step':
        updates.addNextStep = nextArg;
        i++;
        break;
      case '--clear-steps':
        updates.clearNextSteps = true;
        break;
      case '--add-bug':
        updates.addBug = nextArg;
        i++;
        break;
      case '--remove-bug':
        updates.removeBug = nextArg;
        i++;
        break;
      case '--help':
        console.log('\nSession Update Script');
        console.log('\nUsage: node session-update.js [options]\n');
        console.log('Options:');
        console.log('  --feature "description"     Set current feature/task');
        console.log('  --progress <status>         Set progress (not_started|in_progress|completed)');
        console.log('  --note "text"               Add context note');
        console.log('  --next-step "text"          Add next step');
        console.log('  --clear-steps               Clear all next steps');
        console.log('  --add-bug "description"     Add active bug');
        console.log('  --remove-bug "description"  Remove active bug');
        console.log('  --help                      Show this help\n');
        process.exit(0);
    }
  }

  return updates;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const workingDir = process.cwd();

  // Check if first arg is a directory path
  let updates;
  if (args.length > 0 && !args[0].startsWith('--')) {
    // First arg is working directory
    updates = parseArgs(args.slice(1));
  } else {
    updates = parseArgs(args);
  }

  updateSession(workingDir, updates)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { updateSession };
