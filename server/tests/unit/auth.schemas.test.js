'use strict';
const { registerSchema, loginSchema } = require('../../src/modules/auth/auth.schemas');

describe('auth şemaları (birim)', () => {
  test('e-postayı küçük harfe çevirir ve boşlukları kırpar', () => {
    const r = registerSchema.parse({ name: ' Ayşe ', email: '  AYSE@Sektech.COM ', password: 'Gizli1234' });
    expect(r.email).toBe('ayse@sektech.com');
    expect(r.name).toBe('Ayşe');
  });

  test.each([
    [{ name: 'A', email: 'a@x.com', password: 'Gizli1234' }, 'name'],
    [{ name: 'Ayşe', email: 'gecersiz', password: 'Gizli1234' }, 'email'],
    [{ name: 'Ayşe', email: 'a@x.com', password: 'kisa1' }, 'password'],
    [{ name: 'Ayşe', email: 'a@x.com', password: 'sadeceharf' }, 'password'],
    [{ name: 'Ayşe', email: 'a@x.com', password: '12345678' }, 'password'],
    [{ email: 'a@x.com', password: 'Gizli1234' }, 'name'],
  ])('geçersiz kayıt verisi reddedilir (%#)', (input, field) => {
    const r = registerSchema.safeParse(input);
    expect(r.success).toBe(false);
    expect(r.error.issues.map((i) => i.path[0])).toContain(field);
  });

  test('login: şifre boş olamaz', () => {
    expect(loginSchema.safeParse({ email: 'a@x.com', password: '' }).success).toBe(false);
  });
});
