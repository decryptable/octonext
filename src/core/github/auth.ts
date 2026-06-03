import { GITHUB_HOST } from '../../shared/constants';
import { apiBase } from './endpoints';

export interface TokenCheck {
  ok: boolean;
  login?: string;
  message?: string;
}

export async function validateToken(
  token: string,
  host: string = GITHUB_HOST,
): Promise<TokenCheck> {
  if (!token) return { ok: true };
  try {
    const response = await fetch(`${apiBase(host)}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (response.ok) {
      const user = (await response.json()) as { login: string };
      return { ok: true, login: user.login };
    }
    if (response.status === 401) {
      return {
        ok: false,
        message: 'Token rejected. Check the value and that it has repo read access.',
      };
    }
    return { ok: false, message: `GitHub returned status ${response.status}.` };
  } catch {
    return { ok: false, message: 'Could not reach GitHub to validate the token.' };
  }
}
