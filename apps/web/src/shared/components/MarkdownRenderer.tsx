import { renderMarkdown } from 'src/legacy/utils/markdownUtils';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Simple component for rendering markdown content.
 * Uses the existing markdown rendering utilities from the legacy codebase.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps): React.ReactElement {
  return <>{renderMarkdown(content)}</>;
}
