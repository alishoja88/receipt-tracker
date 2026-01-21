/**
 * Date utility functions
 * Handles date parsing and formatting without timezone conversion issues
 */

/**
 * Parse date string (YYYY-MM-DD) as local date without timezone conversion
 * Prevents off-by-one day errors when crossing timezone boundaries
 *
 * @param dateStr - Date string in YYYY-MM-DD format or Date object
 * @returns Date object set to local midnight
 *
 * @example
 * // Instead of: new Date("2025-11-21") which creates 2025-11-21T00:00:00Z
 * // Use: parseLocalDate("2025-11-21") which creates date at local midnight
 * const date = parseLocalDate("2025-11-21");
 */
export function parseLocalDate(dateStr: string | Date): Date {
  // If already a Date object, return as is
  if (dateStr instanceof Date) {
    return dateStr;
  }

  // Parse "YYYY-MM-DD" format
  const parts = dateStr.split('T')[0].split('-'); // Handle both "2025-11-21" and "2025-11-21T00:00:00Z"
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Create date in local timezone (month is 0-indexed in JavaScript)
  // This creates the date at local midnight, not UTC midnight
  return new Date(year, month - 1, day);
}

/**
 * Format date to display string (e.g., "Nov 21, 2025")
 *
 * @param dateStr - Date string in YYYY-MM-DD format or Date object
 * @param locale - Locale string (default: 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateStr: string | Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString(locale, options);
}

/**
 * Format date to YYYY-MM-DD string
 *
 * @param date - Date object or date string
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToISO(date: Date | string): string {
  const d = parseLocalDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
