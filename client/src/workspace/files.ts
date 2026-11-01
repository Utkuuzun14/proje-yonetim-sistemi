export type SavedFile = {
  id: string;
  projectId: string;
  name: string;
  size: number;
  created: string;
  author: string;
  blob: Blob;
};
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let rejected = false;
    const request = indexedDB.open("sek-tech-demo-files", 1);
    request.onupgradeneeded = () => {
      request.result
        .createObjectStore("files", { keyPath: "id" })
        .createIndex("projectId", "projectId");
    };
    request.onsuccess = () => {
      if (rejected) {
        request.result.close();
        return;
      }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () =>
      reject(
        new Error(
          "Dosya depolaması açılamadı. Tarayıcı izinlerini kontrol et.",
        ),
      );
    request.onblocked = () => {
      rejected = true;
      reject(
        new Error(
          "Dosya depolaması başka sekmede açık. Diğer demo sekmelerini kapatıp tekrar dene.",
        ),
      );
    };
  });
}
export async function listFiles(projectId: string): Promise<SavedFile[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const req = tx.objectStore("files").index("projectId").getAll(projectId);
    tx.oncomplete = () => {
      db.close();
      resolve(req.result as SavedFile[]);
    };
    tx.onabort = () => {
      db.close();
      reject(new Error("Dosya listesi okunamadı."));
    };
  });
}
export async function saveFile(
  projectId: string,
  author: string,
  file: File,
): Promise<SavedFile> {
  if (file.size === 0 || file.size > 5 * 1024 * 1024)
    throw new Error("Dosya boş olmamalı ve en fazla 5 MB olmalı.");
  const item: SavedFile = {
    id: crypto.randomUUID(),
    projectId,
    author,
    name: file.name,
    size: file.size,
    created: new Date().toISOString(),
    blob: file,
  };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");
    const existing = store.index("projectId").getAll(projectId);
    let message = "Dosya kaydedilemedi. Tarayıcı alanı dolmuş olabilir.";
    existing.onsuccess = () => {
      if (
        (existing.result as SavedFile[]).reduce((sum, f) => sum + f.size, 0) +
          file.size >
        25 * 1024 * 1024
      ) {
        message = "Bu projenin 25 MB demo dosya sınırına ulaşıldı.";
        tx.abort();
      } else store.add(item);
    };
    tx.oncomplete = () => {
      db.close();
      resolve(item);
    };
    tx.onabort = () => {
      db.close();
      reject(new Error(message));
    };
  });
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
