#!/bin/bash

set -e

ollama serve &
SERVER_PID=$!

echo "Ожидание запуска Ollama сервера..."
until ollama list > /dev/null 2>&1; do
  sleep 2
done

MODEL_NAME="${OLLAMA_MODEL:-qwen3:4b}"
echo "Скачивание модели: $MODEL_NAME..."
ollama pull "$MODEL_NAME"

echo "Сервер принимает запросы на http://0.0.0.0:11434"

wait $SERVER_PID