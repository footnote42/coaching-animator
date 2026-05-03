# Quickstart: Security Hardening — Manual Test Guide

**Branch**: `016-security-hardening`
**Prereqs**: Dev server running (`npm run dev`), a valid authenticated session cookie

---

## 1. Verify Rate Limiting on Remix

```bash
# Replace ANIMATION_ID with any public animation ID from /gallery
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/animations/ANIMATION_ID/remix \
    -H "Cookie: <your-session-cookie>"
done
# Expected: 201 201 201 201 201 429
```

Check the 429 response includes `X-RateLimit-Reset` header:
```bash
curl -v -X POST http://localhost:3000/api/animations/ANIMATION_ID/remix \
  -H "Cookie: <your-session-cookie>" 2>&1 | grep -i "ratelimit\|429"
```

---

## 2. Verify Rate Limiting on Resend Verification

```bash
for i in {1..4}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/auth/resend-verification \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
# Expected: 200 200 200 429
```

---

## 3. Verify Diag Endpoint Has No URL Prefix

```bash
curl -s http://localhost:3000/api/diag | jq .
# Expected: no "urlPrefix" key in the env object
```

---

## 4. Verify Upvote Hourly Limit

Set `upvote` config to a low number (e.g., 3) temporarily, then:
```bash
for i in {1..4}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/animations/ANIMATION_ID/upvote \
    -H "Cookie: <your-session-cookie>"
done
# Expected: 200 200 200 429
```
Restore config after test.

---

## 5. Run Automated Tests

```bash
npm test -- --run src/lib/server/__tests__/rate-limit.test.ts
```

---

## 6. TypeScript + Lint

```bash
npm run lint && npx tsc --noEmit
```

Both must exit 0 with no new errors.
