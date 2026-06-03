import { expect, test } from 'bun:test';
import { type PullInfo, toFile, toPullData } from '../src/core/github/pull-map';

function info(overrides: Partial<PullInfo> = {}): PullInfo {
  return {
    title: 'Add feature',
    state: 'open',
    user: { login: 'octocat' },
    base: { ref: 'main' },
    head: { ref: 'feature' },
    additions: 12,
    deletions: 3,
    changed_files: 2,
    commits: 4,
    review_comments: 1,
    labels: [{ name: 'bug', color: 'd73a4a' }],
    requested_reviewers: [{ login: 'hubot' }],
    ...overrides,
  };
}

test('maps a file response to a PullFile', () => {
  const file = toFile({ filename: 'a.ts', status: 'modified', additions: 5, deletions: 2 });
  expect(file).toEqual({ path: 'a.ts', status: 'modified', additions: 5, deletions: 2 });
});

test('derives merged, closed, and draft states', () => {
  expect(toPullData(1, info(), [], []).state).toBe('open');
  expect(toPullData(1, info({ merged: true }), [], []).state).toBe('merged');
  expect(toPullData(1, info({ state: 'closed' }), [], []).state).toBe('closed');
  expect(toPullData(1, info({ draft: true }), [], []).state).toBe('draft');
});

test('carries detail fields and prefixes label colors', () => {
  const data = toPullData(7, info(), [], []);
  expect(data.number).toBe(7);
  expect(data.author).toBe('octocat');
  expect(data.baseRef).toBe('main');
  expect(data.headRef).toBe('feature');
  expect(data.changedFiles).toBe(2);
  expect(data.reviewers).toEqual(['hubot']);
  expect(data.labels[0]).toEqual({ name: 'bug', color: '#d73a4a' });
});

test('falls back when author and reviewers are absent', () => {
  const data = toPullData(1, info({ user: null, requested_reviewers: null }), [], []);
  expect(data.author).toBe('unknown');
  expect(data.reviewers).toEqual([]);
});
