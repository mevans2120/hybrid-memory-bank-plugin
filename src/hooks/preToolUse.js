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
 * Generate actionable instruction for Claude to update memory bank
 */
async function generateMemoryUpdateInstruction(session, workingDirectory, gitCommand) {
  const instruction = {
    message: '',
    sessionData: session,
    filesToUpdate: []
  };

  let message = '\n';
  message += '━'.repeat(60) + '\n';
  message += '🤖 INSTRUCTION: Update Memory Bank Before Git Operation\n';
  message += '━'.repeat(60) + '\n\n';

  message += 'Claude, before proceeding with the git command, you must:\n\n';

  // Check session activity
  const recentChanges = session?.recentChanges || [];
  const hasChanges = recentChanges.length > 0;

  message += '1. Update .claude-memory/session/current.json with:\n';

  if (hasChanges) {
    message += '   • Add any new file changes to recentChanges array\n';
    message += '   • Update currentTask.files with files being committed\n';
    instruction.filesToUpdate.push('.claude-memory/session/current.json');
  }

  message += '   • Set currentTask.progress appropriately\n';
  message += '   • Add contextNotes about what was accomplished\n\n';

  // Extract files from git add command
  const gitAddMatch = gitCommand.match(/git\s+add\s+(.+)/);
  if (gitAddMatch) {
    const filesBeingAdded = gitAddMatch[1].split(/\s+/).filter(f => f && f !== '&&');
    message += `2. Files being staged: ${filesBeingAdded.join(', ')}\n`;
    message += '   Ensure these are reflected in the session memory\n\n';
  }

  // Check if feature work
  if (session?.currentTask?.feature) {
    message += '3. Document the feature work in session notes\n\n';
  }

  message += 'After updating the memory, proceed with the git operation.\n';
  message += '━'.repeat(60) + '\n\n';

  instruction.message = message;
  return instruction;
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

    // Generate instruction for Claude to update memory bank
    const instruction = await generateMemoryUpdateInstruction(
      session,
      workingDirectory,
      parameters.command
    );

    // Log the instruction so it appears in Claude's context
    logger.info(instruction.message);

    return {
      triggered: true,
      message: instruction.message,
      sessionData: instruction.sessionData,
      filesToUpdate: instruction.filesToUpdate,
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
