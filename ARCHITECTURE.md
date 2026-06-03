# Architecture

OctoNext is split into small, single-purpose modules. Each source file stays
under ~130 lines; when something grows past that it is split into a new file or
folder. There are no documentation comments — names and types carry the intent.

## Build outputs

`scripts/build.ts` bundles three entry points with Bun and emits a loadable
extension into `dist/`:

| Output          | Entry                  | Format | Role                          |
| --------------- | ---------------------- | ------ | ----------------------------- |
| `content.js`    | `src/content/index.ts` | IIFE   | Injected on GitHub pages      |
| `background.js` | `src/background/index.ts` | ESM | Service worker                |
| `options/*`     | `src/options/*`        | ESM    | Settings page                 |
| `content.css`   | `src/styles/*.css`     | —      | Concatenated sidebar styles   |
| `manifest.json` | `src/manifest.config.ts` | —    | Generated, version from `package.json` |

## Source map

```
src/
  shared/      cross-context utilities (storage, settings, messaging, dom, logger)
  core/        framework-free domain logic
    adapters/    parse a URL into a repo context; talk to a host
    github/      REST client, endpoints, flat-to-tree builder
    navigation/  SPA navigation observer
  ui/          framework-free view layer
    sidebar/     shell: header, body, resizer, toggle
    tree/        tree view, rows, node icons
    components/  spinner, message
  content/     content-script entry + app orchestrator
  background/  service worker: context menu, dynamic scripts, permissions
  options/     settings page
```

## Data flow

1. The content script (`content/index.ts`) boots `OctoNextApp`.
2. `observeNavigation` reports every SPA URL change.
3. `GitHubAdapter` turns the URL into a `RepoContext`, resolves the default
   branch when needed, and fetches the repository tree.
4. `tree-builder` converts the flat API response into a `TreeNode` hierarchy.
5. `TreeView` renders the hierarchy into the `Sidebar`; clicking a file
   navigates, clicking a folder expands lazily.
6. Preferences live in `chrome.storage.sync` via `shared/storage.ts`.

## Adding a host adapter

Implement the `Adapter` interface in `src/core/adapters/` and return it for the
current host. An adapter maps a URL to a `RepoContext`, loads a `RepoTree`, and
builds navigation URLs for nodes. The rest of the UI is host-agnostic.
