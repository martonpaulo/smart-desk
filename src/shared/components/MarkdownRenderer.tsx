import type { ReactElement } from 'react';

import { renderMarkdown } from 'src/legacy/utils/markdownUtils';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Simple component for rendering markdown content.
 * Uses the existing markdown rendering utilities from the legacy codebase.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps): ReactElement {
  return <>{renderMarkdown(content)}</>;
}
