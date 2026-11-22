FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
ENV NODE_ENV=production
ENV SESSIONS_DIR=/data/sessions
CMD ["node", "server.js"]