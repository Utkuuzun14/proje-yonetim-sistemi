import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { authenticate, validateAuth } from "./api";
function page(path = "/giris") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("Hesap ekranları", () => {
  it("geçersiz formu sunucuya göndermez", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    page();
    await userEvent.click(screen.getByRole("button", { name: "Giriş yap" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Geçerli bir e-posta");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("kayıt sayfasına geçerken isim alanını gösterir", async () => {
    page();
    await userEvent.click(screen.getByRole("link", { name: /Hesap oluştur/ }));
    expect(screen.getByLabelText("Ad soyad")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Hesap oluştur" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Adını ve soyadını gir",
    );
  });
  it("API yokken sahte giriş başarısı göstermez", async () => {
    vi.stubEnv("VITE_API_URL", "");
    page();
    await userEvent.type(
      screen.getByLabelText("E-posta adresi"),
      "test@example.com",
    );
    await userEvent.type(screen.getByLabelText("Parola"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Giriş yap" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sunucu bağlantısı henüz yapılandırılmadı",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("önizleme ve tasarım sistemine erişim sağlar", async () => {
    page();
    await userEvent.click(
      screen.getByRole("link", { name: /Arayüz önizlemesi/ }),
    );
    expect(
      screen.getByText(/Gösterilen içerikler örnektir/),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("link", { name: "Tasarım sistemi" }),
    );
    expect(
      screen.getByRole("heading", { name: "Tasarım sistemi" }),
    ).toBeInTheDocument();
  });
  it("kısa parolayı reddeder", () => {
    expect(
      validateAuth({ name: "Test User", email: "test@example.com", password: "123" }, true),
    ).toMatch("8-72 karakter");
  });
  it("başarısız kimlik doğrulama isteğini bildirir", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com/");
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      authenticate("login", {
        email: " test@example.com ",
        password: "password123",
      }),
    ).rejects.toThrow("E-posta veya parola hatalı");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/auth/login",
      expect.objectContaining({
        credentials: "omit",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      }),
    );
  });
});
