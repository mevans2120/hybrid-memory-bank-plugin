const fs = require('fs');
const path = require('path');

/**
 * Team Helper Library
 *
 * Manages team patterns, documentation, and synchronization.
 */

class TeamHelper {
  constructor(workingDirectory = process.cwd()) {
    this.cwd = workingDirectory;
    this.skillPath = path.join(__dirname, '..');
    this.patternsPath = path.join(this.skillPath, 'patterns');
    this.docsPath = path.join(this.skillPath, 'docs');
    this.templatesPath = path.join(this.skillPath, 'templates');

    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.patternsPath, this.docsPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load team patterns by type
   */
  loadTeamPatterns(patternType) {
    const filePath = path.join(this.patternsPath, `${patternType}.json`);
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return {};
      throw error;
    }
  }

  /**
   * Save team patterns
   */
  saveTeamPatterns(patternType, patterns) {
    const filePath = path.join(this.patternsPath, `${patternType}.json`);
    fs.writeFileSync(filePath, JSON.stringify(patterns, null, 2), 'utf8');
    return filePath;
  }

  /**
   * Add pattern to team library
   */
  addTeamPattern(patternType, patternKey, pattern) {
    const patterns = this.loadTeamPatterns(patternType);
    patterns[patternKey] = {
      ...pattern,
      addedToTeam: pattern.addedToTeam || new Date().toISOString(),
      addedBy: pattern.addedBy || 'unknown'
    };
    return this.saveTeamPatterns(patternType, patterns);
  }

  /**
   * Get all team pattern types
   */
  getAllTeamPatterns() {
    const types = ['api-patterns', 'error-handling', 'ui-patterns', 'database-patterns'];
    const allPatterns = {};

    types.forEach(type => {
      allPatterns[type] = this.loadTeamPatterns(type);
    });

    return allPatterns;
  }

  /**
   * Load personal patterns from memory-core
   */
  loadPersonalPatterns(workingDirectory) {
    const memoryPath = path.join(workingDirectory, '.claude-memory/patterns');
    const types = ['api-patterns', 'error-handling', 'ui-patterns', 'database-patterns'];
    const personalPatterns = {};

    types.forEach(type => {
      const filePath = path.join(memoryPath, `${type}.json`);
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        personalPatterns[type] = JSON.parse(data);
      } catch (error) {
        personalPatterns[type] = {};
      }
    });

    return personalPatterns;
  }

  /**
   * Find new patterns to share
   */
  findNewPatterns(personalPatterns, teamPatterns) {
    const newPatterns = [];

    Object.entries(personalPatterns).forEach(([type, patterns]) => {
      const teamPatternsOfType = teamPatterns[type] || {};

      Object.entries(patterns).forEach(([key, pattern]) => {
        if (!teamPatternsOfType[key]) {
          newPatterns.push({
            type,
            key,
            pattern
          });
        }
      });
    });

    return newPatterns;
  }

  /**
   * Load template
   */
  loadTemplate(templateName) {
    const templatePath = path.join(this.templatesPath, `${templateName}.md`);
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Template ${templateName} not found`);
    }
  }

  /**
   * Render template
   */
  renderTemplate(template, data) {
    let rendered = template;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const replacement = value !== undefined && value !== null ? String(value) : '';
      rendered = rendered.replace(new RegExp(placeholder, 'g'), replacement);
    });

    // Remove any remaining placeholders
    rendered = rendered.replace(/{{.*?}}/g, '');

    return rendered;
  }

  /**
   * Save team document
   */
  saveTeamDoc(filename, content) {
    const filePath = path.join(this.docsPath, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  /**
   * Format date
   */
  formatDate() {
    return new Date().toISOString().split('T')[0];
  }
}

module.exports = TeamHelper;
