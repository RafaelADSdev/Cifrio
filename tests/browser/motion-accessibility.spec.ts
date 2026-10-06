import { expect, test } from '@playwright/test';

test('limites preservam dados e movimento reduzido muda sem recarregar', async ({ page }) => {
  const click = async (name: string) => {
    const button = page.getByRole('button', { name, exact: true });
    await button.evaluate(element => element.scrollIntoView({ block: 'center' }));
    await button.click();
  };
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('gestao.demo.v1', JSON.stringify({
    accounts: [{ id: 'a', name: 'Conta teste', bank: 'Inter', openingBalance: 100000 }], cards: [],
    entries: [{ id: 'e', kind: 'expense', accountId: 'a', amount: 5000, date: '2026-10-01', description: 'Mercado', category: 'Alimentação', method: 'pix' }],
  })));
  await page.getByRole('button', { name: 'Abrir teste local' }).click();
  const open = page.getByRole('button', { name: 'Definir limites por categoria' });
  const center = async () => open.evaluate(element => element.scrollIntoView({ block: 'center' }));
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByLabel('Limite mensal (R$)', { exact: true })).toHaveCount(0);
  await center(); await open.click();
  await page.getByLabel('Limite mensal (R$)', { exact: true }).fill('200');
  await click('Salvar limite de Alimentação');
  await expect(page.getByText('R$ 50,00 de R$ 200,00', { exact: true })).toBeVisible();
  await page.getByLabel('Limite mensal (R$)', { exact: true }).fill('250');
  await click('Fechar limites por categoria');
  await center(); await open.click();
  await expect(page.getByLabel('Limite mensal (R$)', { exact: true })).toHaveValue('250');
  await click('Fechar limites por categoria');

  await center();
  const bounds = await open.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.down();
  await expect.poll(() => open.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeCloseTo(0.98, 2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => open.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBe(1);
  await page.mouse.up();
  await click('Fechar limites por categoria');

  const chart = page.getByTestId('spending-chart-motion');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const resting = () => chart.evaluate(element => {
    const style = getComputedStyle(element);
    return Number(style.opacity) === 1 && new DOMMatrixReadOnly(style.transform).a === 1;
  });
  await expect.poll(resting).toBe(true);
  await click('Próximo mês');
  const previous = page.getByRole('button', { name: 'Mês anterior', exact: true });
  await click('Mês anterior');
  await expect.poll(resting).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await previous.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Próximo mês', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(resting).toBe(true);
  await expect(page.getByText('R$ 50,00 de R$ 200,00', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
