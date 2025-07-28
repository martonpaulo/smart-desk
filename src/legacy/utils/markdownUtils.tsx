import { ReactElement } from 'react';

import { Checkbox, Typography } from '@mui/material';

import { parseSafeHtml } from '@/legacy/utils/textUtils';

// Util to convert inline markdown to HTML
function inlineToHtml(text: string): string {
  let html = text;

  // Bold italics: /***bold italic***/ or ___bold italic___ → <strong><em>bold italic</em></strong>
  html = html.replace(/(\*\*\*|___)([^*_]+?)\1/g, '<strong><em>$2</em></strong>');

  // Bold: **bold** or __bold__ or <b>bold</b> → <strong>bold</strong>
  html = html.replace(/(\*\*|__|<b>)([^*]+?)(\*\*|__|<\/b>)/g, '<strong>$2</strong>');

  // Italic: *italic* or _italic_ or <i>italic</i> → <em>italic</em>
  html = html.replace(/(\*|_|<i>)([^*_]+?)(\*|_|<\/i>)/g, '<em>$2</em>');

  // Strikethrough: ~strike~ or -strike- → <del>strike</del>
  html = html.replace(/(~|-)([^~-]+?)\1/g, '<del>$2</del>');

  // Inline code: `code` → <code>code</code>
  html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');

  // Image: ![alt](url) → <img src="url" alt="alt" />
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Link: [text](url) → <a href="url">text</a>
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Internal link: #link → <a href="/link">link</a>
  html = html.replace(/#([\w/\-]+)/g, '<a href="/$1">#$1</a>');

  // Escape punctuation: \* \_ \~ \` → literal char
  html = html.replace(/\\([*_~`])/g, '$1');

  return html;
}

// Parse markdown blocks into React elements
export function renderMarkdown(markdown: string, onToggle: (line: number) => void) {
  const lines = markdown.split(/\r?\n/); // split on CRLF or LF
  const elements: ReactElement[] = [];

  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      elements.push(<ul key={`ul-end-${elements.length}`} />);
      inUl = false;
    }
    if (inOl) {
      elements.push(<ol key={`ol-end-${elements.length}`} />);
      inOl = false;
    }
  };

  lines.forEach((line, idx) => {
    // Checkbox: "- [ ] item" or "- [x] item"
    const checkboxMatch = /^([*-]?\s*\[\s*(x?)\s*\])\s*(.*)$/i.exec(line);

    // Unordered list: "- item", "* item", "+ item"
    const ulMatch = /^[-*+] (.*)/.exec(line);

    // Ordered list: "1. item", "2. item", etc.
    const olMatch = /^\d+\. (.*)/.exec(line);

    if (/^### /.test(line)) {
      // Heading level 3: "### Heading"
      closeLists();
      elements.push(
        <Typography key={idx} variant="h6" fontWeight="bold">
          {parseSafeHtml(inlineToHtml(line.replace(/^### /, '')))}
        </Typography>,
      );
    } else if (/^## /.test(line)) {
      // Heading level 2: "## Heading"
      closeLists();
      elements.push(
        <Typography key={idx} variant="h5" fontWeight="bold">
          {parseSafeHtml(inlineToHtml(line.replace(/^## /, '')))}
        </Typography>,
      );
    } else if (/^# /.test(line)) {
      // Heading level 1: "# Heading"
      closeLists();
      elements.push(
        <Typography key={idx} variant="h4" fontWeight="bold">
          {parseSafeHtml(inlineToHtml(line.replace(/^# /, '')))}
        </Typography>,
      );
    } else if (checkboxMatch) {
      const [, , mark, content] = checkboxMatch;
      const checked = mark.toLowerCase() === 'x';

      if (!inUl) {
        elements.push(<ul key={`ul-start-${idx}`} />);
        inUl = true;
      }

      elements.push(
        <li key={idx} style={{ listStyle: 'none' }}>
          <Checkbox size="small" checked={checked} onChange={() => onToggle(idx)} sx={{ p: 0.5 }} />
          <span>{parseSafeHtml(inlineToHtml(content))}</span>
        </li>,
      );
    } else if (ulMatch) {
      // unordered list item
      if (!inUl) {
        elements.push(<ul key={`ul-start-${idx}`} />);
        inUl = true;
      }
      elements.push(<li key={idx}>{parseSafeHtml(inlineToHtml(ulMatch[1]))}</li>);
    } else if (olMatch) {
      // ordered list item
      if (!inOl) {
        elements.push(<ol key={`ol-start-${idx}`} />);
        inOl = true;
      }
      elements.push(<li key={idx}>{parseSafeHtml(inlineToHtml(olMatch[1]))}</li>);
    } else if (/^> /.test(line)) {
      // Blockquote level 1: "> quote"
      closeLists();
      elements.push(
        <blockquote key={idx}>{parseSafeHtml(inlineToHtml(line.replace(/^> /, '')))}</blockquote>,
      );
    } else if (/^>> /.test(line)) {
      // Nested blockquote: ">> nested quote"
      closeLists();
      elements.push(
        <blockquote key={`${idx}-outer`}>
          <blockquote>{parseSafeHtml(inlineToHtml(line.replace(/^>> /, '')))}</blockquote>
        </blockquote>,
      );
    } else {
      closeLists();
      if (line.trim() === '') {
        // empty line → line break
        elements.push(<br key={idx} />);
      } else {
        // plain paragraph
        elements.push(<Typography key={idx}>{parseSafeHtml(inlineToHtml(line))}</Typography>);
      }
    }
  });

  closeLists();
  return elements;
}
