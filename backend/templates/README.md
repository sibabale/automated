# Backend templates

Copy the template that matches the file's responsibility, then replace its
placeholder name and breadcrumb. Templates live outside `src/` so placeholder
code is never included in the production build.

## Required file structure

Every backend implementation and test file uses this order when applicable:

1. Breadcrumb comment.
2. External dependencies.
3. Internal dependencies.
4. Types, constants, mocks, or configuration.
5. The exported implementation or test cases, with nested sections for setup,
   local values, and core logic.
6. `// END FILE` marker.

Public exports retain concise JSDoc that explains their responsibility and any
non-obvious behavior. Section comments provide navigation; they do not replace
documentation.

## Template catalog

| Template | Use for |
| --- | --- |
| `application.template.ts` | Express application composition |
| `routes.template.ts` | Feature route registration |
| `controller.template.ts` | HTTP request-to-service translation |
| `service.template.ts` | Feature business operations |
| `middleware.template.ts` | Cross-cutting Express middleware |
| `error.template.ts` | Expected, typed application failures |
| `repository.template.ts` | Persistence boundary adapters |
| `client-adapter.template.ts` | External API adapters, including future Octokit or Undici clients |
| `http.test.template.ts` | Public HTTP behavior tests |
| `controller.test.template.ts` | Controller contract tests with isolated collaborators |
