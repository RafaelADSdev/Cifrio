import { expect, test } from '@playwright/test';

test('cartões: editar dados e excluir sem histórico', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir teste local' }).click();
  await page.getByRole('tab', { name: /Cartões/ }).click();
  await page.getByLabel('Nome do cartão', { exact: true }).fill('Principal');
  await page.getByLabel('Limite cadastrado (R$)', { exact: true }).fill('5000');
  await page.getByRole('button', { name: 'Salvar cartão', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Principal', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar Principal', exact: true }).click();
  const edit = page.getByText('Editar Principal', { exact: true }).locator('..');
  await edit.getByLabel('Nome do cartão', { exact: true }).fill('Visa');
  await page.getByRole('button', { name: 'Salvar alterações do cartão', exact: true }).click();
  await expect(page.getByText('Cartão atualizado.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Visa', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir cartão Visa', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar exclusão de Visa', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Visa', exact: true })).toHaveCount(0);
});

test('agenda: calendário, limite do mês e modal de parcelas', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir teste local' }).click();
  await page.getByRole('tab', { name: /Cartões/ }).click();
  await page.getByLabel('Nome do cartão', { exact: true }).fill('Agenda');
  await page.getByLabel('Limite cadastrado (R$)', { exact: true }).fill('5000');
  await page.getByRole('button', { name: 'Salvar cartão', exact: true }).click();
  await page.getByRole('button', { name: 'Registrar compra em Agenda' }).click();
  await page.getByLabel('Valor (R$)', { exact: true }).fill('120');
  await page.getByLabel('Descrição', { exact: true }).fill('Parcelada agenda');
  await page.getByLabel('Data (AAAA-MM-DD)').fill('2026-10-01');
  await page.getByLabel('Número de parcelas').fill('12');
  await page.getByRole('button', { name: 'Salvar movimentação' }).click();
  await expect(page.getByText('Limite do mês (vencimentos)', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Parcelada agenda, parcela/ }).click();
  await expect(page.getByText('Faltam', { exact: true })).toBeVisible();
  await expect(page.getByText('12', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Fechar detalhes da compra parcelada', exact: true }).click();
});
