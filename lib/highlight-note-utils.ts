/**
 * @file lib/highlight-note-utils.ts
 * @description
 * Simple markdown utilities for formatting job pick highlight notes.
 * Supports basic formatting: bold (**text**), italic (*text*), and inline code (`code`).
 */

/**
 * Parses simple markdown formatting and returns HTML string.
 * Supports:
 * - **bold text** -> <strong>bold text</strong>
 * - *italic text* -> <em>italic text</em>
 * - `inline code` -> <code>inline code</code>
 * - - bullet point -> <ul><li>bullet point</li></ul>
 * - * bullet point -> <ul><li>bullet point</li></ul>
 * - 1. numbered point -> <ol><li>numbered point</li></ol>
 *
 * @param text Raw text with markdown formatting
 * @returns HTML string with formatting applied
 */
export function parseHighlightNoteMarkdown(text: string): string {
  if (!text) return text

  // Escape HTML entities to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

  // Convert markdown formatting to HTML
  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Handle lists before italic conversion to avoid conflicts
  // Convert bullet lists (- item or * item)
  const lines = html.split("\n")
  const processedLines: string[] = []
  let inUnorderedList = false
  let inOrderedList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Unordered list items (- or *)
    if (line.match(/^[-*]\s+(.+)$/)) {
      const content = line.replace(/^[-*]\s+/, "")
      if (!inUnorderedList) {
        processedLines.push(
          '<ul class="list-disc list-outside space-y-1 ml-4 pl-0">'
        )
        inUnorderedList = true
      }
      if (inOrderedList) {
        processedLines.push("</ol>")
        inOrderedList = false
      }
      processedLines.push(`<li>${content}</li>`)
    }
    // Ordered list items (1. item, 2. item, etc.)
    else if (line.match(/^\d+\.\s+(.+)$/)) {
      const content = line.replace(/^\d+\.\s+/, "")
      if (!inOrderedList) {
        processedLines.push(
          '<ol class="list-decimal list-outside space-y-1 ml-4 pl-0">'
        )
        inOrderedList = true
      }
      if (inUnorderedList) {
        processedLines.push("</ul>")
        inUnorderedList = false
      }
      processedLines.push(`<li>${content}</li>`)
    }
    // Regular line
    else {
      if (inUnorderedList) {
        processedLines.push("</ul>")
        inUnorderedList = false
      }
      if (inOrderedList) {
        processedLines.push("</ol>")
        inOrderedList = false
      }
      if (line) {
        processedLines.push(line)
      } else {
        processedLines.push("")
      }
    }
  }

  // Close any remaining lists
  if (inUnorderedList) processedLines.push("</ul>")
  if (inOrderedList) processedLines.push("</ol>")

  html = processedLines.join("\n")

  // Italic: *text* -> <em>text</em> (but not if it's part of ** or list markers)
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>")

  // Inline code: `text` -> <code>text</code>
  html = html.replace(
    /`([^`]+?)`/g,
    '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
  )

  // Convert line breaks to <br> tags (but not within list structures)
  html = html.replace(/\n(?!<[/]?[uo]l|<li)/g, "<br>")

  return html
}

/**
 * Component props for displaying formatted highlight notes
 */
export interface HighlightNoteDisplayProps {
  text: string
  className?: string
}

/**
 * Returns formatted HTML for safe rendering with dangerouslySetInnerHTML
 */
export function getHighlightNoteHTML(text: string): { __html: string } {
  return { __html: parseHighlightNoteMarkdown(text) }
}
