#!/usr/bin/env node

/**
 * Track Change Script
 *
 * Records file changes to the current session.
 * Maintains a circular buffer of 20 most recent changes.
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const fs = require('fs').promises;
const MemoryStore = require('../lib/memoryStore');
const { toAbsolutePath } = require('../../shared-lib/utils');

async function trackChange(workingDirectory = process.cwd(), filePath, action = 'modified') {
  const memory = new MemoryStore(workingDirectory);

  try {
    // Validate file path
    if (!filePath) {
      console.error('\n❌ Error: File path is required\n');
      console.log('Usage: track-change.js <file-path> [--action <type>]\n');
      console.log('Actions: created, modified, deleted, staged, committed\n');
      return { success: false, error: 'File path required' };
    }

    // Convert to absolute path
    const absolutePath = toAbsolutePath(filePath, workingDirectory);

    // Validate action type
    const validActions = [
      'created',
      'created/updated',
      'modified',
      'deleted',
      'staged',
      'committed'
    ];

    let normalizedAction = action.toLowerCase();

    // Map common variations
    if (normalizedAction === 'create') normalizedAction = 'created';
    if (normalizedAction === 'update') normalizedAction = 'created/updated';
    if (normalizedAction === 'modify') normalizedAction = 'modified';
    if (normalizedAction === 'delete') normalizedAction = 'deleted';
    if (normalizedAction === 'stage') normalizedAction = 'staged';
    if (normalizedAction === 'commit') normalizedAction = 'committed';

    if (!validActions.includes(normalizedAction)) {
      console.error(`\n❌ Invalid action: "${action}"\n`);
      console.log('Valid actions:', validActions.join(', '));
      console.log();
      return { success: false, error: 'Invalid action type' };
    }

    // Auto-detect action if file exists
    if (!action || action === 'auto') {
      try {
        await fs.access(absolutePath);
        // File exists, likely modified
        normalizedAction = 'modified';
      } catch {
        // File doesn't exist, likely deleted
        normalizedAction = 'deleted';
      }
    }

    // Get or create session
    let session = await memory.getCurrentSession();
    if (!session) {
      console.log('⚠️  No active session found, creating new session...');
      session = await memory.createSession();
      console.log(`✅ Created new session: ${session.sessionId}\n`);
    }

    // Prepare change description
    const description = `Tracked: ${normalizedAction}`;

    // Record the change
    const result = await memory.recordChange(absolutePath, normalizedAction, description);

    if (result.recorded) {
      const shortPath = absolutePath.replace(workingDirectory, '.');

      console.log('\n✅ Change tracked successfully!\n');
      console.log(`File:        ${shortPath}`);
      console.log(`Action:      ${normalizedAction}`);
      console.log(`Timestamp:   ${new Date().toLocaleString()}`);

      // Get updated session to show stats
      const updatedSession = await memory.getCurrentSession();
      const totalChanges = updatedSession.recentChanges.length;
      const totalFiles = updatedSession.currentTask.files.length;

      console.log(`\nTotal Changes: ${totalChanges}/20`);
      console.log(`Files Tracked: ${totalFiles}`);
      console.log();

      return {
        success: true,
        change: result.change,
        stats: {
          totalChanges,
          totalFiles
        }
      };
    } else {
      console.log('\n⚠️  Change recording failed\n');
      return { success: false, error: 'Recording failed' };
    }

  } catch (error) {
    console.error('\n❌ Error tracking change:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {
    filePath: null,
    action: 'modified'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--action' || arg === '-a') {
      options.action = nextArg;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log('\nTrack Change Script\n');
      console.log('Records file changes to the current session.\n');
      console.log('Usage: track-change.js <file-path> [options]\n');
      console.log('Options:');
      console.log('  --action, -a <type>   Action type (default: modified)');
      console.log('                        Values: created, modified, deleted, staged, committed');
      console.log('  --help, -h            Show this help\n');
      console.log('Examples:');
      console.log('  track-change.js src/auth/middleware.ts');
      console.log('  track-change.js src/auth/login.ts --action created');
      console.log('  track-change.js src/old-file.ts --action deleted\n');
      process.exit(0);
    } else if (!arg.startsWith('-') && !options.filePath) {
      options.filePath = arg;
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.filePath) {
    console.error('\n❌ Error: File path is required\n');
    console.log('Usage: track-change.js <file-path> [--action <type>]');
    console.log('Use --help for more information\n');
    process.exit(1);
  }

  trackChange(process.cwd(), options.filePath, options.action)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { trackChange };
