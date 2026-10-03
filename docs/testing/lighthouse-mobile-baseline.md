# Mobile Lighthouse Audit Baseline (2026-10-03)

**Date**: 2026-10-03  
**Environment**: Production (`https://coaching-animator.waynetellis.com`)  
**Context**: Post-restart baseline (DevPlan item 4.2 / PERF-001 / GitHub Issue #38) following cutover of the Practice model.

---

## 1. Audit Scores Summary

All audits were executed with Google Lighthouse 13.5.0 using default mobile device emulation (Moto G Power profile, 4G throttling, simulated CPU throttling).

| Route | URL | Performance | Accessibility | Best Practices | SEO |
|---|---|:---:|:---:|:---:|:---:|
| **Landing Page (`/`)** | `https://coaching-animator.waynetellis.com/` | **89** | **96** | **81** | **100** |
| **Practice Editor (`/practice`)** | `https://coaching-animator.waynetellis.com/practice` | **45** | **95** | **77** | **100** |
| **Share Viewer (`/p/[id]`)** | `https://coaching-animator.waynetellis.com/p/0cbe0451-475d-4140-b80b-53da5d05cced` | **79** | **100** | **77** | **100** |
| **Public Gallery (`/gallery`)** | `https://coaching-animator.waynetellis.com/gallery` | **66** | **96** | **77** | **100** |

---

## 2. Core Web Vitals & Loading Metrics

| Route | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|
| **Landing Page (`/`)** | 1.1s | 1.9s | 430ms | 0.001 | 2.3s |
| **Practice Editor (`/practice`)** | 1.0s | 6.2s | 1,250ms | 0.187 | 2.5s |
| **Share Viewer (`/p/[id]`)** | 1.0s | 2.3s | 780ms | 0.000 | 2.9s |
| **Public Gallery (`/gallery`)** | 1.0s | 5.1s | 330ms | 0.166 | 2.4s |

---

## 3. Top Opportunities by Route

### A. Landing Page (`/`) — Performance: 89
1. **Reduce unused JavaScript**: ~43 KiB potential saving on initial bundle chunks.
2. **Minimize main-thread work**: 2.3s total main-thread execution during cold bootstrap.
3. **Color contrast (Accessibility)**: Contrast ratio on secondary navigation tabs and muted text.

### B. Practice Editor (`/practice`) — Performance: 45
1. **Main-thread script evaluation (TBT: 1,250ms)**:
   - Script evaluation consumes 2.47s of main-thread execution.
   - Heavy dependencies (Konva canvas engine, react-konva, and Lucide icon sets) are evaluated during client hydration.
2. **Largest Contentful Paint (LCP: 6.2s)**:
   - Dynamic canvas container and step list client mounting delay rendering of the interactive canvas boundary.
3. **Cumulative Layout Shift (CLS: 0.187)**:
   - Layout shifts occur when the dynamic toolbar, area controls, and canvas client layers mount and determine sizing relative to the viewport.
   - Unused JS: ~101 KiB in initial chunk downloads (`1259-*.js` and `8514-*.js`).

### C. Public Share Viewer (`/p/[id]`) — Performance: 79
1. **Initial server response time (TTFB)**:
   - Root document load took 690ms (server-side Supabase `get_shared_practice` RPC lookup).
2. **Main-thread work (TBT: 780ms)**:
   - Script evaluation is 3.6s, primarily from loading `PracticeCanvas` dynamically on mount while displaying the fallback thumbnail.
3. **Unused JavaScript**: ~100 KiB in bundle chunks that can be trimmed or further code-split.
*Note: Share viewer scored a perfect 100 on Accessibility with 0.000 CLS.*

### D. Public Gallery (`/gallery`) — Performance: 66
1. **Largest Contentful Paint (LCP: 5.1s)**:
   - Cards fetch public practice data asynchronously on the client and render thumbnail SVGs into the DOM.
2. **Cumulative Layout Shift (CLS: 0.166)**:
   - Grid cards shift the content flow as practices load and replace the initial loading skeleton.
3. **Accessibility**: Minor contrast ratio adjustments on muted metadata text.

---

## 4. Exact Reproduction Command & Environment Settings

The audit was executed via `lighthouse` CLI 13.5.0 in headless Chromium on Windows 11:

```bash
# Set Chrome executable
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

# 1. Landing Page
npx lighthouse "https://coaching-animator.waynetellis.com/" \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output=html \
  --output-path="./reports/home" \
  --only-categories=performance,accessibility,best-practices,seo

# 2. Practice Editor
npx lighthouse "https://coaching-animator.waynetellis.com/practice" \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output=html \
  --output-path="./reports/practice" \
  --only-categories=performance,accessibility,best-practices,seo

# 3. Public Share Viewer
npx lighthouse "https://coaching-animator.waynetellis.com/p/0cbe0451-475d-4140-b80b-53da5d05cced" \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output=html \
  --output-path="./reports/share" \
  --only-categories=performance,accessibility,best-practices,seo

# 4. Public Gallery
npx lighthouse "https://coaching-animator.waynetellis.com/gallery" \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output=html \
  --output-path="./reports/gallery" \
  --only-categories=performance,accessibility,best-practices,seo
```
