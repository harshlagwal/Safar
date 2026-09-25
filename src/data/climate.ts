export interface DestinationClimate {
  destination: string;
  summerTemp: [number, number]; // [min, max] °C
  monsoonTemp: [number, number];
  winterTemp: [number, number];
  summerCondition: string;
  monsoonCondition: string;
  winterCondition: string;
  packingAdvise: {
    summer: string[];
    monsoon: string[];
    winter: string[];
  };
}

export const DESTINATION_CLIMATE: Record<string, DestinationClimate> = {
  Manali: {
    destination: 'Manali',
    summerTemp: [10, 25],
    monsoonTemp: [14, 22],
    winterTemp: [-5, 12],
    summerCondition: 'Pleasant & cool mountain breeze',
    monsoonCondition: 'Heavy Himalayan rainfall & landslides',
    winterCondition: 'Sub-zero freezing temperatures & snow',
    packingAdvise: {
      summer: ['Light jacket', 'Sunscreen', 'Walking shoes'],
      monsoon: ['Waterproof jacket', 'Umbrella', 'Trek boots'],
      winter: ['Heavy down jacket', 'Woolen thermals', 'Snow gloves', 'Woolen cap'],
    },
  },
  Shimla: {
    destination: 'Shimla',
    summerTemp: [15, 28],
    monsoonTemp: [16, 23],
    winterTemp: [0, 14],
    summerCondition: 'Crisp & sunny mountain weather',
    monsoonCondition: 'Misty cloud cover & gentle showers',
    winterCondition: 'Chilly winds & occasional snowfall',
    packingAdvise: {
      summer: ['Light cardigan', 'Sunglasses', 'Walking sneakers'],
      monsoon: ['Compact umbrella', 'Rain jacket'],
      winter: ['Heavy woolens', 'Thermals', 'Warm socks'],
    },
  },
  Goa: {
    destination: 'Goa',
    summerTemp: [26, 34],
    monsoonTemp: [24, 30],
    winterTemp: [20, 32],
    summerCondition: 'Warm, sunny beach weather',
    monsoonCondition: 'Lush tropical rainfall & green landscapes',
    winterCondition: 'Perfect balmy sunshine & gentle sea breeze',
    packingAdvise: {
      summer: ['Cotton shorts', 'Sunscreen SPF50', 'Swimwear', 'Sunglasses'],
      monsoon: ['Quick-dry clothes', 'Waterproof pouch for phone', 'Umbrella'],
      winter: ['Breathable linen', 'Beach footwear', 'Light evening layer'],
    },
  },
  Jaipur: {
    destination: 'Jaipur',
    summerTemp: [28, 42],
    monsoonTemp: [25, 34],
    winterTemp: [9, 24],
    summerCondition: 'Intense dry desert heat',
    monsoonCondition: 'Scattered pleasant showers & cloudy skies',
    winterCondition: 'Crisp golden sunshine & chilly nights',
    packingAdvise: {
      summer: ['Light cotton clothing', 'Cap or hat', 'Electrolyte/ORS', 'Sunscreen'],
      monsoon: ['Comfortable sneakers', 'Light rain protection'],
      winter: ['Warm jacket for evenings', 'Shawl or scarf'],
    },
  },
  Rishikesh: {
    destination: 'Rishikesh',
    summerTemp: [22, 36],
    monsoonTemp: [23, 31],
    winterTemp: [8, 22],
    summerCondition: 'Warm days with refreshing river breeze',
    monsoonCondition: 'High river currents & humid showers',
    winterCondition: 'Cool pleasant weather & mystical morning mist',
    packingAdvise: {
      summer: ['Quick-dry clothes for rafting', 'River sandals', 'Sunscreen'],
      monsoon: ['Rain poncho', 'Water-resistant backpack'],
      winter: ['Fleece jacket', 'Comfortable yoga pants', 'Light woolens'],
    },
  },
  // Default fallback climate for other Indian cities
  default: {
    destination: 'India',
    summerTemp: [24, 36],
    monsoonTemp: [23, 31],
    winterTemp: [12, 26],
    summerCondition: 'Sunny & warm weather',
    monsoonCondition: 'Humid with seasonal showers',
    winterCondition: 'Pleasant daytime with cool evenings',
    packingAdvise: {
      summer: ['Breathable cottons', 'Sunscreen', 'Cap/hat'],
      monsoon: ['Umbrella', 'Waterproof phone case'],
      winter: ['Light jacket or sweater', 'Comfortable shoes'],
    },
  },
};

/**
 * Maps Open-Meteo weather codes to human labels and icons
 */
export function getWeatherCodeMeta(code: number): { label: string; icon: string } {
  if (code === 0) return { label: 'Clear sky', icon: '☀️' };
  if (code === 1 || code === 2) return { label: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { label: 'Overcast clouds', icon: '☁️' };
  if (code === 45 || code === 48) return { label: 'Foggy / Misty', icon: '🌫️' };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: 'Rain showers', icon: '🌧️' };
  if ([71, 73, 75, 85, 86].includes(code)) return { label: 'Snowfall', icon: '❄️' };
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorms', icon: '⛈️' };
  return { label: 'Partly sunny', icon: '🌤️' };
}
