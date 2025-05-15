import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log("SESSION API: Processing session request");
    
    // Parse request body
    const { access_token, refresh_token } = await request.json();

    // Validate required fields
    if (!access_token) {
      console.log("SESSION API: Missing access token");
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    console.log("SESSION API: Setting auth cookies");
    
    // Create a response that includes success message
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cookies set successfully' 
    });
    
    // Set the auth cookies on the response
    response.cookies.set({
      name: 'sb-access-token',
      value: access_token,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    if (refresh_token) {
      response.cookies.set({
        name: 'sb-refresh-token',
        value: refresh_token,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
    
    console.log("SESSION API: Session cookies set successfully");
    
    return response;
  } catch (error: any) {
    console.error('Unexpected error in session API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 