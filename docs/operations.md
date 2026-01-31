# Operations Guide: Backup and Recovery

**Last Updated**: 2026-01-31
**Owner**: DevOps / Platform Team

## Table of Contents

1. [Backup Strategy](#backup-strategy)
2. [Automated Backups](#automated-backups)
3. [Manual Backups](#manual-backups)
4. [Recovery Procedures](#recovery-procedures)
5. [Disaster Recovery](#disaster-recovery)
6. [Monitoring and Alerts](#monitoring-and-alerts)

---

## Backup Strategy

### What We Backup

| Component | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| PostgreSQL Database | Daily | 30 days | Supabase (auto) |
| User-uploaded Files | Daily | 30 days | Supabase Storage |
| Environment Config | On change | Git history | GitHub repo |
| Code | Every commit | Indefinite | GitHub repo |

### RPO (Recovery Point Objective)

- **Database**: 24 hours (daily backups)
- **Files**: 24 hours (daily backups)
- **Code**: Minutes (Git)

### RTO (Recovery Time Objective)

- **Database restore**: 1-2 hours
- **Full system recovery**: 4-6 hours
- **Code rollback**: 15 minutes

---

## Automated Backups

### Supabase Automatic Backups

Supabase provides automatic daily backups:

**Production Project**:
- Frequency: Daily at 2:00 AM UTC
- Retention: 30 days (Pro plan) or 7 days (Free plan)
- Location: Supabase managed storage

**Verify Backups**:
1. Go to Supabase Dashboard → Database → Backups
2. Check latest backup timestamp
3. Verify backup size is reasonable

**Download Backup** (for external storage):
```bash
# Using Supabase CLI
npx supabase db dump --db-url $PRODUCTION_DATABASE_URL -f backup-$(date +%Y%m%d).sql

# Upload to secure storage (S3, Google Drive, etc.)
# Example: AWS S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://your-backup-bucket/coaching-animator/
```

### GitHub Code Backups

Code is automatically backed up to GitHub:
- Every commit is stored indefinitely
- Branches preserved until manually deleted
- GitHub maintains redundant copies

**Best Practice**: Tag production releases
```bash
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

---

## Manual Backups

### Before Major Changes

Always create manual backup before:
- Database schema migrations
- Major feature deployments
- Data transformations
- Infrastructure changes

**Create Manual Backup**:

```bash
# 1. Backup database
npx supabase db dump --db-url $PRODUCTION_DATABASE_URL -f backup-pre-migration-$(date +%Y%m%d).sql

# 2. Backup environment variables (from Vercel)
vercel env pull .env.backup

# 3. Backup Supabase Storage files (if needed)
# Use Supabase Storage API or dashboard to export
```

**Store Securely**:
```bash
# Encrypt backup
gpg -c backup-pre-migration-$(date +%Y%m%d).sql

# Upload to secure location
# Example: Google Drive, AWS S3, or encrypted USB drive
```

### Weekly Backup Checklist

- [ ] Verify Supabase automatic backup ran successfully
- [ ] Download latest database dump to external storage
- [ ] Verify backup file integrity (can be opened/restored)
- [ ] Check backup storage usage (cleanup old backups if needed)
- [ ] Test restore procedure (in staging) quarterly

---

## Recovery Procedures

### Scenario 1: Accidental Data Deletion

**User deleted animation by mistake**:

```sql
-- 1. Connect to Supabase SQL Editor (production)
-- 2. Check if soft-deleted (hidden_at field)
SELECT id, title, user_id, hidden_at
FROM saved_animations
WHERE id = 'animation-id-here';

-- 3. If soft-deleted, restore by clearing hidden_at
UPDATE saved_animations
SET hidden_at = NULL
WHERE id = 'animation-id-here';

-- 4. If hard-deleted, restore from backup (see below)
```

**User account deleted**:

```sql
-- Check auth.users for soft-deleted users
SELECT id, email, deleted_at
FROM auth.users
WHERE email = 'user@example.com';

-- Supabase handles auth backups automatically
-- Contact Supabase support for user restoration if needed
```

### Scenario 2: Database Corruption

**Symptoms**: Query errors, data inconsistencies

**Recovery Steps**:

1. **Identify corruption scope**:
   ```sql
   -- Run VACUUM to check for corruption
   VACUUM FULL ANALYZE;

   -- Check table integrity
   SELECT * FROM pg_stat_database;
   ```

2. **Restore from latest backup**:
   ```bash
   # Download latest backup from Supabase
   # Or use your external backup

   # Restore to staging first to verify
   psql $STAGING_DATABASE_URL < backup-20260131.sql

   # Test staging application
   # If verified, restore to production
   psql $PRODUCTION_DATABASE_URL < backup-20260131.sql
   ```

3. **Verify restoration**:
   ```bash
   # Check row counts
   psql $PRODUCTION_DATABASE_URL -c "SELECT COUNT(*) FROM saved_animations;"

   # Verify recent data exists
   psql $PRODUCTION_DATABASE_URL -c "SELECT * FROM saved_animations ORDER BY created_at DESC LIMIT 10;"
   ```

### Scenario 3: Failed Migration

**Symptoms**: Application crashes after deployment, migration errors

**Recovery Steps**:

1. **Immediate rollback**:
   ```bash
   # Revert code deployment
   git revert HEAD
   git push origin main
   # Vercel auto-deploys reverted version
   ```

2. **Restore database to pre-migration state**:
   ```bash
   # Option A: Restore from backup (if migration was destructive)
   psql $PRODUCTION_DATABASE_URL < backup-pre-migration.sql

   # Option B: Manually revert migration (if possible)
   # Connect to Supabase SQL Editor and manually undo changes
   ```

3. **Verify system stability**:
   - Check application health endpoint: `https://your-domain.com/api/health`
   - Test critical user flows
   - Monitor error logs

### Scenario 4: Complete Data Loss

**Symptoms**: Entire database unavailable, Supabase project deleted

**Recovery Steps**:

1. **Create new Supabase project**:
   - Go to https://app.supabase.com
   - Create new project with same region

2. **Restore from latest backup**:
   ```bash
   # Get latest backup from external storage
   # Decrypt if encrypted
   gpg backup-latest.sql.gpg

   # Restore to new Supabase project
   psql $NEW_DATABASE_URL < backup-latest.sql
   ```

3. **Update environment variables**:
   ```bash
   # Update Vercel environment variables with new Supabase credentials
   # Or update .env.local if testing locally
   ```

4. **Verify and deploy**:
   ```bash
   # Test locally first
   npm run dev

   # Deploy to production
   git push origin main
   ```

---

## Disaster Recovery

### Complete System Failure

**Estimated Recovery Time**: 4-6 hours

**Preparation** (Do this NOW):
1. Document all external service credentials:
   - Supabase project details
   - Vercel project details
   - GitHub repository
   - Domain registrar login

2. Store backup credentials securely:
   - Use password manager (1Password, LastPass)
   - Keep encrypted offline copy

**Recovery Plan**:

```markdown
## Day Zero: System Down

Hour 0:
- [ ] Assess damage scope (code, database, files)
- [ ] Notify stakeholders (users, team)
- [ ] Begin recovery procedures

Hour 1-2:
- [ ] Create new Supabase project
- [ ] Restore database from latest backup
- [ ] Verify data integrity

Hour 2-4:
- [ ] Update environment variables in Vercel
- [ ] Deploy application code from GitHub
- [ ] Apply any missing migrations

Hour 4-6:
- [ ] Full system testing
- [ ] Notify users of restoration
- [ ] Document incident for post-mortem

Day 1-7:
- [ ] Monitor for issues
- [ ] Conduct post-mortem
- [ ] Improve backup/recovery procedures
```

### Data Breach Response

**If user data is compromised**:

1. **Immediate Actions** (Hour 0-1):
   - Revoke all API keys and service role keys
   - Reset admin passwords
   - Enable Supabase audit logging
   - Capture forensic evidence

2. **Containment** (Hour 1-4):
   - Identify breach scope (which data affected)
   - Disable affected accounts
   - Block suspicious IP addresses

3. **User Notification** (Hour 4-24):
   - Email all affected users
   - Recommend password reset
   - Explain what data was exposed

4. **Recovery** (Day 1-7):
   - Apply security patches
   - Restore from clean backup if needed
   - Implement additional security measures

---

## Monitoring and Alerts

### Backup Health Checks

**Setup Monitoring**:

1. **Supabase Dashboard**:
   - Enable backup notifications
   - Set alert if backup fails

2. **External Monitoring** (optional):
   ```bash
   # Cron job to verify daily backup exists
   #!/bin/bash
   # Check if today's backup exists
   BACKUP_DATE=$(date +%Y%m%d)
   # Query Supabase API for backup
   # Alert if missing
   ```

### Metrics to Track

- Backup completion rate: 100% expected
- Backup file size: Should be consistent (±20%)
- Storage usage: Monitor for unexpected growth
- Failed backup attempts: Alert immediately

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Backup age | > 36 hours | > 48 hours |
| Backup size drop | > 30% | > 50% |
| Storage full | > 80% | > 90% |
| Failed backups | 1 in 7 days | 2 consecutive |

---

## Best Practices

1. **Test Restores Regularly**:
   - Quarterly restore to staging
   - Verify application works with restored data
   - Document any issues

2. **Automate Where Possible**:
   - Use Supabase automatic backups
   - Script manual backup downloads
   - Automate backup verification

3. **Keep Multiple Copies**:
   - Supabase automatic backups
   - External encrypted backups (S3, Drive)
   - Git repository (code)

4. **Document Changes**:
   - Update this guide when procedures change
   - Document any custom recovery steps
   - Keep runbook accessible to team

5. **Security**:
   - Encrypt backups at rest
   - Secure backup storage access
   - Rotate backup encryption keys annually

---

## Emergency Contacts

**Supabase Support**: support@supabase.com
**Vercel Support**: https://vercel.com/support
**On-Call Engineer**: [Your team's contact]

---

## Appendix: Useful Commands

### Database Operations

```bash
# Create full database backup
pg_dump $DATABASE_URL > backup.sql

# Create schema-only backup
pg_dump --schema-only $DATABASE_URL > schema.sql

# Create data-only backup
pg_dump --data-only $DATABASE_URL > data.sql

# Restore database
psql $DATABASE_URL < backup.sql

# Restore specific table
pg_restore -t saved_animations backup.sql
```

### Supabase CLI

```bash
# List all backups
npx supabase db backups list

# Download specific backup
npx supabase db dump --db-url $DATABASE_URL -f backup.sql

# Apply migrations
npx supabase db push

# Reset database (DESTRUCTIVE)
npx supabase db reset
```

### Vercel CLI

```bash
# Download environment variables
vercel env pull

# Get deployment logs
vercel logs [deployment-url]

# Rollback to previous deployment
vercel rollback [deployment-url]
```

---

**Document Version**: 1.0
**Next Review Date**: 2026-04-30
**Owner**: DevOps Team
