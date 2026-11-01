export type Status = "todo" | "doing" | "done";
export type Project = {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  members: string[];
};
export type Comment = {
  id: string;
  author: string;
  text: string;
  created: string;
};
export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  status: Status;
  start: string;
  end: string;
  completedAt: string | null;
  comments: Comment[];
};
export type Data = { version: 1; projects: Project[]; tasks: Task[] };
export const people = [
  { id: "efe", name: "Ümit Efe", role: "member" },
  { id: "hakan", name: "Hakan", role: "admin" },
  { id: "mustafa", name: "Mustafa", role: "member" },
] as const;
export type PersonId = (typeof people)[number]["id"];
export const statuses: Record<Status, string> = {
  todo: "Yapılacak",
  doing: "Devam ediyor",
  done: "Tamamlandı",
};
export const personName = (id: string) =>
  people.find((p) => p.id === id)?.name ?? "Atanmamış";
export const isAdmin = (id: string) =>
  people.find((p) => p.id === id)?.role === "admin";
export function dateValid(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number(value.slice(0, 4)) >= 2000 &&
    Number(value.slice(0, 4)) <= 2100 &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function checkDates(start: string, end: string) {
  if (!dateValid(start) || !dateValid(end))
    throw new Error(
      "2000–2100 arasında geçerli başlangıç ve bitiş tarihleri seç.",
    );
  if (end < start) throw new Error("Bitiş tarihi başlangıçtan önce olamaz.");
}
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
export const seed: Data = {
  version: 1,
  projects: [
    {
      id: "demo-project",
      name: "Proje Yönetim Sistemi",
      description:
        "Örnek proje: ekip işlerini ortak bir çalışma alanında planlamak.",
      start: "2026-10-19",
      end: "2026-12-07",
      members: ["efe", "hakan", "mustafa"],
    },
  ],
  tasks: [
    {
      id: "demo-design",
      projectId: "demo-project",
      title: "Giriş ekranı tasarımı",
      description:
        "Örnek görev. Tasarım sistemiyle tutarlı giriş akışını hazırla.",
      assignee: "efe",
      status: "doing",
      start: "2026-10-19",
      end: "2026-10-25",
      completedAt: null,
      comments: [],
    },
    {
      id: "demo-api",
      projectId: "demo-project",
      title: "API sözleşmesini belirle",
      description:
        "Örnek görev. Kimlik doğrulama istek ve yanıtlarını netleştir.",
      assignee: "mustafa",
      status: "todo",
      start: "2026-10-20",
      end: "2026-10-25",
      completedAt: null,
      comments: [],
    },
    {
      id: "demo-plan",
      projectId: "demo-project",
      title: "Sprint planını hazırla",
      description: "Bu tamamlanmış durum yalnız demo amaçlıdır.",
      assignee: "hakan",
      status: "done",
      start: "2026-10-19",
      end: "2026-10-19",
      completedAt: "2026-10-19",
      comments: [],
    },
  ],
};
export type Action =
  | { type: "project"; value: Project }
  | { type: "task"; value: Task }
  | { type: "status"; id: string; status: Status; today: string }
  | { type: "comment"; id: string; comment: Comment };
export function applyAction(data: Data, action: Action, user: string): Data {
  if (action.type === "project") {
    if (!isAdmin(user))
      throw new Error("Projeleri yalnız yönetici düzenleyebilir.");
    const project = {
      ...action.value,
      name: action.value.name.trim(),
      description: action.value.description.trim(),
    };
    if (!project.name || project.name.length > 100)
      throw new Error("Proje adı 1–100 karakter olmalı.");
    if (project.description.length > 2000)
      throw new Error("Açıklama en fazla 2000 karakter olabilir.");
    checkDates(project.start, project.end);
    if (
      !project.members.length ||
      project.members.some((id) => !people.some((p) => p.id === id))
    )
      throw new Error("En az bir geçerli ekip üyesi seç.");
    if (
      data.tasks.some(
        (t) =>
          t.projectId === project.id &&
          ((t.assignee && !project.members.includes(t.assignee)) ||
            t.start < project.start ||
            t.end > project.end),
      )
    )
      throw new Error(
        "Proje tarihleri ve üyeleri mevcut görevleri kapsamalı. Önce görevleri güncelle.",
      );
    return {
      ...data,
      projects: data.projects.some((p) => p.id === project.id)
        ? data.projects.map((p) => (p.id === project.id ? project : p))
        : [...data.projects, project],
    };
  }
  const task =
    action.type === "task"
      ? action.value
      : data.tasks.find((t) => t.id === action.id);
  if (!task) throw new Error("Görev bulunamadı.");
  const project = data.projects.find((p) => p.id === task.projectId);
  if (!project || (!isAdmin(user) && !project.members.includes(user)))
    throw new Error("Bu projeye erişimin yok.");
  if (action.type === "comment") {
    if (
      !action.comment.text.trim() ||
      action.comment.text.length > 2000 ||
      action.comment.author !== user
    )
      throw new Error(
        "Yorum 1–2000 karakter olmalı ve mevcut kullanıcıya ait olmalı.",
      );
    return {
      ...data,
      tasks: data.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              comments: [
                ...t.comments,
                { ...action.comment, text: action.comment.text.trim() },
              ],
            }
          : t,
      ),
    };
  }
  if (action.type === "status") {
    if (!isAdmin(user) && task.assignee !== user)
      throw new Error("Yalnız kendi görevlerinin durumunu değiştirebilirsin.");
    if (!Object.hasOwn(statuses, action.status) || !dateValid(action.today))
      throw new Error("Geçersiz görev durumu veya tarih.");
    return {
      ...data,
      tasks: data.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: action.status,
              completedAt:
                action.status === "done" ? t.completedAt || action.today : null,
            }
          : t,
      ),
    };
  }
  if (!isAdmin(user))
    throw new Error("Görev oluşturma ve düzenleme yöneticiye aittir.");
  checkDates(task.start, task.end);
  if (task.start < project.start || task.end > project.end)
    throw new Error("Görev tarihleri proje tarihleri içinde olmalı.");
  if (!task.title.trim() || task.title.length > 150)
    throw new Error("Görev başlığı 1–150 karakter olmalı.");
  if (task.description.length > 2000)
    throw new Error("Açıklama en fazla 2000 karakter olabilir.");
  if (task.assignee && !project.members.includes(task.assignee))
    throw new Error("Sorumlu kişi proje ekibinde olmalı.");
  const previous = data.tasks.find((t) => t.id === task.id);
  const clean = {
    ...task,
    title: task.title.trim(),
    description: task.description.trim(),
    status: previous?.status ?? ("todo" as Status),
    completedAt: previous?.completedAt ?? null,
    comments: previous?.comments ?? [],
  };
  return {
    ...data,
    tasks: previous
      ? data.tasks.map((t) => (t.id === task.id ? clean : t))
      : [...data.tasks, clean],
  };
}
export const STORAGE_KEY = "sek-tech-demo-v1";
// Validate storage as untrusted data before rendering or mutating it.
export function parseData(raw: string): Data {
  const value: unknown = JSON.parse(raw);
  const str = (v: unknown): v is string => typeof v === "string";
  const obj = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object";
  if (
    !obj(value) ||
    value.version !== 1 ||
    !Array.isArray(value.projects) ||
    !Array.isArray(value.tasks)
  )
    throw new Error("Geçersiz kayıt.");
  for (const p of value.projects) {
    if (
      !obj(p) ||
      !str(p.id) ||
      !p.id ||
      !str(p.name) ||
      !str(p.description) ||
      !str(p.start) ||
      !str(p.end) ||
      !Array.isArray(p.members) ||
      !p.members.length ||
      !p.members.every((id) => str(id) && people.some((u) => u.id === id)) ||
      new Set(p.members).size !== p.members.length ||
      !p.name.trim() ||
      p.name.length > 100 ||
      p.description.length > 2000
    )
      throw new Error("Geçersiz proje.");
    checkDates(p.start, p.end);
  }
  for (const t of value.tasks) {
    if (
      !obj(t) ||
      ![
        "id",
        "projectId",
        "title",
        "description",
        "assignee",
        "start",
        "end",
      ].every((k) => str(t[k])) ||
      !["todo", "doing", "done"].includes(String(t.status)) ||
      !(
        t.completedAt === null ||
        (str(t.completedAt) && dateValid(t.completedAt))
      ) ||
      !Array.isArray(t.comments) ||
      !(t.id as string).trim() ||
      !(t.title as string).trim() ||
      (t.title as string).length > 150 ||
      (t.description as string).length > 2000 ||
      (t.status === "done" ? t.completedAt === null : t.completedAt !== null)
    )
      throw new Error("Geçersiz görev.");
    checkDates(t.start as string, t.end as string);
    const project = value.projects.find((p) => p.id === t.projectId);
    if (
      !project ||
      (t.assignee && !project.members.includes(t.assignee)) ||
      t.start! < project.start ||
      t.end! > project.end
    )
      throw new Error("Geçersiz görev ilişkisi.");
    for (const c of t.comments)
      if (
        !obj(c) ||
        !["id", "author", "text", "created"].every((k) => str(c[k])) ||
        !people.some((p) => p.id === c.author) ||
        Number.isNaN(Date.parse(c.created as string)) ||
        !(c.id as string).trim() ||
        !(c.text as string).trim() ||
        (c.text as string).length > 2000
      )
        throw new Error("Geçersiz yorum.");
    if (new Set(t.comments.map((c) => c.id)).size !== t.comments.length)
      throw new Error("Tekrarlı yorum kimliği.");
  }
  if (
    new Set(value.projects.map((p) => p.id)).size !== value.projects.length ||
    new Set(value.tasks.map((t) => t.id)).size !== value.tasks.length
  )
    throw new Error("Tekrarlı kimlik.");
  return value as Data;
}
export function progress(tasks: Task[]) {
  return tasks.length
    ? Math.round(
        (tasks.filter((t) => t.status === "done").length * 100) / tasks.length,
      )
    : 0;
}
export function todayLocal() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
