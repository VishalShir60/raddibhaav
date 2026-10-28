import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = path.resolve('/Users/vishal/.gemini/antigravity-ide/brain/223a4399-1ad6-4032-8358-2cf1d56e296c/screenshots');

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome' });

  // 1. Landing Page (Public) - Desktop & Mobile
  const publicDesktop = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 2,
  });
  const page1 = await publicDesktop.newPage();
  await page1.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(1000);
  await page1.screenshot({
    path: path.join(OUTPUT_DIR, 'landing_page_desktop.png'),
    fullPage: false,
  });
  console.log('Saved landing_page_desktop.png');

  // Dark mode landing page
  await page1.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page1.waitForTimeout(600);
  await page1.screenshot({
    path: path.join(OUTPUT_DIR, 'landing_page_dark_desktop.png'),
    fullPage: false,
  });
  console.log('Saved landing_page_dark_desktop.png');
  await page1.close();
  await publicDesktop.close();

  // Mobile landing page
  const publicMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page1m = await publicMobile.newPage();
  await page1m.goto('http://localhost:3000/en', { waitUntil: 'networkidle' });
  await page1m.waitForTimeout(1000);
  await page1m.screenshot({
    path: path.join(OUTPUT_DIR, 'landing_page_mobile.png'),
    fullPage: false,
  });
  console.log('Saved landing_page_mobile.png');
  await page1m.close();
  await publicMobile.close();

  // 2. Seller Context (for /sell and /bids)
  const sellerCookies = [
    { name: 'raddibhaav_session', value: 'mock-seller-token', domain: 'localhost', path: '/' },
    { name: 'raddibhaav_user_role', value: 'seller', domain: 'localhost', path: '/' },
  ];

  const sellerDesktop = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 2,
  });
  await sellerDesktop.addCookies(sellerCookies);

  const sellerMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  await sellerMobile.addCookies(sellerCookies);

  // /sell (Sell scrap wizard)
  const pageSellD = await sellerDesktop.newPage();
  await pageSellD.goto('http://localhost:3000/en/sell', { waitUntil: 'networkidle' });
  await pageSellD.waitForTimeout(1000);
  await pageSellD.screenshot({
    path: path.join(OUTPUT_DIR, 'sell_scrap_wizard_desktop.png'),
    fullPage: false,
  });
  console.log('Saved sell_scrap_wizard_desktop.png');
  await pageSellD.close();

  const pageSellM = await sellerMobile.newPage();
  await pageSellM.goto('http://localhost:3000/en/sell', { waitUntil: 'networkidle' });
  await pageSellM.waitForTimeout(1000);
  await pageSellM.screenshot({
    path: path.join(OUTPUT_DIR, 'sell_scrap_wizard_mobile.png'),
    fullPage: false,
  });
  console.log('Saved sell_scrap_wizard_mobile.png');
  await pageSellM.close();

  // /bids (Offers comparison page)
  const pageBidsD = await sellerDesktop.newPage();
  await pageBidsD.goto('http://localhost:3000/en/bids', { waitUntil: 'networkidle' });
  await pageBidsD.waitForTimeout(1000);
  await pageBidsD.screenshot({
    path: path.join(OUTPUT_DIR, 'offers_page_desktop.png'),
    fullPage: false,
  });
  console.log('Saved offers_page_desktop.png');
  await pageBidsD.close();

  const pageBidsM = await sellerMobile.newPage();
  await pageBidsM.goto('http://localhost:3000/en/bids', { waitUntil: 'networkidle' });
  await pageBidsM.waitForTimeout(1000);
  await pageBidsM.screenshot({
    path: path.join(OUTPUT_DIR, 'offers_page_mobile.png'),
    fullPage: false,
  });
  console.log('Saved offers_page_mobile.png');
  await pageBidsM.close();

  await sellerDesktop.close();
  await sellerMobile.close();

  // 3. Dealer Context (for /dealer)
  const dealerCookies = [
    { name: 'raddibhaav_session', value: 'mock-dealer-token', domain: 'localhost', path: '/' },
    { name: 'raddibhaav_user_role', value: 'dealer', domain: 'localhost', path: '/' },
  ];

  const dealerDesktop = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 2,
  });
  await dealerDesktop.addCookies(dealerCookies);

  const dealerMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  await dealerMobile.addCookies(dealerCookies);

  const pageDealerD = await dealerDesktop.newPage();
  await pageDealerD.goto('http://localhost:3000/en/dealer', { waitUntil: 'networkidle' });
  await pageDealerD.waitForTimeout(1000);
  await pageDealerD.screenshot({
    path: path.join(OUTPUT_DIR, 'dealer_dashboard_desktop.png'),
    fullPage: false,
  });
  console.log('Saved dealer_dashboard_desktop.png');
  await pageDealerD.close();

  const pageDealerM = await dealerMobile.newPage();
  await pageDealerM.goto('http://localhost:3000/en/dealer', { waitUntil: 'networkidle' });
  await pageDealerM.waitForTimeout(1000);
  await pageDealerM.screenshot({
    path: path.join(OUTPUT_DIR, 'dealer_dashboard_mobile.png'),
    fullPage: false,
  });
  console.log('Saved dealer_dashboard_mobile.png');
  await pageDealerM.close();

  await dealerDesktop.close();
  await dealerMobile.close();

  await browser.close();
  console.log('All authenticated screenshots captured cleanly.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
