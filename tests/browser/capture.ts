import { expect, Page } from '@playwright/test';

export async function readyImages(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => {
    const images = Array.from(document.images).filter(image => image.currentSrc || image.src);
    return images.length > 0 && images.every(image => image.complete && image.naturalWidth > 0);
  })).toBe(true);
}

export async function capture(page: Page, path: string) {
  await page.evaluate(() => document.querySelectorAll('*').forEach(element => {
    if (element instanceof HTMLElement) { element.style.scrollBehavior = 'auto'; element.scrollTop = 0; }
  }));
  await readyImages(page);
  // Let the app's longest 420ms month transition settle before capturing text.
  await page.waitForTimeout(500);
  await page.screenshot({ path });
}
