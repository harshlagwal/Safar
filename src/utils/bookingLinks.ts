/**
 * Safar Booking Deep-Links Utility
 * Affiliate-ready URL generator for transport and hotel bookings
 */

export function slugifyCity(city: string): string {
  if (!city) return '';
  return city
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type BookingType = 'bus' | 'train' | 'flight' | 'hotel';

export function detectBookingType(itemName: string): BookingType | null {
  const lower = (itemName || '').toLowerCase();
  if (lower.includes('bus') || lower.includes('volvo') || lower.includes('sleeper')) {
    return 'bus';
  }
  if (lower.includes('train') || lower.includes('rail') || lower.includes('vande bharat') || lower.includes('irctc')) {
    return 'train';
  }
  if (lower.includes('flight') || lower.includes('plane') || lower.includes('air')) {
    return 'flight';
  }
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort') || lower.includes('hostel') || lower.includes('room')) {
    return 'hotel';
  }
  return null;
}

export function buildBookingLink(
  type: BookingType,
  origin: string = '',
  destination: string = ''
): { url: string; label: string } | null {
  const cleanOrigin = slugifyCity(origin);
  const cleanDest = slugifyCity(destination);

  switch (type) {
    case 'bus': {
      if (!cleanOrigin || !cleanDest) return null;
      return {
        url: `https://www.redbus.in/bus-tickets/${cleanOrigin}-to-${cleanDest}`,
        label: 'RedBus',
      };
    }
    case 'train': {
      return {
        url: 'https://www.irctc.co.in/nget/train-search',
        label: 'IRCTC',
      };
    }
    case 'flight': {
      const qOrigin = encodeURIComponent(origin.trim() || 'India');
      const qDest = encodeURIComponent(destination.trim() || 'India');
      return {
        url: `https://www.google.com/travel/flights?q=Flights%20from%20${qOrigin}%20to%20${qDest}`,
        label: 'Google Flights',
      };
    }
    case 'hotel': {
      if (!destination.trim()) return null;
      const qDest = encodeURIComponent(destination.trim());
      return {
        url: `https://www.booking.com/searchresults.html?ss=${qDest}`,
        label: 'Booking.com',
      };
    }
    default:
      return null;
  }
}
