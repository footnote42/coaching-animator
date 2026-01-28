# Production Readiness Checklist

## 1. Environment Configuration
- [ ] **Vercel Production Key**: Ensure `SUPABASE_ANON_KEY` and `SUPABASE_URL` are set in Vercel Project Settings (Production).
- [ ] **CORS Origin**: Set `FRONTEND_URL` to `https://coaching-animator.vercel.app` (or custom domain) in Vercel Production.

## 2. Database Policy (RLS)
- [ ] **Public Insert**: Verified enabled for `shares` table (allows anyone to share).
- [ ] **Public Read**: Verified enabled for `shares` table (allows accessible replay).
- [ ] **Maintenance**:
    - [ ] Create a scheduled function (pg_cron or edge function) to delete expired rows:
      ```sql
      delete from shares where expires_at < now();
      ```

## 3. SEO & Sharing (WhatsApp)
- [ ] **Open Graph Tags**: Add the following to `index.html`:
  ```html
  <meta property="og:title" content="Rugby Tactic Animation" />
  <meta property="og:description" content="View this tactic on the Rugby Coaching Animator." />
  <meta property="og:image" content="/og-image.png" />
  ```
- [ ] **Favicon**: Ensure `favicon.ico` is present.

## 4. Monitoring
- [ ] **Supabase Dashboard**: Monitor storage usage (ensure < 500MB free tier).
- [ ] **Vercel Dashboard**: Monitor function invocation counts.
