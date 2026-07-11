import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawCity = searchParams.get('city') || 'London';
    
    // Sanitize input: restrict city name to alphabetic characters, spaces, and hyphens/dots
    const city = rawCity.replace(/[^a-zA-Z\s.-]/g, '');

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenWeather API key not configured' }, { status: 500 });
    }

    // First fetch: Current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    );
    const currentData = await currentRes.json();

    if (!currentRes.ok) {
      console.error('OpenWeather Current API error:', currentData);
      return NextResponse.json({ error: 'Failed to retrieve current weather' }, { status: currentRes.status });
    }

    // Second fetch: 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastRes.json();

    if (!forecastRes.ok) {
      console.error('OpenWeather Forecast API error:', forecastData);
      return NextResponse.json({ error: 'Failed to retrieve forecast' }, { status: forecastRes.status });
    }

    // Merge responses
    const mergedResponse = {
      current: currentData,
      forecast: forecastData.list
    };

    return NextResponse.json(mergedResponse);
  } catch (err: unknown) {
    console.error('Weather API caught exception:', err);
    return NextResponse.json({ error: 'Internal weather service error' }, { status: 500 });
  }
}

