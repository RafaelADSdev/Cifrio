import { expect, test } from '@playwright/test';

test('assinaturas: cadastro, total do mês e confirmação de pagamento', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir teste local' }).click();
  await page.getByRole('tab', { name: /Contas/ }).click();
  await page.getByLabel('Nome da conta', { exact: true }).fill('Débito');
  await page.getByLabel('Saldo inicial (R$)', { exact: true }).fill('500');
  await page.getByRole('button', { name: 'Salvar conta', exact: true }).click();
  await page.getByRole('tab', { name: /Assinaturas/ }).click();
  await page.getByRole('button', { name: 'Adicionar assinatura', exact: true }).click();
  await page.getByLabel('Nome da assinatura', { exact: true }).fill('Netflix teste');
  await page.getByLabel('Valor mensal (R$)', { exact: true }).fill('55');
  await page.getByLabel('Dia previsto (1–31)').fill('5');
  await page.getByRole('button', { name: 'Salvar assinatura', exact: true }).click();
  await expect(page.getByText(/Assinatura salva/)).toBeVisible();
  await expect(page.getByText('R$ 55,00', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /Confirmar pagamento de Netflix teste/ }).click();
  await expect(page.getByText('Pagamento registrado no extrato.', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: /Contas/ }).click();
  await expect(page.getByRole('heading', { name: 'Salário e contas fixas', exact: true }).locator('..').getByText('Netflix teste')).toHaveCount(0);
});
