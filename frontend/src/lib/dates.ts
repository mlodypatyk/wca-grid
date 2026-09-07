export const toDateString = (d: Date): string => {
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export const getTodayString = (): string => toDateString(new Date())

export const getYesterdayString = (): string => {
  const d = parseDate(getTodayString());
  d.setDate(d.getDate() - 1);
  return toDateString(d);
}

export const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const REFERENCE_DATE = '2026-03-21'

export const puzzleNumberForDate = (s: string): number => {
  const [y, m, d] = s.split('-').map(Number);
  const [ry, rm, rd] = REFERENCE_DATE.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const reference = Date.UTC(ry, rm - 1, rd);
  const diffDays = Math.round((target - reference) / 86400000);
  return Math.max(1, diffDays + 1);
}
