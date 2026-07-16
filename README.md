# Project-Cozy

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

### Quick Start

```bash
docker compose up --build
```

This builds the app image (frontend + backend in a multi-stage Docker build) and starts both the application and a PostgreSQL database. The app will be available at [http://localhost:8080](http://localhost:8080).

The first build will take a few minutes. Subsequent builds are faster due to Docker layer caching.

### Configuration

Set these environment variables before running to override defaults:

| Variable | Default | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db:5432/flowty` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `flowtyuser` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `flowtypass` | DB password |
| `APP_JWT_SECRET` | *(change me)* | JWT signing secret |

The JWT secret should be changed to a strong random value before deploying.

### Run in Detached Mode

```bash
docker compose up --build -d
```

### Stop

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

### Rebuild After Frontend Changes

```bash
docker compose up --build --force-recreate
```

### Health Checks

Both the app (`/actuator/health`) and database (`pg_isready`) have health checks. Use `docker compose ps` to verify service status.

## Development (Without Docker)

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend dev server runs at [http://localhost:5173](http://localhost:5173) and proxies API calls to the backend on port 8080.