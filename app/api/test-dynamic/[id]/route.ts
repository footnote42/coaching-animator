import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  return NextResponse.json({ message: 'GET works', id: params.id, timestamp: Date.now() });
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  return NextResponse.json({ message: 'POST works', id: params.id, timestamp: Date.now() });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return NextResponse.json({ message: 'DELETE works', id: params.id, timestamp: Date.now() });
}
