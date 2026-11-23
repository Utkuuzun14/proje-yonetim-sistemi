import { describe, it, expect } from "vitest";
import { applyAction, seed, parseData, checkDates, progress } from "./model";
import { monthCells, ganttSpan } from "./Calendar";
import { csvCell, taskCsv } from "./Reports";
describe("Demo iş kuralları", () => {
  it("tutarsız tamamlanma kaydı ve boş proje üyelerini reddeder", () => {
    const invalid = structuredClone(seed);
    invalid.tasks[0].completedAt = "2026-10-20";
    expect(() => parseData(JSON.stringify(invalid))).toThrow();
    const empty = structuredClone(seed);
    empty.projects[0].members = [];
    expect(() => parseData(JSON.stringify(empty))).toThrow();
  });
  it("üyenin yönetici işlemlerini ve başka kişinin durumunu değiştirmesini engeller", () => {
    expect(() =>
      applyAction(seed, { type: "project", value: seed.projects[0] }, "efe"),
    ).toThrow("yönetici");
    expect(() =>
      applyAction(seed, { type: "task", value: seed.tasks[0] }, "efe"),
    ).toThrow("yönetici");
    expect(() =>
      applyAction(
        seed,
        { type: "status", id: "demo-api", status: "done", today: "2026-10-20" },
        "efe",
      ),
    ).toThrow("kendi görevlerinin");
  });
  it("tamamlanma tarihini korur, yeniden açılınca temizler", () => {
    let next = applyAction(
      seed,
      {
        type: "status",
        id: "demo-design",
        status: "done",
        today: "2026-10-20",
      },
      "efe",
    );
    next = applyAction(
      next,
      {
        type: "status",
        id: "demo-design",
        status: "done",
        today: "2026-10-21",
      },
      "efe",
    );
    expect(next.tasks[0].completedAt).toBe("2026-10-20");
    expect(progress(next.tasks)).toBe(67);
    next = applyAction(
      next,
      {
        type: "status",
        id: "demo-design",
        status: "doing",
        today: "2026-10-22",
      },
      "efe",
    );
    expect(next.tasks[0].completedAt).toBeNull();
    expect(progress([])).toBe(0);
  });
  it("proje dışındaki kişiye ve tarih aralığına görev atamaz", () => {
    expect(() =>
      applyAction(
        seed,
        { type: "task", value: { ...seed.tasks[0], assignee: "unknown" } },
        "hakan",
      ),
    ).toThrow("proje ekibinde");
    expect(() =>
      applyAction(
        seed,
        { type: "task", value: { ...seed.tasks[0], start: "2026-09-01" } },
        "hakan",
      ),
    ).toThrow("proje tarihleri");
  });
  it("proje düzenlenirken mevcut görevlerin ilişkilerini korur", () => {
    expect(() =>
      applyAction(
        seed,
        { type: "project", value: { ...seed.projects[0], members: ["hakan"] } },
        "hakan",
      ),
    ).toThrow("mevcut görevleri");
    expect(() =>
      applyAction(
        seed,
        { type: "project", value: { ...seed.projects[0], end: "2026-10-20" } },
        "hakan",
      ),
    ).toThrow("mevcut görevleri");
  });
  it("geçersiz gün ve ters tarih aralığını reddeder", () => {
    expect(() => checkDates("2026-02-30", "2026-03-01")).toThrow();
    expect(() => checkDates("2026-10-25", "2026-10-20")).toThrow("önce");
    expect(() => checkDates("2028-02-29", "2028-02-29")).not.toThrow();
  });
  it("boş yorumları ve başkası adına yorumları reddeder", () => {
    const comment = {
      id: "x",
      text: "  ",
      author: "efe",
      created: "2026-10-19T12:00:00Z",
    };
    expect(() =>
      applyAction(seed, { type: "comment", id: "demo-design", comment }, "efe"),
    ).toThrow();
    expect(() =>
      applyAction(
        seed,
        {
          type: "comment",
          id: "demo-design",
          comment: { ...comment, author: "hakan", text: "Deneme" },
        },
        "efe",
      ),
    ).toThrow();
  });
  it("bozuk kayıtları reddeder ve geçerli veriyi geri yükler", () => {
    expect(parseData(JSON.stringify(seed))).toEqual(seed);
    expect(() => parseData("{")).toThrow();
    expect(() =>
      parseData(
        JSON.stringify({
          ...seed,
          tasks: [{ ...seed.tasks[0], start: "yok" }],
        }),
      ),
    ).toThrow();
    expect(() =>
      parseData(
        JSON.stringify({
          ...seed,
          tasks: [{ ...seed.tasks[0], projectId: "missing" }],
        }),
      ),
    ).toThrow();
    expect(() =>
      parseData(
        JSON.stringify({
          ...seed,
          projects: [seed.projects[0], seed.projects[0]],
        }),
      ),
    ).toThrow();
  });
});
describe("Takvim ve dışa aktarım sınırları", () => {
  it("takvimi pazartesi başlatır, artık günü ve ay taşmasını kapsar", () => {
    const days = monthCells("2028-02");
    expect(days[0]).toBe("2028-01-31");
    expect(days).toContain("2028-02-29");
    expect(days.length % 7).toBe(0);
  });
  it("Gantt çubuğunu seçilen aya kırpar", () => {
    expect(
      ganttSpan(
        { ...seed.tasks[0], start: "2026-09-01", end: "2026-11-01" },
        "2026-10",
      ),
    ).toEqual({ left: "0%", width: "100%" });
  });
  it("CSV formüllerini etkisizleştirir ve alıntıları kaçırır", () => {
    expect(csvCell("=1+1")).toBe('"\'=1+1"');
    expect(csvCell('a"b;c')).toBe('"a""b;c"');
    const csv = taskCsv(seed.tasks, () => "Demo");
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Tamamlandı"');
  });
});
