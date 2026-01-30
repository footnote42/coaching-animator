import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: 'GET works', timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ 
    message: 'POST works', 
    timestamp: Date.now(),
    receivedBody: body 
  });
}

export async function DELETE() {
  return NextResponse.json({ message: 'DELETE works', timestamp: Date.now() });
}
