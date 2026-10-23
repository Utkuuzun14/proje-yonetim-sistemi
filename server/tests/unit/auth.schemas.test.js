'use strict';
const { registerSchema, loginSchema } = require('../../src/modules/auth/auth.schemas');

describe('auth şemaları (birim)', () => {
  test('e-postayı küçük harfe çevirir ve boşlukları kırpar', () => {
    const r = registerSchema.parse({ name: ' Ayşe ', email: '  AYSE@Sektech.COM ', password: 'Gizli123!' });
    expect(r.email).toBe('ayse@sektech.com');
    expect(r.name).toBe('Ayşe');
  });

  test.each([
    [{ name: 'A', email: 'a@x.com', password: 'Gizli123!' }, 'name'],
    [{ name: 'Ayşe', email: 'gecersiz', password: 'Gizli123!' }, 'email'],
    [{ name: 'Ayşe', email: 'a@x.com', password: 'Ks1!' }, 'password'], // 8 karakterden kısa
    [{ name: 'Ayşe', email: 'a@x.com', password: 'gizli123!' }, 'password'], // büyük harf yok
    [{ name: 'Ayşe', email: 'a@x.com', password: 'GIZLI123!' }, 'password'], // küçük harf yok
    [{ name: 'Ayşe', email: 'a@x.com', password: 'Gizlisifre!' }, 'password'], // rakam yok
    [{ name: 'Ayşe', email: 'a@x.com', password: 'Gizli1234' }, 'password'], // özel karakter yok
    [{ email: 'a@x.com', password: 'Gizli123!' }, 'name'],
  ])('geçersiz kayıt verisi reddedilir (%#)', (input, field) => {
    const r = registerSchema.safeParse(input);
    expect(r.success).toBe(false);
    expect(r.error.issues.map((i) => i.path[0])).toContain(field);
  });

  test.each(['Password123!', 'Gizli123!', 'Şifre2026?', 'Çok.Güçlü9'])('SRS FR-01 parola kuralına uyan şifre kabul edilir: %s', (password) => {
    expect(registerSchema.safeParse({ name: 'Ayşe', email: 'a@x.com', password }).success).toBe(true);
  });

  test('login: şifre boş olamaz', () => {
    expect(loginSchema.safeParse({ email: 'a@x.com', password: '' }).success).toBe(false);
  });
});
