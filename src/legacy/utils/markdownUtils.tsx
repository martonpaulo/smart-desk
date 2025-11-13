import { Box, Checkbox, List, ListItem, ListItemIcon, Stack, Typography } from '@mui/material';
import { ReactElement } from 'react';

import { parseSafeHtml } from 'src/legacy/utils/textUtils';

type ListType = 'ul' | 'ol' | 'checkbox';

const escapeMap: Record<string, string> = {
  '*': '␟AST␟',
  _: '␟UND␟',
  '~': '␟TIL␟',
  '`': '␟BQT␟',
  '-': '␟DAS␟',
  '#': '␟HSH␟',
  '[': '␟LBR␟',
  ']': '␟RBR␟',
  '(': '␟LPR␟',
  ')': '␟RPR␟',
  '<': '␟LTH␟',
  '>': '␟GTH␟',
  '\\': '␟BSL␟',
};

function escapeText(text: string): string {
  let escaped = text;

  for (const [char, token] of Object.entries(escapeMap)) {
    // Escape special regex characters in char
    const escapedChar = char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = new RegExp(`\\\\${escapedChar}`, 'g');
    escaped = escaped.replace(pattern, token);
  }

  return escaped;
}

function restoreEscapes(text: string): string {
  let restored = text;

  for (const [char, token] of Object.entries(escapeMap)) {
    const pattern = new RegExp(token, 'g');
    restored = restored.replace(pattern, char);
  }
  return restored;
}

export function normalizeText(text: string): string {
  let normalizedText = text;

  // Step 1: Escape special characters
  normalizedText = escapeText(normalizedText);

  // Arrows: -> and <-
  normalizedText = normalizedText.replace(/(?<!\\)(^|[^-])\-\>(?!>)/g, '$1→');
  normalizedText = normalizedText.replace(/(?<!\\)<\-(?!-)/g, '←');

  // Checkboxes: [ ] and [x]
  normalizedText = normalizedText.replace(/^\s*-?\s*\[\s*x\s*\]\s*(.*)$/gim, '- [x] $1');
  normalizedText = normalizedText.replace(/^\s*-?\s*\[\s*\]\s*(.*)$/gm, '- [ ] $1');

  // Unordered list (e.g., + item or - item)
  normalizedText = normalizedText.replace(/^\s*[+-]\s+(.*)$/gm, '- $1');

  // Line endings: \r\n and \r → \n
  normalizedText = normalizedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Normalize ordered lists: e.g., "5. item" → renumbered from 1.
  const lines = normalizedText.split('\n');
  let olCount = 1;

  normalizedText = lines
    .map(line => {
      if (/^\s*\d+\.\s+/.test(line)) {
        const textOnly = line.replace(/^\s*\d+\.\s+/, '');
        const result = `${olCount}. ${textOnly}`;
        olCount++;
        return result;
      } else {
        olCount = 1;
        return line;
      }
    })
    .join('\n');

  // Step 2: Restore escapes
  normalizedText = restoreEscapes(normalizedText);

  return normalizedText.trim();
}

// Util to convert inline markdown to HTML
function inlineToHtml(text: string): string {
  let html = text;

  // Step 1: Escape special characters
  html = escapeText(html);

  // Handle inline code first — permanently escape inner content
  html = html.replace(/`([^`]+?)`/g, (_, codeContent) => {
    return `<code>${codeContent}</code>`;
  });

  // Bold italics: /***bold italic***/ or ___bold italic___ → <strong><em>bold italic</em></strong>
  html = html.replace(
    /(?<!\w)(\*\*\*|___)([^\s][^*_]*?[^\s])\1(?!\w)/g,
    '<strong><em>$2</em></strong>',
  );

  // Bold: **bold** or __bold__ or <b>bold</b> → <strong>bold</strong>
  html = html.replace(/(?<!\w)(\*\*|__)([^\s][^*_]*?[^\s])\1(?!\w)/g, '<strong>$2</strong>');
  html = html.replace(/<b>([^\s].*?[^\s])<\/b>/g, '<strong>$1</strong>'); // HTML <b>

  // Italic: *italic* or _italic_ or <i>italic</i> → <em>italic</em>
  html = html.replace(/(?<!\w)(\*|_)([^\s][^*_]*?[^\s])\1(?!\w)/g, '<em>$2</em>');
  html = html.replace(/<i>([^\s].*?[^\s])<\/i>/g, '<em>$1</em>'); // HTML <i>

  // Strikethrough: ~strike~ or -strike- → <del>strike</del>
  html = html.replace(/(?<!\w)[~-]([^\s][^~-]*?[^\s])[-~](?!\w)/g, '<del>$1</del>');

  // Image: ![alt](url) → <img src="url" alt="alt" />
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Link: [text](url) → <a href="url" target="_blank" rel="noopener noreferrer">text</a>
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Internal link: #link → <a href="/link">#link</a>
  html = html.replace(/#([\w/=?&\-]+)/g, '<a href="/$1" style="text-decoration: none">#$1</a>');

  // Step 2: Restore escapes
  html = html.replace(/<(code)>[\s\S]*?<\/\1>/g, match => match); // do nothing to <code>
  html = restoreEscapes(html);

  return html;
}

// Parse markdown blocks into React elements
export function renderMarkdown(
  markdown: string,
  onToggle?: (line: number) => void,
): ReactElement[] {
  const lines = markdown.split(/\r?\n/);
  const elements: ReactElement[] = [];

  // accumulate list items until we hit a non-list line
  let currentList: { type: ListType; items: ReactElement[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    elements.push(
      <List key={`list-${elements.length}`} sx={{ paddingY: 0.25 }}>
        {currentList.items}
      </List>,
    );
    currentList = null;
  };

  lines.forEach((line, idx) => {
    const checkboxMatch = /^([*-]?\s*\[\s*(x?)\s*\])\s*(.*)$/i.exec(line);
    const ulMatch = /^[-*+] (.*)/.exec(line);
    const olMatch = /^\d+\. (.*)/.exec(line);

    if (checkboxMatch) {
      const [, , mark, content] = checkboxMatch;
      const checked = mark.toLowerCase() === 'x';
      if (!currentList || currentList.type !== 'checkbox') {
        flushList();
        currentList = { type: 'checkbox', items: [] };
      }
      currentList.items.push(
        <ListItem key={idx} disablePadding sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <ListItemIcon sx={{ minWidth: 0, pr: 0.5 }}>
            <Stack width="1.5rem" height="1.5rem" justifyContent="center" alignItems="center">
              <Checkbox
                size="small"
                checked={checked}
                onChange={() => onToggle?.(idx)}
                sx={{ p: 0 }}
              />
            </Stack>
          </ListItemIcon>

          <Typography
            component="span"
            color={checked ? 'text.secondary' : undefined}
            sx={checked ? { textDecoration: 'line-through' } : undefined}
          >
            {parseSafeHtml(inlineToHtml(content))}
          </Typography>
        </ListItem>,
      );
    } else if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(
        <ListItem key={idx} disablePadding sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <ListItemIcon sx={{ minWidth: 0, pr: 0.5 }}>
            <Stack width="1.5rem" height="1.5rem" justifyContent="center" alignItems="center">
              <Box
                sx={{
                  width: '0.3rem',
                  height: '0.3rem',
                  borderRadius: '50%',
                  backgroundColor: 'text.primary',
                }}
              />
            </Stack>
          </ListItemIcon>
          <Typography component="span">{parseSafeHtml(inlineToHtml(ulMatch[1]))}</Typography>
        </ListItem>,
      );
    } else if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }

      const number = currentList.items.length + 1;

      currentList.items.push(
        <ListItem key={idx} disablePadding sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <ListItemIcon sx={{ minWidth: 0, pr: 0.5 }}>
            <Typography
              fontWeight="500"
              sx={{ width: '1.5rem', textAlign: 'center' }}
              color="text.primary"
            >
              {number}.
            </Typography>
          </ListItemIcon>
          <Typography component="span">{parseSafeHtml(inlineToHtml(olMatch[1]))}</Typography>
        </ListItem>,
      );
    } else {
      flushList();
      // Handle headings and plain text
      if (/^### /.test(line)) {
        elements.push(
          <Typography key={idx} variant="h3" fontWeight="bold" fontSize={'1.125rem'}>
            {parseSafeHtml(inlineToHtml(line.slice(4)))}
          </Typography>,
        );
      } else if (/^## /.test(line)) {
        elements.push(
          <Typography key={idx} variant="h5" fontWeight="bold" fontSize={'1.25rem'}>
            {parseSafeHtml(inlineToHtml(line.slice(3)))}
          </Typography>,
        );
      } else if (/^# /.test(line)) {
        elements.push(
          <Typography key={idx} variant="h4" fontWeight="bold" fontSize={'1.5rem'}>
            {parseSafeHtml(inlineToHtml(line.slice(2)))}
          </Typography>,
        );
      } else if (line.trim() === '') {
        // Handle empty lines
        elements.push(<br key={idx} />);
      } else {
        // Handle plain text
        elements.push(<Typography key={idx}>{parseSafeHtml(inlineToHtml(line))}</Typography>);
      }
    }
  });

  flushList();
  return elements;
}
