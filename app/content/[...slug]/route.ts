import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// List of allowed content extensions
const ALLOWED_CONTENT_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', 
  '.mp3', '.wav', '.ogg', '.mp4', '.webm'
];

/**
 * Route handler to serve static files from content directory
 * This preserves your content management strategy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    // Join the slug array components to form the file path
    const filePath = path.join(process.cwd(), 'content', ...params.slug);
    console.log(`Serving content file: ${filePath}`);

    // Security: Verify the extension is allowed
    const ext = path.extname(filePath).toLowerCase();
    if (!ALLOWED_CONTENT_EXTENSIONS.includes(ext)) {
      console.error(`Unauthorized file extension requested: ${ext}`);
      return new NextResponse('File type not allowed', { status: 403 });
    }

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const file = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
    };

    // Set the content type
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Return the file
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}