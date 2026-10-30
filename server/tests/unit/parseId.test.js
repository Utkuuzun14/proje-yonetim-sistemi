'use strict';
const parseId = require('../../src/utils/parseId');

describe('parseId', () => {
  test.each([['1', 1], ['42', 42], ['2147483647', 2147483647]])('%s → %d', (input, expected) => {
    expect(parseId(input)).toBe(expected);
  });

  test.each(['0', '-1', 'abc', '1.5', '', '2147483648', '99999999999'])('%s → 400 VALIDATION_ERROR', (input) => {
    expect(() => parseId(input)).toThrow(expect.objectContaining({ status: 400, code: 'VALIDATION_ERROR' }));
  });

  test('özel mesaj', () => {
    expect(() => parseId('x', 'Geçersiz proje kimliği.')).toThrow('Geçersiz proje kimliği.');
  });
});
