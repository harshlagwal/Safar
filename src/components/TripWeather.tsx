import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  ShieldAlert,
  Sparkles,
  Plus,
  Check,
  Info,
  Calendar,
} from 'lucide-react';
import { CURATED_DESTINATIONS } from '../data/destinations';
import { DESTINATION_CLIMATE, getWeatherCodeMeta } from '../data/climate';

interface TripWeatherProps {
  destination: string;
  onAddPackingItem?: (item: string) => void;
}

interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  rainProb: number;
}

export const TripWeather: React.FC<TripWeatherProps> = ({
  destination,
  onAddPackingItem,
}) => {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [isLiveForecast, setIsLiveForecast] = useState(false);

  // Find coords for destination
  const destCoords = useMemo(() => {
    const clean = destination.trim().toLowerCase();
    const match = CURATED_DESTINATIONS.find(
      (d) => d.name.toLowerCase() === clean || clean.includes(d.name.toLowerCase())
    );
    if (match) return { lat: match.lat, lng: match.lng };
    return { lat: 28.61, lng: 77.21 }; // Default India center
  }, [destination]);

  // Static climate fallback
  const climateInfo = useMemo(() => {
    const clean = destination.trim();
    return (
      DESTINATION_CLIMATE[clean] ||
      DESTINATION_CLIMATE[Object.keys(DESTINATION_CLIMATE).find((k) => clean.includes(k)) || ''] ||
      DESTINATION_CLIMATE.default
    );
  }, [destination]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchWeather() {
      setLoading(true);
      const cacheKey = `safar_weather_${destination.toLowerCase().replace(/\s+/g, '_')}`;

      // Check localStorage cache (1 hour)
      try {
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - cached.timestamp < oneHour && cached.data) {
            if (!isCancelled) {
              setForecast(cached.data);
              setIsLiveForecast(true);
              setLoading(false);
            }
            return;
          }
        }
      } catch (e) {
        // Continue to fresh fetch
      }

      try {
        // Fetch from Open-Meteo free API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${destCoords.lat}&longitude=${destCoords.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Open-Meteo fetch failed');

        const data = await res.json();
        if (data && data.daily && data.daily.time) {
          const days: DailyForecast[] = data.daily.time.slice(0, 5).map((timeStr: string, idx: number) => ({
            date: timeStr,
            weatherCode: data.daily.weathercode?.[idx] ?? 0,
            tempMax: Math.round(data.daily.temperature_2m_max?.[idx] ?? 25),
            tempMin: Math.round(data.daily.temperature_2m_min?.[idx] ?? 18),
            rainProb: Math.round(data.daily.precipitation_probability_max?.[idx] ?? 0),
          }));

          if (!isCancelled) {
            setForecast(days);
            setIsLiveForecast(true);
            try {
              localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: days }));
            } catch (err) {
              // LocalStorage quota safety
            }
          }
        }
      } catch (err) {
        // Fallback gracefully to static season climate info
        if (!isCancelled) {
          setIsLiveForecast(false);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchWeather();

    return () => {
      isCancelled = true;
    };
  }, [destination, destCoords]);

  // Derived smart packing advice
  const packingHints = useMemo(() => {
    const hints: string[] = [];

    if (forecast && forecast.length > 0) {
      const minTemp = Math.min(...forecast.map((f) => f.tempMin));
      const maxTemp = Math.max(...forecast.map((f) => f.tempMax));
      const maxRain = Math.max(...forecast.map((f) => f.rainProb));

      if (maxRain > 30) hints.push('Umbrella / Poncho zaroori ☂️');
      if (minTemp < 10) hints.push('Heavy Woolens & Thermals 🧥');
      else if (minTemp < 18) hints.push('Light jacket or hoodie 🧣');
      if (maxTemp > 30) hints.push('Sunscreen SPF50 & UV cap 🧢');
      hints.push('Comfortable walking shoes 👟');
    } else {
      // Default to season packing advice
      hints.push(...climateInfo.packingAdvise.summer.slice(0, 3));
    }

    return hints;
  }, [forecast, climateInfo]);

  const handleAddHint = (hint: string) => {
    if (addedItems.includes(hint)) return;
    setAddedItems((prev) => [...prev, hint]);
    if (onAddPackingItem) {
      onAddPackingItem(hint);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e8e8ed] dark:border-[#333336]">
        <div>
          <h3 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-[#ff6b35]" />
            <span>Mausam & Weather Forecast</span>
          </h3>
          <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
            {destination} live atmospheric telemetry & auto packing recommendations
          </p>
        </div>

        {isLiveForecast ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open-Meteo Live</span>
          </span>
        ) : (
          <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1 self-start sm:self-auto">
            <Info className="w-3.5 h-3.5 text-[#ff6b35]" />
            <span>Season Climate Avg</span>
          </span>
        )}
      </div>

      {/* Loading Shimmer */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#f2f2f5] dark:bg-[#2c2c2e] h-24 flex flex-col justify-between"
            />
          ))}
        </div>
      )}

      {/* 5-Day Forecast Grid */}
      {!loading && forecast && forecast.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {forecast.map((day) => {
            const meta = getWeatherCodeMeta(day.weatherCode);
            const dateLabel = new Date(day.date).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={day.date}
                className="p-3.5 rounded-xl bg-[#fafafa] dark:bg-[#252528] border border-[#e8e8ed] dark:border-[#38383a] flex flex-col items-center text-center space-y-1.5"
              >
                <span className="text-[11px] font-medium text-[#86868b] dark:text-[#a1a1a6]">
                  {dateLabel}
                </span>

                <span className="text-[26px] select-none">{meta.icon}</span>

                <span className="text-[11.5px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] line-clamp-1">
                  {meta.label}
                </span>

                <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] pt-0.5">
                  <span>{day.tempMax}°</span>
                  <span className="text-[#86868b] font-normal text-[11.5px]">/ {day.tempMin}°</span>
                </div>

                {day.rainProb > 0 && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{day.rainProb}%</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Note for far-ahead trips */}
      <div className="p-3 rounded-xl bg-[#fafafa] dark:bg-[#222225] border border-[#e8e8ed] dark:border-[#333336] text-[12px] text-[#6e6e73] dark:text-[#a1a1a6] flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[#ff6b35] shrink-0" />
        <span>
          <strong>Traveler Tip:</strong> Open-Meteo provides accurate 16-day forecasts. Agar aapka safar aage ka hai, trip ke 2 hafte pehle exact live mausam yahin auto-update ho jayega.
        </span>
      </div>

      {/* Auto Packing Hints with 1-tap add */}
      <div className="pt-1 space-y-2.5">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
          <span>Mausam ke anusaar packing hints:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {packingHints.map((hint) => {
            const isAdded = addedItems.includes(hint);
            return (
              <button
                key={hint}
                type="button"
                onClick={() => handleAddHint(hint)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer select-none ${
                  isAdded
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-[#f2f2f5] dark:bg-[#2c2c2e] hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e8e8ed] dark:border-[#38383a]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Added to checklist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 text-[#ff6b35]" />
                    <span>{hint}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
