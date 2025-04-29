import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to handle content directory access and other static files
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle content directory access
  if (pathname.startsWith('/content/')) {
    const response = NextResponse.next();
    
    // Add cache headers for content files
    response.headers.set('Cache-Control', 'public, max-age=86400');
    
    return response;
  }
  
  // Handle video files
  if (pathname.startsWith('/video/')) {
    const response = NextResponse.next();
    
    // Add appropriate headers for video files
    response.headers.set('Cache-Control', 'public, max-age=86400');
    
    return response;
  }
  
  // Continue the request for all other paths
  return NextResponse.next();
}

// Configure the paths that the middleware should match
export const config = {
  matcher: [
    // Match static content paths
    '/content/:path*',
    '/video/:path*',
  ],
};