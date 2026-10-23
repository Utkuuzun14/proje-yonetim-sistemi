import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyAction,
  parseData,
  seed,
  STORAGE_KEY,
  type Action,
  type Data,
  type PersonId,
} from "./model";
type Store = {
  data: Data;
  user: PersonId;
  setUser: (id: PersonId) => void;
  mutate: (action: Action) => void;
  notice: string;
  clearNotice: () => void;
  noticeKind: "success" | "warning";
};
const Context = createContext<Store | null>(null);
function load(): {
  data: Data;
  notice: string;
  raw: string | null;
  readable: boolean;
} {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    return {
      data: raw !== null ? parseData(raw) : structuredClone(seed),
      notice: "",
      raw,
      readable: true,
    };
  } catch {
    return {
      data: structuredClone(seed),
      notice:
        "Yerel demo kaydı okunamadı. Örnek veriler açıldı; önceki kayıt korunuyor ve üzerine yazılmayacak.",
      raw,
      readable: false,
    };
  }
}
export function DemoProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [data, setData] = useState(initial.data);
  const [notice, setNotice] = useState(initial.notice);
  const [noticeKind, setNoticeKind] = useState<"success" | "warning">(
    initial.readable ? "success" : "warning",
  );
  const [user, setUser] = useState<PersonId>("efe");
  const savedRaw = useRef(initial.raw);
  function mutate(action: Action) {
    if (!initial.readable)
      throw new Error(
        "Yerel kayıt okunamadığı için kaydetme kapalı. Mevcut kaydını yedekleyip depolama sorununu giderdikten sonra sayfayı yenile.",
      );
    let latest: string | null;
    try {
      latest = localStorage.getItem(STORAGE_KEY);
    } catch {
      throw new Error(
        "Yerel kayıt okunamadı. Değişiklik uygulanmadı; depolama izinlerini kontrol et.",
      );
    }
    if (latest !== savedRaw.current)
      throw new Error(
        "Veriler başka bir sekmede değişti. Mevcut kaydı korumak için işlem durduruldu. Formundaki değişiklikleri not alıp sayfayı yenile.",
      );
    const next = applyAction(data, action, user);
    const nextRaw = JSON.stringify(next);
    // Persist first: quota/unavailable storage must not produce a false success.
    try {
      localStorage.setItem(STORAGE_KEY, nextRaw);
    } catch {
      throw new Error(
        "Tarayıcıya kaydedilemedi. Depolama iznini veya boş alanı kontrol et. Değişiklik uygulanmadı.",
      );
    }
    savedRaw.current = nextRaw;
    setData(next);
    setNoticeKind("success");
    setNotice("Demo değişikliği bu tarayıcıya kaydedildi.");
  }
  return (
    <Context.Provider
      value={{
        data,
        user,
        setUser,
        mutate,
        notice,
        noticeKind,
        clearNotice: () => setNotice(""),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const context = useContext(Context);
  if (!context) throw new Error("DemoProvider gerekli.");
  return context;
}
