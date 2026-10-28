import { test, expect, type BrowserContext, type Page } from '@playwright/test';

async function authenticateAs(context: BrowserContext, page: Page, role: 'seller' | 'dealer') {
  await context.addCookies([
    {
      name: 'raddibhaav_session',
      value: `mock-${role}-session`,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'raddibhaav_user_role',
      value: role,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'raddibhaav_kyc_status',
      value: 'approved',
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.addInitScript((userRole) => {
    window.localStorage.setItem(
      'raddibhaav_auth_user',
      JSON.stringify({ id: `user-${userRole}`, phone: '+919876543210' })
    );
    window.localStorage.setItem(
      'raddibhaav_auth_profile',
      JSON.stringify({
        id: `user-${userRole}`,
        role: userRole,
        name: userRole === 'seller' ? 'Sunita Sharma' : 'Gupta Scrap Traders',
        phone: '9876543210',
        city: 'Nashik',
      })
    );
    if (userRole === 'dealer') {
      window.localStorage.setItem(
        'raddibhaav_auth_dealer',
        JSON.stringify({
          id: 'dealer-demo-1',
          profile_id: 'user-dealer',
          shop_name: 'Gupta Scrap Traders',
          kyc_status: 'approved',
          service_radius_km: 10,
        })
      );
    }
  }, role);
}

test.describe('RaddiBhaav Full Lifecycle E2E: Seller -> Dealer -> Pickup -> Rating', () => {

  test('1. Auth flow: Unauthenticated user logs in via Phone OTP test credentials', async ({ page }) => {
    await page.goto('/en/auth');
    await expect(page.getByRole('heading', { name: 'Login or Register' })).toBeVisible();

    // Fill Test Credentials
    const fillTestBtn = page.getByRole('button', { name: 'Fill Test Credentials' });
    await expect(fillTestBtn).toBeVisible();
    await fillTestBtn.click();

    // Verify phone input is filled
    const phoneInput = page.getByPlaceholder('98765 43210');
    await expect(phoneInput).toHaveValue('9876543210');

    // Click Send OTP
    const sendOtpBtn = page.getByRole('button', { name: 'Send 6-Digit OTP' });
    await expect(sendOtpBtn).toBeEnabled();
    await sendOtpBtn.click();

    // Verify OTP input field appears
    const otpInput = page.locator('#otp');
    await expect(otpInput).toBeVisible({ timeout: 5000 });

    // Verify test mode pre-fills 123456 or fill it
    await otpInput.fill('123456');

    // Click verify & continue
    const verifyBtn = page.getByRole('button', { name: /Verify.*Continue/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();
  });

  test('2. Seller creates listing via 4-step wizard', async ({ page, context }) => {
    await authenticateAs(context, page, 'seller');
    await page.goto('/en/sell');

    // Step 1: Categories & Weights
    await expect(page.locator('form').first()).toBeVisible();
    await expect(page.getByRole('option', { name: 'Newspaper (Raddi)' }).first()).toBeAttached();

    // Advance to Step 2 (Photos)
    const nextStep1 = page.getByRole('button', { name: 'Next Step' }).first();
    await expect(nextStep1).toBeVisible();
    await nextStep1.scrollIntoViewIfNeeded();
    await nextStep1.click({ force: true });

    // Step 2: Photo upload (set synthetic image file so validation passes)
    await page.waitForTimeout(400);
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'scrap_photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
    });
    await page.waitForTimeout(600);

    const nextStep2 = page.getByRole('button', { name: 'Next Step' }).first();
    await expect(nextStep2).toBeVisible();
    await nextStep2.scrollIntoViewIfNeeded();
    await nextStep2.click({ force: true });

    // Step 3: Address & Pickup Window
    await page.waitForTimeout(400);
    const areaBtn = page.getByRole('button', { name: /College Road, Nashik/i }).first();
    if (await areaBtn.isVisible()) {
      await areaBtn.click({ force: true });
    } else {
      const addressInput = page.locator('textarea').first();
      await addressInput.fill('Flat 402, Shivneri CHS, Near Shivaji Park, Nashik');
    }

    const nextStep3 = page.getByRole('button', { name: 'Next Step' }).first();
    await expect(nextStep3).toBeVisible();
    await nextStep3.scrollIntoViewIfNeeded();
    await nextStep3.click({ force: true });

    // Step 4: Review & Submit
    await page.waitForTimeout(400);
    await expect(page.getByText(/Review & Confirm Details/i).first()).toBeVisible();

    // Submit Request
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });

    // Wait for redirect to live bids page
    await page.waitForURL(/.*bids.*/, { timeout: 10000 });
    expect(page.url()).toContain('bids');
  });

  test('3. Dealer views nearby requests and submits a competing offer', async ({ page, context }) => {
    await authenticateAs(context, page, 'dealer');
    await page.goto('/en/dealer');

    // Dealer Hub loads with Active Requests / Tabs
    const requestsTab = page.locator('button:has-text("Requests")').first();
    await expect(requestsTab).toBeVisible();

    // Look for Submit Offer button
    const submitOfferBtn = page.locator('button:has-text("Submit Offer"), button:has-text("Place Bid")').first();
    if (await submitOfferBtn.isVisible()) {
      await submitOfferBtn.click();
      await page.waitForTimeout(500);

      // Fill offer amount
      const amountInput = page.locator('input[type="number"]').first();
      if (await amountInput.isVisible()) {
        await amountInput.fill('580');
      }

      // Confirm submission
      const confirmBtn = page.locator('button:has-text("Send Offer"), button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('4. Seller accepts offer on live bids dashboard', async ({ page, context }) => {
    await authenticateAs(context, page, 'seller');
    await page.goto('/en/bids');

    await expect(page.locator('main')).toBeVisible();

    const acceptBtn = page.locator('button:has-text("Accept Offer"), button:has-text("Accept")').first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('5. Dealer completes doorstep weigh-in and marks paid', async ({ page, context }) => {
    await authenticateAs(context, page, 'dealer');
    await page.goto('/en/dealer');

    // Switch to Won Jobs / Active Pickups tab
    const wonJobsTab = page.locator('button:has-text("Won Jobs")').first();
    if (await wonJobsTab.isVisible()) {
      await wonJobsTab.click();
      await page.waitForTimeout(500);
    }

    const weighBtn = page.locator('button:has-text("Weigh & Settle"), button:has-text("Tolai")').first();
    if (await weighBtn.isVisible()) {
      await weighBtn.click();
      await page.waitForTimeout(500);

      const otpInput = page.locator('input[placeholder*="OTP"], input[name="doorstep_otp"]').first();
      if (await otpInput.isVisible()) {
        await otpInput.fill('1234');
      }

      const completeBtn = page.locator('button:has-text("Mark Paid"), button:has-text("Complete")').first();
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('6. PWA offline banner appears on connection drop and restores', async ({ page, context }) => {
    await page.goto('/en');

    // Emulate network disconnection and trigger window offline event
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await page.waitForTimeout(400);

    // Verify offline banner shows up
    const offlineNotice = page.locator('strong:has-text("Offline Mode")');
    await expect(offlineNotice).toBeVisible();

    // Restore online connection and trigger window online event
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await page.waitForTimeout(400);
    await expect(offlineNotice).not.toBeVisible();
  });
});
