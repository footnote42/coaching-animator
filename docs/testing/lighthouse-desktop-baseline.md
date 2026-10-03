# Desktop Lighthouse Audit Baseline (2026-10-03)

**Date**: 2026-10-03  
**Environment**: Production (`https://coaching-animator.waynetellis.com`), the same build as the mobile baseline  
**Tool**: Lighthouse 13.5.0, `--preset=desktop`, headless Chrome  
**Companion**: `lighthouse-mobile-baseline.md`

## Scores

| Route | Performance | Accessibility | Best Practices | SEO |
|---|:---:|:---:|:---:|:---:|
| Landing Page (`/`) | 98 | 91 | **77** | 100 |
| Practice Editor (`/practice`) | 92 | 95 | **77** | 100 |
| Share view (`/p/0cbe0451-475d-4140-b80b-53da5d05cced`) | 99 | 100 | **77** | 100 |
| Gallery (`/gallery`) | 98 | 97 | **77** | 100 |

## Loading metrics

| Route | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|
| `/` | 0.3s | 0.5s | 10ms | 0.002 | 1.6s |
| `/practice` | 0.3s | 0.6s | 0ms | 0.171 | 0.8s |
| `/p/[id]` | 0.3s | 0.6s | 0ms | 0.027 | 1.4s |
| `/gallery` | 0.3s | 1.0s | 0ms | 0.042 | 1.0s |

## Under 90: what to act on

- **Best Practices 77 on every route (desktop and mobile).** The failing audits are "Uses deprecated APIs" and "Issues logged in the Issues panel" (Content Security Policy). Both come from Cloudflare's injected bot-detection script (`/cdn-cgi/challenge-platform/scripts/jsd/main.js`), not the app. Fix is a Cloudflare setting (JavaScript detections / Bot Fight Mode), a maintainer decision.
- **Editor CLS 0.171** (also on mobile, 0.187): above the 0.1 "good" line though the Performance score is over 90. Worth a look when the editor layout is next touched.
- Accessibility items that recur (not under 90, noted for the polish audit): colour contrast on `/`, `/practice` and `/gallery`; links distinguished by colour only on `/`; visible label not matching the accessible name on `/p/[id]` and `/gallery`; no `<main>` landmark on `/practice`.

## Rule

Act only on a score under 90 or a drop of more than 5 points from this baseline. Lighthouse runs by hand, not in CI. Re-run both baselines after the new look (#88, #89) ships.

```bash
npx -y lighthouse@13.5.0 https://coaching-animator.waynetellis.com/ --preset=desktop --output=json --output-path=home.json --chrome-flags="--headless=new"
```
