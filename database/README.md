Описание
-
Папка содержит файлы для для работы с базой данных проекта. Для локальной разработки база данных запускается через `docker build` / `docker run`. 

В продакшене запуск происходит через `docker compose up` с YAML-файлом в корне проекта.


Локальная разработка
-
Все дейсвтия производятся из `database/`
```bash
docker build -t task-manager-db:dev .

docker run -d \
  --name task-manager-db \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 \
  -v dev_postgres_data:/var/lib/postgresql/data \
  task-manager-db:dev
```
Скрипт инициализации `create_tables.sql` смонтирован в образ и запускается автоматически, если dev_postgres_data пуст. POSTGRES_PASSWORD должен быть установлен.


Переменные окружения
- `POSTGRES_USER` — пользователь БД.
- `POSTGRES_PASSWORD` — пароль пользователя.
- `POSTGRES_DB` — имя базы данных.
- `POSTGRES_PORT` — порт внутри контейнера (по умолчанию 5432).
