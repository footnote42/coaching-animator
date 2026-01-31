# CI/CD Pipeline Setup

**Last Updated**: 2026-01-31

## Overview

This project uses GitHub Actions for continuous integration and Vercel for continuous deployment. The pipeline automatically runs tests, applies database migrations, and deploys to staging or production based on the branch.

## Pipeline Workflow

```mermaid
graph LR
    A[Push to Branch] --> B[Lint & Type Check]
    B --> C[Build Application]
    B --> D[Test Migrations]
    C --> E{Branch?}
    D --> E
    E -->|PR| F[Deploy Preview]
    E -->|staging| G[Deploy Staging]
    E -->|main| H[Deploy Production]
    G --> I[Apply Staging Migrations]
    H --> J[Apply Production Migrations]
```

## Jobs

### 1. Lint and Type Check

- Runs ESLint
- Runs TypeScript type checking
- Blocks deployment if linting or type errors found

### 2. Build

- Builds Next.js application
- Verifies no build errors
- Uploads build artifacts

### 3. Test Migrations

- Starts local Supabase instance
- Applies all migrations from `supabase/migrations/`
- Verifies migrations run successfully
- Blocks deployment if migrations fail

### 4. Deploy Preview (PRs only)

- Deploys to Vercel preview environment
- Comments on PR with preview URL
- Uses separate environment variables for preview

### 5. Deploy Staging (staging branch)

- Applies migrations to staging database
- Deploys to Vercel staging environment
- Runs on push to `staging` branch

### 6. Deploy Production (main branch)

- Applies migrations to production database
- Deploys to Vercel production environment
- Runs on push to `main` branch

## Setup Instructions

### 1. GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Vercel Secrets**:
- `VERCEL_TOKEN`: Vercel API token (from Vercel → Settings → Tokens)
- `VERCEL_ORG_ID`: Vercel organization ID (from `.vercel/project.json`)
- `VERCEL_PROJECT_ID`: Vercel project ID (from `.vercel/project.json`)

**Database URLs**:
- `STAGING_DATABASE_URL`: Staging Supabase connection string
- `PRODUCTION_DATABASE_URL`: Production Supabase connection string

**Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `NEXT_PUBLIC_SITE_URL`: Site URL

### 2. Get Vercel Credentials

```bash
# Link your project to Vercel
npx vercel link

# Get org and project IDs
cat .vercel/project.json
```

Example `.vercel/project.json`:
```json
{
  "orgId": "team_abc123",
  "projectId": "prj_xyz789"
}
```

### 3. Get Database URLs

From Supabase dashboard:

1. Go to Project Settings → Database
2. Copy Connection String (URI)
3. Replace `[YOUR-PASSWORD]` with database password

Format:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 4. Enable GitHub Actions

1. Push `.github/workflows/ci.yml` to repository
2. Go to GitHub → Actions tab
3. Verify workflow appears
4. Enable Actions if prompted

## Branch Strategy

### Development Flow

```bash
# Feature development
git checkout -b feature/my-feature
git push origin feature/my-feature
# → Creates PR → Deploys preview → Runs tests

# Merge to staging for QA
git checkout staging
git merge feature/my-feature
git push origin staging
# → Deploys to staging → Applies staging migrations

# Merge to main for production
git checkout main
git merge staging
git push origin main
# → Deploys to production → Applies production migrations
```

### Hotfix Flow

```bash
# Critical production bug
git checkout -b hotfix/critical-bug main
# Fix the bug
git push origin hotfix/critical-bug
# → Creates PR → Deploys preview

# After testing in preview, merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main
# → Deploys to production immediately
```

## Migration Safety

### Pre-Deployment Checks

Before pushing to `main` or `staging`:

1. **Test migrations locally**:
   ```bash
   npx supabase db reset
   npx supabase db push
   ```

2. **Test in staging first**:
   ```bash
   git push origin staging
   # Wait for staging deployment
   # Test manually in staging
   ```

3. **Verify migration reversibility**:
   - Can you roll back if something goes wrong?
   - Do you have a rollback plan?

### Rollback Procedure

If production migration fails:

1. **Immediately revert**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual database rollback** (if needed):
   ```sql
   -- Connect to production database
   -- Manually revert migration changes
   -- Example: DROP TABLE if table was added
   ```

3. **Fix and re-deploy**:
   - Fix migration in feature branch
   - Test in staging
   - Re-deploy to production

## Monitoring

### View Pipeline Status

- GitHub Actions tab: https://github.com/your-org/your-repo/actions
- Vercel dashboard: https://vercel.com/your-org/your-project

### Pipeline Notifications

Enable GitHub notifications for:
- Workflow failures
- PR deployment previews

In GitHub → Settings → Notifications:
- [x] Actions workflow runs on my repositories

### Common Issues

**Build fails on "npm ci"**:
- Check `package-lock.json` is committed
- Verify Node version matches CI (18.x)

**Migration fails in CI**:
- Test locally with `supabase db reset && supabase db push`
- Check migration syntax errors
- Verify migration order (numbered files)

**Deployment fails on Vercel**:
- Check Vercel logs
- Verify environment variables set correctly
- Check build output for errors

## Performance Optimization

### Cache Dependencies

The pipeline caches npm dependencies to speed up builds:
- `npm ci` uses cache automatically
- Cache invalidates when `package-lock.json` changes

### Parallel Jobs

Jobs run in parallel when possible:
- `lint-and-typecheck` runs simultaneously with nothing
- `build` and `test-migrations` run after linting completes
- Saves ~2-3 minutes per pipeline run

### Skip CI (when needed)

To skip CI on a commit (e.g., documentation changes):

```bash
git commit -m "docs: update README [skip ci]"
```

## Best Practices

1. **Never skip migrations in CI** - Always test before production
2. **Test in staging first** - Don't merge directly to main
3. **Keep migrations small** - One migration per feature
4. **Document complex migrations** - Add comments in SQL
5. **Monitor production deploys** - Watch for errors after merge
6. **Use semantic commit messages** - Helps track changes

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/migrations)
