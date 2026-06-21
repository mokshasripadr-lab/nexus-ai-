/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';

export default function WeatherPage() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather?city=London')
      .then(res => res.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-white">Loading weather...</div>;

  return (
    <div className="p-10 min-h-screen bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-6">Weather Forecast</h1>
      
      {weather?.current && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 max-w-xl">
          <h2 className="text-2xl font-semibold mb-2">Current in {weather.current.name}</h2>
          <p className="text-xl">{weather.current.main?.temp}°C - {weather.current.weather?.[0]?.description}</p>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weather?.forecast?.map((item: any, index: number) => (
          <div key={index} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-sm mb-2">{new Date(item.dt * 1000).toLocaleString()}</p>
            <p className="font-bold text-lg">{item.main.temp}°C</p>
            <p className="text-slate-300 capitalize">{item.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
