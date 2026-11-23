import { useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { Button, Card } from "../components";
import { useDemo } from "./Store";
import {
  isAdmin,
  personName,
  progress,
  statuses,
  todayLocal,
  type Task,
} from "./model";
import { downloadBlob } from "./files";
export function csvCell(value: string) {
  const safe = /^(\s*[=+\-@]|[\t\r\n])/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function taskCsv(tasks: Task[], projectName: (id: string) => string) {
  return (
    "\uFEFF" +
    [
      [
        "Proje",
        "Görev",
        "Sorumlu",
        "Durum",
        "Başlangıç",
        "Bitiş",
        "Tamamlanma",
      ],
      ...tasks.map((t) => [
        projectName(t.projectId),
        t.title,
        personName(t.assignee),
        statuses[t.status],
        t.start,
        t.end,
        t.completedAt ?? "",
      ]),
    ]
      .map((row) => row.map(csvCell).join(";"))
      .join("\r\n")
  );
}
export function ReportsPage({ overview = false }: { overview?: boolean }) {
  const { data, user } = useDemo();
  const [period, setPeriod] = useState("all");
  const [anchor, setAnchor] = useState(todayLocal());
  const [selected, setSelected] = useState("all");
  const projects = data.projects.filter(
    (p) =>
      (isAdmin(user) || p.members.includes(user)) &&
      (selected === "all" || p.id === selected),
  );
  const tasks = data.tasks.filter((t) =>
    projects.some((p) => p.id === t.projectId),
  );
  let start = anchor;
  let end = anchor;
  if (period === "week") {
    const d = new Date(`${anchor}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    start = d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 6);
    end = d.toISOString().slice(0, 10);
  }
  if (period === "month") {
    start = `${anchor.slice(0, 7)}-01`;
    end = new Date(
      Date.UTC(Number(anchor.slice(0, 4)), Number(anchor.slice(5, 7)), 0),
    )
      .toISOString()
      .slice(0, 10);
  }
  const completed = tasks.filter(
    (t) =>
      t.status === "done" &&
      (period === "all" ||
        (t.completedAt && t.completedAt >= start && t.completedAt <= end)),
  );
  const peopleIds = [...new Set(tasks.map((t) => t.assignee))];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">İLERLEMEYİ GÖRÜNÜR KIL</p>
          <h1>{overview ? "Ekibine genel bakış" : "Raporlar ve analiz"}</h1>
          <p>Örnek proje verilerinden hesaplanan güncel durum.</p>
        </div>
        {!overview && (
          <Button
            className="secondary"
            onClick={() =>
              downloadBlob(
                new Blob(
                  [
                    taskCsv(
                      tasks,
                      (id) =>
                        data.projects.find((p) => p.id === id)?.name ?? "",
                    ),
                  ],
                  { type: "text/csv;charset=utf-8" },
                ),
                "sek-tech-gorevler.csv",
              )
            }
          >
            <Download size={16} />
            Görevleri CSV indir
          </Button>
        )}
      </div>
      <div className="toolbar">
        <label>
          <span className="sr-only">Rapor projesi</span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="all">Tüm projeler</option>
            {data.projects
              .filter((p) => isAdmin(user) || p.members.includes(user))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </label>
        {!overview && (
          <>
            <label>
              <span className="sr-only">Tamamlanma dönemi</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="all">Tüm zamanlar</option>
                <option value="day">Günlük</option>
                <option value="week">Haftalık</option>
                <option value="month">Aylık</option>
              </select>
            </label>
            {period !== "all" && (
              <label>
                <span className="sr-only">Rapor tarihi</span>
                <input
                  type="date"
                  min="2000-01-01"
                  max="2100-12-31"
                  value={anchor}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v >= "2000-01-01" && v <= "2100-12-31") setAnchor(v);
                  }}
                />
              </label>
            )}
          </>
        )}
      </div>
      <div className="stat-grid">
        {[
          [String(projects.length), "Proje", "Erişebildiğin projeler"],
          [
            String(tasks.length),
            "Görev",
            `${tasks.filter((t) => t.status === "doing").length} görev devam ediyor`,
          ],
          [
            `%${progress(tasks)}`,
            "Toplam ilerleme",
            `${tasks.filter((t) => t.status === "done").length} görev tamamlandı`,
          ],
        ].map(([n, title, description]) => (
          <Card key={title}>
            <span className="stat-number">{n}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </Card>
        ))}
      </div>
      <div className="overview-grid">
        <Card>
          <h2>Proje ilerlemesi</h2>
          {projects.map((p) => {
            const items = tasks.filter((t) => t.projectId === p.id);
            return (
              <div className="report-project" key={p.id}>
                <div className="progress-label">
                  <Link to={`/onizleme/projeler/${p.id}`}>{p.name}</Link>
                  <strong>%{progress(items)}</strong>
                </div>
                <progress
                  max={100}
                  value={progress(items)}
                  aria-label={`${p.name} ilerleme`}
                />
                <small>
                  {items.filter((t) => t.status === "done").length} /{" "}
                  {items.length} görev tamamlandı
                </small>
              </div>
            );
          })}
          {!projects.length && <p>Bu filtrede proje yok.</p>}
        </Card>
        <Card>
          <h2>Görev dağılımı</h2>
          {Object.entries(statuses).map(([key, label]) => {
            const count = tasks.filter((t) => t.status === key).length;
            return (
              <div className="report-project" key={key}>
                <div className="progress-label">
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
                <progress
                  max={Math.max(1, tasks.length)}
                  value={count}
                  aria-label={label}
                />
              </div>
            );
          })}
        </Card>
      </div>
      <section className="files-section">
        <h2>Kişi bazlı tamamlanma</h2>
        <p>
          {period === "all"
            ? "Tüm zamanlarda tamamlanmış görevler."
            : `${start} – ${end} arasında tamamlanan görevler. Toplam görev sayısı tüm zamanları kapsar.`}{" "}
          Yeniden açılan görevler tamamlanmış sayılmaz.
        </p>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Kişi bazlı görev tamamlama raporu
            </caption>
            <thead>
              <tr>
                <th>Kişi</th>
                <th>Toplam görev</th>
                <th>
                  {period === "all" ? "Tamamlanan" : "Dönemde tamamlanan"}
                </th>
                <th>Devam eden</th>
              </tr>
            </thead>
            <tbody>
              {peopleIds.map((id) => (
                <tr key={id}>
                  <td>{personName(id)}</td>
                  <td>{tasks.filter((t) => t.assignee === id).length}</td>
                  <td>{completed.filter((t) => t.assignee === id).length}</td>
                  <td>
                    {
                      tasks.filter(
                        (t) => t.assignee === id && t.status === "doing",
                      ).length
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!tasks.length && (
            <p className="column-empty">
              Rapor oluşturmak için henüz görev yok.
            </p>
          )}
        </div>
      </section>
      {!overview && (
        <p className="muted helper">
          CSV seçilen projelerin tüm görevlerini içerir; dönem filtresi yalnız
          kişi bazlı tamamlanma tablosuna uygulanır.
        </p>
      )}
    </>
  );
}
