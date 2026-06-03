# Contributing to OctoNext

Thanks for your interest in improving OctoNext! This project aims to stay small,
readable, and easy to fork.

## Getting started

```bash
bun install
bun run dev    # watch build into dist/
```

Load `dist/` as an unpacked extension (see the README), then reload it from
`chrome://extensions` after each rebuild.

## Code style

- **TypeScript, strict mode.** `bun run typecheck` must pass.
- **Keep files small.** Aim for ~130 lines per file. If a file grows beyond
  that, split it into a folder or sibling module.
- **No documentation comments.** Prefer clear names and types. Use a short
  comment only to explain a non-obvious "why".
- **Framework-free.** The UI is plain DOM via the `h()` helper in
  `src/ui/dom.ts`. Avoid adding runtime UI dependencies.
- Run `bun run format` before committing.

## Tests

Pure logic (URL parsing, tree building, encoders) is covered by `bun test`. Add
or update tests under `tests/` when you change that logic.

```bash
bun run test
bun run typecheck
```

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org):

```
feat(tree): lazy-load subtrees for large repositories
fix(sidebar): keep width within bounds while resizing
```

Keep commits focused and ensure the build and tests pass before opening a pull
request.

## Project structure

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the source map and data flow.
