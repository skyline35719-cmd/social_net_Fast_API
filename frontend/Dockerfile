# ==================== STAGE 1: Сборка приложения ====================
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей (для кэширования слоёв)
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY . .

# Собираем production-сборку
RUN npm run build

# ==================== STAGE 2: Раздача через Nginx ====================
FROM nginx:alpine AS runner

# Удаляем дефолтный конфиг Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем наш конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный билд из первого этапа
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]