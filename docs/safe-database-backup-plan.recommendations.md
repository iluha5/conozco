# Enhanced Safe Database Backup and Migration Plan (Addendum)

This addendum preserves the original plan and provides a hardened, production-grade execution plan with validation, observability, retention, and rollback procedures. It does not change the original file.

## 1. Scope and goals
- Ensure every schema/data migration on production is preceded by a valid, restorable backup.
- Abort deployment if backup or its validation fails.
- Provide clear rollback, observability, and verification steps.

Success indicators:
- 100% of production deploys have a preceding successful backup and validation.
- Time to detect backup failure < 1 minute via CI logs/alerts.
- Successful periodic test-restore on staging.

## 2. Roles and responsibilities
- Owner: Backend/Platform engineer on duty.
- Backup execution: CI job on the production host.
- Test-restore: Staging maintenance job, scheduled (e.g., daily/weekly).
- Incident channel: Slack/Email (define channel) with on-call rotation.

## 3. Environments and preconditions
- Production host has docker, bash, and access to the DB network.
- Backup script path on host: /opt/flashcards/scripts/server-setup/backup-db-prod.sh (executable).
- CI has SSH access to host and secrets for DO Spaces.

## 4. Secrets and access
- DO Spaces keys, DB creds are provided via CI/host secret store and never printed in logs.
- CI masks secrets; scripts avoid set -x when printing sensitive values.

## 5. Backup procedure (host-based, mandatory)
1. Pre-checks on host:
   - Verify script exists and is executable: test -x "$BACKUP_SCRIPT".
   - Check free disk space >= configured threshold (e.g., 2x DB size or >= 20 GB).
2. Execute backup:
   - Run backup-db-prod.sh; script outputs a BACKUP_PATH (absolute) and logs size.
3. Immediate validation (lightweight):
   - test -s "$BACKUP_PATH" (non-empty file).
   - Compute SHA-256: shasum -a 256 "$BACKUP_PATH" and log/store alongside backup.
   - If using Postgres custom format, list contents: pg_restore -l "$BACKUP_PATH" (listing must succeed).
4. Upload to DO Spaces with server-side encryption; verify response/status.
5. Persist metadata (structured log/JSON): timestamp, GIT_SHA, APPLIED_BY, size, SHA-256, Spaces key.

## 6. Backup validation (extended) and periodic test-restore
- Before critical releases or on a schedule, run test-restore on staging:
  - Restore into an isolated DB container/instance.
  - Run smoke SQL checks (presence of key schemas/tables, counts on critical tables).
  - Record duration and outcome; alert on failures.

## 7. Retention policy
- Retain last N daily backups (e.g., 14) and W weekly (e.g., 8). Configure lifecycle in DO Spaces.
- Keep at least the last successful pre-migration backup for each production deploy for 30 days.
- Nightly job prunes old local backups; verify free space after prune.

## 8. Deployment order (zero-downtime oriented)
1. Schema migrations compatible with both old and new app versions (additive when possible).
2. Deploy application version that is compatible with both pre/post data states (feature flags if needed).
3. Data migrations (batched, safe, idempotent) after app is live.
4. Clean-up schema migrations (dropping old columns) in a subsequent deploy.

## 9. Data migrations execution policy
- Idempotency: Every migration can safely re-run without changing final state incorrectly.
- Concurrency control: Use DB advisory lock or dedicated migrations registry table to prevent concurrent runs.
- Batching and timeouts: process in small batches; avoid long transactions; respect lock timeouts.
- Index readiness: ensure required indexes exist before large updates.
- Observability: log batches processed, rows affected, total duration.

## 10. Observability and alerts
- Log structured events (JSON) for: backup start/end, size, sha256, key path, durations, success/failure, GIT_SHA, APPLIED_BY.
- Emit metrics (optional): durations, sizes, success rate.
- Alert on: backup failure, Spaces upload failure, validation failure, test-restore failure, disk space below threshold.

## 11. Failure handling and guardrails
- If backup or validation fails -> immediate exit 1, deployment stops.
- Provide manual remediation runbook (rerun backup, free disk, fix creds) before retry.
- Define deployment window and max time spent troubleshooting during window.

## 12. Rollback playbook
1. Quiesce or route traffic if necessary (read-only mode if supported).
2. Restore from the most recent valid pre-migration backup.
3. Redeploy last known good app version.
4. Post-restore checks: integrity, app smoke tests, monitoring green.
5. Incident report and root cause analysis if rollback triggered.

## 13. Verification checklists
- Pre-migration:
  - Backup script executable; free space OK; DO Spaces reachable.
  - Backup completed; file non-empty; pg_restore -l (for custom format) OK; SHA-256 logged; uploaded object present.
- Post-migration:
  - Data invariants/row counts as expected; application health checks pass; logs without errors for N minutes.

## 14. CI/CD integration snippets (illustrative)

```bash
# Verify image exists
if ! docker image inspect "$REGISTRY/$IMAGE_NAME:${IMAGE_TAG}" >/dev/null 2>&1; then
  echo "ERROR: Image not found: $REGISTRY/$IMAGE_NAME:${IMAGE_TAG}"; exit 1; fi

# Host backup (mandatory on prod)
BACKUP_SCRIPT="/opt/flashcards/scripts/server-setup/backup-db-prod.sh"
if [ -z "${SKIP_BACKUP:-}" ] || [ "${SKIP_BACKUP}" != "true" ]; then
  if [ -x "$BACKUP_SCRIPT" ]; then
    echo "Creating database backup before migrations..."
    START_TS=$(date +%s)
    BACKUP_PATH=$(bash "$BACKUP_SCRIPT" | tee /dev/stderr | awk '/BACKUP_PATH=/{print substr($0,index($0,"=")+1)}') || { echo "ERROR: Backup failed"; exit 1; }
    [ -s "$BACKUP_PATH" ] || { echo "ERROR: Backup file missing or empty"; exit 1; }
    shasum -a 256 "$BACKUP_PATH" || { echo "ERROR: SHA256 failed"; exit 1; }
    if command -v pg_restore >/dev/null 2>&1; then pg_restore -l "$BACKUP_PATH" >/dev/null 2>&1 || { echo "ERROR: pg_restore listing failed"; exit 1; }; fi
    DURATION=$(( $(date +%s) - START_TS ))
    echo "Backup completed in ${DURATION}s"
  else
    echo "ERROR: Backup script not found or not executable at $BACKUP_SCRIPT"; exit 1
  fi
else
  echo "WARNING: SKIP_BACKUP=true — backup step skipped (NOT RECOMMENDED)"
fi

# Schema migrations
docker compose -f docker-compose.prod.yml run --rm --no-deps app \
  npx prisma@5.22.0 migrate deploy || { echo "ERROR: Schema migrations failed"; exit 1; }

# Data migrations (if present)
# docker compose -f docker-compose.prod.yml run --rm --no-deps app \
#   node scripts/apply-data-migrations/apply-data-migrations.js || { echo "ERROR: Data migrations failed"; exit 1; }
```

Notes:
- Ensure apply-data-migrations.js is built and present before invocation.
- Prefer masking secrets and avoid echoing sensitive environment variables.

## 15. Risks and mitigations
- Large tables updates -> use batching, proper indexes, and off-peak windows.
- Deadlocks/lock timeouts -> smaller batches, NOWAIT/SKIP LOCKED where applicable, retriable logic.
- Storage exhaustion -> retention policy and pre-backup disk space checks.
- Human error -> explicit checklists and CI gates.

---
This addendum is intended to be used alongside the original plan docs/safe-database-backup-plan.md without modifying it.
