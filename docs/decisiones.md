# Decisiones de Arquitectura y Calidad

## Stack elegido y alternativas descartadas
- Frontend: Next.js 14 (App Router) + React 18 + TypeScript.
  - Alternativas: CRA (deprecated), Vite+React (rápido pero menos estándar en empresas con Next), Astro (overkill).
- Backend: Go 1.22 `net/http` + `database/sql` con `modernc.org/sqlite`.
  - Alternativas: Fiber/Gin (más features pero innecesario), GORM (ORM evita SQL explícito pero agrega complejidad).
- DB: SQLite archivo local; tests usan `:memory:` para velocidad y aislamiento.
- E2E: Cypress (estándar de facto). Alternativas: Playwright (excelente, pero requisito pide Cypress).
- CI/CD: Azure Pipelines + SonarCloud (requisito).

## Criterios de cobertura (70%)
- Umbral global 70% en front y back; balancea esfuerzo/valor pedagógico.
- Priorizado: validaciones en handlers y cliente `api.ts`; estados/errores en `EmployeeForm` y página.
- No se cubren: estilos y wiring no críticos.

## Reglas Sonar usadas y ajustes
- Gates: Reliability A, Security A, 0 Blocker/Critical.
- Exclusiones: `.next/**`, `node_modules/**`, tests (`**/*.test.*`, `**/*_test.go`).
- Cobertura: front `coverage/lcov.info`; back `cover.out`.

## Estrategia E2E
- Flujos: crear, actualizar, errores (422/500) con `cy.intercept`.
- Datos: se crean por spec; sin dependencia entre specs.
- Selectores: última fila `table tbody tr:last-child td:nth-child(2)`; acciones por texto.

## Quality Gates y rollback
- Stage 1: unit + cobertura ≥70% (front/back) y Sonar en verde; falla si no.
- Stage 2: E2E deben pasar; si fallan, no hay “deploy verde”.
- Rollback: al fallar Stage 2, no se promueve artefacto; servicios locales se detienen al terminar el job.
