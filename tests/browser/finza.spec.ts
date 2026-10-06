import { expect, test, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function start(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir teste local' }).click();
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
}
test('atalhos, atividade, estatísticas e filtros preservam a leitura financeira', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await start(page);
  await page.getByRole('tab', { name: /Contas/ }).click();
  await page.getByLabel('Nome da conta', { exact: true }).fill('Conta finza');
  await page.getByLabel('Saldo inicial (R$)', { exact: true }).fill('1000');
  await page.getByRole('button', { name: 'Salvar conta', exact: true }).click();
  await page.getByRole('tab', { name: /Início/ }).click();
  for (const item of [{ action: 'Registrar receita', description: 'Salário finza', amount: '200' }, { action: 'Registrar despesa', description: 'Café finza', amount: '50' }]) {
    await page.getByRole('button', { name: item.action, exact: true }).click();
    await page.getByLabel('Descrição', { exact: true }).fill(item.description);
    await page.getByLabel('Valor (R$)', { exact: true }).fill(item.amount);
    await page.getByRole('button', { name: 'Salvar movimentação' }).click();
    await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
  }
  const recent = page.getByRole('heading', { name: 'Atividade recente', exact: true }).locator('../..');
  await expect(recent.getByText('Café finza', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir movimentação Café finza', exact: true }).click();
  await expect(page.getByLabel('Valor (R$)', { exact: true })).toHaveValue('50,00');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: 'Ver estatísticas', exact: true }).click();
  const summary = page.getByRole('heading', { name: 'Resumo do período', exact: true }).locator('..');
  await expect(summary.getByText('R$ 200,00', { exact: true })).toBeVisible();
  await expect(summary.getByText('R$ 50,00', { exact: true })).toBeVisible();
  await expect(summary.getByText('R$ 150,00', { exact: true })).toBeVisible();
  await page.screenshot({ path: '.project/evidence/finza-statistics-populated-390.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: '.project/evidence/finza-statistics-populated-1440.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir extrato deste período' }).click();
  await page.getByRole('radio', { name: 'Despesa', exact: true }).click();
  await page.getByLabel('Buscar movimentações').fill('cafe');
  await expect(page.getByRole('button', { name: 'Editar Café finza', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Editar Salário finza', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(page.getByRole('button', { name: 'Editar Salário finza', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir perfil' }).click();
  await page.getByRole('button', { name: 'Central de ajuda', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Central de ajuda', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
for (const width of [320, 390, 768, 1440]) test(`estatísticas e ajuda acessíveis sem overflow em ${width}px`, async ({ page }) => {
  await start(page);
  await page.setViewportSize({ width, height: 900 });
  await page.getByRole('button', { name: 'Ver estatísticas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Estatísticas', exact: true })).toBeVisible();
  await expect(page.getByText('Sem gastos neste período', { exact: true })).toBeVisible();
  for (const screen of ['statistics', 'help']) {
    if (screen === 'help') {
      await page.getByRole('button', { name: 'Voltar', exact: true }).click();
      await page.getByRole('button', { name: 'Abrir perfil' }).click();
      await page.getByRole('button', { name: 'Central de ajuda', exact: true }).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(report.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.html) }))).toEqual([]);
    await page.screenshot({ path: `.project/evidence/finza-${screen}-${width}.png`, fullPage: true });
  }
});
