import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to handle content directory access
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the request is for a file in the content directory
  if (pathname.startsWith('/content/')) {
    // Get the response from the content directory
    const response = NextResponse.next();
    
    // Add cache headers for content files
    response.headers.set('Cache-Control', 'public, max-age=86400');
    
    return response;
  }
  
  // Continue the request for all other paths
  return NextResponse.next();
}

// Configure the paths that the middleware should match
export const config = {
  matcher: [
    // Match all paths starting with /content/
    '/content/:path*',
  ],
};