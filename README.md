# AI Task Manager

Это полнофункциональный проект для управления задачами с фронтендом на React/Vite, бэкендом на Node.js/Express, базой данных PostgreSQL и сервисом анализа текста задач на FastAPI + Ollama с локальной моделью.

## Архитектура

Проект состоит из следующих сервисов:

- `frontend/` - React-приложение на Vite.
- `backend/` - Express API с JWT-аутентификацией и интеграцией с сервисом анализа задач.
- `database/` - контейнер PostgreSQL с SQL-скриптом инициализации таблиц.
- `task_analyzer_service/` - FastAPI-сервис, который вызывает Ollama и возвращает категорию и приоритет задачи.
- `k8s/` - Helm-чарты и конфигурации для развёртывания приложения через `helmfile`.


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

## Запуск через Helmfile

Для деплоя в Kubernetes и инфраструктурного развёртывания используется Helmfile.

1. Перейдите в каталог `k8s/`.

2. Скопируйте все файлы с суффиксом `.example` в рабочие конфиги, удалив `.example` из имени файла. Например:

```bash
cp configs/backend_values.example.yaml configs/backend_values.yaml
cp configs/database_values.example.yaml configs/database_values.yaml
cp configs/frontend_values.example.yaml configs/frontend_values.yaml
cp configs/ollama_values.example.yaml configs/ollama_values.yaml
cp configs/task_analyzer_values.example.yaml configs/task_analyzer_values.yaml
```

3. Заполните созданные файлы конфигурации актуальными значениями для окружения: параметры базы данных, JWT-секреты, адреса сервисов и настройки Ollama.

4. Запустите развёртывание:

```bash
helmfile apply
```

Файл `k8s/helmfile.yaml` подключает все Helm-чарты из `k8s/charts/` и использует значения из `k8s/configs/*.yaml`.

> Важно: проект не создает Ingress Controller автоматически. Для корректной работы маршрутизации в Kubernetes у вас должен быть установлен и настроен отдельный ingress controller (например, Traefik).

После деплоя приложение разворачивается по сервисам Kubernetes, а frontend доступен через Ingress/хостовые адреса, указанные в `k8s/configs/frontend_values.yaml`.

## Запуск в продакшене

1. Скопируйте и заполните все `.example`-конфиги в `k8s/configs/`, убрав `.example` из имени файла.
2. Проверьте значения для production-среды, особенно секреты, домены и ресурсы.
3. Выполните:

```bash
helmfile apply
```

4. В продакшене фронтенд и бэкенд разворачиваются через Helm-чарты, а маршрутизация и доступность сервисов задаются через конфиги chart values и Ingress. При этом ingress controller должен быть подготовлен отдельно в кластере.

## Сервисы

### `frontend/`

- React 19 + Vite
- Axios для запросов к API
- Работает с HTTP-only cookie для авторизации

Скрипты:

- `npm run dev` - запуск разработки
- `npm run build` - сборка
- `npm run preview` - предпросмотр сборки
- `npm run lint` - проверка ESLint

### `backend/`

- Express 5
- JWT-аутентификация через cookie
- PostgreSQL через `pg`
- Argon2 для хеширования паролей

Скрипты:

- `npm start` - запуск сервера
- `npm run dev` - запуск с `nodemon`

### `database/`

- PostgreSQL контейнер
- Скрипт `create_tables.sql` создаёт таблицы `users` и `tasks`

Таблицы:

- `users` - `id`, `email`, `password_hash`
- `tasks` - `id`, `user_id`, `title`, `description`, `category`, `priority`, `status`, `created_at`

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

- `GET /tasks` - получить список задач пользователя
- `POST /tasks` - создать задачу
  - Тело: `{ "title": string, "description"?: string, "category"?: string, "priority"?: string }`
  - Если `category` или `priority` не указаны, сервис отдает текст задачи в `task_znzlyzer_service` для их предсказания

- `PUT /tasks/:id` - обновить задачу
- `DELETE /tasks/:id` - удалить задачу

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

## Описание основных файлов

### Корень проекта

- `docker-compose-dev.yaml` - локальная Docker-композиция для всех сервисов.
- `docker-compose-prod.yaml` - продакшен-композиция для запуска в Docker.
- `README.md` - этот файл с инструкциями и описанием архитектуры.
- `k8s/` - Helm-чарты и ресурсы для деплоя через `helmfile`.
- `k8s/helmfile.yaml` - описание релизов и зависимостей между сервисами.
- `k8s/configs/*.example.yaml` - шаблоны настроек для Helm values; перед запуском копируются в файлы без `.example`.

### frontend/

- `package.json` - зависимости и npm-скрипты.
- `vite.config.js` - конфигурация Vite.
- `Dockerfile` - сборка фронтенда в образ.
- `Caddyfile` - настройка статического сервера Caddy для продакшена.
- `src/main.jsx` - точка входа приложения.
- `src/App.jsx` - основной React-компонент.
- `src/api/apiClient.js` - Axios-инстанс для запросов к бэкенду.
- `src/components/` - UI-компоненты приложения.

### backend/

- `package.json` - зависимости и скрипты запуска.
- `Dockerfile` - сборка бэкенда в образ.
- `src/index.js` - точка входа сервера Express.
- `src/routes/authRoutes.js` - регистрация, логин и логаут.
- `src/routes/taskRoutes.js` - CRUD задачи и интеграция с анализатором.
- `src/services/data.js` - работа с PostgreSQL и логика хранения данных.
- `src/services/config.js` - чтение конфигурации из переменных окружения.
- `src/middleware/middleware.js` - проверка JWT и защита маршрутов.
- `src/utils/validators.js` - валидация email и паролей.

### database/

- `Dockerfile` - сборка PostgeSQL в образ.
- `create_tables.sql` - инициализация таблиц `users` и `tasks`.

### task_analyzer_service/

- `src/main.py` - FastAPI-сервис анализа задач.
- `requirements.txt` - Python-зависимости сервиса.
- `python.Dockerfile` - Dockerfile для FastAPI-сервиса.
- `ollama.Dockerfile` - Dockerfile для Ollama-модели.
- `docker-compose-dev.yaml` - локальный файл запуска внутри директории.
- `README.md` - документация для сервиса анализа задач.

### k8s/

- `helmfile.yaml` - главный файл с описанием релизов Helm и зависимостей между сервисами.
- `charts/` - директория с Helm-чартами для каждого сервиса: `backend`, `frontend`, `postgres`, `ollama`, `task-analyzer`.
- `charts/backend/` - чарт для API-сервиса: `deployment.yaml`, `service.yaml`, `configmap.yaml`, `secret.yaml`.
- `charts/frontend/` - чарт для Веб-сервера, отдающего статику: `deployment.yaml`, `service.yaml`, `ingress.yaml`.
- `charts/postgres/` - чарт для PostgreSQL: манифесты StatefulSet, Service, Secrets, PV.
- `charts/ollama/` - чарт для Ollama и хранения моделей: `statefulset.yaml`, `service.yaml`, `pv.yaml`.
- `charts/task-analyzer/` - чарт для FastAPI-сервиса анализа задач: `deployment.yaml`, `service.yaml`.
- `configs/` - файлы values для Helm: `backend_values.yaml`, `frontend_values.yaml`, `database_values.yaml`, `ollama_values.yaml`, `task_analyzer_values.yaml` и их `.example`-версии.
- `configs/*.example.yaml` - шаблоны конфигураций, которые следует копировать в рабочие файлы без суффикса `.example` перед запуском.
