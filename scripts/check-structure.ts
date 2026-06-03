import {
  type Violation,
  checkCssComments,
  checkFileName,
  checkLineCount,
  checkTsComments,
} from './check/rules';
import { ROOT } from './paths';

const CODE_DIRS = ['src', 'scripts', 'tests'];
const STYLE_DIR = 'src/styles';

async function scan(pattern: string): Promise<string[]> {
  const glob = new Bun.Glob(pattern);
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: ROOT, onlyFiles: true })) files.push(file);
  return files;
}

async function collect(): Promise<string[]> {
  const code = await Promise.all(CODE_DIRS.map((dir) => scan(`${dir}/**/*.ts`)));
  const styles = await scan(`${STYLE_DIR}/**/*.css`);
  return [...code.flat(), ...styles].map((file) => file.replaceAll('\\', '/')).sort();
}

async function inspect(file: string): Promise<Violation[]> {
  const source = await Bun.file(`${ROOT}/${file}`).text();
  const violations = [...checkLineCount(file, source), ...checkFileName(file)];
  if (file.endsWith('.ts')) violations.push(...checkTsComments(file, source));
  else violations.push(...checkCssComments(file, source));
  return violations;
}

async function main(): Promise<void> {
  const files = await collect();
  const violations = (await Promise.all(files.map(inspect))).flat();
  if (violations.length === 0) {
    console.log(`Structure check passed for ${files.length} files.`);
    return;
  }
  for (const violation of violations) console.error(`✗ ${violation.file}: ${violation.message}`);
  console.error(`\n${violations.length} structure violation(s) found.`);
  process.exit(1);
}

await main();
