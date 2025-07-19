import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('----------- CLIENT ERROR --------------');
    console.log(JSON.stringify(body.error, null, 2));
    console.log('--------------------------------------');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging debug info:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// Add a route to test MailerLite API directly
export async function GET(request: NextRequest) {
  try {
    // Get email from URL params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';
    const name = searchParams.get('name') || 'Test User';

    console.log(`Testing MailerLite API with email: ${email}, name: ${name}`);

    // MailerLite API v3 endpoint for adding subscribers
    const endpoint = 'https://connect.mailerlite.com/api/subscribers';

    // Prepare request body
    const body = {
      email,
      fields: {
        name,
        source: 'website_debug_endpoint',
      },
      groups: [],
      status: 'active',
    };

    console.log('Request body:', JSON.stringify(body));
    
    // Send request to MailerLite API v3
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env['MAILERLITE_API_KEY'] || ''}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { text: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      request: {
        url: endpoint,
        body,
        auth: process.env['MAILERLITE_API_KEY'] ? 'Bearer token provided' : 'No token',
      }
    });
  } catch (error) {
    console.error('Error testing MailerLite API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
