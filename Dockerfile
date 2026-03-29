FROM oven/bun:1.3 AS build
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
RUN bun install --frozen-lockfile
COPY packages/shared/ packages/shared/
COPY packages/server/ packages/server/
COPY tsconfig.json ./
RUN bun build packages/server/src/index.ts --target=bun --outfile=dist/server.js

FROM oven/bun:1.3-slim
WORKDIR /app
COPY --from=build /app/dist/server.js .
EXPOSE 8080
CMD ["bun", "run", "server.js"]
