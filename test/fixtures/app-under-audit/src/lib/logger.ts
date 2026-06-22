// Basic application logger — ordinary stdout lines.
export function log(level: "info" | "warn" | "error", message: string): void {
  // eslint-disable-next-line no-console
  console[level](`[${new Date().toISOString()}] ${message}`);
}
