# Supabase Setup Instructions - Phase 3.1

**Status**: Ready for user execution
**Estimated Time**: 20 minutes

## ✅ Completed (Automated Tasks)

- ✅ Created `.env.local.example` template
- ✅ Installed `@supabase/supabase-js` (v2.93.1)
- ✅ Installed `@vercel/node` (v5.5.28)
- ✅ Created API stub files (`api/share.ts`, `api/share/[id].ts`)
- ✅ Updated `.gitignore` (added `.vercel`, fixed `.env` patterns)
- ✅ Verified TypeScript compilation (no errors)

## 🔴 Pending (User Tasks)

### Task 1: Create Supabase Account & Project (10 min)

1. **Sign up for Supabase**
   - Navigate to https://supabase.com
   - Click "Start your project" → Sign up with GitHub or email
   - Complete email verification if required

2. **Create New Project**
   - Click "New Project" in Supabase dashboard
   - **Project Name**: `coaching-animator` (or your preference)
   - **Database Password**: Generate a strong password and save it securely
     - ⚠️ **IMPORTANT**: Save this password! You'll need it for database backups
   - **Region**: Choose closest to target users:
     - `us-east-1` (US East - Virginia) - recommended for North America
     - `eu-west-1` (Europe - Ireland) - recommended for Europe
     - `ap-southeast-1` (Asia - Singapore) - recommended for Asia
   - **Pricing Plan**: Free tier (sufficient for MVP)
   - Click "Create new project"
   - ⏳ Wait 2-3 minutes for database provisioning

3. **Copy API Credentials**
   - Once provisioned, go to **Settings** → **API** (left sidebar)
   - Copy **Project URL** (format: `https://[project-id].supabase.co`)
   - Copy **anon public** key (long base64 string starting with `eyJ...`)
   - Keep these ready for Task 2

---

### Task 2: Configure Environment Variables (2 min)

1. **Create `.env.local` file**
   ```bash
   # In project root directory
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local` with your Supabase credentials**
   - Open `.env.local` in your text editor
   - Replace `[your-project-id]` with your actual Supabase project ID (from URL)
   - Replace `[your-anon-key]` with your actual anon key
   - Save the file

   Example:
   ```env
   SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.your-key-here
   FRONTEND_URL=http://localhost:5173
   ```

3. **Verify `.env.local` is not tracked by git**
   ```bash
   git status
   # You should NOT see .env.local in the output
   ```

---

### Task 3: Execute Database Schema (8 min)

1. **Open Supabase SQL Editor**
   - In Supabase dashboard, click **SQL Editor** (left sidebar)
   - Click "New query" button

2. **Copy and paste this SQL script**

```sql
-- =============================================================================
-- SHARES TABLE: Link-Sharing Feature
-- =============================================================================
-- Purpose: Store serialized animation payloads for shareable URLs
-- Retention: 90 days from last access (per Constitution v2.0.0 V.3)
-- Privacy: No user identity, UUID obscurity provides baseline security
-- =============================================================================

-- Create shares table
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  size_bytes INT
);

-- Add comments for documentation
COMMENT ON TABLE shares IS 'Shareable animation links (90-day retention, no auth)';
COMMENT ON COLUMN shares.payload IS 'SharePayloadV1 JSON (players, frames, canvas dimensions)';
COMMENT ON COLUMN shares.expires_at IS 'Automatic deletion after 90 days from last access';
COMMENT ON COLUMN shares.size_bytes IS 'Payload size for monitoring (max 100KB enforced in API)';

-- =============================================================================
-- INDEXES: Performance & Cleanup
-- =============================================================================

-- Index for expiry cleanup (background job will use this)
CREATE INDEX idx_shares_expires_at ON shares(expires_at);

-- Index for access tracking (frequently updated)
CREATE INDEX idx_shares_last_accessed ON shares(last_accessed_at);

-- =============================================================================
-- CONSTRAINTS: Data Validation
-- =============================================================================

-- Enforce 100KB payload size limit (per FR-PRV-02)
ALTER TABLE shares ADD CONSTRAINT payload_size_limit
  CHECK (size_bytes <= 100000);

-- =============================================================================
-- ROW LEVEL SECURITY: Public Access with Restrictions
-- =============================================================================

-- Enable RLS (required for Supabase security)
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shares by ID (no auth required)
-- This enables the GET /api/share/:id endpoint
CREATE POLICY "Allow public read by ID" ON shares
  FOR SELECT USING (TRUE);

-- Allow anyone to create shares (no auth required)
-- This enables the POST /api/share endpoint
CREATE POLICY "Allow public insert" ON shares
  FOR INSERT WITH CHECK (TRUE);

-- Note: Update and delete policies intentionally omitted for MVP
-- Future enhancement: Add deletion policy when share management UI implemented
```

3. **Execute the script**
   - Click "Run" button (or press Ctrl+Enter)
   - ✅ Expected result: "Success. No rows returned"
   - ❌ If you see errors, check the Troubleshooting section below

4. **Verify table creation**
   - Navigate to **Table Editor** (left sidebar)
   - Select `shares` table from the dropdown
   - Verify columns exist: `id`, `payload`, `created_at`, `expires_at`, `last_accessed_at`, `size_bytes`
   - Look for lock icon 🔒 next to table name (indicates RLS is enabled)

5. **Test database access (recommended)**
   - In SQL Editor, run this test query:
   ```sql
   -- Test insert
   INSERT INTO shares (payload, size_bytes)
   VALUES ('{"version": 1, "test": true}'::jsonb, 30)
   RETURNING id, created_at, expires_at;
   ```
   - Expected: One row returned with UUID and timestamps
   - Verify `expires_at` is ~90 days in the future

   - Test select:
   ```sql
   SELECT id, created_at, expires_at, size_bytes
   FROM shares
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   - Expected: Test row from previous query

   - Clean up:
   ```sql
   DELETE FROM shares WHERE (payload->>'test')::boolean = true;
   ```
   - Expected: "DELETE 1"

---

## Verification Checklist

Run these commands in your terminal to verify Phase 3.1 completion:

```bash
# 1. Verify dependencies installed
npm ls @supabase/supabase-js @vercel/node
# Expected: Both packages listed with version numbers

# 2. Verify environment variables file exists
cat .env.local
# Expected: Your actual Supabase URL and key (not placeholders)

# 3. Verify API files created
ls -la api/
ls -la api/share/
# Expected: share.ts and share/[id].ts files exist

# 4. Verify TypeScript compilation
npx tsc --noEmit
# Expected: No output (success)

# 5. Verify .env.local is not tracked by git
git status
# Expected: .env.local NOT in the list (should be ignored)
```

**Database Verification** (via Supabase Dashboard → SQL Editor):
```sql
-- Verify RLS policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'shares';

-- Expected output:
-- public | shares | Allow public read by ID | {public} | SELECT
-- public | shares | Allow public insert     | {public} | INSERT
```

---

## Troubleshooting

### Problem: "permission denied for schema public"
**Cause**: You're not the project owner
**Solution**: Check project settings → Members; ensure you have "Owner" role

### Problem: "relation 'shares' already exists"
**Cause**: Table was already created in a previous attempt
**Solution**: Either skip this step, or run `DROP TABLE shares CASCADE;` first

### Problem: SQL syntax errors when copying script
**Cause**: Copy-paste formatting issues
**Solution**:
1. Copy the SQL script from this file using a text editor (not browser)
2. Ensure no extra line breaks or characters
3. Try executing sections individually (CREATE TABLE, then INDEXES, then RLS)

### Problem: .env.local not loading
**Cause**: Vite requires specific .env file naming
**Solution**:
1. Ensure file is named exactly `.env.local` (no spaces, correct dot prefix)
2. Restart development server: `npm run dev`
3. Verify in code: `console.log(import.meta.env.SUPABASE_URL)`

### Problem: Test connection fails
**Cause**: Invalid credentials or network issues
**Solution**:
1. Verify credentials copied correctly (no extra spaces/line breaks)
2. Check Supabase dashboard → Settings → API shows same values
3. Try regenerating anon key (Settings → API → Reveal anon key → Regenerate)
4. Ensure no firewall/proxy blocking Supabase domains

---

## Next Steps After Completion

Once all tasks are verified:
1. Commit changes to git:
   ```bash
   git add .env.local.example api/ .gitignore package.json package-lock.json
   git commit -m "feat: Phase 3.1 - Supabase setup and API stubs"
   ```

2. Proceed to **Phase 3.2: API Implementation**
   - Implement full API handlers with Supabase client
   - Add payload validation and size checks
   - Test locally with `vercel dev`
   - Handle error cases (expired shares, invalid UUIDs)

---

## Constitutional Compliance Note

Phase 3.1 maintains **100% offline-first operation** for existing features:
- ✅ No network calls in current codebase (API stubs return 501)
- ✅ Animation creation/editing still works without backend
- ✅ Save/Load uses local file I/O (unchanged)
- ✅ GIF export is client-side (unchanged)

Tier 2 networking features will be **explicitly gated** in Phase 4 with:
- Share button showing "🌐" indicator
- Offline detection and graceful degradation
- Privacy notice on first use

---

**Phase 3.1 Status**: Automated tasks complete, awaiting user Supabase setup
**Estimated User Time**: 20 minutes
**Questions?** Refer to Supabase documentation: https://supabase.com/docs
