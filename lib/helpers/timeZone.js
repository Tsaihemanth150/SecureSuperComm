// lib/helpers/timeZone.js

/**
 * Format a date into a specific timezone
 * @param {Date|string|number} date - JS Date, ISO string, or timestamp
 * @param {string} timeZone - IANA timezone string (e.g. "Asia/Kolkata", "America/New_York")
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} formatted date string
 */
export function formatInTimeZone(date, timeZone, options = {}) {
    try {
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        ...options,
      });
  
      return fmt.format(new Date(date));
    } catch (error) {
      console.error("Invalid timeZone or date:", error.message);
      return "";
    }
  }
  
  /**
   * Convert a date to another timezone and return a Date object
   * @param {Date|string|number} date - original date
   * @param {string} timeZone - IANA timezone string
   * @returns {Date} converted date
   */
  export function convertToTimeZone(date, timeZone) {
    try {
      const options = { timeZone, hour12: false };
      const formatter = new Intl.DateTimeFormat("en-US", {
        ...options,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
  
      const parts = formatter.formatToParts(new Date(date));
      const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
  
      return new Date(
        `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
      );
    } catch (error) {
      console.error("Timezone conversion error:", error.message);
      return new Date(date);
    }
  }
  
  /**
   * Get the user's local timezone
   * @returns {string} IANA timezone string
   */
  export function getUserTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  