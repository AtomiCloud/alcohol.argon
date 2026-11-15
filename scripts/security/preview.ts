import { spawn } from 'node:child_process';

// This is a local-only synthetic preview, never an upload/deploy command.
if (process.env.ARGON_SECURITY_SYNTHETIC !== '1') throw new Error('Use pls security:preview');
const vars = Object.entries(process.env).filter(([name]) => name.startsWith('ATOMI_'));
const missingRuntime = process.argv.includes('--missing-runtime');
const runtimeOverrides = process.argv.includes('--runtime-overrides');
const args = ['wrangler', 'dev', '--local', '--env', 'pichu', '--port', '3300', '--ip', '0.0.0.0'];
for (const [name, value] of vars) {
  if (missingRuntime && (name.endsWith('APP__SECRET') || name.endsWith('COOKIE__SECRET'))) continue;
  const override =
    runtimeOverrides &&
    (name.endsWith('APP__SECRET') || name.endsWith('COOKIE__SECRET') || name === 'ATOMI_COMMON__APP__NAME');
  args.push('--var', `${name}:${value}${override ? '-runtime' : ''}`);
}
const env = { ...process.env };
for (const [name] of vars) delete env[name];
const child = spawn('bunx', args, { stdio: 'inherit', env });
for (const signal of ['SIGTERM', 'SIGINT'] as const) process.on(signal, () => child.kill(signal));
child.on('exit', code => process.exit(code ?? 1));
