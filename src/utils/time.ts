export const toUserZonedDate = (isoOrDate: string | Date, timeZone: string): Date => {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (!timeZone) return d;
  // Normalize to user's timezone by formatting and re-parsing to keep wall time intent
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value || "";
  const iso = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:00.000Z`;
  return new Date(iso);
};

export const minutesBetween = (a: Date, b: Date): number => {
  return Math.abs(a.getTime() - b.getTime()) / 60000;
};

