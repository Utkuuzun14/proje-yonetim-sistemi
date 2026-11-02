import { ApiError, apiRequest } from '../api';

export const statuses = ['To Do', 'In Progress', 'Done'] as const;
export const priorities = ['Low', 'Medium', 'High', 'Critical'] as const;
export const taskTypes = ['Task', 'Bug', 'Feature'] as const;
export type Status = typeof statuses[number];
export type Task = {
  id: number; project_id: number; title: string; description: string | null;
  status: Status; priority: typeof priorities[number]; type: typeof taskTypes[number];
  assignee_id: number | null; start_date: string | null; end_date: string | null;
};
export type Member = {id: number; name: string};
export type TaskProject = {id: number; name: string; members: Member[]};
export type Comment = {id: number; task_id: number; author_id: number | null; content: string; created_at: string};
export type History = {id: number; task_id: number; old_status: Status | null; new_status: Status; changed_by_id: number | null; changed_at: string};
type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Sunucu yanıtı beklenen biçimde değil.');
  return value as RecordValue;
}
function id(value: unknown): value is number { return Number.isInteger(value) && Number(value) > 0; }
function nullableId(value: unknown) {return value === null || id(value);}
function date(value: unknown) {return value === null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value));}
function timestamp(value: unknown) {return typeof value === 'string' && Number.isFinite(Date.parse(value));}
function oneOf(values: readonly string[], value: unknown) {return typeof value === 'string' && values.includes(value);}
export function task(value: unknown, projectId: number): Task {
  const v = record(value);
  if (!id(v.id) || v.project_id !== projectId || typeof v.title !== 'string' ||
      !(v.description === null || typeof v.description === 'string') || !nullableId(v.assignee_id) ||
      !oneOf(statuses,v.status) || !oneOf(priorities,v.priority) || !oneOf(taskTypes,v.type) ||
      !date(v.start_date) || !date(v.end_date)) throw new Error('Görev yanıtı API sözleşmesiyle uyuşmuyor.');
  return v as Task;
}
export function list<T>(value: unknown, parse: (v: unknown) => T): T[] {
  if (!Array.isArray(value)) throw new Error('Sunucudan liste bekleniyordu.');
  return value.map(parse);
}
export function taskProject(value: unknown, projectId: number): TaskProject {
  const v = record(value);
  if(v.id !== projectId || typeof v.name !== 'string') throw new Error('Proje yanıtı geçersiz.');
  const members = list(v.members, m => {
    const item = record(m);
    if(!id(item.id) || typeof item.name !== 'string') throw new Error('Proje üye bilgisi geçersiz.');
    return {id:item.id,name:item.name};
  });
  return {id:projectId,name:v.name,members};
}
export function comment(value: unknown, taskId: number): Comment {
  const v=record(value);
  if(!id(v.id) || v.task_id !== taskId || !nullableId(v.author_id) || typeof v.content !== 'string' || !timestamp(v.created_at)) throw new Error('Yorum yanıtı API sözleşmesiyle uyuşmuyor.');
  return v as Comment;
}
export function history(value: unknown, taskId: number): History {
  const v=record(value);
  if(!id(v.id) || v.task_id !== taskId || !(v.old_status === null || oneOf(statuses,v.old_status)) || !oneOf(statuses,v.new_status) || !nullableId(v.changed_by_id) || !timestamp(v.changed_at)) throw new Error('Geçmiş yanıtı API sözleşmesiyle uyuşmuyor.');
  return v as History;
}
export function taskError(error: unknown) {
  if(error instanceof ApiError && error.status === 404) return 'Görev verilerine ulaşılamadı. Erişimin kaldırılmış veya görev servisi henüz kullanıma açılmamış olabilir.';
  return error instanceof Error ? error.message : 'İşlem tamamlanamadı.';
}
export const taskRequest = (path: string, options: Parameters<typeof apiRequest>[1] = {}) => apiRequest<unknown>(path,{...options,auth:true});
