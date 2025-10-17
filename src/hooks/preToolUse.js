/**
 * PreToolUse Hook
 *
 * Triggers before git add commands to prompt memory bank updates
 * Reminds user to update documentation before staging changes
 */

const MemoryStore = require('../lib/memoryStore');
const fs = require('fs').promises;
const path = require('path');

/**
 * Check if this is a git add command
 */
function isGitAdd(toolName, params) {
  if (toolName !== 'Bash') return false;
  const command = params.command || '';
  return /git\s+add/.test(command);
}

/**
 * Generate memory bank update reminder
 */
async function generateCommitReminder(session, workingDirectory) {
  let reminder = '\n';
  reminder += '━'.repeat(60) + '\n';
  reminder += '📝 MEMORY BANK UPDATE REMINDER\n';
  reminder += '━'.repeat(60) + '\n\n';

  reminder += 'Before staging changes, consider updating:\n\n';

  // Check session activity
  const recentChanges = session?.recentChanges || [];
  const hasChanges = recentChanges.length > 0;

  if (hasChanges) {
    reminder += '   ✓ memory-bank/CURRENT.md\n';
    reminder += '     → Update current project state\n\n';

    reminder += '   ✓ memory-bank/progress.md\n';
    reminder += '     → Add what was accomplished\n\n';
  }

  // Check if feature work
  if (session?.currentTask?.feature) {
    reminder += '   ✓ memory-bank/CHANGELOG.md\n';
    reminder += '     → Document feature changes\n\n';
  }

  // Check memory-bank/ freshness
  const memoryBankPath = path.join(workingDirectory, 'memory-bank');
  try {
    const currentMdPath = path.join(memoryBankPath, 'CURRENT.md');
    const stats = await fs.stat(currentMdPath);
    const hoursSinceUpdate = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

    if (hoursSinceUpdate > 24) {
      reminder += `   ⚠️  CURRENT.md last updated ${Math.floor(hoursSinceUpdate)} hours ago\n\n`;
    }
  } catch (error) {
    reminder += '   ⚠️  memory-bank/CURRENT.md not found\n\n';
  }

  reminder += 'Quick commands:\n';
  reminder += '   • /memory show - View current session\n';
  reminder += '   • /memory end-session - Guided documentation update\n\n';

  reminder += '━'.repeat(60) + '\n';
  reminder += 'Proceeding with git add...\n';
  reminder += '━'.repeat(60) + '\n\n';

  return reminder;
}

/**
 * Main hook handler
 */
async function onPreToolUse(context) {
  const { toolName, parameters, workingDirectory, logger } = context;

  // Only care about git add commands
  if (!isGitAdd(toolName, parameters)) {
    return { triggered: false, reason: 'not_git_add' };
  }

  const memory = new MemoryStore(workingDirectory);

  try {
    const session = await memory.getCurrentSession();

    // Generate and show reminder
    const reminder = await generateCommitReminder(session, workingDirectory);
    logger.info(reminder);

    return {
      triggered: true,
      message: 'Memory bank reminder shown',
      sessionId: session?.sessionId
    };

  } catch (error) {
    return {
      triggered: false,
      error: error.message
    };
  }
}

module.exports = onPreToolUse;
