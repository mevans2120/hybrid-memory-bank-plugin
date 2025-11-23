const fs = require('fs');
const path = require('path');

/**
 * Documentation Helper Library
 *
 * Provides markdown manipulation, template rendering, and session data formatting.
 */

class DocHelper {
  constructor(workingDirectory = process.cwd()) {
    this.cwd = workingDirectory;
    this.memoryBankPath = path.join(this.cwd, 'memory-bank');
    this.templatesPath = path.join(__dirname, '../templates');
  }

  /**
   * Load template
   */
  loadTemplate(templateName) {
    const templatePath = path.join(this.templatesPath, `${templateName}.md`);
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      throw new Error(`Template ${templateName} not found: ${error.message}`);
    }
  }

  /**
   * Render template with data
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
   * Read markdown file
   */
  readMarkdownFile(filename) {
    const filePath = path.join(this.memoryBankPath, filename);
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  /**
   * Write markdown file
   */
  writeMarkdownFile(filename, content) {
    const filePath = path.join(this.memoryBankPath, filename);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  /**
   * Parse markdown sections
   */
  parseMarkdownSections(content) {
    const sections = {};
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];

    lines.forEach(line => {
      const headerMatch = line.match(/^##\s+(.+)$/);

      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        // Start new section
        currentSection = headerMatch[1];
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });

    // Save last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * Update section in markdown
   */
  updateSection(content, sectionName, newContent) {
    const sections = this.parseMarkdownSections(content);
    sections[sectionName] = newContent;
    return this.assembleSections(content, sections);
  }

  /**
   * Assemble sections back into markdown
   */
  assembleSections(originalContent, sections) {
    const lines = originalContent.split('\n');
    const result = [];
    let currentSection = null;
    let inSection = false;
    let sectionProcessed = new Set();

    lines.forEach(line => {
      const headerMatch = line.match(/^##\s+(.+)$/);

      if (headerMatch) {
        currentSection = headerMatch[1];
        inSection = true;
        result.push(line); // Add header

        if (sections[currentSection]) {
          result.push(sections[currentSection]); // Add updated content
          sectionProcessed.add(currentSection);
        }
      } else if (line.match(/^##\s/)) {
        inSection = false;
      } else if (!inSection) {
        result.push(line);
      }
    });

    return result.join('\n');
  }

  /**
   * Append to markdown file
   */
  appendToMarkdownFile(filename, content) {
    const filePath = path.join(this.memoryBankPath, filename);
    let existing = '';

    try {
      existing = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const updated = existing + (existing ? '\n\n' : '') + content;
    this.writeMarkdownFile(filename, updated);
    return filePath;
  }

  /**
   * Format duration
   */
  formatDuration(startTime, endTime = new Date()) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;

    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format date
   */
  formatDate(date = new Date()) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Get session ID from date
   */
  getSessionId(date = new Date()) {
    const d = new Date(date);
    const dateStr = this.formatDate(d);
    const hour = d.getHours();

    let period;
    if (hour < 12) {
      period = 'morning';
    } else if (hour < 17) {
      period = 'afternoon';
    } else {
      period = 'evening';
    }

    return `${dateStr}-${period}`;
  }

  /**
   * Load session data from memory-core
   */
  loadSessionData() {
    const sessionPath = path.join(this.cwd, '.claude-memory/session/current.json');
    try {
      const data = fs.readFileSync(sessionPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Format file list as markdown
   */
  formatFileList(files) {
    if (!files || files.length === 0) return 'None';
    return files.map(f => `- ${f}`).join('\n');
  }

  /**
   * Format changes list as markdown
   */
  formatChangesList(changes) {
    if (!changes || changes.length === 0) return 'None';

    // Group by file
    const byFile = {};
    changes.forEach(change => {
      const file = change.file || 'unknown';
      if (!byFile[file]) byFile[file] = [];
      byFile[file].push(change);
    });

    const lines = [];
    Object.entries(byFile).forEach(([file, fileChanges]) => {
      const shortPath = file.replace(this.cwd, '.');
      lines.push(`- ${shortPath}: ${fileChanges.length} change${fileChanges.length !== 1 ? 's' : ''}`);
    });

    return lines.join('\n');
  }

  /**
   * Check if content already exists (prevent duplicates)
   */
  contentExists(content, searchText) {
    return content.includes(searchText);
  }
}

module.exports = DocHelper;
