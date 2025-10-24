import { NextRequest, NextResponse } from 'next/server';

// GET /api/hello
export async function GET() {
  // Access environment variables
  const jwtSecret = process.env.JWT_SECRET;
  const dbUrl = process.env.DATABASE_URL;
  
  return NextResponse.json({
    message: 'Hello from Fraterny API!',
    timestamp: new Date().toISOString(),
    status: 'success',
    // NEVER return actual secrets in response - this is just for demo
    hasJwtSecret: !!jwtSecret,
    hasDbUrl: !!dbUrl
  });
}

// POST /api/hello
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Data received successfully!',
      received: body,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        message: 'Invalid JSON data',
        status: 'error'
      },
      { status: 400 }
    );
  }
}