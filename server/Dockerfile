FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
# Yüklenen dosyalar (FR-13): kalıcı birim olarak bağlanır, yalnız node kullanıcısı yazar
RUN mkdir -p /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]
