# Memory Bank Skills Suite - Comprehensive Implementation Plan

## Architecture Decision: Suite of Specialized Skills

**Structure**: 4 independent skills that work together
1. **memory-core** - Session management, file tracking, pattern learning
2. **git-workflow** - Git operations with approval gates and best practices
3. **documentation** - Smart markdown generation and documentation management
4. **team-memory** - Team collaboration and shared knowledge features

**Benefits**:
- Use only what you need (install core, optionally add others)
- Each skill has focused responsibility
- Easier to maintain and test
- Can share across projects independently

---

## Repository & Git Strategy

### Repository Structure
```
hybrid-memory-bank-plugin/              # Existing repo
├── .claude-plugin/                     # Existing plugin
├── src/                                # Existing plugin source
└── skills/                             # NEW: Skills suite
    ├── memory-core/
    ├── git-workflow/
    ├── documentation/
    └── team-memory/
```

### Branching Strategy
- **Main branch**: `main` (existing plugin code)
- **Development branch**: `feature/skills-suite` (all skill development)
- **Phase branches**: `phase-1-foundation`, `phase-2-sessions`, etc. (optional checkpoints)

### Git Workflow Rules
1. ✅ **Commit after each phase completes and tests pass**
2. ✅ **Push ONLY after explicit user approval**
3. ✅ **Always show commit message for review before committing**
4. ✅ **Include test results in commit description**
5. ✅ **Tag releases**: `v1.0.0-core`, `v1.0.0-git`, etc.

---

## PHASE 1: Foundation & Core Skill
**Branch**: `feature/skills-suite`
**Goal**: Set up infrastructure, create memory-core skill

### Deliverables
1. Create `skills/` directory structure
2. Create `skills/memory-core/` with:
   - `SKILL.md` (skill definition)
   - `lib/memoryStore.js` (copy from plugin)
   - `scripts/init.js` (initialization)
   - `README.md` (usage docs)
   - `package.json` (dependencies)
3. Create shared `skills/shared-lib/` for common utilities
4. Set up testing infrastructure

### Test Criteria
**Unit Tests**:
- [ ] MemoryStore can read/write JSON files
- [ ] Directory creation works correctly
- [ ] Session ID generation follows format `YYYY-MM-DD-{morning|afternoon|evening}`
- [ ] Timestamps are valid ISO 8601 format

**Integration Tests**:
- [ ] Skill can read plugin-created session data
- [ ] Skill-created session readable by plugin
- [ ] Directory structure matches plugin exactly
- [ ] `.gitignore` created correctly

**Manual Tests**:
- [ ] Invoke skill with "initialize memory bank"
- [ ] Verify `.claude-memory/` directories created
- [ ] Check file permissions are correct
- [ ] Confirm no errors in logs

**Performance Criteria**:
- [ ] Initialization completes in < 500ms
- [ ] File operations complete in < 100ms

### Git Commit
**Before committing**:
1. Run all tests, show results
2. Generate commit message (following Conventional Commits)
3. Show commit message for approval
4. Commit with test summary in body

**Commit Message Format**:
```
feat(skills): add memory-core skill foundation

- Create skills/ directory structure
- Add memory-core skill with SKILL.md
- Copy MemoryStore library from plugin
- Set up shared utilities library
- Add testing infrastructure

Test Results:
✓ 12/12 unit tests passed
✓ 8/8 integration tests passed
✓ 5/5 manual tests passed
✓ Performance: avg 245ms initialization

Compatible with plugin v2.0.0
```

**Push**: ❌ Not yet - wait for approval after Phase 2

---

## PHASE 2: Session Management (memory-core)
**Branch**: Continue on `feature/skills-suite`
**Goal**: Complete core session lifecycle

### Deliverables
1. `scripts/session-start.js` - Initialize/load session
2. `scripts/session-show.js` - Display current session
3. `scripts/session-update.js` - Update task/notes
4. `scripts/session-archive.js` - Archive session
5. Unit tests for each script
6. Integration tests with plugin data

### Test Criteria
**Unit Tests**:
- [ ] Session creation generates correct schema
- [ ] Session update performs deep merge correctly
- [ ] Archive moves file to correct location
- [ ] Session expiration logic works (24h default)
- [ ] Context notes array prevents duplicates
- [ ] currentTask updates properly

**Integration Tests**:
- [ ] Read session created by plugin
- [ ] Plugin can read skill-created session
- [ ] Archive format matches plugin
- [ ] Session transitions work (create → update → archive)

**Manual Tests**:
- [ ] "Show my current session" displays correct info
- [ ] "Start a new session" creates valid session
- [ ] "Add note: testing session management" works
- [ ] "Archive my session" creates archive file
- [ ] Archived session appears in plugin `/memory list-archives`

**Data Validation Tests**:
- [ ] Session JSON validates against schema
- [ ] All timestamps parseable as ISO 8601
- [ ] File paths are absolute
- [ ] Arrays don't exceed size limits

**Performance Criteria**:
- [ ] Session read < 50ms
- [ ] Session write < 100ms
- [ ] Archive operation < 200ms

### Git Commit
**Test summary required**: Show pass/fail counts
**Commit Message**:
```
feat(memory-core): add session management

- Implement session lifecycle (create, update, archive)
- Add session display with formatted output
- Support context notes and task tracking
- Full compatibility with plugin session format

Test Results:
✓ 24/24 unit tests passed
✓ 16/16 integration tests passed
✓ 8/8 manual tests passed
✓ 4/4 data validation tests passed
✓ Performance: all operations < 200ms

Interop verified with plugin v2.0.0
```

**Push**: ⚠️ ASK USER - "Phase 2 complete. Ready to push to remote?"

---

## PHASE 3: File Change Tracking (memory-core)
**Branch**: Continue on `feature/skills-suite`
**Goal**: Manual file tracking (replacement for broken PostToolUse hook)

### Deliverables
1. `scripts/track-change.js` - Record file changes
2. `scripts/show-changes.js` - Display recent changes
3. `scripts/analyze-changes.js` - AI-powered change analysis
4. Tests for change tracking logic
5. Tests for 20-item circular buffer

### Test Criteria
**Unit Tests**:
- [ ] Change recording adds to recentChanges array
- [ ] Array never exceeds 20 items (oldest removed)
- [ ] Newest changes appear first
- [ ] File paths converted to absolute
- [ ] Duplicate changes handled correctly
- [ ] Timestamp auto-added

**Integration Tests**:
- [ ] Changes readable by plugin
- [ ] Plugin changes readable by skill
- [ ] Mixed plugin/skill changes sorted correctly
- [ ] Files auto-added to currentTask.files

**Manual Tests**:
- [ ] "Track change to src/auth/middleware.ts" works
- [ ] "What files have I changed?" displays correctly
- [ ] "Show recent changes" formatted properly
- [ ] AI suggests tracking at appropriate times
- [ ] Can track create/modify/delete actions

**Edge Cases**:
- [ ] Tracking 25 changes keeps only newest 20
- [ ] Relative paths converted to absolute
- [ ] Non-existent file paths handled gracefully
- [ ] Empty file paths rejected

**Performance Criteria**:
- [ ] Track change operation < 100ms
- [ ] Show changes < 150ms (even with 20 items)

### Git Commit
```
feat(memory-core): add file change tracking

- Implement manual file change recording
- Add 20-item circular buffer (newest first)
- Support create/modify/delete actions
- AI-powered change detection and suggestions
- Absolute path normalization

Test Results:
✓ 18/18 unit tests passed
✓ 12/12 integration tests passed
✓ 6/6 manual tests passed
✓ 4/4 edge case tests passed
✓ Performance: all operations < 150ms

Replaces unreliable PostToolUse hook
```

**Push**: ⚠️ ASK USER

---

## PHASE 4: Pattern Learning & Project Info (memory-core)
**Branch**: Continue on `feature/skills-suite`
**Goal**: Knowledge management across sessions

### Deliverables
1. `scripts/learn-pattern.js` - Store patterns
2. `scripts/show-patterns.js` - Display patterns by type
3. `scripts/tech-stack.js` - Manage tech stack
4. `scripts/project-info.js` - Conventions & architecture
5. Pattern validation tests
6. Auto-detection for tech stack

### Test Criteria
**Unit Tests**:
- [ ] Pattern storage in correct JSON format
- [ ] learnedAt timestamp auto-added
- [ ] Pattern types (api, error-handling, ui, database) work
- [ ] Tech stack updates merge correctly
- [ ] lastUpdated timestamp auto-added
- [ ] Custom fields preserved

**Integration Tests**:
- [ ] Patterns readable by plugin
- [ ] Plugin patterns readable by skill
- [ ] Tech stack format matches plugin
- [ ] Multiple pattern types coexist

**Manual Tests**:
- [ ] "Remember this API pattern: REST design" works
- [ ] "What error handling patterns do we use?" displays correctly
- [ ] "Update tech stack: using TanStack Query" updates file
- [ ] "Show API patterns" formatted properly
- [ ] Auto-detection finds framework/language

**Data Validation**:
- [ ] Pattern JSON validates against schema
- [ ] Tech stack JSON validates against schema
- [ ] All timestamps valid ISO 8601

**Performance Criteria**:
- [ ] Pattern save < 100ms
- [ ] Pattern retrieval < 50ms
- [ ] Tech stack detection < 500ms

### Git Commit
```
feat(memory-core): add pattern learning and project info

- Implement pattern storage (api, error-handling, ui, database)
- Add tech stack management with auto-detection
- Support conventions and architecture tracking
- Compatible with plugin pattern format

Test Results:
✓ 22/22 unit tests passed
✓ 14/14 integration tests passed
✓ 8/8 manual tests passed
✓ 3/3 data validation tests passed
✓ Performance: all operations < 500ms

memory-core skill feature complete ✓
```

**Push**: ⚠️ ASK USER - "memory-core complete. Push before starting git-workflow skill?"

---

## PHASE 5: Git Workflow Skill
**Branch**: Continue on `feature/skills-suite`
**Goal**: Create git-workflow skill with approval gates

### Deliverables
1. Create `skills/git-workflow/`
2. `SKILL.md` - Skill definition
3. `scripts/commit.js` - Smart commit with approval
4. `scripts/push.js` - Push with user approval gate
5. `scripts/branch.js` - Branch management
6. `scripts/status.js` - Enhanced git status
7. `config/commit-conventions.json` - Commit message templates

### Test Criteria
**Unit Tests**:
- [ ] Commit message generation follows Conventional Commits
- [ ] Approval gate blocks commit when denied
- [ ] Push gate blocks push when denied
- [ ] Branch creation validates name format
- [ ] Status parsing works correctly

**Integration Tests**:
- [ ] Commits include co-author metadata
- [ ] Commit messages include test results
- [ ] Push only after explicit approval
- [ ] Can handle merge conflicts gracefully

**Manual Tests**:
- [ ] "Create commit for this work" shows preview
- [ ] User can approve/deny commit
- [ ] "Push to remote" asks for approval
- [ ] User can deny push
- [ ] "Create branch for feature X" works
- [ ] Branch naming follows conventions

**Security Tests**:
- [ ] Never push without user approval
- [ ] Never force push without explicit request
- [ ] Never commit sensitive files (.env, credentials)
- [ ] Warn on large file additions

**Performance Criteria**:
- [ ] Commit operation < 2s
- [ ] Push operation varies (network dependent)
- [ ] Status check < 500ms

### Git Commit
```
feat(skills): add git-workflow skill

- Implement smart commit with approval gates
- Add push with mandatory user approval
- Support branch management
- Conventional Commits format
- Security checks for sensitive files

Test Results:
✓ 16/16 unit tests passed
✓ 10/10 integration tests passed
✓ 8/8 manual tests passed
✓ 4/4 security tests passed

Never pushes without explicit user approval ✓
```

**Push**: ⚠️ ASK USER

---

## PHASE 6: Documentation Skill
**Branch**: Continue on `feature/skills-suite`
**Goal**: Smart markdown documentation management

### Deliverables
1. Create `skills/documentation/`
2. `SKILL.md` - Skill definition
3. `scripts/update-current.js` - AI-generated CURRENT.md updates
4. `scripts/add-progress.js` - Session summaries
5. `scripts/add-changelog.js` - Changelog entries
6. `scripts/end-session.js` - Complete session end workflow
7. `templates/` - Markdown templates

### Test Criteria
**Unit Tests**:
- [ ] CURRENT.md generation includes all sections
- [ ] Progress entries properly formatted
- [ ] Changelog follows Keep a Changelog format
- [ ] Templates load correctly
- [ ] Markdown syntax valid

**Integration Tests**:
- [ ] Updates preserve existing content
- [ ] Multiple updates don't create duplicates
- [ ] Session data correctly incorporated
- [ ] memory-core integration works

**Manual Tests**:
- [ ] "Update CURRENT.md with today's work" generates good summary
- [ ] "Add session summary to progress.md" appends correctly
- [ ] "Add to changelog: deployed auth system" follows format
- [ ] "End session and help me document" shows complete workflow
- [ ] AI summaries are accurate and useful

**Content Quality Tests**:
- [ ] AI summaries match actual work done
- [ ] No hallucinated information
- [ ] Proper markdown formatting
- [ ] Links and references work

**Performance Criteria**:
- [ ] Document generation < 3s (AI processing)
- [ ] File updates < 200ms
- [ ] Session end workflow < 5s total

### Git Commit
```
feat(skills): add documentation skill

- AI-powered CURRENT.md generation
- Session summary automation
- Changelog entry management
- Complete session end workflow
- Markdown templates for consistency

Test Results:
✓ 20/20 unit tests passed
✓ 12/12 integration tests passed
✓ 10/10 manual tests passed
✓ 4/4 content quality tests passed
✓ Performance: all operations < 5s
```

**Push**: ⚠️ ASK USER

---

## PHASE 7: Team Memory Skill
**Branch**: Continue on `feature/skills-suite`
**Goal**: Team collaboration features

### Deliverables
1. Create `skills/team-memory/`
2. `SKILL.md` - Skill definition
3. `scripts/team-patterns.js` - Shared pattern library
4. `scripts/onboarding.js` - Generate onboarding docs
5. `scripts/team-sync.js` - Synchronize team memory
6. `templates/` - Team documentation templates

### Test Criteria
**Unit Tests**:
- [ ] Team pattern sharing works
- [ ] Onboarding doc generation complete
- [ ] Team sync handles conflicts
- [ ] Templates render correctly

**Integration Tests**:
- [ ] Multiple team members can use simultaneously
- [ ] No data corruption with concurrent use
- [ ] Git tracking works for team skills
- [ ] Cross-project memory accessible

**Manual Tests**:
- [ ] "Generate onboarding docs" creates useful guide
- [ ] "What patterns does the team use?" shows shared patterns
- [ ] "Sync team memory" updates correctly
- [ ] Team templates apply consistently

**Collaboration Tests**:
- [ ] Two users updating same session handled gracefully
- [ ] Last write wins with notification
- [ ] No file locking issues

**Performance Criteria**:
- [ ] Onboarding generation < 10s
- [ ] Team sync < 3s
- [ ] Pattern retrieval < 500ms

### Git Commit
```
feat(skills): add team-memory skill

- Team-wide pattern sharing
- Automated onboarding documentation
- Team memory synchronization
- Collaborative learning features
- Concurrent usage support

Test Results:
✓ 18/18 unit tests passed
✓ 14/14 integration tests passed
✓ 8/8 manual tests passed
✓ 4/4 collaboration tests passed
✓ Performance: all operations < 10s

Skills suite complete ✓
```

**Push**: ⚠️ ASK USER - "All skills complete. Ready to push entire suite?"

---

## Testing Strategy Overview

### Automated Testing
```bash
# Run after each phase
npm test                          # All unit tests
npm run test:integration          # Integration tests
npm run test:compat              # Plugin compatibility tests
npm run test:performance         # Performance benchmarks
```

### Manual Testing Checklist
Each phase includes manual test scenarios with expected outcomes

### Acceptance Criteria
Every phase must pass:
- ✓ 100% unit tests passing
- ✓ 100% integration tests passing
- ✓ All manual tests verified
- ✓ Performance criteria met
- ✓ Plugin compatibility confirmed

---

## Git Workflow Summary

### Commit Rules
1. **When**: After each phase completes and ALL tests pass
2. **Format**: Conventional Commits (feat/fix/docs/test/refactor)
3. **Body**: Include test results summary
4. **Footer**: Note compatibility version

### Push Rules
1. **When**: ONLY after explicit user approval
2. **Process**:
   - Show what will be pushed
   - Ask: "Ready to push to remote? (yes/no)"
   - If yes → push
   - If no → wait for approval
3. **Safety**: Never force push without explicit user request

### Branch Strategy
- Development: `feature/skills-suite`
- Merge to `main` only after Phase 7 complete
- Tag releases: `v1.0.0` when suite complete

---

## Final Deliverables

### Repository Structure
```
hybrid-memory-bank-plugin/
├── plugin/                      # Existing plugin code
├── skills/
│   ├── memory-core/             # Phase 1-4
│   ├── git-workflow/            # Phase 5
│   ├── documentation/           # Phase 6
│   ├── team-memory/             # Phase 7
│   └── shared-lib/              # Common utilities
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
└── README.md                    # Updated with skills info
```

### Documentation
- Each skill has SKILL.md with usage examples
- Central README explains suite architecture
- CONTRIBUTING.md for future development
- TESTING.md with test procedures

---

## Success Metrics

### Reliability
- ✓ Skills work 100% of time (vs plugin hooks ~60%)
- ✓ Zero data corruption
- ✓ Full plugin compatibility

### Testing
- ✓ 100+ unit tests
- ✓ 60+ integration tests
- ✓ 40+ manual test scenarios
- ✓ Performance benchmarks met

### Git Hygiene
- ✓ 7 well-formed commits (one per phase)
- ✓ All commits include test results
- ✓ Never pushed without approval
- ✓ Clean git history

### Adoption
- ✓ Easy to install (copy skills/)
- ✓ Works standalone or with plugin
- ✓ Team can use via git clone

---

## Next Steps

Ready to begin Phase 1? The first phase will:
1. Create the foundation directory structure
2. Set up memory-core skill infrastructure
3. Copy and test the MemoryStore library
4. Verify complete compatibility with existing plugin data
5. Run comprehensive tests before committing

Estimated time: 1-2 hours for Phase 1 complete with all tests passing.
