export type AuthFields = { name?: string; email: string; password: string };
export function validateAuth(
  fields: AuthFields,
  register: boolean,
): string | null {
  if (register && !fields.name?.trim()) return "Adını ve soyadını gir.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    return "Geçerli bir e-posta adresi gir.";
  if (fields.password.length < 8) return "Parolan en az 8 karakter olmalı.";
  return null;
}
// Proposed contract; confirm with backend before enabling the API URL.
export async function authenticate(
  mode: "login" | "register",
  fields: AuthFields,
) {
  const base = import.meta.env.VITE_API_URL;
  if (!base)
    throw new Error(
      "Sunucu bağlantısı henüz yapılandırılmadı. Şimdilik arayüz önizlemesini inceleyebilirsin.",
    );
  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/$/, "")}/auth/${mode}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        email: fields.email.trim(),
        ...(fields.name ? { name: fields.name.trim() } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (
      typeof error === 'object' && error !== null && 'name' in error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    )
      throw new Error(
        "Sunucu zamanında yanıt vermedi. Biraz sonra tekrar dene.",
        { cause: error },
      );
    throw new Error(
      "Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.",
      { cause: error },
    );
  }
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "E-posta veya parola hatalı."
        : response.status === 429
          ? "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene."
          : response.status === 403
            ? "Bu işlem için erişim iznin yok."
            : response.status === 409
              ? "Bu e-posta adresi zaten kullanılıyor."
              : "İşlem tamamlanamadı. Lütfen tekrar dene.",
    );
}
