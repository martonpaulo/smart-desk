import React, { Fragment, ReactElement } from 'react';

import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

export function parseBold(input: string): ReactElement {
  const parts = input.split(/(<b>.*?<\/b>)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('<b>') && part.endsWith('</b>')) {
          const content = part.slice(3, -4);
          return <strong key={index}>{content}</strong>;
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

export function parseSafeHtml(content: string) {
  const safeHtml = parse(DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }));
  return safeHtml;
}
