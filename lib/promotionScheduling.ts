/**
 * Promotion Scheduling Utilities
 * Handles time-based availability checks for promotions with complex schedules
 */

import { PromotionSchedule, DayOfWeek } from '../types';

/**
 * Get the current day of week
 */
export const getCurrentDayOfWeek = (): DayOfWeek => {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[new Date().getDay()];
};

/**
 * Format time as HH:mm for comparison
 */
export const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Parse time string "HH:mm" to minutes since midnight
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if current time is within a specific time period
 */
export const isTimeInPeriod = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Handle overnight periods (e.g., 22:00 to 02:00)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

/**
 * Check if current date/time is on a blackout date
 */
export const isBlackoutDate = (blackoutDates: string[]): boolean => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  return blackoutDates.includes(todayISO);
};

/**
 * Check if promotion is active for specific days and times
 */
export const isActiveOnDaysAndTimes = (
  daysOfWeek: Array<{
    day: DayOfWeek;
    enabled: boolean;
    timePeriods: Array<{ startTime: string; endTime: string }>;
  }>
): boolean => {
  const currentDay = getCurrentDayOfWeek();
  const daySchedule = daysOfWeek.find(d => d.day === currentDay);
  
  if (!daySchedule || !daySchedule.enabled) {
    return false;
  }
  
  // Check if current time falls within any of the day's time periods
  return daySchedule.timePeriods.some(period =>
    isTimeInPeriod(period.startTime, period.endTime)
  );
};

/**
 * Check if promotion is active for specific dates
 */
export const isActiveOnSpecificDate = (
  specificDates: Array<{
    date: string;
    timePeriods: Array<{ startTime: string; endTime: string }>;
  }>
): boolean => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const dateEntry = specificDates.find(d => d.date === todayISO);
  
  if (!dateEntry) {
    return false;
  }
  
  // Check if current time falls within any of the date's time periods
  return dateEntry.timePeriods.some(period =>
    isTimeInPeriod(period.startTime, period.endTime)
  );
};

/**
 * Main function: Check if promotion is currently valid based on schedule
 */
export const isPromotionActiveNow = (schedule?: PromotionSchedule): boolean => {
  if (!schedule) {
    // No schedule means always active (during campaign dates)
    return true;
  }
  
  // Check blackout dates first
  if (schedule.blackoutDates?.length && isBlackoutDate(schedule.blackoutDates)) {
    return false;
  }
  
  switch (schedule.type) {
    case 'always-on':
      return true;
      
    case 'specific-days-and-times':
      if (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0) {
        return true;
      }
      return isActiveOnDaysAndTimes(schedule.daysOfWeek);
      
    case 'specific-dates':
      if (!schedule.specificDates || schedule.specificDates.length === 0) {
        return false;
      }
      return isActiveOnSpecificDate(schedule.specificDates);
      
    case 'blackout-dates':
      // If it's a blackout schedule, promotion is active except on blackout dates
      return !schedule.blackoutDates?.length || !isBlackoutDate(schedule.blackoutDates);
      
    default:
      return true;
  }
};

/**
 * Get human-readable schedule description
 */
export const getScheduleDescription = (schedule?: PromotionSchedule): string => {
  if (!schedule) {
    return 'Always available';
  }
  
  switch (schedule.type) {
    case 'always-on':
      return 'Always available';
      
    case 'specific-days-and-times':
      if (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0) {
        return 'No specific days configured';
      }
      
      const activeDays = schedule.daysOfWeek
        .filter(d => d.enabled)
        .map(d => d.day.slice(0, 3))
        .join(', ');
      
      const timePeriods = schedule.daysOfWeek
        .flatMap(d => d.timePeriods)
        .map(p => `${p.startTime}-${p.endTime}`)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');
      
      return `${activeDays} from ${timePeriods}`;
      
    case 'specific-dates':
      if (!schedule.specificDates || schedule.specificDates.length === 0) {
        return 'No specific dates configured';
      }
      return `On ${schedule.specificDates.length} specific date(s)`;
      
    case 'blackout-dates':
      return `Available except on ${schedule.blackoutDates?.length || 0} blackout date(s)`;
      
    default:
      return 'Schedule not configured';
  }
};

/**
 * Get next available time for this promotion
 */
export const getNextAvailableTime = (schedule?: PromotionSchedule): Date | null => {
  if (!schedule) {
    return null; // No schedule restrictions
  }
  
  if (schedule.type !== 'specific-days-and-times' || !schedule.daysOfWeek) {
    return null;
  }
  
  const now = new Date();
  const currentDay = getCurrentDayOfWeek();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = days.indexOf(currentDay);
  
  // Look for next available time
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDayIndex = (currentDayIndex + daysAhead) % 7;
    const checkDay = days[checkDayIndex] as DayOfWeek;
    
    const daySchedule = schedule.daysOfWeek.find(d => d.day === checkDay);
    
    if (daySchedule && daySchedule.enabled && daySchedule.timePeriods.length > 0) {
      // If it's today, check if there's a remaining time period
      if (daysAhead === 0) {
        for (const period of daySchedule.timePeriods) {
          const startMinutes = timeToMinutes(period.startTime);
          if (startMinutes > currentMinutes) {
            const nextTime = new Date();
            nextTime.setHours(Math.floor(startMinutes / 60));
            nextTime.setMinutes(startMinutes % 60);
            return nextTime;
          }
        }
      } else {
        // Future day - return start of first time period
        const firstPeriod = daySchedule.timePeriods[0];
        const startMinutes = timeToMinutes(firstPeriod.startTime);
        const nextTime = new Date(now);
        nextTime.setDate(now.getDate() + daysAhead);
        nextTime.setHours(Math.floor(startMinutes / 60));
        nextTime.setMinutes(startMinutes % 60);
        return nextTime;
      }
    }
  }
  
  return null; // No available time found in next 7 days
};

/**
 * Calculate percentage of day promotion is active
 */
export const getPromotionCoverage = (schedule?: PromotionSchedule): number => {
  if (!schedule || schedule.type !== 'specific-days-and-times' || !schedule.daysOfWeek) {
    return 100; // No schedule = always active
  }
  
  const minutesPerDay = 24 * 60;
  let totalMinutesActive = 0;
  
  for (const daySchedule of schedule.daysOfWeek) {
    if (daySchedule.enabled) {
      for (const period of daySchedule.timePeriods) {
        const startMinutes = timeToMinutes(period.startTime);
        const endMinutes = timeToMinutes(period.endTime);
        
        // Handle overnight periods
        if (endMinutes < startMinutes) {
          totalMinutesActive += (minutesPerDay - startMinutes) + endMinutes;
        } else {
          totalMinutesActive += endMinutes - startMinutes;
        }
      }
    }
  }
  
  // Average across all days of week (normalize)
  const averageMinutesPerDay = totalMinutesActive / 7;
  return Math.round((averageMinutesPerDay / minutesPerDay) * 100);
};

/**
 * Validate schedule configuration
 */
export const validateSchedule = (schedule: PromotionSchedule): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!schedule.type) {
    errors.push('Schedule type is required');
  }
  
  if (schedule.type === 'specific-days-and-times') {
    if (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0) {
      errors.push('At least one day must be configured');
    }
    
    for (const daySchedule of schedule.daysOfWeek || []) {
      if (daySchedule.enabled && (!daySchedule.timePeriods || daySchedule.timePeriods.length === 0)) {
        errors.push(`${daySchedule.day} is enabled but has no time periods`);
      }
      
      for (const period of daySchedule.timePeriods || []) {
        if (!period.startTime || !period.endTime) {
          errors.push(`${daySchedule.day} has incomplete time period`);
        }
        
        const startMin = timeToMinutes(period.startTime);
        const endMin = timeToMinutes(period.endTime);
        
        // Allow overnight periods
        if (startMin === endMin && startMin !== 0) {
          errors.push(`${daySchedule.day} start and end times cannot be the same`);
        }
      }
    }
  }
  
  if (schedule.type === 'specific-dates') {
    if (!schedule.specificDates || schedule.specificDates.length === 0) {
      errors.push('At least one specific date must be configured');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
