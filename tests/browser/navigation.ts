import { Page } from '@playwright/test';

/** Secondary destinations move into Mais on narrow screens. */
export async function navigateTab(page: Page, name: string) {
  const tab = page.getByRole('tab', { name: new RegExp(name) });
  if (await tab.count()) {
    await tab.click();
    return;
  }
  if (name !== 'Importar' && name !== 'Assinaturas') throw new Error('Destino de navegação ausente: ' + name);
  await page.getByRole('tab', { name: /Mais/ }).click();
  await page.getByRole('button', { name: name === 'Importar' ? 'Importar extrato' : 'Ver assinaturas', exact: true }).click();
}
