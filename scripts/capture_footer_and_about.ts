import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = path.resolve('/Users/vishal/.gemini/antigravity-ide/brain/223a4399-1ad6-4032-8358-2cf1d56e296c/screenshots');

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome' });

  // 1. Desktop Footer (Full Footer Element)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);

  const footerElement = await desktopPage.$('footer');
  if (footerElement) {
    await footerElement.screenshot({
      path: path.join(OUTPUT_DIR, 'footer_desktop.png'),
    });
    console.log('Saved footer_desktop.png');
  }

  // 2. Mobile Footer: target the bottom attribution section & credit line
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);

  // Scroll to bottom
  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mobilePage.waitForTimeout(600);

  // Take screenshot of mobile bottom viewport showing the footer credit
  await mobilePage.screenshot({
    path: path.join(OUTPUT_DIR, 'footer_mobile.png'),
    fullPage: false,
  });
  console.log('Saved footer_mobile.png');

  // Also take full-page screenshot of the footer on mobile
  if (footerElement) {
    const mobileFooterElement = await mobilePage.$('footer');
    if (mobileFooterElement) {
      await mobileFooterElement.screenshot({
        path: path.join(OUTPUT_DIR, 'footer_mobile_full.png'),
      });
      console.log('Saved footer_mobile_full.png');
    }
  }

  // 3. About Page: Scroll to "Built by" section on Desktop
  await desktopPage.goto('http://localhost:3000/en/about', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  
  // Scroll to "Built by"
  const builtBySection = await desktopPage.locator('text=Built by').first();
  if (await builtBySection.count() > 0) {
    await builtBySection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await desktopPage.screenshot({
      path: path.join(OUTPUT_DIR, 'about_page_built_by_desktop.png'),
      fullPage: false,
    });
    console.log('Saved about_page_built_by_desktop.png');
  }

  // 4. About Page: Scroll to "Built by" on Mobile
  await mobilePage.goto('http://localhost:3000/en/about', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  const mobileBuiltBy = await mobilePage.locator('text=Built by').first();
  if (await mobileBuiltBy.count() > 0) {
    await mobileBuiltBy.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({
      path: path.join(OUTPUT_DIR, 'about_page_built_by_mobile.png'),
      fullPage: false,
    });
    console.log('Saved about_page_built_by_mobile.png');
  }

  await desktopPage.close();
  await desktopContext.close();
  await mobilePage.close();
  await mobileContext.close();
  await browser.close();
  console.log('Finished capturing all detailed screenshots!');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
