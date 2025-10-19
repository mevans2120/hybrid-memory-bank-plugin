/**
 * PreToolUse Hook
 *
 * Triggers before git status commands to enforce memory bank updates
 * Checks for uncommitted changes and provides directive instructions
 */

const MemoryStore = require('../lib/memoryStore');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

/**
 * Check if this is a git status command
 */
function isGitStatus(toolName, params) {
  if (toolName !== 'Bash') return false;
  const command = params.command || '';
  return /git\s+status/.test(command);
}

/**
 * Get git status information
 */
function getGitStatus(workingDirectory) {
  try {
    // Check if we're in a git repo
    execSync('git rev-parse --git-dir', {
      cwd: workingDirectory,
      stdio: 'pipe'
    });

    // Get modified, added, and untracked files
    const status = execSync('git status --porcelain', {
      cwd: workingDirectory,
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const lines = status.trim().split('\n').filter(l => l);
    const files = lines.map(line => {
      const statusCode = line.substring(0, 2);
      const file = line.substring(3);
      return { status: statusCode, file };
    });

    return {
      hasChanges: files.length > 0,
      files,
      modifiedCount: files.filter(f => f.status.includes('M')).length,
      addedCount: files.filter(f => f.status.includes('A')).length,
      untrackedCount: files.filter(f => f.status.includes('??')).length
    };
  } catch (error) {
    return { hasChanges: false, files: [], error: error.message };
  }
}

/**
 * Generate actionable instruction for Claude to update memory bank
 */
async function generateMemoryUpdateInstruction(session, gitStatus, workingDirectory) {
  const instruction = {
    message: '',
    sessionData: session,
    filesToUpdate: [],
    gitStatus
  };

  let message = '\n';
  message += '━'.repeat(60) + '\n';

  // If no uncommitted changes, just acknowledge
  if (!gitStatus.hasChanges) {
    message += '✅ MEMORY BANK STATUS: UP TO DATE\n';
    message += '━'.repeat(60) + '\n\n';
    message += 'No uncommitted changes detected.\n';
    message += 'Memory bank updates are not required at this time.\n';
    message += '━'.repeat(60) + '\n\n';

    instruction.message = message;
    instruction.actionRequired = false;
    return instruction;
  }

  // There are uncommitted changes - provide directive instructions
  message += '🧠 ACTION REQUIRED: Update Memory Bank Before Committing\n';
  message += '━'.repeat(60) + '\n\n';
  message += `Detected ${gitStatus.files.length} uncommitted file(s):\n`;
  message += `  • Modified: ${gitStatus.modifiedCount}\n`;
  message += `  • Added: ${gitStatus.addedCount}\n`;
  message += `  • Untracked: ${gitStatus.untrackedCount}\n\n`;

  message += '📝 BEFORE COMMITTING, YOU MUST UPDATE:\n\n';

  // Session current.json
  message += '1. .claude-memory/session/current.json\n';
  message += '   → Add changed files to currentTask.files array\n';
  message += '   → Update currentTask.progress (in_progress, completed, blocked)\n';
  message += '   → Update currentTask.feature with what you worked on\n';
  message += '   → Add contextNotes describing what was accomplished\n\n';
  instruction.filesToUpdate.push('.claude-memory/session/current.json');

  // Memory bank markdown files
  message += '2. memory-bank/CURRENT.md\n';
  message += '   → Update "Recent Changes" with what was accomplished\n';
  message += '   → Update "Active Tasks" to reflect current state\n';
  message += '   → Update "Current Focus" if it changed\n\n';
  instruction.filesToUpdate.push('memory-bank/CURRENT.md');

  message += '3. memory-bank/progress.md\n';
  message += '   → Add a session entry with timestamp\n';
  message += '   → List completed work and files modified\n';
  message += '   → Add notes about important context\n\n';
  instruction.filesToUpdate.push('memory-bank/progress.md');

  // Conditional updates
  if (session?.currentTask?.feature || gitStatus.files.length > 5) {
    message += '4. memory-bank/CHANGELOG.md (if major feature completed)\n';
    message += '   → Document the completed feature\n';
    message += '   → Note deployment or version changes\n\n';
    instruction.filesToUpdate.push('memory-bank/CHANGELOG.md');
  }

  message += '⚠️  UPDATE THESE FILES BEFORE COMMITTING\n';
  message += '━'.repeat(60) + '\n\n';

  instruction.message = message;
  instruction.actionRequired = true;
  return instruction;
}

/**
 * Main hook handler
 */
async function onPreToolUse(context) {
  const { toolName, parameters, workingDirectory, logger } = context;

  // Only care about git status commands
  if (!isGitStatus(toolName, parameters)) {
    return { triggered: false, reason: 'not_git_status' };
  }

  const memory = new MemoryStore(workingDirectory);

  try {
    const session = await memory.getCurrentSession();

    // Get actual git status
    const gitStatus = getGitStatus(workingDirectory);

    // Generate instruction for Claude to update memory bank
    const instruction = await generateMemoryUpdateInstruction(
      session,
      gitStatus,
      workingDirectory
    );

    // Log the instruction so it appears in Claude's context
    logger.info(instruction.message);

    return {
      triggered: true,
      actionRequired: instruction.actionRequired,
      message: instruction.message,
      sessionData: instruction.sessionData,
      filesToUpdate: instruction.filesToUpdate,
      gitStatus: instruction.gitStatus,
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
