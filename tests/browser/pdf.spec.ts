import { expect, test } from '@playwright/test';
test.use({ baseURL: process.env.PDF_TEST_BASE_URL ?? 'http://localhost:8081' });

// Synthetic ASCII fixture only. Never attach the personal Ourocard sample to browser traces.
function pdf(lines: string[], protectedFile = false) {
  const stream = ['BT /F1 11 Tf 40 700 Td', ...lines.flatMap((line, index) => [`${index ? '0 -18 Td ' : ''}(${line}) Tj`]), 'ET'].join('\n');
  let body = '%PDF-1.4\n'; const offsets = [0];
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  if (protectedFile) objects.push(`<< /Filter /Standard /V 1 /R 2 /O <${'00'.repeat(32)}> /U <${'00'.repeat(32)}> /P -4 >>`);
  objects.forEach((object, index) => { offsets.push(body.length); body += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const at = body.length;
  const encrypted = protectedFile ? ` /Encrypt 6 0 R /ID [<${'01'.repeat(16)}> <${'01'.repeat(16)}>]` : '';
  return Buffer.from(`${body}xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R${encrypted} >>\nstartxref\n${at}\n%%EOF`);
}

test('PDF externo ao Metro revisa só o cartão do perfil, sem upload do arquivo', async ({ page }) => {
  const errors: string[] = [], requests: { method: string; path: string }[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await page.getByRole('button', { name: 'Abrir teste local' }).click();
  await page.getByRole('button', { name: 'Abrir perfil' }).click();
  await page.getByLabel('Nome de exibição', { exact: true }).fill('Carlos Ana Sobrenome');
  await page.getByRole('button', { name: 'Salvar perfil', exact: true }).click();
  await expect(page.getByText('Perfil salvo.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('tab', { name: /Contas/ }).click();
  await page.getByLabel('Nome da conta', { exact: true }).fill('Conta PDF');
  await page.getByLabel('Saldo inicial (R$)', { exact: true }).fill('100');
  await page.getByRole('button', { name: 'Salvar conta', exact: true }).click();
  await page.getByRole('tab', { name: /Importar/ }).click();
  await expect(page.getByRole('heading', { name: 'Importar extrato', exact: true })).toBeVisible();
  page.on('request', request => requests.push({ method: request.method(), path: new URL(request.url()).pathname }));
  const chooser = page.waitForEvent('filechooser'); await page.getByRole('button', { name: 'Escolher CSV, OFX ou PDF' }).click();
  await (await chooser).setFiles({ name: 'fatura-sintetica.pdf', mimeType: 'application/pdf', buffer: pdf([
    'Fatura fechada em 09/09/2026', 'OUROCARD', '01- ANA TESTE Cartao N. 1111',
    '21/08 COMPRA ANA R$ 10,00', '22/08 ESTORNO ANA R$ 3,00-', 'Subtotal R$ 7,00',
    '02- BRUNO TESTE Cartao N. 2222', '21/08 COMPRA BRUNO R$ 20,00', 'Subtotal R$ 20,00', 'Total R$ 27,00',
  ]) });
  await expect(page.getByRole('button', { name: 'Confirmar importação' })).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(2);
  await expect(page.getByRole('checkbox', { name: /COMPRA ANA/ })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /ESTORNO ANA/ })).toBeVisible();
  expect(requests.some(request => /\/pdfjs\/.*pdf\.mjs$/.test(request.path))).toBe(true);
  expect(requests.some(request => /\/pdfjs\/.*pdf\.worker\.mjs$/.test(request.path))).toBe(true);
  expect(requests.filter(request => request.method !== 'GET')).toEqual([]);
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Confirmar importação' }).click();
  await expect(page.getByText('2 movimentações importadas. 0 já existentes foram ignoradas.', { exact: true })).toBeVisible();
  const blank = page.waitForEvent('filechooser'); await page.getByRole('button', { name: 'Escolher CSV, OFX ou PDF' }).click();
  await (await blank).setFiles({ name: 'sem-texto.pdf', mimeType: 'application/pdf', buffer: pdf([]) });
  await expect(page.getByText(/Este PDF não tem texto selecionável/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar importação' })).toHaveCount(0);
  const protectedChooser = page.waitForEvent('filechooser'); await page.getByRole('button', { name: 'Escolher CSV, OFX ou PDF' }).click();
  await (await protectedChooser).setFiles({ name: 'com-senha.pdf', mimeType: 'application/pdf', buffer: pdf([], true) });
  await expect(page.getByText(/Este PDF pede senha/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar importação' })).toHaveCount(0);
  await page.getByRole('tab', { name: /Extrato/ }).click();
  await expect(page.getByRole('button', { name: /Editar COMPRA ANA/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Editar ESTORNO ANA/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Editar COMPRA BRUNO/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});
