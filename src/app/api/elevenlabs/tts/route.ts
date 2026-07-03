import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = "4562438be24c2d704f66abcd51f2978b41d45442abc219138b358f011cb73650";

export async function POST(req: Request) {
  try {
    const { text, voice_id } = await req.json();

    if (!text || !voice_id) {
      return NextResponse.json({ error: 'Missing text or voice_id' }, { status: 400 });
    }

    // Default ElevenLabs model
    const model_id = "eleven_monolingual_v1";

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', errorText);
      throw new Error(`ElevenLabs API returned ${response.status}`);
    }

    // Return the audio stream
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error: any) {
    console.error('Error in TTS API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
