import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('mantém os módulos PDF.js fora dos imports de execução do Metro', () => {
  const source = readFileSync('src/lib/pdfText.ts', 'utf8');
  expect(source).not.toMatch(/import\s*\(\s*['"]pdfjs-dist/);
  expect(source).not.toMatch(/import\s+(?!type\b)[^;]*from\s*['"]pdfjs-dist/);
});
