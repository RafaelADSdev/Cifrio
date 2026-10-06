import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({ baseURL: process.env.POLISH_BASE_URL ?? 'http://localhost:8081' });
for (const width of [320, 390, 768, 1440]) test('pizza, compromissos e navegação em ' + width, async ({ page }) => {
 const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
 await page.setViewportSize({width:390,height:900});
 await page.clock.setFixedTime(new Date('2026-10-05T12:00:00-03:00'));
 await page.goto('/');
 await page.evaluate(() => localStorage.setItem('gestao.demo.v1', JSON.stringify({
  accounts:[{id:'a',name:'Conta teste',bank:'Inter',openingBalance:100000}],
  cards:[{id:'c',name:'Cartão teste',closingDay:25,dueDay:28,limit:300000}],
  entries:[
   {id:'e1',kind:'expense',accountId:'a',amount:5000,date:'2026-10-01',description:'Mercado',category:'Alimentação',method:'pix'},
   {id:'e2',kind:'expense',accountId:'a',amount:1500,date:'2026-10-01',description:'Ônibus',category:'Transporte',method:'pix'},
   {id:'e3',kind:'card_purchase',cardId:'c',amount:90000,date:'2026-10-01',description:'Notebook',category:'Compras',method:'credit',installments:3,statementMonth:'2026-10'}
  ]
 })));
 await page.getByRole('button',{name:'Abrir teste local'}).click();
 await expect(page.getByRole('heading',{name:'Visão geral'})).toBeVisible();
 await page.setViewportSize({width,height:900});
 const pie=page.getByRole('img',{name:/Gráfico de pizza/});
 await expect(pie).toBeVisible(); await expect(pie.locator('svg path')).toHaveCount(3);
 const committed=page.getByRole('heading',{name:'Já comprometido',exact:true}).locator('..');
 await expect(committed.getByText('R$ 600,00',{exact:true})).toBeVisible();
 await expect(committed.getByText('Notebook',{exact:true})).toHaveCount(2);
 const tabs=page.getByRole('tablist');
 await expect(tabs.getByRole('tab')).toHaveCount(width<1000?5:6);
 if(width<1000){
  const boxes=await tabs.getByRole('tab').all();
  const rects=await Promise.all(boxes.map(tab=>tab.boundingBox()));
  expect(Math.max(...rects.map(r=>r!.width))-Math.min(...rects.map(r=>r!.width))).toBeLessThan(2);
  expect(Math.max(...rects.map(r=>r!.y))-Math.min(...rects.map(r=>r!.y))).toBeLessThan(2);
  await page.getByRole('tab',{name:/Mais/}).click();
  await page.getByRole('button',{name:'Ver assinaturas'}).click();
  await expect(page.getByRole('heading',{name:'Assinaturas',exact:true,level:1})).toBeVisible();
  await page.getByRole('tab',{name:/Mais/}).click();
  await page.getByRole('button',{name:'Importar extrato',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Importar extrato',exact:true})).toBeVisible();
 }
 await page.getByRole('tab',{name:/Início/}).click();
 // Allow the existing dashboard arrival transitions to settle before contrast analysis.
 await page.waitForTimeout(750);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 expect(report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.html)}))).toEqual([]);
 await committed.scrollIntoViewIfNeeded();
 await page.screenshot({path:'.project/evidence/dashboard-polish-'+width+'.png'});
 await pie.scrollIntoViewIfNeeded();
 await page.screenshot({path:'.project/evidence/pizza-'+width+'.png'});
 await page.getByRole('button',{name:'Próximo mês',exact:true}).click();
 await expect(pie.locator('svg circle')).toHaveCount(1);
 await page.emulateMedia({reducedMotion:'reduce'});
 if (width >= 800) await page.setViewportSize({ width: 390, height: 900 });
 await page.reload();
 await page.getByRole('button',{name:'Abrir teste local'}).click();
 await expect(page.getByRole('img',{name:/Gráfico de pizza/})).toBeVisible();
 expect(errors).toEqual([]);
});
