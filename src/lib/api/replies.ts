import { NextResponse } from 'next/server';

import type { Invalid } from '@/seams/validate';

/** What a service hands back: the thing it made, or a sentence a person can read. */
export type ServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: 400 | 404 | 409; error: string; fieldErrors?: Record<string, string> };

export function refused(
  status: 400 | 404 | 409,
  error: string,
  fieldErrors?: Record<string, string>,
): ServiceResult<never> {
  return { ok: false, status, error, ...(fieldErrors ? { fieldErrors } : {}) };
}

export function invalidReply(result: Invalid): NextResponse {
  return NextResponse.json(
    { error: result.message, fieldErrors: result.fieldErrors },
    { status: 400 },
  );
}

/** Turn a service's answer into a response, with the detail of a failure kept off the wire. */
export function serviceReply<T>(result: ServiceResult<T>, successStatus = 200): NextResponse {
  if (result.ok) return NextResponse.json(result.value, { status: successStatus });
  return NextResponse.json(
    { error: result.error, ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}) },
    { status: result.status },
  );
}

/** Something broke on our side: log what, answer with a plain sentence. */
export function unexpectedReply(where: string, error: unknown): NextResponse {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[${where}] ${detail}`);
  return NextResponse.json(
    { error: 'That did not save. Nothing has changed; try again.' },
    { status: 500 },
  );
}
