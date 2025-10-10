/**
 * PostToolUse Hook
 *
 * Automatically tracks file changes after Write, Edit, or Bash commands
 * Updates session state with recent changes
 */

const MemoryStore = require('../lib/memoryStore');
const path = require('path');

/**
 * Determine action type from tool name and parameters
 */
function determineAction(toolName, params) {
  if (toolName === 'Write') {
    return 'created/updated';
  } else if (toolName === 'Edit') {
    return 'modified';
  } else if (toolName === 'Bash') {
    // Try to detect git operations
    const command = params.command || '';
    if (command.includes('git commit')) return 'committed';
    if (command.includes('git add')) return 'staged';
    if (command.includes('rm ')) return 'deleted';
    return 'bash_command';
  }
  return 'changed';
}

/**
 * Extract file path from tool parameters
 */
function extractFilePath(toolName, params) {
  if (toolName === 'Write' || toolName === 'Edit') {
    return params.file_path || null;
  } else if (toolName === 'Bash') {
    // Try to extract file from command (best effort)
    const command = params.command || '';
    const match = command.match(/(?:touch|vim|nano|rm|mv)\s+([^\s]+)/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Main hook handler
 */
async function onPostToolUse(context) {
  const { toolName, parameters, workingDirectory, result } = context;

  // Only track specific tools
  const trackedTools = ['Write', 'Edit', 'Bash'];
  if (!trackedTools.includes(toolName)) {
    return { tracked: false, reason: 'tool_not_tracked' };
  }

  const memory = new MemoryStore(workingDirectory);

  try {
    const filePath = extractFilePath(toolName, parameters);
    if (!filePath) {
      return { tracked: false, reason: 'no_file_path' };
    }

    const action = determineAction(toolName, parameters);
    const description = `${toolName}: ${action}`;

    // Record the change
    const changeResult = await memory.recordChange(
      filePath,
      action,
      description
    );

    if (changeResult.recorded) {
      // Also update current task files if not already included
      const session = await memory.getCurrentSession();
      if (session && !session.currentTask.files.includes(filePath)) {
        session.currentTask.files.push(filePath);
        await memory.updateSession({ currentTask: session.currentTask });
      }
    }

    return {
      tracked: true,
      file: filePath,
      action,
      ...changeResult
    };

  } catch (error) {
    return {
      tracked: false,
      error: error.message
    };
  }
}

module.exports = onPostToolUse;
