# OctoNext

A fast, clean **code tree sidebar for GitHub**, built as a Manifest V3 browser
extension with TypeScript and [Bun](https://bun.sh). OctoNext renders a
collapsible file tree for any repository so you can browse code without constant
page loads. Everything runs locally — there is **no backend and no telemetry**.

## Features

- **File tree sidebar** on `github.com` repository pages, powered by the GitHub
  REST API with lazy folder loading for large repositories
- **VS Code file icons** via the Material Icon Theme, plus a minimal icon pack
- **Themes** — Auto, GitHub Light/Dark/Dimmed, One Dark, Dracula, Nord, Monokai,
  Solarized, Gruvbox, Tokyo Night
- **Fonts** — pick from bundled coding fonts (JetBrains Mono, Fira Code, …) or
  system fonts
- **Search** files by name with instant filtering
- **Download** any selection via checkboxes — a single file downloads directly,
  multiple files or folders download as a ZIP that mirrors the repository paths
  (empty folders are skipped)
- **Sizes** — total repository size in the header, plus per-folder and per-file
  sizes in the tree
- **Bookmarks** — save repositories locally and jump back any time
- **Pull request panel** — changed files and review comments, click to jump to
  the diff or comment
- **Dock** the sidebar left or right, resize it, pin it open, and drag the
  toggle button to any height
- **Expand all / collapse all**, keyboard navigation, custom scrollbars
- **GitHub Enterprise** support via per-domain opt-in (right-click the toolbar
  icon → “Enable OctoNext on this domain”)

GitHub sign-in is **only** needed for private repositories: paste a personal
access token in the options page. The token is validated against GitHub before
it is saved and is stored locally in `chrome.storage`.

## Install (from source)

```bash
bun install
bun run build      # outputs the unpacked extension to dist/
```

- **Chrome / Edge**: open `chrome://extensions`, enable Developer mode, click
  **Load unpacked**, and select `dist/`.
- **Firefox**: run `bun run package` and load
  `release/octonext-firefox-vX.Y.Z.zip` via `about:debugging` → This Firefox →
  Load Temporary Add-on.

## Packaging for the stores

```bash
bun run package
```

Produces store-ready and self-distribution artifacts in `release/`:

- `octonext-chrome-vX.Y.Z.zip` — Chrome Web Store (MV3, service worker)
- `octonext-chrome-vX.Y.Z.crx` — signed CRX3 for direct Chrome install
- `octonext-firefox-vX.Y.Z.zip` — Firefox Add-ons upload
- `octonext-firefox-vX.Y.Z.xpi` — installable Firefox package

The CRX is signed with a key in `keys/octonext.pem`, generated on first run and
kept out of version control. Keep it safe to preserve a stable extension ID.

## Development

```bash
bun run dev        # rebuild on change into dist/ (fast incremental)
bun run typecheck  # strict TypeScript checks
bun run test       # unit tests for the core logic
bun run format     # Prettier
```

## Tech stack

- **Bun** — package manager, bundler, test runner, and asset pipeline
- **TypeScript** (strict) — all source, no UI framework
- **material-icon-theme** — VS Code file icons
- **@fortawesome/\*** — UI icons
- **webextension-polyfill** — cross-browser `browser.*` APIs

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the source map and data flow, and
[`CONTRIBUTING.md`](./CONTRIBUTING.md) to get involved.

## License

[MIT](./LICENSE) © [decryptable](https://github.com/decryptable)
