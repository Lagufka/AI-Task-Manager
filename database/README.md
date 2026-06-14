Описание
-
Папка содержит файлы для для работы с базой данных проекта. Для локальной разработки база данных запускается через `docker build` / `docker run`. 


Про запуск в продакшене написано в README в корне  проекта.


Локальная разработка
-
Все дейсвтия производятся из `database/`
```bash
docker build -t dev-esoft-practice-postgres .

docker run -d --name dev-esoft-practice-postgres -e POSTGRES_USER=appuser -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=appdb -p 5432:5432 -v dev_postgres_data:/var/lib/postgresql/data dev-esoft-practice-postgres
```
Скрипт инициализации `create_tables.sql` смонтирован в образ и запускается автоматически, если dev_postgres_data пуст.


Переменные окружения
-
- `POSTGRES_USER` - пользователь БД.
- `POSTGRES_PASSWORD` - пароль пользователя.
- `POSTGRES_DB` - имя базы данных.
Переменные влияют только на новую БД с пустым(или отсутствующим) volume