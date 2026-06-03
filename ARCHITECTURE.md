# Architecture

OctoNext is split into small, single-purpose modules. Each source file stays
under ~130 lines; when something grows past that it is split into a new file or
folder. There are no documentation comments — names and types carry the intent.

## Build outputs

`scripts/build.ts` bundles three entry points with Bun and emits a loadable
extension into `dist/`:

| Output          | Entry                     | Format | Role                        |
| --------------- | ------------------------- | ------ | --------------------------- |
| `content.js`    | `src/content/index.ts`    | IIFE   | Injected on GitHub pages    |
| `background.js` | `src/background/index.ts` | IIFE   | Service worker / event page |
| `options/*`     | `src/options/*`           | ESM    | Settings page               |
| `content.css`   | `src/styles/*.css`        | —      | Concatenated sidebar styles |
| `manifest.json` | `src/manifest.config.ts`  | —      | Generated per target        |

Assets are copied by `scripts/assets.ts`: Material icon SVGs + a trimmed
`manifest.json` lookup, the bundled fonts, and PNG action icons rendered from
`public/icon.svg` via `scripts/render-icons.ts` (resvg-wasm).
`scripts/package.ts` zips Chrome and Firefox builds into `release/`.

## Source map

```
src/
  shared/      storage, settings, theme, fonts, messaging, dom, browser, logger
  core/        framework-free domain logic
    adapters/    URL → repo context; host adapter
    github/      client, endpoints, ref resolution, pull data, auth (token check)
    icons/       material icon manifest + filename → icon resolution
    bookmarks.ts local bookmark store
    search.ts    tree filtering
  ui/          framework-free view layer
    sidebar/     shell: header, tabs, resizer, draggable toggle
    tree/        tree view, rows, node icons, search results
    panels/      files, pull request, bookmarks
    components/  spinner, message, icon button
    icons.ts     Font Awesome icon registry
  content/     content-script entry, app orchestrator, appearance, render helpers
  background/  service worker: context menu, dynamic scripts, permissions
  options/     settings page
```

## Data flow

1. The content script boots `OctoNextApp`, which injects fonts and builds the
   sidebar.
2. `observeNavigation` reports every SPA URL change.
3. `GitHubAdapter` turns the URL into a `RepoContext`. For tree views,
   `resolveRef` uses `git/matching-refs/heads/{prefix}` so branch names with
   slashes resolve correctly even in very large repositories.
4. `tree-builder` converts the flat API response into a `TreeNode` hierarchy;
   `TreeView` renders it lazily with batched DOM fragments.
5. Pull request pages additionally load changed files and review comments.
6. Preferences live in `chrome.storage.sync`; bookmarks in `chrome.storage.local`.

## Adding a host adapter

Implement the `Adapter` interface in `src/core/adapters/`. An adapter maps a URL
to a `RepoContext`, loads a `RepoTree` and `PullData`, and builds navigation
URLs for nodes. The rest of the UI is host-agnostic.
```
