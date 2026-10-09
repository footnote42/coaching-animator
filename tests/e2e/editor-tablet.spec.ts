import { test, expect } from '@playwright/test';

test('tablet landscape offers full editor and touch sizes', async ({ page }) => {
  await page.goto('/practice');

  // Konva draws one canvas per layer; tap their shared container.
  const canvas = page.locator('.konvajs-content');
  await canvas.waitFor();

  // Add 6 markers (e.g. attackers and defenders)
  const placeAttacker = page.getByRole('button', { name: 'Place attacker' });
  const placeDefender = page.getByRole('button', { name: 'Place defender' });
  
  await placeAttacker.click();
  for (let i = 0; i < 3; i++) {
    await canvas.click({ position: { x: 100 + i * 50, y: 100 } });
  }
  
  await placeDefender.click();
  for (let i = 0; i < 3; i++) {
    await canvas.click({ position: { x: 100 + i * 50, y: 150 } });
  }

  // Draw a run
  await page.getByRole('button', { name: 'Draw a run' }).click();
  await canvas.click({ position: { x: 100, y: 100 } });
  await canvas.click({ position: { x: 100, y: 200 } });

  // Give the first attacker a ball: only a player holding it can pass.
  await page.getByRole('button', { name: 'Place ball' }).click();
  await canvas.click({ position: { x: 100, y: 100 } });

  // Add a pass
  await page.getByRole('button', { name: 'Add a pass' }).click();
  await canvas.click({ position: { x: 100, y: 100 } });
  await canvas.click({ position: { x: 150, y: 100 } });

  // Check that the script reflects 6 players and a ball, 1 move, 1 pass
  await page.getByText('Practice Script').click();
  const scriptContent = await page.locator('textarea#practice-script').inputValue();
  const script = JSON.parse(scriptContent);
  expect(script.markers.length).toBe(7);
  expect(script.base.moves.length).toBe(1);
  expect(script.base.passes.length).toBe(1);
});
