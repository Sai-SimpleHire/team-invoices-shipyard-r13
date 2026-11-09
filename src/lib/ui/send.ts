/** Sending a form to the app's own API from the browser, with every failure turned into words. */

export type SendResult<T> =
  { ok: true; data: T } | { ok: false; message: string; fieldErrors: Record<string, string> };

interface ErrorBody {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const OFFLINE = 'Could not reach the app. Check your connection and try again.';
const SIGNED_OUT =
  'You have been signed out. Sign in again in another tab; what you typed is here.';
const FAILED = 'That did not save. Nothing has changed; try again.';

export async function sendJson<T>(
  url: string,
  request: { method: 'POST' | 'PUT'; body: unknown },
): Promise<SendResult<T>> {
  const response = await fetch(url, {
    method: request.method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request.body),
  }).catch(() => null);

  if (!response) return { ok: false, message: OFFLINE, fieldErrors: {} };

  const payload: unknown = await response.json().catch(() => ({}));
  if (response.ok) return { ok: true, data: payload as T };
  if (response.status === 401) return { ok: false, message: SIGNED_OUT, fieldErrors: {} };

  const body = payload as ErrorBody;
  return { ok: false, message: body.error ?? FAILED, fieldErrors: body.fieldErrors ?? {} };
}
