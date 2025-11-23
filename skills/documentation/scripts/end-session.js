#!/usr/bin/env node

/**
 * End Session Script
 *
 * Complete session end workflow:
 * 1. Archive session
 * 2. Update CURRENT.md
 * 3. Add progress summary
 * 4. Show documentation checklist
 */

const { execSync } = require('child_process');
const path = require('path');
const DocHelper = require('../lib/docHelper');

async function endSession(workingDirectory = process.cwd(), options = {}) {
  const doc = new DocHelper(workingDirectory);

  try {
    console.log('\n' + '='.repeat(70));
    console.log('🏁 End Session Workflow');
    console.log('='.repeat(70));

    // Load session
    const session = doc.loadSessionData();
    if (!session) {
      console.log('\n⚠️  No active session found\n');
      return { success: false, error: 'No session' };
    }

    console.log(`\nSession: ${session.sessionId}`);
    console.log(`Duration: ${doc.formatDuration(session.startedAt)}`);

    const steps = [];

    // Step 1: Archive session (using memory-core)
    console.log('\n' + '-'.repeat(70));
    console.log('Step 1: Archive Session');
    console.log('-'.repeat(70));

    try {
      const memoryCorePath = path.join(workingDirectory, 'skills/memory-core/scripts/session-archive.js');
      if (require('fs').existsSync(memoryCorePath)) {
        execSync(`node "${memoryCorePath}"`, { cwd: workingDirectory, stdio: 'inherit' });
        steps.push({ step: 'Archive session', status: 'completed' });
      } else {
        console.log('⚠️  memory-core not found, skipping archive');
        steps.push({ step: 'Archive session', status: 'skipped' });
      }
    } catch (error) {
      console.log(`⚠️  Archive failed: ${error.message}`);
      steps.push({ step: 'Archive session', status: 'failed' });
    }

    // Step 2: Update CURRENT.md
    console.log('\n' + '-'.repeat(70));
    console.log('Step 2: Update CURRENT.md');
    console.log('-'.repeat(70));

    try {
      const updateCurrentPath = path.join(__dirname, 'update-current.js');
      execSync(`node "${updateCurrentPath}"`, { cwd: workingDirectory, stdio: 'inherit' });
      steps.push({ step: 'Update CURRENT.md', status: 'completed' });
    } catch (error) {
      console.log(`⚠️  Update failed: ${error.message}`);
      steps.push({ step: 'Update CURRENT.md', status: 'failed' });
    }

    // Step 3: Add progress summary
    console.log('\n' + '-'.repeat(70));
    console.log('Step 3: Add Progress Summary');
    console.log('-'.repeat(70));

    try {
      const addProgressPath = path.join(__dirname, 'add-progress.js');
      const progressCmd = `node "${addProgressPath}"`;
      execSync(progressCmd, { cwd: workingDirectory, stdio: 'inherit' });
      steps.push({ step: 'Add progress summary', status: 'completed' });
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Progress entry already exists');
        steps.push({ step: 'Add progress summary', status: 'skipped' });
      } else {
        console.log(`⚠️  Progress update failed: ${error.message}`);
        steps.push({ step: 'Add progress summary', status: 'failed' });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 Session End Summary');
    console.log('='.repeat(70));

    steps.forEach(({ step, status }) => {
      const icon = status === 'completed' ? '✅' : status === 'skipped' ? '⊝' : '❌';
      console.log(`${icon} ${step}: ${status}`);
    });

    // Documentation checklist
    console.log('\n' + '-'.repeat(70));
    console.log('📝 Documentation Checklist');
    console.log('-'.repeat(70));
    console.log('\nBefore committing, review:');
    console.log('  [ ] memory-bank/CURRENT.md - Updated with final status');
    console.log('  [ ] memory-bank/progress.md - Session summary added');
    console.log('  [ ] memory-bank/CHANGELOG.md - Major features documented (if applicable)');
    console.log('  [ ] README.md - Updated if features/API changed');
    console.log('\nReady to commit? Use git-workflow commit script!\n');

    const completed = steps.filter(s => s.status === 'completed').length;
    const total = steps.length;

    return {
      success: true,
      session: session.sessionId,
      steps,
      completed,
      total
    };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Parse command line arguments
function parseArgs(args) {
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        console.log('\nEnd Session Script\n');
        console.log('Complete session end workflow with documentation updates.\n');
        console.log('Usage: end-session.js\n');
        console.log('Workflow:');
        console.log('  1. Archive session (memory-core)');
        console.log('  2. Update CURRENT.md with final status');
        console.log('  3. Add progress summary to progress.md');
        console.log('  4. Show documentation checklist\n');
        console.log('Example:');
        console.log('  end-session.js\n');
        process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  endSession(process.cwd(), options)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { endSession };
