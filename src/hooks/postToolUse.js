/**
 * PostToolUse Hook
 *
 * Triggers after git status commands to automatically update memory bank files
 * Parses the git status output and updates session and memory-bank documentation
 */

const MemoryStore = require('../lib/memoryStore');
const fs = require('fs').promises;
const path = require('path');

/**
 * Check if this was a git status command
 */
function isGitStatus(toolName, params) {
  if (toolName !== 'Bash') return false;
  const command = params.command || '';
  return /git\s+status/.test(command);
}

/**
 * Parse git status output to extract file changes
 */
function parseGitStatus(output) {
  if (!output) {
    return { hasChanges: false, files: [] };
  }

  const lines = output.split('\n');
  const files = [];
  let inChangesSection = false;

  for (const line of lines) {
    // Detect sections
    if (line.includes('Changes not staged for commit:') ||
        line.includes('Changes to be committed:') ||
        line.includes('Untracked files:')) {
      inChangesSection = true;
      continue;
    }

    // Skip empty lines and instructions
    if (!line.trim() || line.includes('(use "git') || line.includes('no changes added')) {
      continue;
    }

    // Parse file entries
    if (inChangesSection) {
      const match = line.match(/^\s+(modified|new file|deleted|renamed):\s+(.+)$/) ||
                    line.match(/^\s+(.+)$/);
      if (match) {
        const file = match[2] || match[1];
        if (file && !file.includes('(use "git')) {
          files.push(file.trim());
        }
      }
    }
  }

  return {
    hasChanges: files.length > 0,
    files: files.filter(f => f.length > 0),
    fileCount: files.length
  };
}

/**
 * Update session current.json with changed files
 */
async function updateSessionMemory(memory, gitStatus, workingDirectory) {
  try {
    const session = await memory.getCurrentSession();

    if (!session || !gitStatus.hasChanges) {
      return { updated: false, reason: 'no_changes' };
    }

    // Add changed files to the current task if not already there
    if (!session.currentTask.files) {
      session.currentTask.files = [];
    }

    const newFiles = gitStatus.files.filter(f => !session.currentTask.files.includes(f));
    if (newFiles.length > 0) {
      session.currentTask.files.push(...newFiles);
    }

    // Update progress if still not_started
    if (session.currentTask.progress === 'not_started') {
      session.currentTask.progress = 'in_progress';
    }

    // Add a context note about the uncommitted changes
    if (!session.contextNotes) {
      session.contextNotes = [];
    }

    const timestamp = new Date().toISOString();
    const note = `[${timestamp}] Detected ${gitStatus.fileCount} uncommitted file(s) - ${gitStatus.files.slice(0, 3).join(', ')}${gitStatus.files.length > 3 ? '...' : ''}`;

    // Only add if we don't already have a similar recent note
    const recentNote = session.contextNotes[session.contextNotes.length - 1];
    if (!recentNote || !recentNote.includes('uncommitted file(s)')) {
      session.contextNotes.push(note);
    }

    // Save updated session
    await memory.updateSession(session);

    return {
      updated: true,
      filesAdded: newFiles.length,
      totalFiles: session.currentTask.files.length
    };

  } catch (error) {
    return { updated: false, error: error.message };
  }
}

/**
 * Update memory-bank/CURRENT.md with recent changes
 */
async function updateCurrentMarkdown(gitStatus, workingDirectory) {
  try {
    const currentPath = path.join(workingDirectory, 'memory-bank', 'CURRENT.md');
    let content = await fs.readFile(currentPath, 'utf8');

    // Find the "Recent Changes" section
    const recentChangesMatch = content.match(/## Recent Changes\n([\s\S]*?)(?=\n## |$)/);

    if (recentChangesMatch) {
      const timestamp = new Date().toLocaleString();
      const newEntry = `- **[${timestamp}]**: Uncommitted changes detected - ${gitStatus.fileCount} file(s) modified\n`;

      // Add the new entry at the top of Recent Changes
      const beforeChanges = content.substring(0, recentChangesMatch.index + '## Recent Changes\n'.length);
      const afterChanges = content.substring(recentChangesMatch.index + recentChangesMatch[0].length);

      content = beforeChanges + newEntry + afterChanges;

      await fs.writeFile(currentPath, content, 'utf8');
      return { updated: true };
    }

    return { updated: false, reason: 'section_not_found' };

  } catch (error) {
    return { updated: false, error: error.message };
  }
}

/**
 * Generate informational message about what was updated
 */
function generateUpdateMessage(sessionUpdate, currentUpdate, gitStatus) {
  let message = '\n';
  message += '━'.repeat(60) + '\n';
  message += '🧠 MEMORY BANK AUTO-UPDATE\n';
  message += '━'.repeat(60) + '\n\n';

  if (!gitStatus.hasChanges) {
    message += '✅ Git status: Clean (no uncommitted changes)\n';
    message += '   No memory updates needed.\n';
  } else {
    message += `📝 Detected ${gitStatus.fileCount} uncommitted file(s)\n\n`;

    if (sessionUpdate.updated) {
      message += `✅ Updated .claude-memory/session/current.json\n`;
      message += `   → Added ${sessionUpdate.filesAdded} new file(s) to tracking\n`;
      message += `   → Total files tracked: ${sessionUpdate.totalFiles}\n\n`;
    }

    if (currentUpdate.updated) {
      message += `✅ Updated memory-bank/CURRENT.md\n`;
      message += `   → Added entry to Recent Changes\n\n`;
    }

    message += `📋 Changed files:\n`;
    gitStatus.files.slice(0, 5).forEach(file => {
      message += `   • ${file}\n`;
    });
    if (gitStatus.files.length > 5) {
      message += `   ... and ${gitStatus.files.length - 5} more\n`;
    }
  }

  message += '\n' + '━'.repeat(60) + '\n\n';
  return message;
}

/**
 * Main hook handler
 */
async function onPostToolUse(context) {
  const { toolName, parameters, result, workingDirectory, logger } = context;

  // Only care about git status commands
  if (!isGitStatus(toolName, parameters)) {
    return { triggered: false, reason: 'not_git_status' };
  }

  const memory = new MemoryStore(workingDirectory);

  try {
    // Parse the git status output
    const gitStatus = parseGitStatus(result.output || result.stdout || '');

    // Update session memory
    const sessionUpdate = await updateSessionMemory(memory, gitStatus, workingDirectory);

    // Update CURRENT.md only if there are changes
    const currentUpdate = gitStatus.hasChanges
      ? await updateCurrentMarkdown(gitStatus, workingDirectory)
      : { updated: false, reason: 'no_changes' };

    // Generate informational message
    const message = generateUpdateMessage(sessionUpdate, currentUpdate, gitStatus);

    // Log the update summary
    logger.info(message);

    return {
      triggered: true,
      gitStatus,
      sessionUpdate,
      currentUpdate,
      message
    };

  } catch (error) {
    logger.error(`PostToolUse hook error: ${error.message}`);
    return {
      triggered: false,
      error: error.message
    };
  }
}

module.exports = onPostToolUse;
