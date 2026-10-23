import { useEffect, useState, useRef, type FormEvent } from "react";
import { Download, Paperclip } from "lucide-react";
import { Button, Card } from "../components";
import { useDemo } from "./Store";
import { personName, type Project } from "./model";
import { listFiles, saveFile, downloadBlob, type SavedFile } from "./files";
export function ProjectFiles({ project }: { project: Project }) {
  const { user } = useDemo();
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listFiles(project.id)
      .then((items) => {
        if (active) setFiles(items);
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [project.id, retry]);
  async function upload(event: FormEvent) {
    event.preventDefault();
    const file = input.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const saved = await saveFile(project.id, user, file);
      setFiles((old) => [...old, saved]);
      if (input.current) input.current.value = "";
      setMessage("Dosya bu tarayıcıya kaydedildi.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="files-section" aria-label="Proje dosyaları">
      <div className="section-heading">
        <h2>
          <Paperclip size={20} /> Dosyalar
        </h2>
        <span className="muted">{files.length} dosya</span>
      </div>
      <Card>
        <p>
          Demo dosyaları yalnız bu tarayıcıda saklanır; ekiple paylaşılmaz.
          Dosya başına 5 MB, proje başına 25 MB.
        </p>
        <form className="file-form" onSubmit={upload}>
          <label className="field">
            <span>Projeye dosya ekle</span>
            <input
              type="file"
              required
              ref={input}
              disabled={busy || loading}
            />
          </label>
          <Button type="submit" disabled={busy || loading}>
            {busy ? "Kaydediliyor…" : "Dosyayı ekle"}
          </Button>
        </form>
        {error && (
          <div className="alert" role="alert">
            {error}{" "}
            <button
              className="edit-link"
              onClick={() => setRetry((n) => n + 1)}
            >
              Yeniden yükle
            </button>
          </div>
        )}
        {message && (
          <p role="status" className="success">
            {message}
          </p>
        )}
        {loading ? (
          <p role="status">Dosyalar yükleniyor…</p>
        ) : !files.length ? (
          <p className="column-empty">Henüz dosya eklenmedi.</p>
        ) : (
          <ul className="file-list">
            {files.map((f) => (
              <li key={f.id}>
                <div>
                  <strong>{f.name}</strong>
                  <small>
                    {personName(f.author)} · {(f.size / 1024).toFixed(1)} KB
                  </small>
                </div>
                <button
                  className="icon-button"
                  aria-label={`${f.name} indir`}
                  onClick={() => downloadBlob(f.blob, f.name)}
                >
                  <Download size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
