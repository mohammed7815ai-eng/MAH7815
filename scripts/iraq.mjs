// Runs a command with EDITION=iraq on every platform (Windows cmd has no `VAR=value cmd` syntax).
import { spawnSync } from 'child_process';
const r = spawnSync(process.argv.slice(2).join(' '), { stdio: 'inherit', shell: true, env: { ...process.env, EDITION: 'iraq' } });
process.exit(r.status ?? 1);
