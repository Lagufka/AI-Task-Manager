Описание
-
Папка содержит файлы для для работы с ИИ сервисом анализа задач.

Локальная разработка
-
Все дейсвтия производятся из `task_analyzer_service/`
```bash
docker compose -f docker-compose-dev.yaml up -d --build 
```
Запускается 2 контейнеера. Один с ollama, в котором лежит модель, второй python FastAPI, с `/analyze` эндпоинтом для обработки текста задач и отправки его в ollama.

Про запуск в продакшене написано в README в корне  проекта.


Переменные окружения
-
- `ENVIRONMENT` - "development|production". Определяет будет ли hot reload у FastAPI и отключает swagger
- `PORT` - порт FastAPI на хостовой машине
- `OLLAMA_MODEL` - модель которую скачает и запустит ollama

