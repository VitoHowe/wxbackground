# ===================================
# Stage 1: Builder - build Next.js standalone output
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

# ===================================
# Stage 2: Production - runtime
# ===================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3007

# Next standalone server contains the minimal runtime dependencies.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R node:node /app
USER node

EXPOSE 3007

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3007/api/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
