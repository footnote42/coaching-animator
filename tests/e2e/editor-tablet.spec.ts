import { test, expect } from '@playwright/test';

test('tablet landscape offers full editor and touch sizes', async ({ page }) => {
  await page.goto('/practice');

  // Add 6 markers (e.g. attackers and defenders)
  const placeAttacker = page.getByRole('button', { name: 'Place attacker' });
  const placeDefender = page.getByRole('button', { name: 'Place defender' });
  
  await placeAttacker.click();
  for (let i = 0; i < 3; i++) {
    // The canvas is the PracticeCanvas. It's the only canvas, but let's just click on it.
    await page.locator('canvas').click({ position: { x: 100 + i * 50, y: 100 } });
  }
  
  await placeDefender.click();
  for (let i = 0; i < 3; i++) {
    await page.locator('canvas').click({ position: { x: 100 + i * 50, y: 150 } });
  }

  // Draw a run
  await page.getByRole('button', { name: 'Draw a run' }).click();
  await page.locator('canvas').click({ position: { x: 100, y: 100 } });
  await page.locator('canvas').click({ position: { x: 100, y: 200 } });

  // Add a pass
  await page.getByRole('button', { name: 'Add a pass' }).click();
  await page.locator('canvas').click({ position: { x: 100, y: 100 } });
  await page.locator('canvas').click({ position: { x: 150, y: 100 } });

  // Check that the script reflects 6 markers, 1 move, 1 pass
  await page.getByText('Practice Script').click();
  const scriptContent = await page.locator('textarea#practice-script').inputValue();
  const script = JSON.parse(scriptContent);
  expect(script.markers.length).toBe(6);
  expect(script.base.moves.length).toBe(1);
  expect(script.base.passes.length).toBe(1);
});
