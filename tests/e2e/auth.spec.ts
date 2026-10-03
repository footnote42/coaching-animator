import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  const timestamp = Date.now();
  const testEmail = `newuser_${timestamp}@test.com`;
  const testPassword = 'Password123!';

  test('email sign up and sign in with confirmation', async ({ page, request }) => {
    // 1. Navigate to register
    await page.goto('/register');
    
    // 2. Fill out registration form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);
    await page.locator('input#terms').check();
    
    await page.getByRole('button', { name: 'Create Account' }).click();

    // 3. Wait for success message
    await expect(page.locator('text=Check your email for a confirmation link')).toBeVisible();

    // 4. Retrieve confirmation email from Inbucket (local Supabase test mail server)
    // Inbucket API: /api/v1/mailbox/{name}
    let messages = [];
    for (let i = 0; i < 15; i++) {
      const response = await request.get(`http://localhost:54324/api/v1/mailbox/${testEmail}`);
      if (response.ok()) {
        messages = await response.json();
        if (messages.length > 0) break;
      }
      await page.waitForTimeout(1000);
    }
    
    expect(messages.length).toBeGreaterThan(0);
    
    const messageId = messages[0].id;
    const messageResponse = await request.get(`http://localhost:54324/api/v1/mailbox/${testEmail}/${messageId}`);
    expect(messageResponse.ok()).toBeTruthy();
    
    const messageDetail = await messageResponse.json();
    const bodyText = messageDetail.body.text || messageDetail.body.html;
    
    // 5. Extract confirmation link from email body
    const urlMatch = bodyText.match(/http:\/\/localhost:3000\/auth\/confirm\?token_hash=[^\s"']+/);
    
    expect(urlMatch).toBeTruthy();
    const confirmUrl = urlMatch![0];

    // 6. Navigate to confirmation link
    await page.goto(confirmUrl);
    
    // Wait for redirect to happen (usually goes to /practice or similar)
    await page.waitForURL(/\/(practice|my-practices|profile|login)/, { timeout: 15000 });
    
    // 7. If logged in, logout so we can test explicit sign in
    const logoutButton = page.locator('button:has-text("Sign Out")');
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await page.waitForLoadState('load');
    }

    // 8. Sign in explicitly
    await page.goto('/login');
    await page.getByTestId('login-email').fill(testEmail);
    await page.getByTestId('login-password').fill(testPassword);
    await page.getByTestId('login-submit').click();
    
    // 9. 18+ declaration runs on first sign-in
    await expect(page.locator('h2:has-text("Confirm your age")')).toBeVisible();
    await page.getByLabel('I am 18 or over').check();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 10. Should be redirected or at least authenticated and on the site
    await expect(page.locator('a[href="/profile"]').first()).toBeVisible({ timeout: 15000 });
  });
});
