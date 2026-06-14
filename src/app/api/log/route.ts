import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('--- MESSAGES LOG START ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('--- MESSAGES LOG END ---');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
