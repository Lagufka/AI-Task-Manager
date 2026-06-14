Описание
-
Папка содержит файлы для для бэкенда проекта.

Локальная разработка
-
Все дейсвтия производятся из `backend/`.  

Запуск nodemon dev сервера с hot reload. !сервер доступен из всех сетей (`host 0.0.0.0`). При этом способе URL до бэкенда береться из `.env.development` из переменной `VITE_API_URL`
```bash
npm run dev
```
\
Запуск nodemon dev сервера с hot reload внутри докер контейнера и примонтированными файлами из `backend/src`
```bash
docker build --target development -t dev-esoft-practice-backend .

# Для Linux
docker run -d --name dev-esoft-practice-backend \
-p 3333:3333 \
-v $(pwd)/src:/app/src \
-e TASK_ANALYZER_URL=http://host.docker.internal:8000 \
-e POSTGRES_HOST=host.docker.internal \
-e POSTGRES_USER=appuser \
-e POSTGRES_PASSWORD=secret \
-e POSTGRES_DATABASE=appdb \
dev-esoft-practice-backend

# Для PowerShell
docker run -d --name dev-esoft-practice-backend `
-p 3333:3333 `
-v ${pwd}/src:/app/src `
-e TASK_ANALYZER_URL=http://host.docker.internal:8000 `
-e POSTGRES_HOST=host.docker.internal `
-e POSTGRES_USER=appuser `
-e POSTGRES_PASSWORD=secret `
-e POSTGRES_DATABASE=appdb `
dev-esoft-practice-backend
```




Про запуск в продакшене написано в README в корне  проекта.

Переменные окружения
-
- `CHOKIDAR_USEPOLLING` - "true|false". Включение опроса изменений файлов. Нужна для hot reload в докере.

