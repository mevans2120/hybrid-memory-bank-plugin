const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Git Helper Library
 *
 * Provides git operations with security checks and error handling.
 */

class GitHelper {
  constructor(workingDirectory = process.cwd()) {
    this.cwd = workingDirectory;
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config/commit-conventions.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.warn('Warning: Could not load commit conventions config');
      return { types: {}, sensitive: { patterns: [], extensions: [] } };
    }
  }

  /**
   * Execute git command safely
   */
  exec(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.cwd,
        encoding: 'utf8',
        ...options
      });
      return { success: true, output: result.trim() };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout ? error.stdout.trim() : '',
        stderr: error.stderr ? error.stderr.trim() : ''
      };
    }
  }

  /**
   * Check if directory is a git repository
   */
  isGitRepo() {
    const result = this.exec('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return result.success && result.output === 'true';
  }

  /**
   * Get git status with parsed output
   */
  getStatus() {
    const result = this.exec('git status --porcelain');
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const lines = result.output.split('\n').filter(line => line.trim());
    const staged = [];
    const unstaged = [];
    const untracked = [];

    lines.forEach(line => {
      const status = line.substring(0, 2);
      const file = line.substring(3);

      if (status.startsWith('?')) {
        untracked.push(file);
      } else if (status[0] !== ' ' && status[0] !== '?') {
        staged.push({ file, status: status[0] });
      } else if (status[1] !== ' ') {
        unstaged.push({ file, status: status[1] });
      }
    });

    return {
      success: true,
      staged,
      unstaged,
      untracked,
      hasChanges: staged.length > 0 || unstaged.length > 0 || untracked.length > 0
    };
  }

  /**
   * Get diff for staged files
   */
  getStagedDiff() {
    const result = this.exec('git diff --cached');
    return result.success ? result.output : '';
  }

  /**
   * Get diff for unstaged files
   */
  getUnstagedDiff() {
    const result = this.exec('git diff');
    return result.success ? result.output : '';
  }

  /**
   * Get list of staged files
   */
  getStagedFiles() {
    const result = this.exec('git diff --cached --name-only');
    if (!result.success) return [];
    return result.output.split('\n').filter(f => f.trim());
  }

  /**
   * Check for sensitive files
   */
  checkSensitiveFiles(files) {
    const { sensitive } = this.config;
    const sensitiveFiles = [];

    files.forEach(file => {
      // Check extensions
      const ext = path.extname(file);
      if (sensitive.extensions && sensitive.extensions.includes(ext)) {
        sensitiveFiles.push({ file, reason: `Sensitive extension: ${ext}` });
        return;
      }

      // Check patterns
      if (sensitive.patterns) {
        for (const pattern of sensitive.patterns) {
          const regex = new RegExp(pattern);
          if (regex.test(file)) {
            sensitiveFiles.push({ file, reason: `Matches pattern: ${pattern}` });
            break;
          }
        }
      }
    });

    return sensitiveFiles;
  }

  /**
   * Check for large files
   */
  checkLargeFiles(files) {
    const { largeFile } = this.config;
    const largeFiles = [];

    files.forEach(file => {
      const filePath = path.join(this.cwd, file);
      try {
        const stats = fs.statSync(filePath);
        const size = stats.size;

        if (largeFile && size > largeFile.warnSizeBytes) {
          largeFiles.push({
            file,
            size,
            sizeHuman: this.formatBytes(size),
            isError: size > (largeFile.errorSizeBytes || Infinity)
          });
        }
      } catch (error) {
        // File might be deleted, skip
      }
    });

    return largeFiles;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get current branch name
   */
  getCurrentBranch() {
    const result = this.exec('git branch --show-current');
    return result.success ? result.output : null;
  }

  /**
   * Get commit count ahead/behind remote
   */
  getRemoteStatus() {
    const branch = this.getCurrentBranch();
    if (!branch) return null;

    const result = this.exec(`git rev-list --left-right --count origin/${branch}...HEAD 2>/dev/null || echo "0\t0"`);
    if (!result.success) return null;

    const [behind, ahead] = result.output.split('\t').map(n => parseInt(n, 10));
    return { ahead, behind, branch };
  }

  /**
   * Stage files
   */
  stageFiles(files) {
    if (!Array.isArray(files) || files.length === 0) {
      return { success: false, error: 'No files to stage' };
    }

    const fileList = files.map(f => `"${f}"`).join(' ');
    return this.exec(`git add ${fileList}`);
  }

  /**
   * Create commit
   */
  commit(message) {
    // Use heredoc to properly handle multiline messages
    const result = this.exec(`git commit -m "$(cat <<'EOF'\n${message}\nEOF\n)"`);
    return result;
  }

  /**
   * Push to remote
   */
  push(remote = 'origin', branch = null) {
    const currentBranch = branch || this.getCurrentBranch();
    if (!currentBranch) {
      return { success: false, error: 'Could not determine current branch' };
    }

    return this.exec(`git push ${remote} ${currentBranch}`);
  }

  /**
   * Create and checkout new branch
   */
  createBranch(branchName) {
    return this.exec(`git checkout -b ${branchName}`);
  }

  /**
   * Checkout existing branch
   */
  checkoutBranch(branchName) {
    return this.exec(`git checkout ${branchName}`);
  }

  /**
   * Get recent commits
   */
  getRecentCommits(count = 5) {
    const result = this.exec(`git log -${count} --pretty=format:"%h|%s|%an|%ar" --abbrev-commit`);
    if (!result.success) return [];

    return result.output.split('\n').map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });
  }

  /**
   * Analyze changes and suggest commit type
   */
  analyzeChanges(diff) {
    const analysis = {
      type: 'chore',
      scope: null,
      linesAdded: 0,
      linesRemoved: 0,
      filesChanged: 0
    };

    const lines = diff.split('\n');
    const files = new Set();

    lines.forEach(line => {
      if (line.startsWith('+++') || line.startsWith('---')) {
        const file = line.substring(6);
        if (file !== '/dev/null') {
          files.add(file);
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        analysis.linesAdded++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        analysis.linesRemoved++;
      }
    });

    analysis.filesChanged = files.size;

    // Suggest type based on patterns
    const diffLower = diff.toLowerCase();
    if (diffLower.includes('test') || diffLower.includes('spec.')) {
      analysis.type = 'test';
    } else if (diffLower.includes('readme') || diffLower.includes('.md')) {
      analysis.type = 'docs';
    } else if (diffLower.includes('bug') || diffLower.includes('fix')) {
      analysis.type = 'fix';
    } else if (analysis.linesAdded > analysis.linesRemoved * 2) {
      analysis.type = 'feat';
    } else if (analysis.linesRemoved > analysis.linesAdded) {
      analysis.type = 'refactor';
    }

    return analysis;
  }
}

module.exports = GitHelper;
