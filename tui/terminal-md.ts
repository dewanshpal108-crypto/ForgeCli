// This module renders markdown text as terminal output.
// It uses the 'marked' library with 'marked-terminal' to convert markdown
// to ANSI-colored terminal text.
// The `renderTerminalMarkdown` function takes a markdown source string,
// trims trailing whitespace, parses it synchronously, and returns the
// rendered terminal string.
//
// The `ensureMarked` function initializes the marked renderer with
// terminal options, ensuring that the width is appropriately set
// based on the current terminal size.

import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

let ready = false;

function ensureMarked(): void {
  if (ready) return;
  const w = Math.max(40, Math.min(process.stdout.columns || 80, 120));
  // @ts-ignore
  marked.use(markedTerminal({ width: w, reflowText: true }, {}));
  ready = true;
}

export function renderTerminalMarkdown(source: string): string {
  ensureMarked();
  return marked.parse(source.trimEnd(), { async: false }) as string;
}