/**
 * Date utility functions
 * Handles date parsing without timezone conversion issues
 */

/**
 * Parse date string (YYYY-MM-DD) as local date without timezone conversion
 * Prevents off-by-one day errors when crossing timezone boundaries
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object set to local midnight
 *
 * @example
 * // Instead of: new Date("2025-11-21") which creates 2025-11-21T00:00:00Z
 * // Use: parseLocalDate("2025-11-21") which creates date at local midnight
 * const date = parseLocalDate("2025-11-21");
 */
export function parseLocalDate(dateStr: string | Date): Date {
  // If already a Date object, extract the date parts to avoid timezone issues
  if (dateStr instanceof Date) {
    // Use local date parts to avoid timezone conversion
    const year = dateStr.getFullYear();
    const month = dateStr.getMonth();
    const day = dateStr.getDate();
    return new Date(year, month, day);
  }

  // Parse "YYYY-MM-DD" format - handle both "2025-11-21" and "2025-11-21T00:00:00Z"
  const dateOnly = dateStr.split('T')[0];
  const [year, month, day] = dateOnly.split('-').map(Number);

  // Create date in local timezone (month is 0-indexed in JavaScript)
  // This creates the date at local midnight, not UTC midnight
  // This ensures the date is stored correctly in PostgreSQL date type
  return new Date(year, month - 1, day);
}

/**
 * Format date to YYYY-MM-DD string
 *
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
