// Task and activity dates in the user's own timezone.
// The database stores UTC instants; the form fields work in local time.

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" of the local day, for `type="date"` inputs. */
export function localDateInput(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A task due on a date stays due until the end of that local day. */
export function dueDateFromDateInput(value: string): string | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

export function dateInputFromDueDate(iso: string | null): string {
  return iso ? localDateInput(new Date(iso)) : "";
}

/** A `type="datetime-local"` value, read as local time. */
export function dueDateFromDateTimeInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function dateTimeInputFromDueDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${localDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
