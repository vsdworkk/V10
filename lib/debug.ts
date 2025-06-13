/*
Provides a simple debug logger that only outputs messages in development.
*/

export function debugLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}
