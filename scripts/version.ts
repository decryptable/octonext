import { fromRoot } from './paths';

const NUMERIC = /^v?\d+(\.\d+){0,3}$/;

function clean(value: string): string {
  return value.trim().replace(/^v/, '');
}

function run(args: string[]): string | undefined {
  try {
    const proc = Bun.spawnSync(['git', ...args], { cwd: fromRoot('.'), stderr: 'ignore' });
    if (!proc.success) return undefined;
    const out = new TextDecoder().decode(proc.stdout).trim();
    return out.length > 0 ? out : undefined;
  } catch {
    return undefined;
  }
}

function fromEnv(): string | undefined {
  const ref = process.env.RELEASE_VERSION ?? process.env.GITHUB_REF_NAME;
  return ref && NUMERIC.test(ref.trim()) ? clean(ref) : undefined;
}

function fromGit(): string | undefined {
  const tag = run(['describe', '--tags', '--abbrev=0']);
  if (!tag || !NUMERIC.test(tag)) return undefined;
  const base = clean(tag);
  if (run(['describe', '--tags', '--exact-match'])) return base;
  const count = run(['rev-list', '--count', `${tag}..HEAD`]);
  return count && count !== '0' ? `${base}.${count}` : base;
}

async function fromPackage(): Promise<string> {
  const pkg = (await Bun.file(fromRoot('package.json')).json()) as { version: string };
  return pkg.version;
}

export async function resolveVersion(): Promise<string> {
  return fromEnv() ?? fromGit() ?? (await fromPackage());
}
