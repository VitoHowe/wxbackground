# ===================================
# Stage 1: Builder - build Next.js
# ===================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Disable Next telemetry in CI/build.
ENV NEXT_TELEMETRY_DISABLED=1

# pnpm-lock.yaml uses lockfileVersion 9.x.
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* values used by client code are baked at build time.
ARG NEXT_PUBLIC_API_BASE_URL=https://wxnode.mayday.qzz.io/api
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN pnpm build

# Keep only production dependencies for runtime.
# NOTE: `pnpm prune --prod` may re-run lifecycle scripts (e.g. `prepare`).
# This project has `prepare: husky install` but husky is a devDependency,
# so pruning first can make `husky` unavailable and fail the build.
RUN pnpm prune --prod --ignore-scripts

# ===================================
# Stage 2: Production - runtime
# ===================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3007

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN chown -R node:node /app
USER node

EXPOSE 3007

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3007/api/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node_modules/.bin/next", "start", "-p", "3007"]
