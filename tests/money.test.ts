import { describe, expect, it } from 'vitest';
import { assertDate, parseMoney, addMonth } from '../src/domain/money';
describe('valores e datas', () => {
  it('usa centavos exatos para reais e sinais', () => {
    expect(parseMoney('1.234,56')).toBe(123456);
    expect(parseMoney('-0,01')).toBe(-1);
    expect(parseMoney('0.29')).toBe(29);
    expect(parseMoney('R$ 12,30')).toBe(1230);
  });
  it.each(['', 'abc', '1,234', '12.3456', '1e3'])('rejeita valor ambíguo %s', v => expect(() => parseMoney(v)).toThrow());
  it('rejeita dia inexistente e suporta virada de ano', () => {
    expect(() => assertDate('2026-02-30')).toThrow();
    expect(() => assertDate('2024-02-29')).not.toThrow();
    expect(addMonth('2026-12', 1)).toBe('2027-01');
  });
});
