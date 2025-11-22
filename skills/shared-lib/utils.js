/**
 * Shared Utilities for Memory Bank Skills
 *
 * Common functions used across all memory bank skills.
 */

/**
 * Format a date as a human-readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

/**
 * Format a relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLen - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLen = 50) {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

/**
 * Convert relative path to absolute
 * @param {string} filePath - File path (relative or absolute)
 * @param {string} baseDir - Base directory for relative paths
 * @returns {string} Absolute file path
 */
function toAbsolutePath(filePath, baseDir = process.cwd()) {
  const path = require('path');
  return path.isAbsolute(filePath) ? filePath : path.resolve(baseDir, filePath);
}

/**
 * Validate ISO 8601 timestamp
 * @param {string} timestamp - Timestamp to validate
 * @returns {boolean} True if valid
 */
function isValidTimestamp(timestamp) {
  if (typeof timestamp !== 'string') return false;
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

/**
 * Validate session ID format
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean} True if valid
 */
function isValidSessionId(sessionId) {
  if (typeof sessionId !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}-(morning|afternoon|evening)$/.test(sessionId);
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Logger with consistent formatting
 */
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  debug: (msg) => {
    if (process.env.DEBUG) {
      console.log(`🐛 ${msg}`);
    }
  }
};

module.exports = {
  formatDate,
  formatRelativeTime,
  truncate,
  toAbsolutePath,
  isValidTimestamp,
  isValidSessionId,
  formatFileSize,
  logger
};
