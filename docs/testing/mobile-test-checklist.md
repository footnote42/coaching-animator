# Mobile Test Checklist

Manual checks for phones and tablets. Run before a release that touches the share view, the editor or the layout.

## Devices

| Device | Viewport | Tasks |
|--------|----------|-------|
| Phone (375px, e.g. iPhone SE or 12 mini) | 375 x 667 | 1-6 |
| Mid-range Android (Pixel 5 class, Chrome) | 412 x 915 | 1-6 |
| iPad portrait | 768 x 1024 | 1-7 |
| iPad landscape | 1024 x 768 | 1-7 |

DevTools emulation is fine for a quick pass; sign-off needs real devices (touch, rotation and the share sheet do not emulate well).

## Tasks

Use a saved Practice with at least two Steps and Commentary, shared by link or public.

1. **Open a link.** Open `/p/[id]` from a messaging app. Expected: the share view loads with the Area, the Step controls and the brand mark visible without scrolling.
2. **Play.** Tap Play all Steps. Expected: markers move along their runs, passes fly on arrival, playback is smooth. Tap again to pause.
3. **Step.** Tap Next Step and Previous Step. Expected: the Step changes and the Area shows it; Back to start returns to the first Step.
4. **Rotate.** Rotate portrait to landscape and back while playing. Expected: the Area resizes to fit, nothing is clipped, controls stay tappable, playback continues.
5. **Full screen.** Tap Full screen, then Exit full screen. Expected: the Area fills the screen and exits cleanly. iPhone Safari has no Fullscreen API for pages, so the button is hidden there: record "n/a".
6. **Share.** Tap Share. Expected: the native share sheet opens with the Practice title and link; without a share sheet, the link is copied and a confirmation shows.
7. **Build on a tablet** (signed in, `/practice`). Add 6 markers, Draw a run for one, Add a pass between two attackers, Add a Progression, then Save. Expected: every control is tappable with a finger, the Practice saves, and it reopens from My Practices unchanged.

On every device also check: touch targets at least 44px, no horizontal page scroll, Commentary closes with Close Commentary.

## What to record

One row per device and task. Raise an issue for each failure.

| Date | Device | Browser and version | Task | Pass/Fail | Note |
|------|--------|---------------------|------|-----------|------|
| | | | | | |

## Lighthouse

Baselines: `lighthouse-mobile-baseline.md` (mobile) and `lighthouse-desktop-baseline.md` (desktop). Act only on a score under 90 or a drop of more than 5 points from the baseline. Lighthouse runs by hand, not in CI.
