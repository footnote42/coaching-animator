# Staging Environment Setup

**Last Updated**: 2026-01-31

## Overview

The staging environment is a production-like environment used for testing changes before deploying to production. It uses a separate Supabase project and can be deployed to Vercel preview environments or a dedicated staging deployment.

## Prerequisites

1. Vercel account
2. Separate Supabase project for staging
3. GitHub repository connected to Vercel

## Setup Steps

### 1. Create Staging Supabase Project

1. Go to https://app.supabase.com
2. Create new project: `coaching-animator-staging`
3. Wait for database to initialize
4. Note down:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key (Settings → API → anon key)
   - Service Role Key (Settings → API → service_role key)

### 2. Apply Database Migrations to Staging

```bash
# Set Supabase CLI to use staging project
npx supabase link --project-ref your-staging-project-ref

# Apply all migrations
npx supabase db push

# Verify tables created
npx supabase db diff
```

### 3. Configure Staging Environment Variables

Copy `.env.staging` to `.env.local` for local staging testing, or add to Vercel:

**In Vercel Dashboard**:
1. Go to Project Settings → Environment Variables
2. Add each variable from `.env.staging`
3. Set Environment to "Preview" or create "Staging" environment
4. Save

**Key Variables**:
- `NEXT_PUBLIC_SITE_URL`: Staging domain (e.g., `https://staging.your-domain.vercel.app`)
- `NEXT_PUBLIC_SUPABASE_URL`: Staging Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Staging anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Staging service role key

### 4. Deploy to Staging

**Option A: Vercel Preview Deployments**

Every PR automatically creates a preview deployment that can serve as staging:

```bash
git checkout -b feature/my-feature
git push origin feature/my-feature
# Create PR → Vercel auto-deploys preview
```

**Option B: Dedicated Staging Deployment**

Create a `staging` branch:

```bash
git checkout -b staging
git push origin staging
```

In Vercel:
1. Go to Project Settings → Git
2. Add Production Branch: `staging`
3. Configure to use `.env.staging` variables

Deploy:
```bash
git checkout staging
git merge main
git push origin staging
# Vercel auto-deploys to staging domain
```

### 5. Seed Staging Data (Optional)

Create test data for staging:

```sql
-- Create test admin user (run in Supabase SQL Editor)
INSERT INTO user_profiles (id, email, display_name, role)
VALUES (
  'your-test-user-uuid',
  'admin@staging.test',
  'Staging Admin',
  'admin'
);

-- Create test animations
INSERT INTO saved_animations (user_id, title, animation_type, payload, visibility)
VALUES (
  'your-test-user-uuid',
  'Test Tactic',
  'tactic',
  '{"version":"1.0","name":"Test","sport":"rugby","frames":[],"settings":{}}',
  'public'
);
```

## Testing Workflow

### Pre-Deployment Testing

1. Apply migration to staging:
   ```bash
   npx supabase db push --db-url $STAGING_DATABASE_URL
   ```

2. Deploy code to staging:
   ```bash
   git push origin staging
   ```

3. Run smoke tests:
   - [ ] User can register and login
   - [ ] User can create animation
   - [ ] User can save to cloud
   - [ ] Gallery loads animations
   - [ ] Admin dashboard accessible

4. If tests pass, merge to `main` and deploy to production

### Rollback Procedure

If staging tests fail:

1. Do not merge to `main`
2. Fix issues in feature branch
3. Re-deploy to staging
4. Re-run tests

If production deployment fails:

1. Revert `main` to last known good commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. Vercel auto-deploys reverted version
3. Fix issues in staging, then re-deploy

## Environment Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| Domain | `staging.your-domain.vercel.app` | `your-domain.com` |
| Supabase | Separate project | Production project |
| Data | Test data only | Real user data |
| Debug | Enabled (`LOG_LEVEL=debug`) | Disabled |
| Rate Limits | Lenient (for testing) | Strict |
| Quotas | Lower (to test enforcement) | Higher |

## Maintenance

### Regular Tasks

1. **Weekly**: Clear old test data from staging database
2. **Before major release**: Re-sync staging DB schema with production
3. **After migration**: Test migration in staging first

### Monitoring

- Check Vercel deployment logs for staging errors
- Monitor Supabase staging project usage
- Review staging API error rates

## Troubleshooting

### Migration fails in staging

```bash
# Reset staging database (DESTRUCTIVE)
npx supabase db reset --db-url $STAGING_DATABASE_URL

# Re-apply migrations
npx supabase db push --db-url $STAGING_DATABASE_URL
```

### Environment variables not updating

1. Clear Vercel build cache
2. Trigger re-deploy
3. Verify variables in Vercel dashboard

### Staging domain not accessible

1. Check Vercel deployment status
2. Verify DNS settings (if custom domain)
3. Check Vercel logs for errors

## Best Practices

1. **Never point staging to production database**
2. **Test all migrations in staging first**
3. **Use staging for QA and client demos**
4. **Keep staging data minimal and anonymous**
5. **Document any staging-specific configurations**
6. **Run automated tests in staging before production deploy**

## Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/migrations)
- [Next.js Environments](https://nextjs.org/docs/basic-features/environment-variables)
