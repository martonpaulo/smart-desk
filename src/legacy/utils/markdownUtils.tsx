import { ReactElement } from 'react';

import { Checkbox, Typography } from '@mui/material';

import { parseSafeHtml } from '@/legacy/utils/textUtils';

// Util to convert inline markdown to HTML
function inlineToHtml(text: string): string {
  let html = text;
  html = html.replace(/(\*\*\*|___)([^*_]+?)\1/g, '<strong><em>$2</em></strong>');
  html = html.replace(/(\*\*|__|<b>)([^*]+?)(\*\*|__|<\/b>)/g, '<strong>$2</strong>');
  html = html.replace(/(\*|_|<i>)([^*_]+?)(\*|_|<\/i>)/g, '<em>$2</em>');
  html = html.replace(/(~|-)([^~-]+?)\1/g, '<del>$2</del>');
  html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/@([\w/\-]+)/g, '<a href="/$1">$1</a>');
  html = html.replace(/\\([*_~`])/g, '$1');
  return html;
}

// Parse markdown blocks into React elements
export function renderMarkdown(markdown: string, onToggle: (line: number) => void) {
  const lines = markdown.split(/\r?\n/);
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
    const checkboxMatch = /^- \[( |x)\] (.*)/.exec(line);
    const ulMatch = /^[-*+] (.*)/.exec(line);
    const olMatch = /^\d+\. (.*)/.exec(line);
    if (/^### /.test(line)) {
      closeLists();
      elements.push(
        <Typography key={idx} variant="h6" fontWeight="bold">
          {parseSafeHtml(inlineToHtml(line.replace(/^### /, '')))}
        </Typography>,
      );
    } else if (/^## /.test(line)) {
      closeLists();
      elements.push(
        <Typography key={idx} variant="h5" fontWeight="bold">
          {parseSafeHtml(inlineToHtml(line.replace(/^## /, '')))}
        </Typography>,
      );
    } else if (/^# /.test(line)) {
      closeLists();
      elements.push(
        <Typography key={idx} variant="h4" fontWeight="bold">
          {parseSafeHtml(inlineToHtml(line.replace(/^# /, '')))}
        </Typography>,
      );
    } else if (checkboxMatch) {
      if (!inUl) {
        elements.push(<ul key={`ul-start-${idx}`} />);
        inUl = true;
      }
      const checked = checkboxMatch[1] === 'x';
      const content = checkboxMatch[2];
      elements.push(
        <li key={idx} style={{ listStyle: 'none' }}>
          <Checkbox size="small" checked={checked} onChange={() => onToggle(idx)} sx={{ p: 0.5 }} />
          <span>{parseSafeHtml(inlineToHtml(content))}</span>
        </li>,
      );
    } else if (ulMatch) {
      if (!inUl) {
        elements.push(<ul key={`ul-start-${idx}`} />);
        inUl = true;
      }
      elements.push(<li key={idx}>{parseSafeHtml(inlineToHtml(ulMatch[1]))}</li>);
    } else if (olMatch) {
      if (!inOl) {
        elements.push(<ol key={`ol-start-${idx}`} />);
        inOl = true;
      }
      elements.push(<li key={idx}>{parseSafeHtml(inlineToHtml(olMatch[1]))}</li>);
    } else if (/^> /.test(line)) {
      closeLists();
      elements.push(
        <blockquote key={idx}>{parseSafeHtml(inlineToHtml(line.replace(/^> /, '')))}</blockquote>,
      );
    } else if (/^>> /.test(line)) {
      closeLists();
      elements.push(
        <blockquote key={`${idx}-outer`}>
          <blockquote>{parseSafeHtml(inlineToHtml(line.replace(/^>> /, '')))}</blockquote>
        </blockquote>,
      );
    } else {
      closeLists();
      if (line.trim() === '') {
        elements.push(<br key={idx} />);
      } else {
        elements.push(<Typography key={idx}>{parseSafeHtml(inlineToHtml(line))}</Typography>);
      }
    }
  });
  closeLists();
  return elements;
}
