/* eslint-disable @typescript-eslint/no-explicit-any -- page-side Konva access */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { openScriptBox } from './script-box';

test.use({ viewport: { width: 1440, height: 900 } });

const RUCK = JSON.parse(fs.readFileSync(path.resolve('skill/coaching-animator/examples/10-ruck-and-recycle.json'), 'utf8'));

// #210: from xl up the Selection panel sits beside the canvas, and every control for a selected
// waypoint shows without scrolling. 2 is a support player; 1 carries the ball, which adds the
// ball controls.
for (const [name, index] of [
  ['support player', 1],
  ['ball carrier', 0],
] as const) {
  test(`desktop Selection panel shows every waypoint control without scrolling: ${name}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'runs in the chromium project');
    await page.goto('/practice', { waitUntil: 'load' });
    const canvas = page.locator('.konvajs-content').first();
    await canvas.waitFor();
    await openScriptBox(page);
    await page.locator('#practice-script').fill(JSON.stringify(RUCK));
    await page.getByRole('button', { name: 'Apply script' }).click();
    // The edit layer (the fourth Konva layer) loads after the canvas; taps before it is there do nothing.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const stages = ((window as any).Konva?.stages ?? []).filter((s: any) => document.body.contains(s.container()));
          return stages[stages.length - 1]?.getLayers().length ?? 0;
        }),
      )
      .toBeGreaterThanOrEqual(4);

    const tapCell = async (cell: { x: number; y: number }) => {
      const box = (await canvas.boundingBox())!;
      const cellPx = box.width / RUCK.area.width;
      await canvas.click({ position: { x: (cell.x + 0.5) * cellPx, y: (cell.y + 0.5) * cellPx } });
    };
    await page.getByRole('button', { name: 'Select and drag' }).click();
    const panel = page.getByRole('region', { name: 'Selection' });
    // Select the player, then the first waypoint of their run (it holds until a pass is caught).
    await expect(async () => {
      await tapCell(RUCK.base.placements[index].cell);
      await expect(panel.getByLabel('Start when')).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    await tapCell(RUCK.base.moves[index].waypoints[0]);
    await expect(panel.getByLabel('Hold until')).toBeVisible();

    // Nothing in the panel scrolls.
    const scrolls = await panel.evaluate((el) =>
      [el, ...el.querySelectorAll('*')].some((e) => e.scrollHeight > e.clientHeight + 1 && getComputedStyle(e).overflowY !== 'visible'),
    );
    expect(scrolls, 'nothing in the panel scrolls').toBe(false);

    const controls = [
      panel.getByLabel('Pace', { exact: true }),
      panel.getByLabel('Start when'),
      panel.getByLabel('Into point 1'),
      panel.getByLabel('Hold until'),
      panel.getByRole('button', { name: 'Delete run' }),
      panel.getByRole('button', { name: 'Delete waypoint' }),
    ];
    if (name === 'ball carrier') controls.push(panel.getByRole('button', { name: 'Remove ball' }));
    for (const control of controls) await expect(control).toBeInViewport({ ratio: 1 });

    // The wait pickers are wide enough for their longest option.
    for (const picker of [panel.getByLabel('Start when'), panel.getByLabel('Hold until')]) {
      const fits = await picker.evaluate((select: HTMLSelectElement) => {
        const probe = document.createElement('span');
        probe.style.cssText = `font:${getComputedStyle(select).font};position:absolute;visibility:hidden;white-space:nowrap`;
        document.body.append(probe);
        const widest = Math.max(...[...select.options].map((o) => ((probe.textContent = o.text), probe.offsetWidth)));
        probe.remove();
        // Room for padding and the dropdown arrow.
        return select.clientWidth >= widest + 24;
      });
      expect(fits, 'picker fits its longest option').toBe(true);
    }
  });
}
