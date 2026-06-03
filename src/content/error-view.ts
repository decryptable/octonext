import { GitHubApiError } from '../core/types';
import { message } from '../ui/components/message';

export function buildErrorView(error: unknown, onOpenSettings: () => void): HTMLElement {
  const action = { label: 'Open settings', onClick: onOpenSettings };

  if (error instanceof GitHubApiError) {
    if (error.isRateLimit) {
      return message(
        'error',
        'GitHub API rate limit reached. Add a personal access token.',
        action,
      );
    }
    if (error.status === 401) {
      return message('error', 'The access token was rejected. Update it in settings.', action);
    }
    if (error.status === 404) {
      return message(
        'error',
        'Not found. If this is a private repository, add an access token in settings.',
        action,
      );
    }
    return message('error', error.message);
  }

  return message('error', 'Something went wrong while loading the tree.');
}
