/**
 * Safe calendar date formatting and calculation utilities for PAWLIO
 * Prevents timezone shifting bugs by treating YYYY-MM-DD as calendar dates.
 */

/**
 * Safely parse a date string into a Date object at local midnight
 * @param {string|Date} dateInput
 * @returns {Date|null}
 */
export function parseCalendarDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }

  const str = String(dateInput).trim();
  if (!str) return null;

  // If date-only string like YYYY-MM-DD
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const d = new Date(year, monthIndex, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Format a calendar date for user display (e.g. "10 Jan 2026" or "10 January 2026")
 * @param {string|Date} dateInput
 * @param {'short'|'long'} [monthStyle='short']
 * @returns {string}
 */
export function formatCalendarDate(dateInput, monthStyle = "short") {
  if (!dateInput) return "";
  const d = parseCalendarDate(dateInput);
  if (!d) return String(dateInput);

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: monthStyle === "long" ? "long" : "short",
    year: "numeric",
  });
}

/**
 * Format an appointment date strictly as "03 Oct 2026"
 * Ensures 2-digit day and 3-letter month, respecting calendar date without timezone offset.
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatAppointmentDate(dateInput) {
  if (!dateInput) return "";
  const d = parseCalendarDate(dateInput);
  if (!d) return String(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Convert 12-hour components (hour, minute, period) to 24-hour "HH:mm" format.
 * Examples:
 *   ("01", "00", "AM") -> "01:00"
 *   ("09", "15", "AM") -> "09:15"
 *   ("11", "45", "AM") -> "11:45"
 *   ("12", "00", "PM") -> "12:00"
 *   ("12", "30", "PM") -> "12:30"
 *   ("02", "00", "PM") -> "14:00"
 *   ("06", "30", "PM") -> "18:30"
 *   ("11", "45", "PM") -> "23:45"
 *   ("12", "00", "AM") -> "00:00"
 *   ("12", "30", "AM") -> "00:30"
 * @param {string|number} hour - 1 to 12
 * @param {string|number} minute - 00 to 59
 * @param {'AM'|'PM'} period
 * @returns {string} 24-hour "HH:mm" string
 */
export function to24HourTime(hour, minute, period) {
  let h = parseInt(hour, 10);
  if (isNaN(h)) h = 9;
  const m = String(minute !== undefined && minute !== null ? minute : "00").padStart(2, "0");
  const p = String(period || "AM").toUpperCase().trim();

  if (p === "PM") {
    if (h !== 12) h += 12;
  } else {
    // AM
    if (h === 12) h = 0;
  }

  return `${String(h).padStart(2, "0")}:${m}`;
}

/**
 * Parse an appointment time string (24-hour "14:30" or 12-hour "02:30 PM") into 12-hour components.
 * @param {string} timeStr
 * @returns {{ hour: string, minute: string, period: 'AM'|'PM' }}
 */
export function parseTimeTo12HourParts(timeStr) {
  if (!timeStr) {
    return { hour: "09", minute: "00", period: "AM" };
  }
  const str = String(timeStr).trim();

  // If already 12h: "02:30 PM" or "2:30 pm"
  const m12 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    if (h === 0) h = 12;
    if (h > 12) h = h % 12 || 12;
    return {
      hour: String(h).padStart(2, "0"),
      minute: m12[2],
      period: m12[3].toUpperCase(),
    };
  }

  // 24h: "14:30" or "14:30:00"
  const m24 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (m24) {
    let hours = parseInt(m24[1], 10);
    const minutes = m24[2];
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return {
      hour: String(hours).padStart(2, "0"),
      minute: minutes,
      period,
    };
  }

  return { hour: "09", minute: "00", period: "AM" };
}

/**
 * Format an appointment time string into "02:00 PM" format without seconds.
 * Handles "14:00:00", "14:00", "02:00:00", "2:00 PM", etc.
 * @param {string} timeStr
 * @returns {string}
 */
export function formatAppointmentTime(timeStr) {
  if (!timeStr) return "";
  const parts = parseTimeTo12HourParts(timeStr);
  return `${parts.hour}:${parts.minute} ${parts.period}`;
}

/**
 * Get today's calendar date string in YYYY-MM-DD format
 * @returns {string}
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the difference in calendar days between today and target date
 * Positive = future, Negative = past, 0 = today
 * @param {string|Date} targetDate
 * @returns {number|null}
 */
export function getDaysDifferenceFromToday(targetDate) {
  const target = parseCalendarDate(targetDate);
  if (!target) return null;

  const today = parseCalendarDate(new Date());
  if (!today) return null;

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / msPerDay);
}

/**
 * Calculate vaccination status based strictly on Next Due Date:
 * - "Up to Date": Next due date is more than 30 days away (> 30 days)
 * - "Due Soon": Next due date is within the next 30 days (0 to 30 days)
 * - "Overdue": Next due date has already passed (< 0 days)
 *
 * @param {string|Date} nextDueDate
 * @returns {{
 *   status: 'Up to Date' | 'Due Soon' | 'Overdue',
 *   daysDiff: number,
 *   badgeClass: string,
 *   label: string
 * }}
 */
export function calculateVaccinationStatus(nextDueDate) {
  const daysDiff = getDaysDifferenceFromToday(nextDueDate);

  if (daysDiff === null) {
    return {
      status: "Unknown",
      daysDiff: 0,
      badgeClass: "badge-unknown",
      label: "Unknown",
    };
  }

  if (daysDiff < 0) {
    return {
      status: "Overdue",
      daysDiff,
      badgeClass: "badge-overdue",
      label: "Overdue",
    };
  }

  if (daysDiff <= 30) {
    return {
      status: "Due Soon",
      daysDiff,
      badgeClass: "badge-due-soon",
      label: "Due Soon",
    };
  }

  return {
    status: "Up to Date",
    daysDiff,
    badgeClass: "badge-up-to-date",
    label: "Up to Date",
  };
}
