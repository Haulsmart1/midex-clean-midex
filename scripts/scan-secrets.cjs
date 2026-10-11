// Never print matched values. Scan tracked source and every reachable commit.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['provider-secret', /\b(?:sk_(?:live|test)_[A-Za-z0-9]{12,}|AKIA[A-Z0-9]{16}|ghp_[A-Za-z0-9]{20,})/],
  ['jwt', /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/],
  ['embedded-transport-password', /\bpass\s*:\s*['"][^'"]+['"]/],
  ['credential-assignment', /(?:SECRET|SERVICE_KEY|SERVICE_ROLE_KEY|PASSWORD|API_KEY)\s*[:=]\s*["']?(?!process\.|\$|undefined|changeme|your[_-]|<)[A-Za-z0-9_./+\-=]{12,}/i],
];
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 });
const findings = [];
function scan(content, source) {
  content.split('\n').forEach((line, index) => {
    for (const [kind, regex] of patterns) if (regex.test(line)) findings.push({ source, line: index + 1, kind });
  });
}
for (const file of git('ls-files', '--cached', '--others', '--exclude-standard').trim().split('\n')) {
  if (/\.(?:js|cjs|mjs|jsx|ts|tsx|json|md|sql|toml)$|(?:^|\/)\.env/.test(file) && fs.existsSync(file)) scan(fs.readFileSync(file, 'utf8'), file);
}
const commits = git('rev-list', '--all').trim().split('\n');
for (const commit of commits) scan(git('show', '--format=', '--no-ext-diff', '--no-renames', commit, '--', '*.js', '*.jsx', '*.ts', '*.json', '*.env*', '.env', '.env.local', '*.toml'), `history:${commit.slice(0, 12)}`);
const report = { commitsScanned: commits.length, findings, note: 'Candidates only; values deliberately suppressed. History line numbers refer to diff lines.' };
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/SECRET-SCAN.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Scanned ${commits.length} commits; ${findings.length} candidate locations. See docs/SECRET-SCAN.json. No values printed.`);
