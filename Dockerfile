FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/tsconfig.json frontend/vite.config.ts frontend/index.html frontend/postcss.config.mjs ./
COPY frontend/default_shadcn_theme.css ./
COPY frontend/src ./src
RUN npx vite build --outDir dist
RUN mkdir -p /out/static && cp -r dist/* /out/static/

FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:resolve -DskipTests -q
COPY backend/src ./backend/src
COPY --from=frontend-build /out/static ./backend/src/main/resources/static
RUN mvn package -DskipTests -Dskip.frontend.build=true -q

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=backend-build --chown=appuser:appgroup /app/target/flowty-*.jar app.jar
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -sf http://localhost:8080/actuator/health || exit 1
EXPOSE 8080
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]