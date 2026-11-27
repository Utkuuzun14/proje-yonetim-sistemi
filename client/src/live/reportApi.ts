export type MemberReport = {user_id: number; name: string; assigned: number; todo: number; in_progress: number; done: number; overdue: number; completion_rate: number};
export type ProgressReport = {total: number; status_counts: {'To Do': number; 'In Progress': number; Done: number}; overdue: number; completion_rate: number; unassigned: number; members: MemberReport[]};
export type RangeReport = {from: string; to: string; created: number; completed: number};
function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Rapor yanıtı geçersiz.');
  return v as Record<string, unknown>;
}
const count = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0;
const rate = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;
export function progressReport(value: unknown): ProgressReport {
  const v = record(value), s = record(v.status_counts);
  if (!count(v.total) || !count(v.overdue) || !count(v.unassigned) || !rate(v.completion_rate) ||
    !['To Do', 'In Progress', 'Done'].every(k => count(s[k])) || !Array.isArray(v.members)) throw new Error('Rapor yanıtı geçersiz.');
  const members = v.members.map(value => {
    const m = record(value);
    if (!count(m.user_id) || m.user_id === 0 || typeof m.name !== 'string' ||
      !['assigned', 'todo', 'in_progress', 'done', 'overdue'].every(k => count(m[k])) || !rate(m.completion_rate)) throw new Error('Kişi raporu geçersiz.');
    return m as MemberReport;
  });
  return {...v, members} as ProgressReport;
}
export function validDay(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day;
}
export function validRange(from: string, to: string) { return validDay(from) && validDay(to) && from <= to; }
export function rangeReport(value: unknown, from: string, to: string): RangeReport {
  const v = record(value);
  if (!validRange(from, to) || v.from !== from || v.to !== to || !count(v.created) || !count(v.completed)) throw new Error('Tarih aralığı raporu geçersiz.');
  return v as RangeReport;
}
