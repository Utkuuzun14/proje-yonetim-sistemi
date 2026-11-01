import { useState, type FormEvent } from "react";
import {
  Plus,
  GripVertical,
  MessageSquare,
  List,
  Columns3,
} from "lucide-react";
import { Button, Field } from "../components";
import { Modal } from "./Modal";
import { useDemo } from "./Store";
import {
  dateLabel,
  isAdmin,
  personName,
  statuses,
  todayLocal,
  type Project,
  type Status,
  type Task,
} from "./model";

function TaskEditor({
  project,
  task,
  onClose,
}: {
  project: Project;
  task?: Task;
  onClose: () => void;
}) {
  const { mutate } = useDemo();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      mutate({
        type: "task",
        value: {
          id: task?.id ?? crypto.randomUUID(),
          projectId: project.id,
          title: String(form.get("title")),
          description: String(form.get("description")),
          assignee: String(form.get("assignee")),
          start: String(form.get("start")),
          end: String(form.get("end")),
          status: task?.status ?? "todo",
          completedAt: task?.completedAt ?? null,
          comments: task?.comments ?? [],
        },
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title={task ? "Görevi düzenle" : "Yeni görev"} onClose={onClose}>
      <form onSubmit={submit}>
        <Field
          id="task-title"
          name="title"
          label="Görev başlığı"
          maxLength={150}
          required
          defaultValue={task?.title}
        />
        <label className="field">
          <span>Açıklama</span>
          <textarea
            name="description"
            rows={3}
            maxLength={2000}
            defaultValue={task?.description}
          />
        </label>
        <label className="field">
          <span>Sorumlu kişi</span>
          <select name="assignee" defaultValue={task?.assignee ?? ""}>
            <option value="">Atanmamış</option>
            {project.members.map((id) => (
              <option key={id} value={id}>
                {personName(id)}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <Field
            id="task-start"
            name="start"
            label="Başlangıç tarihi"
            type="date"
            required
            min={project.start}
            max={project.end}
            defaultValue={task?.start ?? project.start}
          />
          <Field
            id="task-end"
            name="end"
            label="Bitiş tarihi"
            type="date"
            required
            min={project.start}
            max={project.end}
            defaultValue={task?.end ?? project.end}
          />
        </div>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button type="button" className="secondary" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit">Görevi kaydet</Button>
        </div>
      </form>
    </Modal>
  );
}
function TaskDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, user, mutate } = useDemo();
  const task = data.tasks.find((t) => t.id === id)!;
  const [error, setError] = useState("");
  function comment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = String(new FormData(form).get("comment") || "");
    try {
      mutate({
        type: "comment",
        id,
        comment: {
          id: crypto.randomUUID(),
          author: user,
          text,
          created: new Date().toISOString(),
        },
      });
      form.reset();
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title={task.title} onClose={onClose}>
      <p className="preserve-text">
        {task.description || "Açıklama eklenmedi."}
      </p>
      <div className="detail-meta">
        <span>{personName(task.assignee)}</span>
        <span>
          {dateLabel(task.start)} — {dateLabel(task.end)}
        </span>
        <span className="pill">{statuses[task.status]}</span>
      </div>
      <h3 className="section-title">Yorumlar ({task.comments.length})</h3>
      {!task.comments.length && <p>İlk yorumu sen ekle.</p>}
      <div className="comments">
        {task.comments.map((c) => (
          <article key={c.id}>
            <strong>{personName(c.author)}</strong>
            <time dateTime={c.created}>
              {new Date(c.created).toLocaleString("tr-TR")}
            </time>
            <p className="preserve-text">{c.text}</p>
          </article>
        ))}
      </div>
      <form onSubmit={comment}>
        <label className="field">
          <span>Yorumun</span>
          <textarea name="comment" rows={3} maxLength={2000} required />
        </label>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <Button type="submit">Yorum ekle</Button>
      </form>
    </Modal>
  );
}
export function TaskBoard({ project }: { project: Project }) {
  const { data, user, mutate } = useDemo();
  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [editor, setEditor] = useState<Task | "new" | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const tasks = data.tasks.filter(
    (t) =>
      t.projectId === project.id &&
      (assignee === "all" || t.assignee === assignee) &&
      t.title.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")),
  );
  const canMove = (t: Task) => isAdmin(user) || t.assignee === user;
  function move(id: string, status: Status) {
    try {
      mutate({ type: "status", id, status, today: todayLocal() });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
    setDragging(null);
  }
  const statusSelect = (t: Task) => (
    <select
      className="status-select"
      aria-label={`${t.title} durumu`}
      value={t.status}
      disabled={!canMove(t)}
      onChange={(e) => move(t.id, e.target.value as Status)}
    >
      {Object.entries(statuses).map(([key, label]) => (
        <option value={key} key={key}>
          {label}
        </option>
      ))}
    </select>
  );
  return (
    <section aria-label="Görev yönetimi">
      <div className="section-heading">
        <h2>Görevler</h2>
        {isAdmin(user) && (
          <Button onClick={() => setEditor("new")}>
            <Plus size={16} />
            Yeni görev
          </Button>
        )}
      </div>
      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">Görev ara</span>
          <input
            type="search"
            placeholder="Görevlerde ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Sorumluya göre filtrele</span>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="all">Tüm sorumlular</option>
            <option value="">Atanmamış</option>
            {project.members.map((id) => (
              <option key={id} value={id}>
                {personName(id)}
              </option>
            ))}
          </select>
        </label>
        <div className="view-switch">
          <button
            aria-pressed={view === "board"}
            onClick={() => setView("board")}
          >
            <Columns3 size={16} />
            Pano
          </button>
          <button
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={16} />
            Liste
          </button>
        </div>
      </div>
      <p className="muted helper">
        Kartları sürükleyebilir veya durum seçicisini klavye ve dokunmayla
        kullanabilirsin.
      </p>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {view === "board" ? (
        <div className="kanban">
          {(Object.entries(statuses) as [Status, string][]).map(
            ([status, label]) => (
              <section
                key={status}
                className={`kanban-column column-${status} ${dragging ? "drop-ready" : ""}`}
                aria-label={label}
                onDragOver={(e) => {
                  if (dragging) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging) move(dragging, status);
                }}
              >
                <div className="column-heading">
                  <h3>{label}</h3>
                  <span>{tasks.filter((t) => t.status === status).length}</span>
                </div>
                {tasks
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <article
                      className="task-card"
                      key={t.id}
                      draggable={canMove(t)}
                      onDragStart={(e) => {
                        setDragging(t.id);
                        e.dataTransfer.setData("text/plain", t.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDragging(null)}
                    >
                      <div className="task-card-top">
                        <span className="task-code">
                          {t.id.startsWith("demo")
                            ? "ÖRNEK"
                            : `#${t.id.slice(0, 6)}`}
                        </span>
                        {canMove(t) && (
                          <GripVertical size={16} aria-hidden="true" />
                        )}
                      </div>
                      <button
                        className="task-title"
                        onClick={() => setDetail(t.id)}
                      >
                        {t.title}
                      </button>
                      <p className="clamp-text">
                        {t.description || "Açıklama eklenmedi."}
                      </p>
                      <div className="task-meta">
                        <span>{personName(t.assignee)}</span>
                        <span>
                          <MessageSquare size={13} />
                          {t.comments.length}
                        </span>
                      </div>
                      <div className="task-date">Bitiş: {dateLabel(t.end)}</div>
                      {statusSelect(t)}
                      {isAdmin(user) && (
                        <button
                          className="edit-link"
                          onClick={() => setEditor(t)}
                        >
                          Düzenle
                        </button>
                      )}
                    </article>
                  ))}
                {!tasks.some((t) => t.status === status) && (
                  <div className="column-empty">Bu sütunda görev yok.</div>
                )}
              </section>
            ),
          )}
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Proje görevleri</caption>
            <thead>
              <tr>
                <th>Görev</th>
                <th>Sorumlu</th>
                <th>Bitiş</th>
                <th>Durum</th>
                <th>
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <button
                      className="task-title"
                      onClick={() => setDetail(t.id)}
                    >
                      {t.title}
                    </button>
                  </td>
                  <td>{personName(t.assignee)}</td>
                  <td>{dateLabel(t.end)}</td>
                  <td>{statusSelect(t)}</td>
                  <td>
                    {isAdmin(user) && (
                      <button
                        className="edit-link"
                        onClick={() => setEditor(t)}
                      >
                        Düzenle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!tasks.length && (
            <p className="column-empty">Filtrelere uygun görev yok.</p>
          )}
        </div>
      )}
      {editor && isAdmin(user) && (
        <TaskEditor
          project={project}
          task={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}{" "}
      {detail && <TaskDetail id={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}
