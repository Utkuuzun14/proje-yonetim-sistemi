import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../components";
import { useDemo } from "./Store";
import { dateLabel, isAdmin, statuses, todayLocal, type Task } from "./model";
const DAY = 86400000;
export function monthCells(month: string) {
  const first = new Date(`${month}-01T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  const days = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) =>
    new Date(first.getTime() + (i - offset) * DAY).toISOString().slice(0, 10),
  );
}
export function ganttSpan(task: Task, month: string) {
  const start = Date.parse(`${month}-01`);
  const end = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0);
  const total = Math.round((end - start) / DAY) + 1;
  const left = Math.max(0, (Date.parse(task.start) - start) / DAY);
  const right = Math.min(total, (Date.parse(task.end) - start) / DAY + 1);
  return {
    left: `${(left / total) * 100}%`,
    width: `${(Math.max(0, right - left) / total) * 100}%`,
  };
}
export function CalendarPage() {
  const { data, user } = useDemo();
  const [month, setMonth] = useState(todayLocal().slice(0, 7));
  const [project, setProject] = useState("all");
  const [view, setView] = useState<"calendar" | "gantt">("calendar");
  const projects = data.projects.filter(
    (p) => isAdmin(user) || p.members.includes(user),
  );
  const cells = monthCells(month);
  const monthStart = `${month}-01`;
  const next = new Date(
    Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0),
  )
    .toISOString()
    .slice(0, 10);
  const tasks = data.tasks.filter(
    (t) =>
      projects.some((p) => p.id === t.projectId) &&
      (project === "all" || t.projectId === project),
  );
  const monthTasks = tasks.filter(
    (t) => t.start <= next && t.end >= monthStart,
  );
  function shift(delta: number) {
    const date = new Date(`${month}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + delta);
    const value = date.toISOString().slice(0, 7);
    if (value >= "2000-01" && value <= "2100-12") setMonth(value);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ZAMANI BİRLİKTE PLANLA</p>
          <h1>Takvim ve zaman çizelgesi</h1>
          <p>Görevlerin başlangıç ve bitiş tarihlerini tek bakışta gör.</p>
        </div>
      </div>
      <div className="toolbar">
        <div className="month-navigation">
          <button
            className="icon-button"
            aria-label="Önceki ay"
            onClick={() => shift(-1)}
          >
            <ChevronLeft />
          </button>
          <label>
            <span className="sr-only">Görüntülenen ay</span>
            <input
              type="month"
              value={month}
              min="2000-01"
              max="2100-12"
              onChange={(e) => {
                if (
                  /^\d{4}-\d{2}$/.test(e.target.value) &&
                  e.target.value >= "2000-01" &&
                  e.target.value <= "2100-12"
                )
                  setMonth(e.target.value);
              }}
            />
          </label>
          <button
            className="icon-button"
            aria-label="Sonraki ay"
            onClick={() => shift(1)}
          >
            <ChevronRight />
          </button>
        </div>
        <label>
          <span className="sr-only">Takvim projesi</span>
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="all">Tüm projeler</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="view-switch">
          <button
            aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            Takvim
          </button>
          <button
            aria-pressed={view === "gantt"}
            onClick={() => setView("gantt")}
          >
            Gantt
          </button>
        </div>
      </div>
      <p className="muted">
        {monthTasks.length} görev bu ayla kesişiyor. Başlangıç ve bitiş günleri
        dahildir.
      </p>
      {view === "calendar" ? (
        <div className="calendar-scroll">
          <div className="calendar-grid">
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
              <div className="weekday" key={d}>
                {d}
              </div>
            ))}
            {cells.map((day) => (
              <div
                key={day}
                className={`calendar-cell ${day.startsWith(month) ? "" : "outside-month"} ${day === todayLocal() ? "today" : ""}`}
              >
                <time dateTime={day}>{Number(day.slice(8))}</time>
                {tasks
                  .filter((t) => t.start <= day && t.end >= day)
                  .map((t) => (
                    <Link
                      key={t.id}
                      title={`${t.title} · ${statuses[t.status]}`}
                      className={`calendar-task status-${t.status}`}
                      to={`/onizleme/projeler/${t.projectId}`}
                    >
                      {t.title}
                      <small>{statuses[t.status]}</small>
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <h2>
            {new Intl.DateTimeFormat("tr-TR", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(monthStart))}
          </h2>
          <p>Çubuklar seçilen ayın başlangıcından sonuna kadar ölçeklenir.</p>
          <div className="gantt-scroll">
            <div className="gantt-axis">
              <span>Görev</span>
              <span>
                1 <span>{Number(next.slice(8))}</span>
              </span>
            </div>
            {monthTasks.map((t) => (
              <div className="gantt-row" key={t.id}>
                <Link to={`/onizleme/projeler/${t.projectId}`}>
                  {t.title}
                  <small>
                    {dateLabel(t.start)} — {dateLabel(t.end)}
                  </small>
                </Link>
                <div className="gantt-track">
                  <div
                    className={`gantt-bar status-${t.status}`}
                    style={ganttSpan(t, month)}
                    title={`${t.title}: ${statuses[t.status]}`}
                  >
                    <span className="sr-only">{statuses[t.status]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!monthTasks.length && (
            <p className="column-empty">Bu ay için planlanmış görev yok.</p>
          )}
        </Card>
      )}
    </>
  );
}
