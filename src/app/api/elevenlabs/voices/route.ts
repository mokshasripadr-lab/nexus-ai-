/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = "4562438be24c2d704f66abcd51f2978b41d45442abc219138b358f011cb73650";

export async function GET() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
