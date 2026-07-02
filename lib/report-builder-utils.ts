/** Format a date string for display in the table. */
export function formatCellDate(val: unknown): string {
  if (!val) return "\u2014";
  const s = String(val);
  // If it looks like an ISO date, format it
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    try {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-ZA", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      // fall through
    }
  }
  return s;
}


