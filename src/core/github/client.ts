import { GitHubApiError } from '../types';

function authHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getJson<T>(url: string, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { headers: authHeaders(token) });
  } catch {
    throw new GitHubApiError('Network request failed', 0);
  }

  if (response.ok) return (await response.json()) as T;

  const remaining = response.headers.get('X-RateLimit-Remaining');
  const isRateLimit = (response.status === 403 || response.status === 429) && remaining === '0';
  throw new GitHubApiError(await readErrorMessage(response), response.status, isRateLimit);
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}
