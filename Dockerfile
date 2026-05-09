
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules


RUN npm install -g pnpm
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000



CMD ["node", "dist/index.js"]