import { markdownToHtml } from './lib/markdown.js';

// Convert path from CommonJS to ESM
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function testMarkdown() {
  console.log('Testing markdown conversion with fixed code...');
  
  const testMarkdown = `
# Test Heading

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

[A link](https://example.com)
`;

  try {
    const result = await markdownToHtml(testMarkdown);
    console.log('Conversion result:');
    console.log(result);
    console.log('\nCheck that headings, paragraphs, bold/italic text, lists, and links are properly rendered in HTML format.');
  } catch (error) {
    console.error('Error converting markdown:', error);
  }
}

testMarkdown();