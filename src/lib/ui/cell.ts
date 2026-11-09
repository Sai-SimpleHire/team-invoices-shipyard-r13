import type { ReactNode } from 'react';

/**
 * A table cell that shows something rich (a link, a status, an amount) but sorts and searches by
 * plain text. The data table compares and searches with String(value), so `toString` is what
 * it sees; `presentation.tsx` renders `node`.
 */
export class Cell {
  constructor(
    readonly text: string,
    readonly node: ReactNode,
  ) {}

  toString(): string {
    return this.text;
  }
}
