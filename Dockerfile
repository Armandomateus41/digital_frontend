# Stage 1: build frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY frontend ./frontend
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate \
  && pnpm -C frontend install --frozen-lockfile || pnpm -C frontend install \
  && pnpm -C frontend build

# Stage 2: build server
FROM node:20-alpine AS build-server
WORKDIR /app
COPY server ./server
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate \
  && pnpm -C server install --frozen-lockfile || pnpm -C server install \
  && pnpm -C server build

# Stage 3: runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-frontend /app/frontend/dist ./frontend/dist
COPY --from=build-server /app/server/dist ./server/dist
COPY server/package.json ./server/package.json
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate \
  && pnpm -C server install --prod --no-optional

EXPOSE 8787
CMD ["node", "server/dist/index.js"]


