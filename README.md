# AI Task Manager

Это полнофункциональный проект для управления задачами с фронтендом на React/Vite, бэкендом на Node.js/Express, базой данных PostgreSQL и сервисом анализа текста задач на FastAPI + Ollama с локальной моделью.

## Архитектура

Проект состоит из следующих сервисов:

- `frontend/` - React-приложение на Vite.
- `backend/` - Express API с JWT-аутентификацией и интеграцией с сервисом анализа задач.
- `database/` - контейнер PostgreSQL с SQL-скриптом инициализации таблиц.
- `task_analyzer_service/` - FastAPI-сервис, который вызывает Ollama и возвращает категорию и приоритет задачи.

## Что делает проект

- Пользователь регистрируется и входит в систему.
- Пользователь создаёт, редактирует, удаляет и получает свои задачи.
- Если категория или приоритет задачи не указаны при создании, бэкенд запрашивает их у сервиса `task_analyzer_service`. Анализируется текст задачи и возвращается JSON с полями `priority` и `category`.

## Быстрый запуск (локальная разработка)

1. Переименуйте или скопируйте `.env.example` в `.env.dev` и заполните своими данными

2. Запустите из корня проекта:

```bash
docker compose -f docker-compose-dev.yaml --env-file .env.dev up -d --build
```

3. Доступы (Порты хоста можно указать в `.env.dev` файле):

- Фронтенд: `http://localhost:5173`
- Бэкенд: `http://localhost:3333`
- Анализатор задач: `http://localhost:3000/analyze`
- PostgreSQL: `localhost:5432`


Так же каждый сервис можно запустить отдельно, про это можно прочитать в README файле в директориях сервисов.


## Запуск в продакшене

1. Создайте `.env.prod` с нужными значениями для базы данных, JWT и модели.
2. Запустите:

```bash
docker compose -f docker-compose-prod.yaml --env-file .env.prod up -d --build
```

3. В продакшене фронтенд запускается в контейнере Caddy, который отдает билд статику React и производит reverse proxy на бэкенд. Он доступен на `http://localhost` (порт 80), который автоматически редиректит на `https`.

## Сервисы

### `frontend/`

- React 19 + Vite
- Axios для запросов к API
- Работает с HTTP-only cookie для авторизации

Скрипты:

- `npm run dev` — запуск разработки
- `npm run build` — сборка
- `npm run preview` — предпросмотр сборки
- `npm run lint` — проверка ESLint

### `backend/`

- Express 5
- JWT-аутентификация через cookie
- PostgreSQL через `pg`
- Argon2 для хеширования паролей

Скрипты:

- `npm start` — запуск сервера
- `npm run dev` — запуск с `nodemon`

### `database/`

- PostgreSQL контейнер
- Скрипт `create_tables.sql` создаёт таблицы `users` и `tasks`

Таблицы:

- `users` — `id`, `email`, `password_hash`
- `tasks` — `id`, `user_id`, `title`, `description`, `category`, `priority`, `status`, `created_at`

### `task_analyzer_service/`

- FastAPI + Uvicorn
- Вызов Ollama API для анализа текста задач
- Возвращает JSON с полями:
  - `priority`: `high`, `medium`, `low`
  - `category`: `business`, `personal`, `health`, `education`, `travel`, `ideas`, `other`

В режиме разработки доступны `/docs` и `/redoc`.

## API бэкенда

### Аутентификация

- `POST /auth/register`
  - Тело: `{ "email": string, "password": string }`
  - Регистрирует пользователя и выставляет cookie `token`

- `POST /auth/login`
  - Тело: `{ "email": string, "password": string }`
  - Устанавливает cookie `token`

- `POST /auth/logout`
  - Удаляет cookie `token`

### Задачи

- `GET /tasks` — получить список задач пользователя
- `POST /tasks` — создать задачу
  - Тело: `{ "title": string, "description"?: string, "category"?: string, "priority"?: string }`
  - Если `category` или `priority` не указаны, сервис отдает текст задачи в `task_znzlyzer_service` для их предсказания

- `PUT /tasks/:id` — обновить задачу
- `DELETE /tasks/:id` — удалить задачу

Все маршруты `/tasks` требуют авторизации через JWT cookie.

## Анализ задач

Анализатор принимает POST-запрос на `/analyze` с телом:

```json
{ "text": "..." }
```

И возвращает:

```json
{ "priority": "medium", "category": "business" }
```

Если анализатор недоступен или модель возвращает некорректный JSON, бэкенд по умолчанию использует `priority = medium` и `category = other`.
