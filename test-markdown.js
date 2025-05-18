const { markdownToHtml } = require('./lib/markdown');

async function testMarkdown() {
  console.log('Testing markdown conversion...');
  
  const testCases = [
    {
      name: 'Basic paragraph',
      markdown: 'This is a paragraph.',
      expectedStart: '<p>This is a paragraph.</p>'
    },
    {
      name: 'Heading',
      markdown: '# Heading 1',
      expectedStart: '<h1>Heading 1</h1>'
    },
    {
      name: 'Bold text',
      markdown: '**Bold text**',
      expectedStart: '<p><strong>Bold text</strong></p>'
    },
    {
      name: 'List items',
      markdown: '- Item 1\n- Item 2',
      expectedStart: '<ul>'
    }
  ];
  
  for (const test of testCases) {
    try {
      const result = await markdownToHtml(test.markdown);
      const passed = result.trim().startsWith(test.expectedStart.trim());
      console.log(`${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (!passed) {
        console.log('Expected to start with:', test.expectedStart);
        console.log('Received:', result);
      }
    } catch (error) {
      console.error(`Error in test '${test.name}':`, error);
    }
  }
}

testMarkdown();