#!/usr/bin/env node

const path = require('path');
const TeamHelper = require('../lib/teamHelper');

/**
 * Onboarding Documentation Generator
 *
 * Generates comprehensive onboarding guide from team patterns and templates
 */

const USAGE = `
Usage: node onboarding.js [options]

Options:
  --project <name>        Project name (required)
  --output <file>         Output file (default: ONBOARDING.md in docs/)
  --template <name>       Template to use (default: onboarding)
  --dry-run              Show what would be generated without saving
  --help                 Show this help message

The script will prompt for information if not provided via options.

Examples:
  # Generate with prompts
  node onboarding.js --project "My App"

  # Generate with custom output
  node onboarding.js --project "My App" --output custom-onboarding.md

  # Preview without saving
  node onboarding.js --project "My App" --dry-run
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    projectName: null,
    output: null,
    template: 'onboarding',
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--project') {
      options.projectName = args[++i];
    } else if (arg === '--output') {
      options.output = args[++i];
    } else if (arg === '--template') {
      options.template = args[++i];
    }
  }

  return options;
}

function formatTeamPatterns(allPatterns) {
  let formatted = '';

  Object.entries(allPatterns).forEach(([type, patterns]) => {
    if (Object.keys(patterns).length > 0) {
      formatted += `\n### ${type}\n\n`;
      Object.entries(patterns).forEach(([key, pattern]) => {
        formatted += `**${key}**\n`;
        formatted += `- ${pattern.description || 'No description'}\n`;
        if (pattern.example) {
          formatted += `\`\`\`\n${pattern.example}\n\`\`\`\n`;
        }
        formatted += '\n';
      });
    }
  });

  return formatted || 'No team patterns yet. Check back as the team establishes patterns.';
}

function generateOnboarding(team, options) {
  // Load template
  const template = team.loadTemplate(options.template);

  // Load team patterns
  const allPatterns = team.getAllTeamPatterns();

  // Prepare template data
  const data = {
    projectName: options.projectName || 'Project',
    date: team.formatDate(),
    techStack: 'Review package.json and dependencies for current tech stack',
    prerequisites: '- Node.js (version specified in package.json)\n- Git\n- Code editor (VS Code recommended)',
    installationSteps: 'git clone <repository>\ncd <project-directory>\nnpm install',
    runCommands: 'npm run dev',
    teamPatterns: formatTeamPatterns(allPatterns),
    conventions: 'See CONVENTIONS.md for detailed coding conventions',
    gitWorkflow: 'See WORKFLOWS.md for git workflow and branch naming',
    commonTasks: '- Running tests: npm test\n- Building: npm run build\n- Linting: npm run lint',
    troubleshooting: 'Common issues and solutions will be documented here as they arise',
    resources: '- Team documentation in .claude/skills/team-memory/docs/\n- Project README.md'
  };

  return team.renderTemplate(template, data);
}

async function main() {
  const options = parseArgs();
  const team = new TeamHelper();

  if (!options.projectName) {
    console.error('Error: --project name is required');
    console.log(USAGE);
    process.exit(1);
  }

  try {
    console.log('\n📝 Generating onboarding documentation...\n');

    const content = generateOnboarding(team, options);

    if (options.dryRun) {
      console.log('[DRY RUN] Would generate:\n');
      console.log('─'.repeat(60));
      console.log(content);
      console.log('─'.repeat(60));
      return;
    }

    // Determine output path
    const outputFile = options.output || 'ONBOARDING.md';
    const outputPath = team.saveTeamDoc(outputFile, content);

    console.log('✅ Onboarding documentation generated');
    console.log(`   File: ${outputPath}`);
    console.log(`\n💡 Review and customize the generated content`);
    console.log(`💡 Commit to share with team`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs, formatTeamPatterns, generateOnboarding };
