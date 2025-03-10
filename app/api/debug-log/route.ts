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
