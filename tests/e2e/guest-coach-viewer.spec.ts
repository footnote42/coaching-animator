import { test, expect, type Page } from '@playwright/test'
import { openScriptBox } from './script-box'

/**
 * The restart's end-to-end path (#66): a Guest tries the editor, signs in and keeps
 * the Practice; the Coach adds a Progression and shares it; a viewer on a phone
 * watches it at /p/[id].
 *
 * Needs a local Supabase (`npx supabase start`) with the app pointed at it. The
 * Coach account is created through the local auth API, so the test never touches
 * a hosted project.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const LOCAL_SUPABASE = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(SUPABASE_URL)

const EXAMPLE_TITLE = 'Passing square with Progressions'
const NEW_POINT = 'Defender starts closer, so less time on the ball'

// Locally, skip unless the app points at a local Supabase. In CI, never skip silently.
test.skip(!process.env.CI && (!LOCAL_SUPABASE || !ANON_KEY), 'Set NEXT_PUBLIC_SUPABASE_URL and _ANON_KEY to a local Supabase')
test.skip(({ browserName }) => browserName !== 'chromium', 'Clipboard permissions are Chromium-only')

const timeLabel = (page: Page) => page.getByText(/^\d+\.\ds \/ \d+\.\ds$/)

test('Guest to Coach to viewer', async ({ browser, page, context, request }) => {
  test.setTimeout(180_000)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])

  // A fresh Coach (email confirmation is off locally; the trigger records the 18+ tick).
  const coach = { email: `coach-${Date.now()}@example.com`, password: 'Password1!' }
  const signup = await request.post(`${SUPABASE_URL}/auth/v1/signup`, {
    headers: { apikey: ANON_KEY },
    data: { ...coach, data: { age_confirmed: true } },
  })
  expect(signup.ok(), await signup.text()).toBe(true)

  // Guest: import the worked example and play it.
  await page.goto('/practice')
  await expect(page.getByRole('heading', { name: 'Practice editor' })).toBeVisible({ timeout: 60_000 })
  await openScriptBox(page)
  await page.getByRole('button', { name: 'Use example' }).click()

  const steps = page.getByRole('group', { name: 'Steps' })
  await expect(steps.getByRole('button', { name: 'Base' })).toBeVisible()
  await expect(steps.getByRole('button', { name: /^2\. / })).toBeVisible()

  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(timeLabel(page)).not.toHaveText(/^0\.0s/)

  // Copy script puts the whole Practice Script on the clipboard.
  await page.getByRole('button', { name: 'Copy script' }).click()
  await expect(page.getByText('Script copied.')).toBeVisible()
  const copied = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
  expect(copied.title).toBe(EXAMPLE_TITLE)
  expect(copied.progressions).toHaveLength(2)

  // Sign in, then keep the device Practice in the account.
  await page.getByText('to save Practices').getByRole('link', { name: 'Sign in' }).click()
  await page.getByLabel('Email').fill(coach.email)
  await page.getByLabel('Password').fill(coach.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/practice', { timeout: 60_000 })

  const offer = page.getByRole('dialog', { name: 'Save device Practice' })
  await offer.getByRole('button', { name: 'Save to account' }).click()
  // Details open first (#195); the title comes from the script.
  await expect(offer.getByLabel('Title', { exact: true })).toHaveValue(EXAMPLE_TITLE)
  await offer.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText('Practice saved to your account.')).toBeVisible()

  // Reopen it from My Practices (the editor does not list Practices).
  await page.goto('/my-practices')
  await page.getByRole('link', { name: EXAMPLE_TITLE, exact: true }).click()
  await page.waitForURL(/\/practice\?id=/)
  const id = new URL(page.url()).searchParams.get('id')
  expect(id).toBeTruthy()
  await expect(steps.getByRole('button', { name: /^2\. / })).toBeVisible()

  // Coach: add a Progression that pulls the Time lever, with its coaching point.
  await steps.getByRole('button', { name: 'Add Progression' }).click()
  const addDialog = page.getByRole('dialog', { name: 'Add a Progression' })
  await addDialog.getByLabel('Lever').selectOption('time')
  await addDialog.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(steps.getByRole('button', { name: '3. Time' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByLabel('New coaching point').fill(NEW_POINT)
  await page.getByLabel('New coaching point').press('Enter')
  await expect(page.getByRole('textbox', { name: 'Coaching point 1' })).toHaveValue(NEW_POINT)

  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Practice updated.')).toBeVisible()

  // Share: anyone with the link can watch it.
  await page.goto('/my-practices')
  const shared = page.waitForResponse(
    (res) => res.url().endsWith(`/api/practices/${id}`) && res.request().method() === 'PATCH',
  )
  await page.getByLabel(`Visibility of ${EXAMPLE_TITLE}`).selectOption('link')
  expect((await shared).ok()).toBe(true)

  // Viewer on a phone, signed out.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  await phone.grantPermissions(['clipboard-read', 'clipboard-write'])
  const viewer = await phone.newPage()
  await viewer.goto(`/p/${id}`)
  await expect(viewer.getByRole('heading', { name: EXAMPLE_TITLE })).toBeVisible({ timeout: 60_000 })
  await expect(viewer.getByText('Base Step (1/4)')).toBeVisible()

  // Home brand link
  await expect(viewer.getByRole('link', { name: 'Coaching Animator home' })).toHaveAttribute('href', '/')

  // Report and Full screen fold into the More menu on phones (title needs the room)
  await expect(viewer.getByRole('button', { name: 'Report' })).toBeHidden()
  await expect(viewer.getByRole('button', { name: 'Full screen' })).toBeHidden()
  const titleBox = await viewer.getByRole('heading', { name: EXAMPLE_TITLE }).boundingBox()
  expect(titleBox?.width ?? 0).toBeGreaterThanOrEqual(200)

  // Share copies link on fallback and confirms
  await viewer.getByRole('button', { name: 'Share' }).click()
  await expect(viewer.getByText('Link copied.')).toBeVisible()


  const next = viewer.getByRole('button', { name: 'Next Step' })
  for (let n = 0; n < 3; n++) await next.click()
  await expect(viewer.getByText('Step 3: Time lever (4/4)')).toBeVisible()
  await expect(next).toBeDisabled()

  // Commentary starts collapsed on phones; playback bar button toggles it.
  await expect(viewer.getByText(NEW_POINT)).toBeHidden()
  await expect(viewer.getByRole('button', { name: 'Show Commentary' })).toHaveAttribute('aria-pressed', 'false')

  await viewer.getByRole('button', { name: 'Show Commentary' }).click()
  await expect(viewer.getByText(NEW_POINT)).toBeVisible()
  await expect(viewer.getByRole('button', { name: 'Hide Commentary' })).toHaveAttribute('aria-pressed', 'true')

  await viewer.getByRole('button', { name: 'Hide Commentary' }).click()
  await expect(viewer.getByText(NEW_POINT)).toBeHidden()

  // Overflow menu: Copy script with explanation
  await viewer.getByRole('button', { name: 'More options' }).click()
  await expect(viewer.getByRole('menu')).toBeVisible()
  await expect(viewer.getByText('Copy the Practice Script to adapt or hand to an AI.')).toBeVisible()
  await expect(viewer.getByRole('menuitem', { name: 'Report' })).toBeVisible()
  await expect(viewer.getByRole('menuitem', { name: 'Full screen' })).toBeVisible()
  await viewer.getByRole('menuitem', { name: /Copy script/ }).click()
  await expect(viewer.getByText('Script copied.')).toBeVisible()

  // Speed.
  const speed = viewer.getByRole('group', { name: 'Speed' })
  await speed.getByRole('button', { name: '2× speed' }).click()
  await expect(speed.getByRole('button', { name: '2× speed' })).toHaveAttribute('aria-pressed', 'true')
  await expect(speed.getByRole('button', { name: '1× speed' })).toHaveAttribute('aria-pressed', 'false')

  await phone.close()

  // Viewer on a tablet (portrait and landscape), signed out.
  const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true })
  await tablet.grantPermissions(['clipboard-read', 'clipboard-write'])
  const tabletViewer = await tablet.newPage()
  await tabletViewer.goto(`/p/${id}`)
  await expect(tabletViewer.getByRole('heading', { name: EXAMPLE_TITLE })).toBeVisible({ timeout: 60_000 })
  await expect(tabletViewer.getByRole('button', { name: 'Report' })).toBeVisible()

  // Full screen toggle.
  const fsBtn = tabletViewer.getByRole('button', { name: 'Full screen' })
  await expect(fsBtn).toBeVisible()
  await fsBtn.click()
  const exitFsBtn = tabletViewer.getByRole('button', { name: 'Exit full screen' })
  await expect(exitFsBtn).toBeVisible()
  await exitFsBtn.click()
  await expect(tabletViewer.getByRole('button', { name: 'Full screen' })).toBeVisible()

  // Share.
  await tabletViewer.getByRole('button', { name: 'Share' }).click()
  await expect(tabletViewer.getByText('Link copied.')).toBeVisible()

  // Commentary dismiss and restore.
  await expect(tabletViewer.getByText('Base Step', { exact: true })).toBeVisible()
  await tabletViewer.getByRole('button', { name: 'Hide Commentary' }).click()
  await expect(tabletViewer.getByText('Base Step', { exact: true })).toBeHidden()
  await tabletViewer.getByRole('button', { name: 'Show Commentary' }).click()
  await expect(tabletViewer.getByText('Base Step', { exact: true })).toBeVisible()

  await tablet.close()

  // Viewer on tablet landscape (1024x768).
  const tabletLandscape = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true })
  const landscapeViewer = await tabletLandscape.newPage()
  await landscapeViewer.goto(`/p/${id}`)
  await expect(landscapeViewer.getByRole('heading', { name: EXAMPLE_TITLE })).toBeVisible({ timeout: 60_000 })
  await expect(landscapeViewer.getByRole('button', { name: 'Report' })).toBeVisible()
  await expect(landscapeViewer.getByRole('button', { name: 'Full screen' })).toBeVisible()
  await expect(landscapeViewer.getByRole('button', { name: 'Share' })).toBeVisible()

  await tabletLandscape.close()
})
