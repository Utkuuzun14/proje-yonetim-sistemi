import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticate } from "./api";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("Kimlik doğrulama hata mesajları", () => {
  it.each([
    [new TypeError("Failed to fetch"), "Sunucuya ulaşılamadı"],
    [new DOMException("timeout", "TimeoutError"), "zamanında yanıt vermedi"],
  ])("bağlantı hatasını anlaşılır açıklar: %s", async (error, message) => {
    vi.stubEnv("VITE_API_URL", "https://example.test/api");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
    await expect(
      authenticate("login", {
        email: "test@example.test",
        password: "password123",
      }),
    ).rejects.toThrow(message);
  });
  it.each([
    [429, "Çok fazla deneme"],
    [403, "erişim iznin yok"],
  ])("%s yanıtını açıklar", async (status, message) => {
    vi.stubEnv("VITE_API_URL", "https://example.test/api");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status }));
    await expect(
      authenticate("login", {
        email: "test@example.test",
        password: "password123",
      }),
    ).rejects.toThrow(message);
  });
});
