// output — the single print path for every stamp command. Under --json it emits ONLY
// machine-parseable JSON to stdout (EM JTBD-10 / OP O23 — agents never parse a human TTY);
// otherwise a readable summary. Errors go to stderr with a non-zero exit at the caller.

export interface OutputOpts {
  readonly json?: boolean;
}

/** Print a result either as JSON (stdout, exact) or a human-readable rendering. */
export function emit(result: unknown, opts: OutputOpts, humanRender: (r: never) => string): void {
  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }
  process.stdout.write(humanRender(result as never) + "\n");
}

/** A compact human renderer for a list-of-strings section. */
export function bullets(title: string, items: readonly string[]): string {
  return `${title}\n` + items.map((i) => `  - ${i}`).join("\n");
}
