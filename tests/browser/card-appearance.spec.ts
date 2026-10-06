import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { capture } from './capture';

test('cartão personalizado persiste, aparece no início e abre a fatura correta', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Continuar com Google' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir teste local' }).click();
  await page.getByRole('tab', { name: /Cartões/ }).click();
  await page.getByLabel('Nome do cartão', { exact: true }).fill('Principal');
  await page.getByLabel('Limite cadastrado (R$)', { exact: true }).fill('5000');
  await page.getByRole('radio', { name: 'Mastercard', exact: true }).click();
  await page.getByRole('radio', { name: 'Azul profundo', exact: true }).click();
  await page.getByLabel('Últimos quatro dígitos (opcional)').fill('4321');
  await page.getByRole('button', { name: 'Salvar cartão', exact: true }).click();
  await expect(page.getByLabel('Nome do cartão', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Adicionar cartão', exact: true }).click();
  await page.getByLabel('Nome do cartão', { exact: true }).fill('Reserva');
  await page.getByLabel('Limite cadastrado (R$)', { exact: true }).fill('2000');
  await page.getByRole('radio', { name: 'Visa', exact: true }).click();
  await page.getByRole('radio', { name: 'Ciano', exact: true }).click();
  await page.getByLabel('Últimos quatro dígitos (opcional)').fill('5678');
  await page.getByRole('button', { name: 'Salvar cartão', exact: true }).click();
  await page.reload(); await page.getByRole('button', { name: 'Abrir teste local' }).click();
  const reserve = page.getByRole('button', { name: 'Ver fatura de Reserva', exact: true });
  await expect(reserve).toContainText('5678');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    if (width !== 320) await capture(page, `.impeccable/review/compact-${width === 390 ? 'mobile' : 'desktop'}.png`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await reserve.click();
  await expect(page.getByRole('heading', { name: 'Reserva', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Principal', exact: true })).toHaveCount(0);
  await capture(page, '.impeccable/review/themed-card-mobile.png');
  await page.getByRole('button', { name: 'Editar Reserva', exact: true }).click();
  await expect(page.getByLabel('Últimos quatro dígitos (opcional)')).toHaveValue('5678');
  await page.getByRole('radio', { name: 'Azul-marinho', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar alterações do cartão' }).click();
  await page.getByRole('radio', { name: 'Principal', exact: true }).click();
  await page.getByRole('tab', { name: /Início/ }).click();
  // Persistence was exercised by reload; navigate back to the same card after editing.
  await reserve.click();
  await page.getByRole('button', { name: 'Editar Reserva', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Azul-marinho', exact: true })).toHaveAttribute('aria-checked', 'true');
});
