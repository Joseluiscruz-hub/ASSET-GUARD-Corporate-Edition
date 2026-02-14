const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
}

function safeRun(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (err) {
    return false;
  }
}

try {
  const out = run('git diff --cached --name-only --diff-filter=ACM');
  if (!out) {
    // nothing staged
    process.exit(0);
  }
  const files = out.split(/\r?\n/).filter(Boolean).map(f => f.trim()).filter(Boolean);
  // keep only files that still exist (avoid deleted/renamed entries)
  const existing = files.filter(f => {
    try { return fs.existsSync(path.resolve(f)); } catch (e) { return false; }
  });

  // Only lint TypeScript files with ESLint (avoids TS parser issues for .js files)
  const tsFiles = existing.filter(f => /\.(ts|tsx)$/i.test(f));
  // Prettier for a broader set (including .js and others)
  const format = existing.filter(f => /\.(ts|tsx|js|css|scss|json|html|md)$/i.test(f));

  if (tsFiles.length) {
    console.log('Running ESLint on staged TypeScript files:');
    console.log(tsFiles.join('\n'));
    const filesArg = tsFiles.map(f => '"' + f.replace(/"/g, '\\"') + '"').join(' ');
    const cmd = `npx eslint -c .eslintrc.cjs --fix -- ${filesArg}`;
    const ok = safeRun(cmd);
    if (!ok) {
      console.error('ESLint failed. Aborting commit.');
      process.exit(1);
    }
    try { execSync(`git add ${filesArg}`); } catch (e) {}
  }

  if (format.length) {
    console.log('Running Prettier on staged files:');
    console.log(format.join('\n'));
    const filesArg = format.map(f => '"' + f.replace(/"/g, '\\"') + '"').join(' ');
    try { execSync(`npx prettier --write ${filesArg}`, { stdio: 'inherit' }); } catch (e) { /* ignore */ }
    try { execSync(`git add ${filesArg}`); } catch (e) {}
  }

  process.exit(0);
} catch (err) {
  console.error('pre-commit hook failed:', err && err.message ? err.message : err);
  process.exit(1);
}
