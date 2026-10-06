import { expect, test, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { capture, readyImages } from './capture';
import { navigateTab } from './navigation';
async function start(page: Page) {
  const viewport = page.viewportSize();
  // The incumbent welcome screen exposes the local pilot only below 800px.
  // Enter there, then test the requested desktop layout without altering that screen.
  if (viewport && viewport.width >= 800) await page.setViewportSize({ width: 390, height: viewport.height });
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00')); await page.goto('/'); await page.getByRole('button', { name: 'Abrir teste local' }).click(); await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
  if (viewport && viewport.width >= 800) await page.setViewportSize(viewport);
}
async function tab(page: Page, name: string) { await navigateTab(page, name); }
async function account(page: Page, name: string, value: string) { await tab(page, 'Contas'); await page.getByLabel('Nome da conta', { exact: true }).fill(name); await page.getByLabel('Saldo inicial (R$)', { exact: true }).fill(value); await page.getByRole('button', { name: 'Salvar conta', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Saldos registrados', exact: true }).locator('..').getByText(name, { exact: true })).toBeVisible(); }
test('contas, Pix, transferência, parcelas, pagamento e persistência', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await start(page); await account(page, 'BB teste', '1000'); await account(page, 'Inter teste', '0');
  await tab(page, 'Extrato'); await page.getByRole('button', { name: 'Nova movimentação' }).click();
  await page.getByLabel('Valor (R$)', { exact: true }).fill('50,00'); await page.getByLabel('Descrição', { exact: true }).fill('Mercado teste'); await page.getByRole('button', { name: 'Salvar movimentação' }).click();
  await expect(page.getByRole('button', { name: 'Editar Mercado teste', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar Mercado teste' }).click(); await page.getByLabel('Valor (R$)', { exact: true }).fill('60'); await page.getByRole('button', { name: 'Salvar movimentação' }).click();
  await page.getByRole('button', { name: 'Nova movimentação' }).click(); await page.getByRole('radio', { name: 'Transferência', exact: true }).click(); await page.getByLabel('Valor (R$)', { exact: true }).fill('100'); await page.getByLabel('Descrição', { exact: true }).fill('Reserva teste'); await page.getByRole('button', { name: 'Salvar movimentação' }).click();
  await tab(page, 'Contas'); const balances = page.getByRole('heading', { name: 'Saldos registrados', exact: true }).locator('..'); await expect(balances.getByText('R$ 840,00', { exact: true })).toBeVisible(); await expect(balances.getByText('R$ 100,00', { exact: true })).toBeVisible();
  await capture(page, '.impeccable/review/accounts-mobile.png');
  await tab(page, 'Cartões'); await page.getByLabel('Nome do cartão', { exact: true }).fill('Cartão teste'); await page.getByLabel('Limite cadastrado (R$)', { exact: true }).fill('2000'); await page.getByRole('button', { name: 'Salvar cartão' }).click();
  await page.getByRole('button', { name: 'Registrar compra em Cartão teste' }).click(); await page.getByLabel('Valor (R$)', { exact: true }).fill('100'); await page.getByLabel('Descrição', { exact: true }).fill('Compra parcelada'); await page.getByLabel('Data (AAAA-MM-DD)').fill('2026-10-01'); await page.getByLabel('Número de parcelas').fill('3'); await page.getByRole('button', { name: 'Salvar movimentação' }).click();
  await tab(page, 'Cartões'); await expect(page.getByRole('heading', { name: 'Cartão teste', exact: true }).locator('..').getByText('R$ 33,34 em aberto', { exact: true })).toBeVisible();
  await capture(page, '.impeccable/review/cards-mobile.png');
  await page.getByRole('button', { name: 'Pagar fatura de Cartão teste' }).click(); await page.getByLabel('Valor (R$)', { exact: true }).fill('33,34'); await page.getByRole('button', { name: 'Salvar movimentação' }).click();
  await tab(page, 'Início'); await expect(page.getByTestId('monthly-expense').getByText('R$ 93,34', { exact: true })).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'Abrir teste local' }).click(); await expect(page.getByText('R$ 906,66', { exact: true })).toBeVisible();
  expect(errors).toEqual([]); await readyImages(page); await page.screenshot({ path: '.project/evidence/dashboard-mobile.png', fullPage: true });
  await capture(page, '.impeccable/review/mobile.png');
  await page.setViewportSize({ width: 1440, height: 1000 }); await capture(page, '.impeccable/review/desktop.png');
  const navigation = await page.getByRole('tablist').boundingBox(); expect(navigation?.width).toBeLessThan(200);
  await page.setViewportSize({ width: 390, height: 844 }); await tab(page, 'Extrato'); await capture(page, '.impeccable/review/transactions-mobile.png');
  await page.getByRole('button', { name: 'Nova movimentação' }).click(); await capture(page, '.impeccable/review/entry-mobile.png'); await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await tab(page, 'Contas'); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Exportar registros (JSON)' }).click();
  const exported = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  expect(exported.accounts).toHaveLength(2); expect(exported.entries).toHaveLength(4); expect(exported.amountsInCents).toBe(true);
});
test('CSV é revisado e reimportação não duplica lançamentos', async ({ page }) => {
  await start(page); await account(page, 'Conta importação', '0'); await tab(page, 'Importar');
  const file = { name: 'teste.csv', mimeType: 'text/csv', buffer: Buffer.from('data;descricao;valor\n01/10/2026;Receita importada;100\n02/10/2026;Despesa importada;-10,50') };
  for (let i = 0; i < 2; i++) {
    const chooser = page.waitForEvent('filechooser'); await page.getByRole('button', { name: 'Escolher CSV, OFX ou PDF' }).click(); await (await chooser).setFiles(file);
    await expect(page.getByRole('button', { name: 'Confirmar importação' })).toBeVisible();
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(accessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.html) }))).toEqual([]);
    await page.getByRole('button', { name: 'Confirmar importação' }).click();
    await expect(page.getByText(i ? '0 movimentações importadas. 2 já existentes foram ignoradas.' : '2 movimentações importadas. 0 já existentes foram ignoradas.', { exact: true })).toBeVisible();
  }
  await tab(page, 'Extrato'); await expect(page.getByRole('button', { name: 'Editar Receita importada', exact: true })).toHaveCount(1);
  await tab(page, 'Importar'); await capture(page, '.impeccable/review/imports-mobile.png');
});
for (const width of [320, 390, 768, 1440]) test(`interface sem overflow e acessível em ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await start(page);
  for (const name of ['Contas', 'Cartões', 'Importar', 'Extrato', 'Início']) {
    await tab(page, name);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(report.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.html) }))).toEqual([]);
  }
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.html) }))).toEqual([]);
  await page.screenshot({ path: `.project/evidence/dashboard-${width}.png`, fullPage: true });
});
test('entrada, foco por teclado, erro local e navegação do mês', async ({ page }) => {
  await page.goto('/');
  const entry = page.getByRole('button', { name: 'Abrir teste local' }); await expect(entry).toBeVisible();
  const firstAction = await entry.boundingBox(); expect(firstAction!.y + firstAction!.height).toBeLessThan(844);
  await entry.focus(); await expect(entry).toBeFocused();
  await capture(page, '.impeccable/review/welcome-mobile.png');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Informe e-mail válido');
  await start(page); await page.getByRole('button', { name: 'Mês anterior' }).click(); await expect(page.getByText('setembro de 2026', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Próximo mês' }).click(); await expect(page.getByText('outubro de 2026', { exact: true })).toBeVisible();
});
