import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { capture } from './capture';
test('contas: fundos, exclusão protegida, salário e despesas mensais persistem', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
  await page.goto('/'); await page.getByRole('button', { name: 'Abrir teste local' }).click(); await page.getByRole('tab', { name: /Contas/ }).click();
  for (const [name, amount] of [['BB contas', '100'], ['Vazia', '0']]) {
    await page.getByLabel('Nome da conta', { exact: true }).fill(name); await page.getByLabel('Saldo inicial (R$)', { exact: true }).fill(amount); await page.getByRole('button', { name: 'Salvar conta', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Saldos registrados' }).locator('..').getByText(name, { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Excluir conta Vazia', exact: true }).click(); await page.getByRole('button', { name: 'Cancelar exclusão' }).click();
  await page.getByRole('button', { name: 'Excluir conta Vazia', exact: true }).click(); await page.getByRole('button', { name: 'Confirmar exclusão de Vazia' }).click();
  await expect(page.getByRole('button', { name: 'Excluir conta Vazia', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Adicionar fundos a BB contas' }).click(); await page.getByLabel('Valor dos fundos (R$)').fill('50'); await page.getByRole('button', { name: 'Registrar fundos', exact: true }).click();
  await expect(page.getByText('Fundos registrados no extrato.', { exact: true })).toBeVisible();
  const recorded = page.getByRole('heading', { name: 'Saldos registrados', exact: true }).locator('..');
  await expect(recorded.getByText('R$ 150,00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir conta BB contas', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('tem movimentações');
  for (const [description, kind, amount, day] of [['Salário teste', 'Receita / salário', '1000', '1'], ['Aluguel teste', 'Despesa fixa', '100', '2']]) {
    await page.getByRole('button', { name: 'Adicionar recorrência mensal' }).click(); await page.getByRole('radio', { name: kind, exact: true }).click();
    await page.getByLabel('Descrição da recorrência').fill(description); await page.getByLabel('Valor mensal (R$)').fill(amount); await page.getByLabel('Dia previsto (1–31)').fill(day); await page.getByRole('button', { name: 'Salvar recorrência', exact: true }).click();
    await expect(page.getByText('Recorrência salva. O saldo só muda após confirmar o mês.', { exact: true })).toBeVisible();
  }
  await expect(recorded.getByText('R$ 150,00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar recebimento de Salário teste' }).click(); await expect(page.getByRole('button', { name: 'Confirmar recebimento de Salário teste' })).toBeDisabled();
  await page.getByRole('button', { name: 'Confirmar pagamento de Aluguel teste' }).click(); await expect(recorded.getByText('R$ 1.050,00', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar Aluguel teste' }).click(); await expect(page.getByRole('button', { name: 'Retomar Aluguel teste' })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze(); expect(axe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 }); await capture(page, '.impeccable/review/accounts-new-mobile.png');
  await page.setViewportSize({ width: 1440, height: 1000 }); await capture(page, '.impeccable/review/accounts-new-desktop.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('heading', { name: 'Salário e contas fixas', exact: true }).evaluate(element => { let parent = element.parentElement; while (parent && parent.scrollHeight <= parent.clientHeight) parent = parent.parentElement; if (parent) { parent.style.scrollBehavior = 'auto'; parent.scrollTop += element.getBoundingClientRect().top - parent.getBoundingClientRect().top - 20; } });
  await expect(page.getByRole('button', { name: 'Confirmar recebimento de Salário teste' })).toBeInViewport(); await page.screenshot({ path: '.impeccable/review/recurring-mobile.png' });
  await page.getByRole('button', { name: 'Remover recorrência Aluguel teste' }).click(); await page.getByRole('button', { name: 'Confirmar remoção de Aluguel teste' }).click();
  await page.getByRole('button', { name: 'Próximo mês das recorrências' }).click(); await expect(page.getByRole('button', { name: 'Confirmar recebimento de Salário teste' })).toBeDisabled();
  await page.goto('/'); await page.reload(); await page.getByRole('button', { name: 'Abrir teste local' }).click(); await page.getByRole('tab', { name: /Contas/ }).click();
  await expect(recorded.getByText('R$ 1.050,00', { exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Confirmar recebimento de Salário teste' })).toBeDisabled();
  await page.getByRole('button', { name: 'Adicionar fundos a BB contas' }).click(); await capture(page, '.impeccable/review/funds-mobile.png');
  await page.getByRole('button', { name: 'Cancelar entrada de fundos' }).click();
  await page.getByRole('tab', { name: /Extrato/ }).click(); await expect(page.getByRole('button', { name: 'Editar Aluguel teste', exact: true })).toHaveCount(1);
  expect(errors).toEqual([]);
});
