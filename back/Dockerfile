# syntax=docker/dockerfile:1

FROM golang:1.22-bookworm AS builder
WORKDIR /app

# Pre-cache deps
COPY go.mod ./
# go.sum might not exist locally; allow download to generate
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download || true

COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .

FROM debian:bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/server ./server
ENV DB_DSN=/data/employees.db
VOLUME ["/data"]
EXPOSE 8080
ENTRYPOINT ["/app/server"]


