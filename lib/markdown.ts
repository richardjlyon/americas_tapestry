import { remark } from 'remark';
import html from 'remark-html';

/**
 * Convert markdown content to HTML
 * 
 * @param content Markdown string to convert to HTML
 * @param options Additional options for markdown processing
 * @returns String containing the HTML rendered from markdown
 */
export async function markdownToHtml(
  content: string,
  options: { 
    removeH1?: boolean // Whether to remove the first H1 heading
  } = {}
): Promise<string> {
  try {
    let processableContent = content;
    
    // Process the markdown content
    const processedContent = await remark()
      .use(html, { sanitize: true }) // Enable sanitization to prevent XSS
      .process(processableContent);
      
    // Convert to string
    let htmlContent = processedContent.toString();
    
    // Optionally remove the first h1 tag if requested (useful for pages that already have an h1)
    if (options.removeH1) {
      htmlContent = htmlContent.replace(/<h1>(.*?)<\/h1>/, '');
    }
    
    return htmlContent;
  } catch (error) {
    console.error('Error processing markdown:', error);
    
    // Fallback to simple paragraph
    return `<p>${content}</p>`;
  }
}

/**
 * Extract an excerpt from markdown content
 * 
 * @param content Markdown string to extract excerpt from
 * @param maxLength Maximum length of the excerpt
 * @returns Plain text excerpt from the first paragraph of content
 */
export function extractExcerpt(content: string, maxLength = 160): string {
  try {
    // Remove h1 titles
    const contentWithoutHeadings = content.replace(/^#\s+.*$/gm, '').trim();
    
    // Get the first paragraph
    const firstParagraph = contentWithoutHeadings
      .split('\n\n')[0]
      .replace(/\n/g, ' ')
      .trim();
    
    // Truncate if needed
    if (firstParagraph.length <= maxLength) {
      return firstParagraph;
    }
    
    return firstParagraph.substring(0, maxLength).trim() + '...';
  } catch (error) {
    console.error('Error extracting excerpt:', error);
    return '';
  }
}