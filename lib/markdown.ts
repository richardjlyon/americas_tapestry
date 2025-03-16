import { remark } from 'remark';
import html from 'remark-html';

/**
 * Process YouTube iframe embeds to ensure they are safe and responsive
 *
 * @param content HTML content that may contain YouTube iframes
 * @returns Processed HTML with safe, responsive YouTube embeds
 */
function processYouTubeEmbeds(content: string): string {
  // Regular expression to match YouTube iframes
  const youtubeIframeRegex =
    /<iframe[^>]*src="https:\/\/www\.youtube\.com\/embed\/[^"]*"[^>]*><\/iframe>/g;

  return content.replace(youtubeIframeRegex, (match) => {
    // Extract the src attribute
    const srcMatch = match.match(/src="([^"]*)"/);
    if (!srcMatch) return match;

    const src = srcMatch[1];

    // Create a responsive wrapper for the iframe
    return `
      <div class="relative w-full aspect-video">
        <iframe
          src="${src}"
          class="absolute top-0 left-0 w-full h-full"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `;
  });
}

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
    removeH1?: boolean; // Whether to remove the first H1 heading
  } = {},
): Promise<string> {
  try {
    const processableContent = content;

    // Process the markdown content
    const processedContent = await remark()
      .use(html, {
        sanitize: {
          // Allow iframes from YouTube
          tagNames: ['iframe'],
          attributes: {
            iframe: [
              'src',
              'width',
              'height',
              'frameborder',
              'allow',
              'allowfullscreen',
              'title',
              'class',
            ],
          },
          protocols: {
            src: ['https'],
          },
          urlSchemes: ['https'],
        },
      })
      .process(processableContent);

    // Convert to string and process YouTube embeds
    let htmlContent = processYouTubeEmbeds(processedContent.toString());

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
