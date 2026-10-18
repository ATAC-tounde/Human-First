FROM node:22-alpine
ENV NODE_ENV=production PORT=4173 HOST=0.0.0.0
WORKDIR /app
COPY package.json ./
COPY public/ ./public/
COPY server/ ./server/
USER node
EXPOSE 4173
CMD ["node", "server/index.mjs"]
