# TaskVault Scalability Plan

This file is the correct place to write about load balancers, caching, database scaling, microservices, observability, and deployment readiness.

## Stateless Backend

The Spring Boot API is stateless. Access tokens are signed JWTs, and refresh tokens are stored in PostgreSQL. Because user session state is not kept in server memory, multiple backend instances can run behind a load balancer without sticky sessions.

Production setup:

```text
Client -> CDN/Frontend -> Load Balancer -> Spring Boot API replicas -> PostgreSQL
```

## Load Balancing

Use an L7 load balancer such as AWS ALB, NGINX, Render routing, Railway routing, or Kubernetes Ingress. The load balancer should:

- Terminate TLS.
- Route `/api/**` traffic to backend replicas.
- Use `/api/health` for health checks.
- Enforce request size limits.
- Apply basic rate limits for login and refresh endpoints.

## Caching

Redis can be added when read traffic grows. Good cache candidates:

- Visible category lists.
- Task list pages with filters.
- Admin task statistics.

Cache keys must include user id, role, page, filters, and sort fields. Write operations such as create, update, patch, and delete should evict related task/category cache entries immediately.

## Database Scaling

PostgreSQL remains the source of truth. The project already uses HikariCP connection pooling and indexes for common lookup paths.

Recommended database scaling path:

1. Tune Hikari pool size per API instance.
2. Add missing indexes based on slow query logs.
3. Move high-volume reads to read replicas.
4. Keep writes, refresh token rotation, and transactional operations on the primary database.
5. Add backups, point-in-time recovery, and migration tooling before production use.

## Microservices Path

The current modular package structure is intentionally simple for an intern assignment. If the product grows, it can be split into:

- `auth-service`
- `task-service`
- `category-service`
- `user-service`

An API gateway can handle routing, JWT verification, rate limiting, and request logging. Cross-service events such as `TaskCreated`, `CategoryDeleted`, and `UserDeactivated` can move through Kafka, RabbitMQ, or another durable event bus.

This split should happen only when traffic, team ownership, or deployment independence justifies the extra operational cost.

## Deployment Readiness

The Docker setup makes the app ready for container platforms.

Recommended production checklist:

- Run at least two backend replicas.
- Use environment-managed JWT secrets.
- Use managed PostgreSQL with automated backups.
- Serve frontend assets through a CDN.
- Add Spring Actuator metrics for Prometheus/Grafana.
- Add structured request logging.
- Add Redis-backed rate limiting for auth endpoints.
- Add CI checks for `mvn test`, `npm run build`, and Docker builds.
