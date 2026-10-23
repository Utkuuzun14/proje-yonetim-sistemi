import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { saveFile, listFiles } from "./files";
describe("Yerel dosya alanı", () => {
  it("dosyayı kaydeder, yeniden okur ve projeleri birbirinden ayırır", async () => {
    const project = crypto.randomUUID();
    const file = new File(["örnek metin"], "not.txt", { type: "text/plain" });
    const saved = await saveFile(project, "efe", file);
    const files = await listFiles(project);
    expect(files).toHaveLength(1);
    expect(files[0].id).toBe(saved.id);
    expect(files[0].size).toBe(file.size);
    expect(await listFiles("other-project")).toHaveLength(0);
  });
  it("boş veya sınırı aşan dosyayı kaydetmez", async () => {
    await expect(
      saveFile("limits", "efe", new File([], "empty.txt")),
    ).rejects.toThrow("boş olmamalı");
    await expect(
      saveFile(
        "limits",
        "efe",
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.bin"),
      ),
    ).rejects.toThrow("5 MB");
    expect(await listFiles("limits")).toHaveLength(0);
  });
});
