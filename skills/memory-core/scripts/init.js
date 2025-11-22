#!/usr/bin/env node

/**
 * Memory Bank Initialization Script
 *
 * Initializes the .claude-memory/ directory structure and creates
 * an initial session if one doesn't exist.
 *
 * Compatible with hybrid-memory-bank-plugin data format.
 */

const path = require('path');
const MemoryStore = require('../lib/memoryStore');

async function initialize(workingDirectory = process.cwd()) {
  console.log('🧠 Initializing Memory Bank...\n');

  const memory = new MemoryStore(workingDirectory);

  try {
    // Step 1: Initialize directory structure
    console.log('📁 Creating directory structure...');
    await memory.initialize();
    console.log('   ✓ Created .claude-memory/ directories');
    console.log('   ✓ Created .gitignore');

    // Step 2: Clean expired sessions
    console.log('\n🧹 Cleaning expired sessions...');
    const cleaned = await memory.cleanExpired();
    if (cleaned.cleaned) {
      console.log(`   ✓ Archived expired session: ${cleaned.sessionId}`);
    } else {
      console.log('   ✓ No expired sessions found');
    }

    // Step 3: Get or create current session
    console.log('\n📝 Setting up session...');
    let session = await memory.getCurrentSession();

    if (session) {
      console.log(`   ✓ Found existing session: ${session.sessionId}`);
    } else {
      session = await memory.createSession();
      console.log(`   ✓ Created new session: ${session.sessionId}`);
    }

    // Step 4: Display session info
    console.log('\n' + '='.repeat(60));
    console.log('Memory Bank Status');
    console.log('='.repeat(60));
    console.log(`Session ID:      ${session.sessionId}`);
    console.log(`Started:         ${new Date(session.startedAt).toLocaleString()}`);
    console.log(`Expires:         ${new Date(session.expiresAt).toLocaleString()}`);
    console.log(`Current Task:    ${session.currentTask.feature || '(none)'}`);
    console.log(`Files Tracked:   ${session.currentTask.files.length}`);
    console.log(`Recent Changes:  ${session.recentChanges.length}`);
    console.log(`Context Notes:   ${session.contextNotes.length}`);
    console.log('='.repeat(60));

    // Step 5: Check tech stack
    const techStack = await memory.getTechStack();
    if (techStack) {
      console.log('\n📚 Tech Stack Detected:');
      if (techStack.framework) console.log(`   Framework:    ${techStack.framework}`);
      if (techStack.language) console.log(`   Language:     ${techStack.language}`);
      if (techStack.database?.type) console.log(`   Database:     ${techStack.database.type}`);
      if (techStack.styling) console.log(`   Styling:      ${techStack.styling}`);
    }

    // Step 6: Show memory-bank/ status
    console.log('\n📖 Documentation Status:');
    const fs = require('fs').promises;
    const memoryBankPath = path.join(workingDirectory, 'memory-bank');
    try {
      await fs.access(memoryBankPath);
      const files = await fs.readdir(memoryBankPath);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      console.log(`   Found ${mdFiles.length} documentation files:`);
      mdFiles.forEach(f => console.log(`   - ${f}`));
    } catch (err) {
      console.log('   No memory-bank/ directory found');
      console.log('   💡 Tip: Create memory-bank/ for human-readable documentation');
    }

    console.log('\n✅ Memory Bank initialized successfully!\n');

    return {
      success: true,
      sessionId: session.sessionId,
      directories: ['.claude-memory/', 'memory-bank/'],
      session
    };

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run if called directly
if (require.main === module) {
  const workingDir = process.argv[2] || process.cwd();
  initialize(workingDir)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { initialize };
