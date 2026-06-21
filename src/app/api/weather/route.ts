import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || 'London';
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenWeather API key not configured' }, { status: 500 });
  }

  try {
    // First fetch: Current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    const currentData = await currentRes.json();

    if (!currentRes.ok) {
      return NextResponse.json(currentData, { status: currentRes.status });
    }

    // Second fetch: 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastRes.json();

    if (!forecastRes.ok) {
      return NextResponse.json(forecastData, { status: forecastRes.status });
    }

    // Merge responses
    const mergedResponse = {
      current: currentData,
      forecast: forecastData.list
    };

    return NextResponse.json(mergedResponse);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
