import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faAnglesDown,
  faAnglesUp,
  faArrowsRotate,
  faBookmark,
  faChevronRight,
  faCodePullRequest,
  faFile,
  faFolder,
  faGear,
  faGripVertical,
  faHeart,
  faMagnifyingGlass,
  faStar,
  faTableColumns,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

function toSvg(def: IconDefinition): string {
  const [width, height, , , path] = def.icon;
  const data = Array.isArray(path) ? path.join('') : path;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="1em" height="1em" aria-hidden="true" fill="currentColor"><path d="${data}"/></svg>`;
}

const DEFS = {
  logo: faGithub,
  chevron: faChevronRight,
  search: faMagnifyingGlass,
  expandAll: faAnglesDown,
  collapseAll: faAnglesUp,
  star: faStar,
  pullRequest: faCodePullRequest,
  refresh: faArrowsRotate,
  settings: faGear,
  close: faXmark,
  dock: faTableColumns,
  trash: faTrash,
  bookmark: faBookmark,
  grip: faGripVertical,
  heart: faHeart,
  file: faFile,
  folder: faFolder,
} as const;

export const ICONS = Object.fromEntries(
  Object.entries(DEFS).map(([name, def]) => [name, toSvg(def)]),
) as Record<keyof typeof DEFS, string>;

export type IconName = keyof typeof DEFS;
