# Production image for Fly.io. Build: `docker build .`; run: `node build`.
FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
# Keep only runtime dependencies.
RUN npm prune --omit=dev

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./

USER node
EXPOSE 3000
CMD ["node", "build"]
