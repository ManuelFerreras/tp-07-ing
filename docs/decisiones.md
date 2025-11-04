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

### Issues Sonar corregidos

- Backend (`back/handlers.go`): literal duplicado "internal error" → se reemplazó por constante `internalErrorMsg` y se reutiliza en ramas 500.
- Front (`front/src/app/layout.tsx`): props del componente marcadas como `Readonly`.
- Front (`front/src/components/EmployeeForm.tsx`): tipo `Props` y parámetro marcados como `Readonly`.

## Cobertura (estado y brechas)

- Frontend
  - Estado: Jest genera `coverage/lcov.info` y aplica umbral global 70%.
  - Cubierto: `src/lib/api.ts` (happy path y errores 422/404/500), `EmployeeForm` (validación requerida, submit exitoso y error UI).
  - Brechas: `src/app/employees/page.tsx` (render tabla con lista vacía, flujo de edición, render de alerta en error inicial).
  - Sugerencia: añadir 1-2 tests de la página para consolidar ≥70% y, opcionalmente, `coverageReporters: ['html']` para inspección visual.
- Backend
  - Estado: `make cover` genera `cover.out`; `make check-cover` aplica gate 70%. `make cobertura` produce `cobertura.xml` para Azure.
  - Cubierto: GET/POST/PUT happy; errores 422 (payload inválido), 404 (id inexistente), 405 (método no permitido), 500 (fallo de store), OPTIONS (CORS), JSON inválido, lista vacía `[]`.
  - Brechas: opcional verificar encabezados CORS en GET/POST/PUT y paths de logging.
- Cómo reproducir
  - Front: `cd front && npm run test:coverage` (reporte consola y `coverage/lcov.info`).
  - Back: `cd back && make cover && go tool cover -func=cover.out` (resumen) y `go tool cover -html=cover.out -o cover.html` (HTML).

## Estrategia E2E

- Flujos: crear, actualizar, errores (422/500) con `cy.intercept`.
- Datos: se crean por spec; sin dependencia entre specs.
- Selectores: última fila `table tbody tr:last-child td:nth-child(2)`; acciones por texto.

### Escenarios E2E implementados

- Crear registro (`e2e/cypress/e2e/create_employee.cy.ts`)
  - Paso a paso: visitar `/employees` → completar input `name` → click "Create".
  - Verificación: última fila de la tabla (columna nombre) coincide con el valor ingresado.
- Actualizar registro (`e2e/cypress/e2e/update_employee.cy.ts`)
  - Paso a paso: crear registro → click "Edit" en la última fila → modificar nombre → click "Update".
  - Verificación: última fila refleja el nuevo nombre.
- Manejo de errores (`e2e/cypress/e2e/error_handling.cy.ts`)
  - 422 al crear: `cy.intercept('POST', '**/employees', { statusCode: 422, body: { error: 'name is required' } })`.
  - 500 al actualizar: `cy.intercept('PUT', '**/employees/*', { statusCode: 500, body: { error: 'internal error' } })`.
  - Verificación: la UI muestra el mensaje en `[role="alert"]`.

## Quality Gates y rollback

- Stage 1: unit + cobertura ≥70% (front/back) y Sonar en verde; falla si no.
- Stage 2: E2E deben pasar; si fallan, no hay “deploy verde”.
- Rollback: al fallar Stage 2, no se promueve artefacto; servicios locales se detienen al terminar el job.
