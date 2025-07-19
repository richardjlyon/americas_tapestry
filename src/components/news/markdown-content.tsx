interface MarkdownContentProps {
  html: string;
}

// We need to use dangerouslySetInnerHTML here because we're rendering
// markdown content that has been converted to HTML
export function MarkdownContent({ html }: MarkdownContentProps) {
  // Using a simple div with the HTML content
  return (
    <div
      className="content-typography prose prose-colonial max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
