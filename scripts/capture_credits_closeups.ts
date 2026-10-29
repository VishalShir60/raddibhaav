import { chromium } from '@playwright/test';
import * as path from 'path';

const OUTPUT_DIR = path.resolve('/Users/vishal/.gemini/antigravity-ide/brain/223a4399-1ad6-4032-8358-2cf1d56e296c/screenshots');

async function run() {
  const browser = await chromium.launch({ channel: 'chrome' });

  // Mobile Attribution Focus
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const pageM = await mobile.newPage();
  await pageM.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
  await pageM.waitForTimeout(600);

  const creditRowM = pageM.locator('#footer-creator-credit');
  await creditRowM.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(300);
  await creditRowM.screenshot({
    path: path.join(OUTPUT_DIR, 'footer_mobile_credit.png'),
  });
  console.log('Saved footer_mobile_credit.png');

  // Desktop Attribution Focus
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const pageD = await desktop.newPage();
  await pageD.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
  await pageD.waitForTimeout(600);

  const creditRowD = pageD.locator('#footer-creator-credit');
  await creditRowD.scrollIntoViewIfNeeded();
  await pageD.waitForTimeout(300);
  await creditRowD.screenshot({
    path: path.join(OUTPUT_DIR, 'footer_desktop_credit.png'),
  });
  console.log('Saved footer_desktop_credit.png');

  await pageM.close();
  await pageD.close();
  await mobile.close();
  await desktop.close();
  await browser.close();
}

run().catch(console.error);
