# Changelog

All notable changes to the Hybrid Memory Bank Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-17

### Added
- Integration with Claude Code's native hook system via shell bridge
- `.claude/settings.json` for automatic hook registration
- Shell wrapper scripts in `.claude/hooks/` for stdin/stdout communication
- Bridge infrastructure (`wrapper.js`) for connecting shell commands to JavaScript implementations

### Fixed
- Hooks now work correctly with Claude Code's expected shell-based hook system
- SessionStart hook properly initializes memory bank on session start
- PostToolUse hook correctly tracks file changes
- UserPromptSubmit hook triggers on completion patterns

### Changed
- Updated installation instructions to reflect new hook system
- Hooks now use hybrid bridge approach instead of direct JavaScript plugin API
- Improved error handling in hook execution

## [0.1.0] - 2025-10-17

### Added
- Initial release of Hybrid Memory Bank Plugin
- Core MemoryStore library for JSON-based memory management
- SessionStart, PostToolUse, and UserPromptSubmit hooks
- 9 slash commands for memory management
- Dual memory system: automated JSON + human-readable markdown
- Session management with auto-archiving
- File change tracking
- Pattern learning capabilities
- Documentation reminders