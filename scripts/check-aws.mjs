import { spawnSync } from 'node:child_process';

// Read-only readiness check. Never installs tools, creates resources, or prints credentials.
let missing = false;
for (const command of ['aws', 'sam']) {
  const result = spawnSync(command, ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) { console.log(`${command}: not installed or unavailable`); missing = true; }
  else console.log((result.stdout || result.stderr).trim());
}
if (missing) { console.log('Follow docs/aws-setup.md to install tools and configure the rebootroute profile.'); process.exit(1); }
const identity = spawnSync('aws', ['sts', 'get-caller-identity', '--profile', 'rebootroute', '--region', 'ap-south-1', '--query', '{Account:Account,Arn:Arn}', '--output', 'json'], { encoding: 'utf8', timeout: 15000 });
if (identity.status !== 0) { console.log('The rebootroute profile is not signed in or the account check failed. Follow docs/aws-setup.md.'); process.exit(1); }
console.log(identity.stdout.trim());
console.log('Account identity verified. Manually confirm a budget alert before deployment.');
