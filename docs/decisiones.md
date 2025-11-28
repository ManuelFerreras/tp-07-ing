# Decisiones de Arquitectura y Calidad

## Stack elegido y alternativas descartadas

- Frontend: Next.js 14 (App Router) + React 18 + TypeScript.
  - Alternativas: CRA (deprecated), Vite+React (rápido pero menos estándar en empresas con Next), Astro (overkill).
- Backend: Go 1.22 `net/http` + `database/sql` con `modernc.org/sqlite`.
  - Alternativas: Fiber/Gin (más features pero innecesario), GORM (ORM evita SQL explícito pero agrega complejidad).
- DB: SQLite archivo local; tests usan `:memory:` para velocidad y aislamiento.
- E2E: Cypress (estándar de facto). Alternativas: Playwright (excelente, pero requisito pide Cypress).
- CI/CD: Azure Pipelines + SonarCloud (requisito).

## Alcance funcional y módulos entregados

- Gestión de empleados (CRUD) se mantiene como módulo base.
- Evaluaciones de desempeño:
  - Store en Go con estados `draft → submitted → approved`, ratings 1-5 y comentarios.
  - Front: tablero con formulario de alta, filtros por empleado/estado, edición y tarjetas con promedios por persona.
  - Backend: endpoints `GET/POST /reviews`, `PUT /reviews/{id}`, `PUT /reviews/{id}/status` + agregados por empleado.
- Nómina:
  - Store calcula neto = `base + horasExtra*tarifa + bonos - deducciones` y expone totales por período.
  - Front: formulario con previsualización en tiempo real y listado con totales acumulados.
  - Backend: `GET/POST /payroll` con filtros `employeeId` y `period`.
- Se agregaron unit tests (Go + Jest) para cubrir reglas de negocio (transiciones, neto) y formularios.

## Container Registry

- Elegido: GitHub Container Registry (`ghcr.io`).
  - Justificación: integración nativa con GitHub Actions, permisos vía `GITHUB_TOKEN`, publicación sin credenciales adicionales, trazabilidad por commit SHA y fácil control de visibilidad (público/privado).
  - Alternativas: Docker Hub (límite de pulls, rate limits), ACR/ECR/GCR (excelentes pero mayor complejidad de credenciales para este alcance).
- Imágenes publicadas por workflow:
  - Backend: `ghcr.io/<owner>/<repo>-back:{sha}`, `latest`
  - Frontend: `ghcr.io/<owner>/<repo>-front:{sha}`, `latest`
- Integración en CI:
  - Job `docker_push` en `.github/workflows/build.yml` usa `docker/login-action` con `GITHUB_TOKEN` y `build-push-action` para construir y subir imágenes.
  - Tags: `:${sha}` (versionado inmutable) + `:latest` (tracking).
  - Front pasa `NEXT_PUBLIC_API_URL` como `--build-arg` en build (ajustable por ambiente en despliegue).

## QA y PROD (Railway)

- QA (Railway)

  - Servicios: `backend-qa` (8080), `frontend-qa` (3000)
  - Imágenes: `:latest`
  - Env: `DB_DSN=/data/employees.db`, `NEXT_PUBLIC_API_URL=https://<backend-qa>`
  - Volúmenes: `/data` para backend
  - Recursos: ~0.2 vCPU / 512MB (ejemplo)
  - Autosleep: opcional

- PROD (Railway)

  - Proyecto separado `tp07-prod` (segregación)
  - Servicios: `backend-prod`, `frontend-prod`
  - Imágenes: `:prod` (promovidas desde GHCR)
  - Env: `DB_DSN=/data/employees.db`, `NEXT_PUBLIC_API_URL=https://<backend-prod>`
  - Volúmenes: `/data` para backend
  - Recursos: backend 1 vCPU/1GB; frontend 0.5-1 vCPU/512MB-1GB; réplicas frontend si plan lo permite
  - Autosleep: desactivado

- CD a PROD (manual + approval)
  - Workflow: `.github/workflows/release-prod.yml` (`workflow_dispatch` con `image_tag`)
  - Usa ambiente `production` (requiere aprobación en GitHub → Environments)
  - Pasos: login GHCR → retag `{sha}` como `:prod` → Railway CLI `up` para backend y frontend
  - Secrets/vars requeridos: `RAILWAY_TOKEN` (secret), `RAILWAY_PROJECT_ID_PROD`, `RAILWAY_SERVICE_ID_BACK_PROD`, `RAILWAY_SERVICE_ID_FRONT_PROD` (vars)

Justificación

- Mismo servicio (Railway) facilita operación y coherencia entre QA/PROD.
- Separación por proyecto/servicio + tags (`:latest`/`:prod`) aísla ambientes.
- Aproval gate en GitHub Environments para control manual de releases.

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
  - Cubierto: `src/lib/api.ts` completo (empleados + reviews + payroll), `EmployeeForm`, `PerformanceReviewForm`, `PayrollForm`, `Home`.
  - Brechas: wiring de páginas (`src/app/**`) se valida vía Cypress; no duplicamos con Jest.
- Backend
  - Estado: `make cover` genera `cover.out`; `make check-cover` aplica gate 70%. `make cobertura` produce `cobertura.xml` para Azure.
  - Cubierto: empleados + nuevas rutas `/reviews` y `/payroll` (éxito, validaciones, transiciones).
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
- Evaluaciones de desempeño end-to-end (`e2e/cypress/e2e/reviews.cy.ts`)
  - Precondición: se crea empleado vía `cy.request` al backend.
  - Flujo: completar formulario → generar evaluación → avanzar a `submitted` y luego `approved`.
  - Verificación: la fila refleja el estado final y la tarjeta de resumen muestra promedio.
- Nómina (`e2e/cypress/e2e/payroll.cy.ts`)
  - Precondición: empleado sembrado vía API.
  - Flujo: cargar formulario con horas extra/bonos/deducciones → enviar.
  - Verificación: la tabla muestra el registro y el panel “Total acumulado” refleja el neto calculado.

## Quality Gates y rollback

- Stage 1: unit + cobertura ≥70% (front/back) y Sonar en verde; falla si no.
- Stage 2: E2E deben pasar; si fallan, no hay “deploy verde”.
- Rollback: al fallar Stage 2, no se promueve artefacto; servicios locales se detienen al terminar el job.

## Pipeline CI/CD (GitHub Actions)

- Workflow: `.github/workflows/build.yml`
  - Trigger: `push` a `main` y `pull_request` (opened/synchronize/reopened)
  - Jobs y herramientas integradas:
    - `build_test_front`: Node 20; `npm run test:ci` en `front/` genera `coverage/lcov.info` y aplica `coverageThreshold` global 70% (falla si <70%). Publica artifact `front-coverage`.
    - `build_test_back`: Go 1.22; `make check-cover` genera `cover.out` y falla si cobertura total <70%. Convierte a `cobertura.xml` y publica artifact `back-coverage`.
    - `sonar`: Java 17; ejecuta `SonarSource/sonarqube-scan-action@v6` contra SonarCloud y espera el Quality Gate por API. Si el estado ≠ `OK`, el job falla.
    - `e2e`: levanta backend (Go) y frontend (Next) en background y corre `npx cypress run --headless` en `e2e/`. Publica JUnit, videos y screenshots; el job falla si hay specs fallidas.
- Secrets/variables requeridas:
  - Secrets: `SONAR_TOKEN` (token de SonarCloud)
  - Repository variables: `SONAR_ORG`, `SONAR_PROJECT_KEY`, `SONAR_PROJECT_NAME`
  - En E2E: `FRONTEND_URL` se pasa como env (usa `http://localhost:3000` por defecto).
- Artefactos publicados:
  - Front: `front/coverage/lcov.info`
  - Back: `back/cover.out`, `back/cobertura.xml`
  - E2E: `e2e/cypress/results/*.xml`, `e2e/cypress/videos/**`, `e2e/cypress/screenshots/**`
- Criterios de Quality Gate efectivos (bloquean merge/deploy):
  - Cobertura <70%:
    - Front: Jest falla por `coverageThreshold` → falla `build_test_front`.
    - Back: `make check-cover` retorna código ≠0 → falla `build_test_back`.
  - SonarCloud Quality Gate Failed (issues críticos/Blocker o cobertura insuficiente en Nuevo Código):
    - Paso “Wait for Sonar Quality Gate” hace `exit 1` → falla `sonar`.
  - E2E fallidos:
    - `npx cypress run` retorna código ≠0 → falla `e2e`.
- Fail fast y protección de ramas:
  - Dependencias `needs` hacen que si un job falla no ejecuten los siguientes.
  - Activar Branch Protection en `main` para requerir “SonarCloud Code Analysis” y los checks de `build_test_front`, `build_test_back` y `e2e`.

# Como Correr

- Test Back: `cd back && go test ./...`
- Test Front: `cd front && npm run test:ci`
- Test E2E: `cd e2e && FRONTEND_URL=http://localhost:3000 API_URL=http://localhost:8080 npx cypress run --headless`
- Test Sonar: `cd back && make cover && go tool cover -func=cover.out`

# Docker Image

- docker login

- docker build -t numita/tp-07-back:latest ./back

- docker build -t numita/tp-07-front:latest ./front

- docker push numita/tp-07-back:latest

- docker push numita/tp-07-front:latest
