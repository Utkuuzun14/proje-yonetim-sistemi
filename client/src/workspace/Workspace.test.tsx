import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { STORAGE_KEY, parseData, seed } from "./model";
vi.mock("./files", () => ({
  listFiles: vi.fn().mockResolvedValue([]),
  saveFile: vi.fn(),
  downloadBlob: vi.fn(),
}));
function page(path = "/onizleme/projeler") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
describe("Çalışma alanı akışları", () => {
  it("başka sekmede değişen veriyi eski ekranla ezmez", async () => {
    page("/onizleme/projeler/demo-project");
    const newer = structuredClone(seed);
    newer.projects[0].name = "Başka sekmenin değişikliği";
    const raw = JSON.stringify(newer);
    localStorage.setItem(STORAGE_KEY, raw);
    await userEvent.selectOptions(
      screen.getByLabelText("Giriş ekranı tasarımı durumu"),
      "done",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "başka bir sekmede değişti",
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
    expect(screen.getByLabelText("Giriş ekranı tasarımı durumu")).toHaveValue(
      "doing",
    );
  });
  it("bozuk kaydın üzerine yeni değişiklik yazmaz", async () => {
    localStorage.setItem(STORAGE_KEY, "broken");
    page("/onizleme/projeler/demo-project");
    await userEvent.selectOptions(
      screen.getByLabelText("Giriş ekranı tasarımı durumu"),
      "done",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("kaydetme kapalı");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
  });
  it("görev oluşturma, atama ve düzenleme aynı kaydı günceller", async () => {
    page("/onizleme/projeler/demo-project");
    await userEvent.selectOptions(
      screen.getByLabelText("Demo kullanıcısı"),
      "hakan",
    );
    await userEvent.click(screen.getByRole("button", { name: "Yeni görev" }));
    await userEvent.type(
      screen.getByLabelText("Görev başlığı"),
      "Yeni test görevi",
    );
    await userEvent.selectOptions(screen.getByLabelText("Sorumlu kişi"), "efe");
    await userEvent.click(
      screen.getByRole("button", { name: "Görevi kaydet" }),
    );
    const card = screen
      .getByRole("button", { name: "Yeni test görevi" })
      .closest("article")!;
    await userEvent.click(
      within(card).getByRole("button", { name: "Düzenle" }),
    );
    await userEvent.clear(screen.getByLabelText("Görev başlığı"));
    await userEvent.type(
      screen.getByLabelText("Görev başlığı"),
      "Düzenlenen test görevi",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Görevi kaydet" }),
    );
    const saved = parseData(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.tasks).toHaveLength(4);
    expect(saved.tasks[3]).toMatchObject({
      title: "Düzenlenen test görevi",
      assignee: "efe",
      status: "todo",
    });
  });
  it("durum değişikliği rapora ve dönem filtresine yansır", async () => {
    page("/onizleme/projeler/demo-project");
    await userEvent.selectOptions(
      screen.getByLabelText("Giriş ekranı tasarımı durumu"),
      "done",
    );
    await userEvent.click(screen.getByRole("link", { name: "Raporlar" }));
    expect(
      screen.getByRole("progressbar", {
        name: "Proje Yönetim Sistemi ilerleme",
      }),
    ).toHaveValue(67);
    const table = screen.getByRole("table");
    const row = within(table).getByText("Ümit Efe").closest("tr")!;
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["Ümit Efe", "1", "1", "0"]);
    await userEvent.selectOptions(
      screen.getByLabelText("Tamamlanma dönemi"),
      "month",
    );
    fireEvent.change(screen.getByLabelText("Rapor tarihi"), {
      target: { value: "2020-01-01" },
    });
    const filteredRow = within(table).getByText("Ümit Efe").closest("tr")!;
    expect(
      within(filteredRow)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["Ümit Efe", "1", "0", "0"]);
  });
  it("yönetici proje oluşturur; üye aynı kontrolleri göremez", async () => {
    page();
    expect(
      screen.queryByRole("button", { name: "Yeni proje" }),
    ).not.toBeInTheDocument();
    await userEvent.selectOptions(
      screen.getByLabelText("Demo kullanıcısı"),
      "hakan",
    );
    await userEvent.click(screen.getByRole("button", { name: "Yeni proje" }));
    await userEvent.type(
      screen.getByLabelText("Proje adı"),
      "Yeni demo projesi",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Projeyi kaydet" }),
    );
    expect(
      screen.getByRole("link", { name: "Yeni demo projesi" }),
    ).toBeInTheDocument();
    expect(parseData(localStorage.getItem(STORAGE_KEY)!).projects).toHaveLength(
      2,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("kendi görevini değiştirir, başka kişinin görevi kilitlidir", async () => {
    page("/onizleme/projeler/demo-project");
    expect(
      screen.getByLabelText("API sözleşmesini belirle durumu"),
    ).toBeDisabled();
    await userEvent.selectOptions(
      screen.getByLabelText("Giriş ekranı tasarımı durumu"),
      "done",
    );
    expect(parseData(localStorage.getItem(STORAGE_KEY)!).tasks[0].status).toBe(
      "done",
    );
    await userEvent.click(screen.getByRole("button", { name: "Liste" }));
    expect(screen.getByLabelText("Giriş ekranı tasarımı durumu")).toHaveValue(
      "done",
    );
  });
  it("kart sürüklenince durum verisini günceller", () => {
    page("/onizleme/projeler/demo-project");
    const card = screen
      .getByRole("button", { name: "Giriş ekranı tasarımı" })
      .closest("article")!;
    fireEvent.dragStart(card, {
      dataTransfer: { setData: vi.fn(), effectAllowed: "" },
    });
    fireEvent.drop(screen.getByRole("region", { name: "Tamamlandı" }));
    expect(parseData(localStorage.getItem(STORAGE_KEY)!).tasks[0].status).toBe(
      "done",
    );
  });
  it("yorum ekler ve görev detayında gösterir", async () => {
    page("/onizleme/projeler/demo-project");
    await userEvent.click(
      screen.getByRole("button", { name: "Giriş ekranı tasarımı" }),
    );
    const dialog = screen.getByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText("Yorumun"),
      "Ekran akışını kontrol ettim.",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Yorum ekle" }),
    );
    expect(
      within(dialog).getByText("Ekran akışını kontrol ettim."),
    ).toBeInTheDocument();
    expect(
      parseData(localStorage.getItem(STORAGE_KEY)!).tasks[0].comments,
    ).toHaveLength(1);
  });
  it("depolama başarısızsa değişikliği başarıyla kaydedilmiş gibi göstermez", async () => {
    page("/onizleme/projeler/demo-project");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota", "QuotaExceededError");
    });
    await userEvent.selectOptions(
      screen.getByLabelText("Giriş ekranı tasarımı durumu"),
      "done",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Değişiklik uygulanmadı",
    );
    expect(screen.getByLabelText("Giriş ekranı tasarımı durumu")).toHaveValue(
      "doing",
    );
  });
  it("bozuk kaydı sessizce ezmeden kullanıcıya bildirir", () => {
    localStorage.setItem(STORAGE_KEY, "broken");
    page();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Yerel demo kaydı okunamadı",
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
  });
});
