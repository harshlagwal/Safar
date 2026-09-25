export interface Holiday {
  name: string;
  date: string; // YYYY-MM-DD
  day: string;
  isNationalHoliday?: boolean;
  notes?: string;
}

export const INDIAN_HOLIDAYS: Holiday[] = [
  // 2026 Holidays
  { name: 'Republic Day', date: '2026-01-26', day: 'Monday', isNationalHoliday: true },
  { name: 'Maha Shivratri', date: '2026-02-15', day: 'Sunday' },
  { name: 'Holi', date: '2026-03-04', day: 'Wednesday', notes: 'Take 2 days off for 5-day mega break' },
  { name: 'Id-ul-Fitr (Eid)', date: '2026-03-21', day: 'Saturday' },
  { name: 'Good Friday', date: '2026-04-03', day: 'Friday', notes: '3-day weekend (Fri-Sun)' },
  { name: 'Ambedkar Jayanti', date: '2026-04-14', day: 'Tuesday' },
  { name: 'Mahavir Jayanti', date: '2026-04-30', day: 'Thursday', notes: 'Take Friday off for 4-day weekend' },
  { name: 'Buddha Purnima', date: '2026-05-31', day: 'Sunday' },
  { name: 'Bakrid / Eid al-Adha', date: '2026-05-27', day: 'Wednesday' },
  { name: 'Muharram', date: '2026-06-26', day: 'Friday', notes: '3-day weekend (Fri-Sun)' },
  { name: 'Independence Day', date: '2026-08-15', day: 'Saturday' },
  { name: 'Janmashtami', date: '2026-09-04', day: 'Friday', notes: '3-day weekend (Fri-Sun)' },
  { name: 'Milad-un-Nabi', date: '2026-09-25', day: 'Friday', notes: '3-day weekend (Fri-Sun)' },
  { name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', day: 'Friday', notes: '3-day weekend (Fri-Sun)' },
  { name: 'Dussehra (Vijayadashami)', date: '2026-10-20', day: 'Tuesday' },
  { name: 'Diwali (Deepavali)', date: '2026-11-08', day: 'Sunday', notes: 'Festive long week' },
  { name: 'Govardhan Puja', date: '2026-11-09', day: 'Monday', notes: '3-day weekend with weekend' },
  { name: 'Bhai Dooj', date: '2026-11-11', day: 'Wednesday' },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', day: 'Tuesday' },
  { name: 'Christmas Day', date: '2026-12-25', day: 'Friday', notes: '3-day holiday weekend (Fri-Sun)' },

  // 2027 Holidays Preview
  { name: 'New Year', date: '2027-01-01', day: 'Friday', notes: '3-day weekend' },
  { name: 'Republic Day', date: '2027-01-26', day: 'Tuesday' },
  { name: 'Holi', date: '2027-03-22', day: 'Monday', notes: '3-day weekend (Sat-Mon)' },
  { name: 'Good Friday', date: '2027-03-26', day: 'Friday', notes: '3-day weekend (Fri-Sun)' },
];

export interface NextBreakInfo {
  holiday: Holiday;
  breakDays: number;
  startDate: string;
  endDate: string;
  tagline: string;
  isLongWeekend: boolean;
}

/**
 * Calculates the next upcoming holiday or long weekend break from today's date
 */
export function getNextUpcomingBreak(currentDate: Date = new Date()): NextBreakInfo {
  const todayStr = currentDate.toISOString().slice(0, 10);

  // Find all future holidays
  const future = INDIAN_HOLIDAYS.filter((h) => h.date >= todayStr);

  // If none remaining in current calendar, default to next year's first holiday
  const targetHoliday = future[0] || INDIAN_HOLIDAYS[0];

  const hDate = new Date(targetHoliday.date);
  const dayOfWeek = hDate.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  let breakDays = 3;
  let isLongWeekend = false;
  let start = targetHoliday.date;
  let end = targetHoliday.date;

  if (dayOfWeek === 1) {
    // Monday holiday: Sat-Mon = 3 days
    breakDays = 3;
    isLongWeekend = true;
    const s = new Date(hDate);
    s.setDate(s.getDate() - 2);
    start = s.toISOString().slice(0, 10);
    end = targetHoliday.date;
  } else if (dayOfWeek === 5) {
    // Friday holiday: Fri-Sun = 3 days
    breakDays = 3;
    isLongWeekend = true;
    const e = new Date(hDate);
    e.setDate(e.getDate() + 2);
    start = targetHoliday.date;
    end = e.toISOString().slice(0, 10);
  } else if (dayOfWeek === 4) {
    // Thursday: Take Friday off -> 4 days
    breakDays = 4;
    isLongWeekend = true;
    const e = new Date(hDate);
    e.setDate(e.getDate() + 3);
    start = targetHoliday.date;
    end = e.toISOString().slice(0, 10);
  } else if (dayOfWeek === 2) {
    // Tuesday: Take Monday off -> 4 days
    breakDays = 4;
    isLongWeekend = true;
    const s = new Date(hDate);
    s.setDate(s.getDate() - 3);
    start = s.toISOString().slice(0, 10);
    end = targetHoliday.date;
  } else {
    // Midweek or weekend holiday
    breakDays = 3;
    isLongWeekend = false;
  }

  return {
    holiday: targetHoliday,
    breakDays,
    startDate: start,
    endDate: end,
    tagline: isLongWeekend
      ? `${breakDays} din ka long weekend break sambhav!`
      : `Next public holiday: ${targetHoliday.day}`,
    isLongWeekend,
  };
}
