# Scalability Note

The project is structured by domain modules so new resources can be added without crowding the auth or task code paths. API versioning is isolated under `/api/v1`, which allows breaking changes to ship later under `/api/v2` while keeping old clients stable.

## Near-Term Improvements

- Add Alembic migrations instead of `metadata.create_all` for controlled schema changes.
- Move JWT secrets and database credentials to a managed secret store.
- Add refresh tokens with token rotation for longer-lived sessions.
- Add structured JSON logging and request IDs for traceability.
- Add Redis for rate limiting, cacheable reads, and short-lived session metadata.
- Add pagination to list endpoints before task volume grows.

## Larger Scale Direction

- Run API instances behind a load balancer with stateless JWT verification.
- Keep Postgres as the transactional source of truth and add read replicas if read traffic dominates.
- Split heavy async workflows into background workers with a queue.
- Separate modules into services only when team boundaries or scaling pressure justify the operational cost.
- Add CI checks for tests, linting, container build, and OpenAPI schema generation.

