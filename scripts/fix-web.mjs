// Run format, lint with auto-fix, then show only remaining errors and type errors for apps/web

import { spawnSync } from 'node:child_process';

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  return res.status ?? 0;
}

let exitCode = 0;

// 1. Prettier format only web
if (run('pnpm', ['nx', 'format:write', '--projects=web']) !== 0) {
  exitCode = 1;
}

// 2. ESLint auto-fix only web
if (run('pnpm', ['nx', 'run', 'web:lint', '--fix']) !== 0) {
  exitCode = 1;
}

// 3. ESLint report only remaining errors (quiet hides warnings)
if (
  run('pnpm', ['nx', 'run', 'web:lint', '--quiet', '--format=stylish', '--max-warnings=0']) !== 0
) {
  exitCode = 1;
}

// 4. TypeScript check (errors only, no emit)
if (run('tsc', ['-p', 'apps/web/tsconfig.json', '--noEmit']) !== 0) {
  exitCode = 1;
}

process.exit(exitCode);
