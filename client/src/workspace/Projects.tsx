import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, ArrowUpRight, FolderKanban } from "lucide-react";
import { Button, Card, Field } from "../components";
import { Modal } from "./Modal";
import { useDemo } from "./Store";
import {
  dateLabel,
  isAdmin,
  people,
  personName,
  progress,
  todayLocal,
  type Project,
} from "./model";
import { TaskBoard } from "./Tasks";
import { ProjectFiles } from "./ProjectFiles";

function ProjectEditor({
  project,
  onClose,
}: {
  project?: Project;
  onClose: () => void;
}) {
  const { mutate } = useDemo();
  const [error, setError] = useState("");
  const date = todayLocal();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      mutate({
        type: "project",
        value: {
          id: project?.id ?? crypto.randomUUID(),
          name: String(form.get("name")),
          description: String(form.get("description")),
          start: String(form.get("start")),
          end: String(form.get("end")),
          members: form.getAll("members").map(String),
        },
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title={project ? "Projeyi düzenle" : "Yeni proje"} onClose={onClose}>
      <form onSubmit={submit}>
        <Field
          id="project-name"
          label="Proje adı"
          name="name"
          required
          maxLength={100}
          defaultValue={project?.name}
        />
        <label className="field">
          <span>Açıklama</span>
          <textarea
            name="description"
            maxLength={2000}
            rows={3}
            defaultValue={project?.description}
          />
        </label>
        <div className="form-grid">
          <Field
            id="project-start"
            label="Başlangıç tarihi"
            name="start"
            type="date"
            required
            defaultValue={project?.start ?? date}
          />
          <Field
            id="project-end"
            label="Bitiş tarihi"
            name="end"
            type="date"
            required
            defaultValue={project?.end ?? date}
          />
        </div>
        <fieldset>
          <legend>Proje ekibi</legend>
          {people.map((p) => (
            <label className="checkbox-label" key={p.id}>
              <input
                type="checkbox"
                name="members"
                value={p.id}
                defaultChecked={project ? project.members.includes(p.id) : true}
              />
              {p.name}
            </label>
          ))}
        </fieldset>
        {error && (
          <p role="alert" className="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button type="button" className="secondary" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit">Projeyi kaydet</Button>
        </div>
      </form>
    </Modal>
  );
}
export function Projects() {
  const { data, user } = useDemo();
  const [query, setQuery] = useState("");
  const [create, setCreate] = useState(false);
  const all = data.projects.filter(
    (p) => isAdmin(user) || p.members.includes(user),
  );
  const projects = all.filter((p) =>
    `${p.name} ${p.description}`
      .toLocaleLowerCase("tr")
      .includes(query.toLocaleLowerCase("tr")),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BİRLİKTE ÜRET</p>
          <h1>Projeler</h1>
          <p>Ekibinin hedefleri, görevleri ve teslim tarihleri.</p>
        </div>
        {isAdmin(user) && (
          <Button onClick={() => setCreate(true)}>
            <Plus size={18} />
            Yeni proje
          </Button>
        )}
      </div>
      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">Proje ara</span>
          <input
            type="search"
            placeholder="Projelerde ara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span className="muted">{projects.length} proje</span>
      </div>
      {projects.length ? (
        <div className="project-grid">
          {projects.map((p) => {
            const tasks = data.tasks.filter((t) => t.projectId === p.id);
            const percent = progress(tasks);
            return (
              <Card key={p.id}>
                <div className="card-heading">
                  <span className="project-icon">
                    <FolderKanban size={24} />
                  </span>
                  <span className="pill">{tasks.length} GÖREV</span>
                </div>
                <h2>
                  <Link to={`/onizleme/projeler/${p.id}`}>{p.name}</Link>
                </h2>
                <p className="clamp-text">
                  {p.description || "Henüz açıklama eklenmedi."}
                </p>
                <div className="progress-label">
                  <span>Tamamlanma</span>
                  <strong>%{percent}</strong>
                </div>
                <progress
                  aria-label={`${p.name} tamamlanma`}
                  value={percent}
                  max={100}
                />
                <div className="project-meta">
                  <span>{dateLabel(p.end)}</span>
                  <span>{p.members.length} üye</span>
                </div>
                <Link className="text-action" to={`/onizleme/projeler/${p.id}`}>
                  Projeyi aç <ArrowUpRight size={16} />
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <h2>{query ? "Aramana uygun proje yok." : "Henüz bir proje yok."}</h2>
          <p>
            {query
              ? "Farklı bir kelime deneyebilirsin."
              : isAdmin(user)
                ? "Yeni proje oluşturarak başlayabilirsin."
                : "Yöneticinin seni bir projeye eklemesi gerekiyor."}
          </p>
        </Card>
      )}
      {create && <ProjectEditor onClose={() => setCreate(false)} />}
    </>
  );
}
export function ProjectDetail() {
  const { id } = useParams();
  const { data, user } = useDemo();
  const [edit, setEdit] = useState(false);
  const project = data.projects.find(
    (p) => p.id === id && (isAdmin(user) || p.members.includes(user)),
  );
  if (!project)
    return (
      <Card>
        <h1>Proje bulunamadı</h1>
        <p>
          Proje mevcut olmayabilir veya bu demo rolüyle erişimin olmayabilir.
        </p>
        <Link to="/onizleme/projeler">Projelere dön</Link>
      </Card>
    );
  return (
    <>
      <Link className="breadcrumb" to="/onizleme/projeler">
        ← Tüm projeler
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PROJE ALANI</p>
          <h1>{project.name}</h1>
          <p className="preserve-text">{project.description}</p>
          <div className="detail-meta">
            <span>
              {dateLabel(project.start)} — {dateLabel(project.end)}
            </span>
            <span>{project.members.map(personName).join(", ")}</span>
          </div>
        </div>
        {isAdmin(user) && (
          <Button className="secondary" onClick={() => setEdit(true)}>
            Projeyi düzenle
          </Button>
        )}
      </div>
      <TaskBoard key={`tasks-${project.id}`} project={project} />
      <ProjectFiles key={`files-${project.id}`} project={project} />
      {edit && (
        <ProjectEditor project={project} onClose={() => setEdit(false)} />
      )}
    </>
  );
}
