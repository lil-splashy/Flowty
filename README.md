# Flowty - Productivity Workspace

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

### Download and Run the Pre-built Container Image

The easiest way to run Flowty is to download and run the published container image from the GitHub Container Registry. This skips building the image locally.

1. Create a `docker-compose.yml` file:

   ```yaml
   services:
     app:
       image: ghcr.io/lil-splashy/flowty:latest
       ports:
         - "8080:8080"
       environment:
         - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/flowty
         - SPRING_DATASOURCE_USERNAME=flowtyuser
         - SPRING_DATASOURCE_PASSWORD=flowtypass
         - APP_JWT_SECRET=change-this-to-a-strong-random-secret-at-least-256-bits
       depends_on:
         db:
           condition: service_healthy
       healthcheck:
         test: ["CMD", "curl", "-sf", "http://localhost:8080/actuator/health"]
         interval: 30s
         timeout: 3s
         retries: 3

     db:
       image: postgres:16-alpine
       environment:
         - POSTGRES_DB=flowty
         - POSTGRES_USER=flowtyuser
         - POSTGRES_PASSWORD=flowtypass
       volumes:
         - pgdata:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U flowtyuser -d flowty"]
         interval: 5s
         timeout: 3s
         retries: 5

   volumes:
     pgdata:
   ```

2. Start the application:

   ```bash
   docker compose up -d
   ```

3. Open the app at [http://localhost:8080](http://localhost:8080).

If you see an authentication error pulling the image, make sure you are logged in to the GitHub Container Registry:

```bash
docker login ghcr.io
```

> **Note:** The first start downloads the image and may take a few minutes depending on your connection. Subsequent starts are fast because the image is cached locally.

### Build and Run Locally from Source

If you prefer to build the image yourself instead of downloading it, run:

```bash
docker compose up --build
```

This builds the app image from the local `Dockerfile` and starts both the application and a PostgreSQL database. The app will be available at [http://localhost:8080](http://localhost:8080).

The first build will take a few minutes. Subsequent builds are faster due to Docker layer caching.

### Configuration

Set these environment variables before running to override defaults:

| Variable | Default | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring profile |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db:5432/flowty` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `flowtyuser` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `flowtypass` | DB password |

The JWT secret should be changed to a strong random value before deploying.

### Use a Specific Image Tag

Replace `latest` in the compose file with a specific release tag (for example, `ghcr.io/lil-splashy/flowty:v1.0.0`) to pin the version you run.

### Run in Detached Mode

When running the downloaded image:

```bash
docker compose up -d
```

When building from source:

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
