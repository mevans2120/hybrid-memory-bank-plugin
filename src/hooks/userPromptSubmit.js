/**
 * UserPromptSubmit Hook
 *
 * Detects when user is finishing work and reminds about documentation
 * Triggers on patterns like "done", "finished", "goodbye", etc.
 */

const MemoryStore = require('../lib/memoryStore');
const fs = require('fs').promises;
const path = require('path');

/**
 * Check if prompt indicates session ending
 */
function isEndingPrompt(prompt) {
  const endingPatterns = [
    /\b(done|finished|complete|completed)\b/i,
    /\b(goodbye|bye|see you|thanks|thank you)\b/i,
    /\b(commit|push|deploy)\b.*\b(done|finished)\b/i,
    /that'?s? (it|all)/i,
  ];

  return endingPatterns.some(pattern => pattern.test(prompt));
}

/**
 * Generate documentation reminder based on session activity
 */
function generateReminder(session, recentChanges) {
  let reminder = '\n';
  reminder += '━'.repeat(60) + '\n';
  reminder += '📝 DOCUMENTATION REMINDER\n';
  reminder += '━'.repeat(60) + '\n\n';

  reminder += 'Consider updating these files before ending:\n\n';

  // Check if significant work was done
  const hasSignificantChanges = recentChanges.length > 5;
  const hasTaskProgress = session.currentTask.progress !== 'not_started';

  if (hasTaskProgress || hasSignificantChanges) {
    reminder += '   ✓ memory-bank/CURRENT.md\n';
    reminder += '     → Update current project state\n\n';

    reminder += '   ✓ memory-bank/progress.md\n';
    reminder += '     → Add session summary with timestamp\n\n';
  }

  // Check if major feature or deployment
  if (session.currentTask.feature && session.currentTask.progress === 'completed') {
    reminder += '   ✓ memory-bank/CHANGELOG.md\n';
    reminder += '     → Document completed feature\n\n';
  }

  // Check if architectural changes
  if (recentChanges.some(c => c.file.includes('architecture') || c.file.includes('schema'))) {
    reminder += '   ✓ memory-bank/ARCHITECTURE.md\n';
    reminder += '     → Document architectural decisions\n\n';
  }

  reminder += 'Use /memory end-session for guided session end\n';
  reminder += '━'.repeat(60) + '\n\n';

  return reminder;
}

/**
 * Main hook handler
 */
async function onUserPromptSubmit(context) {
  const { prompt, workingDirectory, logger } = context;

  if (!isEndingPrompt(prompt)) {
    return { triggered: false, reason: 'not_ending_prompt' };
  }

  const memory = new MemoryStore(workingDirectory);

  try {
    const session = await memory.getCurrentSession();
    if (!session) {
      return { triggered: false, reason: 'no_active_session' };
    }

    const recentChanges = session.recentChanges || [];

    // Only show reminder if there's actual work to document
    if (recentChanges.length === 0 && session.currentTask.progress === 'not_started') {
      return { triggered: false, reason: 'no_work_to_document' };
    }

    const reminder = generateReminder(session, recentChanges);
    logger.info(reminder);

    return {
      triggered: true,
      sessionId: session.sessionId,
      changesCount: recentChanges.length
    };

  } catch (error) {
    return {
      triggered: false,
      error: error.message
    };
  }
}

module.exports = onUserPromptSubmit;
