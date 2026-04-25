#!/usr/bin/env node
/**
 * Project Generator CLI
 *
 * Usage:
 *   npx @simpletoolsindia/project-generator my-project
 *   npx @simpletoolsindia/project-generator my-project --typescript --tailwind
 *   npx @simpletoolsindia/project-generator my-project --packages prisma,next-auth,tailwindcss
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI_NAME = '@simpletoolsindia/project-generator';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function parseArgs(args) {
  const config = {
    name: args[0] || 'my-project',
    typescript: true,
    tailwind: true,
    packages: [],
  };

  args.slice(1).forEach(arg => {
    if (arg === '--typescript' || arg === '-ts') config.typescript = true;
    if (arg === '--javascript' || arg === '-js') config.typescript = false;
    if (arg === '--tailwind' || arg === '-tw') config.tailwind = true;
    if (arg === '--no-tailwind') config.tailwind = false;
    if (arg.startsWith('--packages=') || arg.startsWith('-p=')) {
      config.packages = arg.split('=')[1].split(',').map(p => p.trim());
    }
    if (arg === '--help' || arg === '-h') {
      config.help = true;
    }
    if (arg === '--version' || arg === '-v') {
      config.version = true;
    }
  });

  return config;
}

function showHelp() {
  log(`
╔═══════════════════════════════════════════════════════════════╗
║           Project Generator CLI                              ║
║           Create Next.js projects instantly                   ║
╚═══════════════════════════════════════════════════════════════╝

${colors.cyan}Usage:${colors.reset}
  npx ${CLI_NAME} <project-name> [options]

${colors.cyan}Options:${colors.reset}
  --typescript, -ts     Use TypeScript (default)
  --javascript, -js     Use JavaScript instead
  --tailwind, -tw       Add Tailwind CSS (default)
  --no-tailwind         Don't add Tailwind CSS
  --packages=<list>, -p=<list>
                        Additional packages to install
                        Comma-separated list (e.g., prisma,next-auth)

${colors.cyan}Examples:${colors.reset}
  npx ${CLI_NAME} my-app
  npx ${CLI_NAME} my-app --typescript --tailwind
  npx ${CLI_NAME} my-app --packages prisma,tailwindcss,next-auth
  npx ${CLI_NAME} my-app -js --no-tailwind

${colors.cyan}Available packages:${colors.reset}
  prisma, drizzle, mongoose, better-sqlite3
  next-auth, clerk, lucia, jwt
  axios, zod, trpc, hono
  framer-motion, react-router, shadcn
  date-fns, lodash, nanoid
  openai, anthropic, langchain

${colors.cyan}Interactive mode:${colors.reset}
  npx ${CLI_NAME}
  (No arguments starts interactive prompts)
`, 'reset');
}

async function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q) => new Promise(resolve => rl.question(q, resolve));

  log('\n🛠️  Project Generator - Interactive Mode\n', 'bright');

  const name = await question('Project name: ');
  const group = await question('Group ID (com.example): ') || 'com.example';
  const desc = await question('Description: ') || 'A Next.js project';
  const ts = await question('Use TypeScript? (y/n) [y]: ') || 'y';
  const tw = await question('Use Tailwind CSS? (y/n) [y]: ') || 'y';

  log('\n📦 Available packages:', 'cyan');
  log('prisma, drizzle, mongoose | next-auth, clerk, lucia | axios, zod, trpc | framer-motion, shadcn | openai, anthropic\n', 'reset');

  const pkgInput = await question('Additional packages (comma-separated, leave empty for none): ');
  const packages = pkgInput ? pkgInput.split(',').map(p => p.trim()) : [];

  rl.close();

  return {
    name: name || 'my-project',
    group: group,
    description: desc,
    typescript: ts.toLowerCase() !== 'n',
    tailwind: tw.toLowerCase() !== 'n',
    packages,
  };
}

async function createProject(config) {
  const projectName = config.name;
  const projectPath = path.join(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectPath)) {
    log(`❌ Directory "${projectName}" already exists!`, 'red');
    process.exit(1);
  }

  log(`\n🚀 Creating project: ${projectName}`, 'bright');

  // Create Next.js app
  log('\n📦 Creating Next.js app...', 'cyan');
  const tsFlag = config.typescript ? '--typescript' : '--javascript';
  const twFlag = config.tailwind ? '--tailwind' : '';

  try {
    execSync(`npx create-next-app@latest ${projectName} ${tsFlag} ${twFlag} --app --no-src-dir --import-alias "@/*" --yes`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    log('❌ Failed to create Next.js app', 'red');
    process.exit(1);
  }

  // Install additional packages
  if (config.packages && config.packages.length > 0) {
    log('\n📦 Installing additional packages...', 'cyan');
    try {
      execSync(`npm install ${config.packages.join(' ')}`, {
        stdio: 'inherit',
        cwd: projectPath,
      });
    } catch (error) {
      log('⚠️  Some packages failed to install. You can install them manually.', 'yellow');
    }
  }

  // Update README
  const readme = `# ${projectName}

${config.description || 'A Next.js project generated with ' + CLI_NAME}

## Getting Started

\`\`\`bash
cd ${projectName}
npm install
npm run dev
\`\`\`

## Packages

${config.packages.map(p => `- ${p}`).join('\n')}

## Generated with

[Project Generator](https://simpletoolsindia.github.io/project-generator/) - Create Next.js projects instantly.
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

  log(`
╔═══════════════════════════════════════════════════════════════╗
║                    ✅ Project Created!                        ║
╚═══════════════════════════════════════════════════════════════╝

  ${colors.green}cd ${projectName}${colors.reset}
  ${colors.green}npm run dev${colors.reset}

  Project created at: ${path.join(process.cwd(), projectName)}

`, 'green');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    log(`${CLI_NAME} v1.0.0`, 'cyan');
    process.exit(0);
  }

  let config;
  if (args.length === 0 || args[0].startsWith('-')) {
    // Interactive mode
    config = await interactiveMode();
  } else {
    config = parseArgs(args);
  }

  await createProject(config);
}

main().catch(console.error);