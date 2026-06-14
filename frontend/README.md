Описание
-
Папка содержит файлы для для фронтенда проекта.

Локальная разработка
-
Все дейсвтия производятся из `frontend/`.  

Запуск dev сервера Vite с hot reload. !сервер доступен из всех сетей (`host 0.0.0.0`). При этом способе URL до бэкенда береться из `.env.development` из переменной `VITE_API_URL`
```bash
npm run dev
```
\
Запуск dev сервера vite с hot reload внутри докер контейнера и примонтированными файлами из `frintend/`
```bash
docker build --target development -t dev-esoft-practice-frontend .

# Для Linux
docker run -d --name dev-esoft-practice-frontend \
-p 5173:5173 \
-v $(pwd):/app \
-v /app/node_modules \
-e CHOKIDAR_USEPOLLING=true \
dev-esoft-practice-frontend

# Для PowerShell
docker run -d --name dev-esoft-practice-frontend `
-p 5173:5173 `
-v ${pwd}:/app `
-v /app/node_modules `
-e CHOKIDAR_USEPOLLING=true `
dev-esoft-practice-frontend
```




Про запуск в продакшене написано в README в корне  проекта.

Переменные окружения
-
- `CHOKIDAR_USEPOLLING` - "true|false". Включение опроса изменений файлов. Нужна для hot reload в докере.

