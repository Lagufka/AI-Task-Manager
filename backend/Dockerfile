FROM node:24-alpine AS base

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

COPY package*.json ./

# =====================================================

FROM base AS development

RUN npm ci

RUN mkdir -p src && chown nodejs:nodejs src

USER nodejs

CMD [ "npm" , "run" , "dev" ]

# =====================================================

FROM base AS production

RUN npm ci --omit=dev && npm cache clean --force;

COPY --chown=nodejs:nodejs ./src ./src

USER nodejs

CMD ["node", "src/index.js"]