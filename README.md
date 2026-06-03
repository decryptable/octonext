# OctoNext

A fast, clean **code tree sidebar for GitHub**, built as a Manifest V3 browser
extension with TypeScript and [Bun](https://bun.sh). OctoNext renders a
collapsible file tree for any repository so you can browse code without
constant page loads.

> Status: early foundation. The core tree sidebar works; more features are on
> the roadmap below.

## Features

- File tree sidebar injected on `github.com` repository pages
- Powered by the GitHub REST API (`git/trees`) with optional access token
- Resizable and pinnable sidebar with persisted preferences
- SPA-aware: follows GitHub's in-page (Turbo/pjax) navigation
- Optional GitHub Enterprise support via per-domain opt-in (right-click the
  toolbar icon → "Enable OctoNext on this domain")
- Zero UI frameworks — small, dependency-light, framework-free DOM

## Install (from source)

```bash
bun install
bun run build
```

Then load the extension:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the generated `dist/` folder

Add a [personal access token](https://github.com/settings/tokens) in the
extension options to browse private repositories and raise the API rate limit.

## Development

```bash
bun run dev        # rebuild on change into dist/
bun run typecheck  # strict TypeScript checks
bun run test       # unit tests for the core logic
bun run format     # Prettier
```

## Tech stack

- **Bun** — package manager, bundler, and test runner
- **TypeScript** (strict) — all source
- **webextension-polyfill** — cross-browser `browser.*` APIs
- No runtime UI dependencies

## Project layout

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a tour of the source tree and how
the pieces fit together.

## Roadmap

- File-type icons and search/filter within the tree
- Lazy subtree loading for very large repositories
- Branch and tag switching from the header
- Pull request and diff helpers

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © [decryptable](https://github.com/decryptable)
