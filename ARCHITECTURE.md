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
| `options/*`     | `src/options/*`           | ESM    | Settings page + live preview|
| `content.css`   | `src/styles/` + `themes/` | —      | Concatenated sidebar styles |
| `options/themes.css` | `src/styles/themes/` | —      | Theme bundle for the preview|
| `manifest.json` | `src/manifest.config.ts`  | —      | Generated per target        |

Styles are concatenated by `scripts/styles.ts`: a fixed core order followed by
every file in `src/styles/themes/` (one file per theme, scoped by
`[data-octonext-theme]`). Assets are copied by `scripts/assets.ts`: Material icon
SVGs + a trimmed `manifest.json` lookup, the bundled fonts, and PNG action icons
rendered from `public/icon.svg` via `scripts/render-icons.ts` (resvg-wasm).
`scripts/package.ts` zips Chrome and Firefox builds into `release/` and signs a
CRX3 with the key from `keys/` or the `CRX_PRIVATE_KEY` environment variable. CI
runs in `.github/workflows/` (verify on push/PR, package on `v*` tags).

## Source map

```
src/
  shared/      storage, settings, theme, fonts, messaging, dom, browser, logger
  core/        framework-free domain logic
    adapters/    URL → repo context; host adapter
    github/      client, endpoints, ref resolution, pull data + mapping, auth
    icons/       material icon manifest + filename → icon resolution
    bookmarks.ts local bookmark store
    search.ts    tree filtering
  ui/          framework-free view layer
    sidebar/     shell: header, tabs, resizer, draggable toggle
    tree/        tree view, rows, node icons, search results
    panels/      files, bookmarks, and the PR panel (summary, searchable
                 paginated file list with highlighting, review comments)
    components/  spinner, message, icon button
    icons.ts     Font Awesome icon registry
  content/     content-script entry, app orchestrator, appearance, render helpers
  background/  service worker: context menu, dynamic scripts, permissions
  options/     settings page, searchable selects, and a live theme/font preview
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
5. Pull request pages load full PR detail (state, author, branches, totals,
   labels, reviewers), all changed files (paged from the API), and review
   comments — rendered without leaving the page. The file list filters and
   highlights in memory, so searching never re-fetches.
6. Preferences live in `chrome.storage.sync`; bookmarks in `chrome.storage.local`.

## Adding a host adapter

Implement the `Adapter` interface in `src/core/adapters/`. An adapter maps a URL
to a `RepoContext`, loads a `RepoTree` and `PullData`, and builds navigation
URLs for nodes. The rest of the UI is host-agnostic.
