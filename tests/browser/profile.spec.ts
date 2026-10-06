import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { capture, readyImages } from './capture';
test('perfil local edita nome, foto, persiste, exporta e remove foto', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/'); await page.getByRole('button', { name: 'Abrir teste local' }).click(); await page.getByRole('button', { name: 'Abrir perfil' }).click();
  await expect(page.getByRole('heading', { name: 'Seu perfil', exact: true })).toBeVisible();
  await page.getByLabel('Nome de exibição', { exact: true }).fill('Ana Teste');
  const chooser = page.waitForEvent('filechooser'); await page.getByRole('button', { name: 'Alterar foto', exact: true }).click(); await (await chooser).setFiles('assets/brand/cifrio-mark.png');
  await expect(page.getByRole('button', { name: 'Remover foto', exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Salvar perfil', exact: true }).click(); await expect(page.getByText('Perfil salvo.', { exact: true })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze(); expect(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.html) }))).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await capture(page, '.impeccable/review/profile-mobile.png');
  await page.setViewportSize({ width: 1440, height: 1000 }); await capture(page, '.impeccable/review/profile-desktop.png'); await page.setViewportSize({ width: 390, height: 844 });
  await page.reload(); await page.getByRole('button', { name: 'Abrir teste local' }).click(); await page.getByRole('button', { name: 'Abrir perfil' }).click(); await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Teste'); await expect(page.getByRole('button', { name: 'Remover foto' })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Exportar meu perfil (JSON)' }).click(); const exported = JSON.parse(await readFile((await (await download).path())!, 'utf8')); expect(exported.displayName).toBe('Ana Teste'); expect(exported.avatarDataUrl).toMatch(/^data:image\/png;base64,/);
  await page.getByRole('button', { name: 'Remover foto' }).click(); await page.getByRole('button', { name: 'Salvar perfil' }).click(); await expect(page.getByRole('button', { name: 'Remover foto' })).toHaveCount(0);
  await page.getByLabel('Nome de exibição').fill(' '); await page.getByRole('button', { name: 'Salvar perfil' }).click(); await expect(page.getByRole('alert')).toContainText('1 a 80'); expect(errors).toEqual([]);
});
test('callback sem código tem erro recuperável e não simula sessão', async ({ page }) => {
  await page.goto('/auth/callback'); await expect(page.getByRole('alert')).toContainText('Não foi possível concluir'); await page.getByRole('button', { name: 'Voltar para entrada' }).click(); await expect(page.getByRole('button', { name: 'Continuar com Google' })).toBeVisible();
  await readyImages(page);
  const heading = page.getByRole('heading', { name: 'Sua conta online', exact: true });
  await heading.evaluate(element => {
    let parent = element.parentElement;
    while (parent && parent.scrollHeight <= parent.clientHeight) parent = parent.parentElement;
    if (parent) { parent.style.scrollBehavior = 'auto'; parent.scrollTop += element.getBoundingClientRect().top - parent.getBoundingClientRect().top - 20; }
  });
  await expect(heading).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('button', { name: 'Continuar com Google' })).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: '.impeccable/review/welcome-online-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 }); await capture(page, '.impeccable/review/welcome-desktop.png');
});
test('OAuth PKCE simulado retorna sessão e editar nome não apaga o extrato', async ({ page }) => {
  const runtimeErrors: string[] = []; page.on('pageerror', error => runtimeErrors.push(error.message));
  const id = '00000000-0000-4000-8000-000000000001';
  let user = { id, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: { provider: 'google', providers: ['google'] }, user_metadata: { full_name: 'Pessoa Teste' }, created_at: '2026-10-05T00:00:00Z' };
  let exchanged = false;
  await page.route('https://*.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/auth/v1/authorize') {
      expect(url.searchParams.get('provider')).toBe('google'); expect(url.searchParams.get('code_challenge_method')).toBe('s256'); expect(url.searchParams.get('code_challenge')).toBeTruthy();
      return route.fulfill({ status: 302, headers: { location: new URL('/auth/callback?code=fixture-code', page.url()).href } });
    }
    if (url.pathname === '/auth/v1/token') {
      const input = route.request().postDataJSON(); expect(input.auth_code).toBe('fixture-code'); expect(input.code_verifier.length).toBeGreaterThan(20); exchanged = true;
      const jwt = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture-signature`;
      return route.fulfill({ json: { access_token: jwt, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 3600, user } });
    }
    if (url.pathname === '/auth/v1/user') {
      if (route.request().method() === 'PUT') user = { ...user, user_metadata: { ...user.user_metadata, ...route.request().postDataJSON().data } };
      return route.fulfill({ json: user });
    }
    if (url.pathname === '/rest/v1/rpc/read_finance') return route.fulfill({ json: { accounts: [{ id: '10000000-0000-4000-8000-000000000001', name: 'Conta fixture', bank: 'Banco do Brasil', openingBalance: 100000 }], cards: [], entries: [], appliedOperations: [] } });
    return route.fulfill({ status: 404, json: { error: 'Fixture endpoint not defined' } });
  });
  await page.goto('/'); await page.getByRole('button', { name: 'Continuar com Google' }).click(); await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible({ timeout: 15000 }); expect(exchanged).toBe(true); expect(runtimeErrors).toEqual([]); await expect(page.getByText('R$ 1.000,00', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Abrir perfil' }).click(); await expect(page.getByLabel('Nome de exibição')).toHaveValue('Pessoa Teste'); await page.getByLabel('Nome de exibição').fill('Nome Editado'); await page.getByRole('button', { name: 'Salvar perfil' }).click(); await expect(page.getByText('Perfil salvo.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click(); await expect(page.getByText('R$ 1.000,00', { exact: true }).first()).toBeVisible(); await page.getByRole('button', { name: 'Abrir perfil' }).click(); await expect(page.getByLabel('Nome de exibição')).toHaveValue('Nome Editado');
});
