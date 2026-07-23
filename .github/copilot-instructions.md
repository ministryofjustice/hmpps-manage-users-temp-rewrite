# hmpps-manage-users-temp-rewrite

An HMPPS (MoJ) TypeScript/Express server-rendered (Nunjucks + GOV.UK Frontend) app for managing DPS/prison users,
external (auth) users, groups, roles, email domains and the user allowlist. It's a frontend for the
`manage-users-api` service (no direct DB access from this app).

## Build, test, lint

- Install deps: `npm run setup` (NOT `npm install` — this also runs allowlisted postinstall scripts and installs
  precommit hooks). Requires Node 24 / npm 11 (see `.nvmrc` / `engines`).
- Build: `npm run build` (esbuild). Dev with rebuild-on-change: `npm run start:dev`.
- Typecheck: `npm run typecheck` — runs `tsc` against the root, `integration_tests`, and `assets/js` tsconfigs.
- Lint: `npm run lint` (`npm run lint-fix` to autofix).
- Unit tests (Jest): `npm run test`. CI uses `npm run test:ci` (`--runInBand`).
  - Run a single file: `npx jest server/services/externalUserService.test.ts`
  - Run a single test by name: `npx jest server/services/externalUserService.test.ts -t "test name"`
  - Test files live next to source as `*.test.ts` and are matched under `server/**` or `job/**`.
- Integration tests (Playwright, against wiremock stubs, not the real API):
  1. `docker compose -f docker-compose-test.yml up` (starts wiremock)
  2. `npm run start-feature` (or `start-feature:dev` for auto-restart), which loads `feature.env`
  3. `npm run int-test-init:ci` once, then `npm run int-test` (or `npm run int-test-ui`)
- Regenerate API types from the deployed OpenAPI spec: `./generate-api-types.sh` (writes
  `server/@types/manageUsersApi/index.d.ts`).

## Architecture

- `server/index.ts` → `server/app.ts` wires Express, middleware (`server/middleware/*`), and `routes(services)`.
- `server/services/index.ts` builds a single `Services` object (DI container) from `dataAccess()`
  (`server/data/index.ts`) and threads it through every router factory — routers are functions
  `(services: Services) => Router`, not classes or singletons.
- All calls to the external API go through `server/data/manageUsersApiClient.ts` (extends `RestClient` from
  `@ministryofjustice/hmpps-rest-client`, using `asUser(token)` for on-behalf-of calls). Services in
  `server/services/*Service.ts` wrap this client with app-specific logic; routers call services, never the client
  directly.
- Routing is feature-sliced under `server/routes/<feature>/` (e.g. `externalUser`, `dpsUser`, `groups`, `roles`,
  `emailDomains`, `crsGroups`, `userAllowList`), each with an `index.ts` that mounts sub-routers. `dpsUser` and
  `externalUser` further split into `create` / `manage` sub-folders for multi-step wizards.
- **All URL paths are centralised in `server/routes/paths.ts`** using `static-path`'s `path()`/`.path()` composition
  (never hardcode route strings elsewhere — build/redirect using the `paths` object, e.g.
  `paths.externalUser.manage.details({ userId })`).
- Views mirror the route structure under `server/views/pages/<feature>/*.njk`, with shared partials in
  `server/views/partials` and reusable components in `server/views/components`.
- Form validation lives in `server/presentation/validation/*Validation.ts` (pure functions returning `FormError[]`);
  generic form/flash helpers (`bodyFromFlash`, `flashBody`, `flashErrors`, `formErrorsFromFlash`,
  `validateFormOrRedirect`) are in `server/middleware/route/formMiddleware.ts` and implement the standard
  GET/POST-redirect-on-error pattern used by every create/edit form (see
  `server/routes/externalUser/createRouter.ts` for the canonical example).
- Role-based access control on routes uses `authRoleGuardMiddleware(AuthRole[])`
  (`server/middleware/route/authRoleGuardMiddleware.ts`), applied per sub-router with `router.use(...)`. Role
  constants are in `server/interfaces/authRole.ts`; helper `hasRole(user, role)` is in
  `server/interfaces/hmppsUser.ts`.
- Auditing: significant actions call `auditService.logAuditEvent({ what, who, subjectId, subjectType, details })`
  (`server/services/auditService.ts`) after a successful API mutation.
- Types generated from the API spec live in `server/@types/manageUsersApi` (raw OpenAPI) and
  `server/@types/manageUsersApiClient` (hand-picked convenience aliases imported as `from 'manageUsersApiClient'`).

## Conventions

- TypeScript, strict, `@ministryofjustice/eslint-config-hmpps` — don't add custom lint/format tooling.
- Prefer editing `paths.ts` rather than inlining route strings; prefer adding a service method + client method over
  calling `superagent`/HTTP directly from a router.
- Errors from the API client are inspected via `err.responseStatus` (e.g. `HttpStatusCode.BAD_REQUEST`,
  `HttpStatusCode.CONFLICT` from `server/utils/utils.ts`) to map to user-facing form errors; unexpected statuses are
  rethrown.
- Secrets scanning runs via pre-commit hooks (`.pre-commit-config.yaml`); don't disable without cause.
