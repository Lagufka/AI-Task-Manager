import json
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    warmup_text = "Привет! Это тестовый запрос для прогрева модели. Пожалуйста, проанализируй этот текст и верни приоритет и категорию задачи в формате JSON."
    
    try:
        await analyze(TextInput(text=warmup_text))
    except Exception as exc:
        print("Model warmup failed:", exc)
    yield

app = FastAPI(lifespan=lifespan)


ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
if ENVIRONMENT == "development": print("Running in development mode")

OLLAMA_URL = (
    os.environ.get("OLLAMA_HOST", "http://host.docker.internal:11434") + "/api/generate"
)
MODEL_NAME = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")

BASE_PROMPT = """
Ты — сервис классификации задач. Твоя задача — проанализировать текст и вернуть ТОЛЬКО JSON без пояснений.
JSON должен содержать ТОЛЬКО следующие поля:
1. priority: "high" (срочно/важно), "medium" (обычное), "low" (не срочно).
2. category: *Одна категория из списка*

Категории и их описание:

1. business — всё, что связано с профессиональной деятельностью: задачи по проектам, встречи, дедлайны, отчёты, переписка с коллегами, выполнение служебных обязанностей, карьерный рост.

2. personal — дела, касающиеся личной жизни, семьи, друзей, отношений, хобби, саморазвития вне работы, домашние обязанности, встречи с близкими.

3. health — всё, что относится к физическому и психическому здоровью: визиты к врачу, спорт, питание, сон, приём лекарств, самочувствие, ментальное благополучие.

4. education — получение знаний: курсы, лекции, домашние задания, экзамены, изучение языков, чтение профессиональной или научной литературы, подготовка к сертификациям.

5. travel — поездки, командировки, отпуск: бронирование билетов и отелей, сбор чемодана, маршруты, визы, список мест для посещения.

6. ideas — творческие или нестандартные мысли: предложения для проектов, концепции, инсайты, мысли для блога, изобретения, планы на будущее в свободной форме.

7. other — всё, что не попадает в остальные категории. Используй этот вариант, только если ни одна из категорий явно не подходит.

Входной текст:
{text}
"""
TASK_PRIORITIES = ["high", "medium", "low"]
TASK_CATEGORIES = [
    "business",
    "personal",
    "health",
    "education",
    "travel",
    "ideas",
    "other"
]


### Схемы данных ###

class TextInput(BaseModel):
    text: str


class AnalysisOutput(BaseModel):
    priority: str
    category: str


### Endpoints ###

@app.post("/analyze", response_model=AnalysisOutput)
async def analyze(input_data: TextInput):
    prompt = BASE_PROMPT.format(text=input_data.text)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"num_predict": 100},
            },
            timeout=60.0,
        )

    model_answer = response.json()["response"]
    if model_answer == "":
        model_answer = response.json()["thinking"]

    try:
        model_answer = model_answer.strip().replace("```json", "").replace("```", "")
        answer_json = json.loads(model_answer)

        if answer_json["priority"] not in TASK_PRIORITIES:
            answer_json["priority"] = "medium"
        if answer_json["category"] not in TASK_CATEGORIES:
            answer_json["category"] = "other"

        return answer_json
    except json.JSONDecodeError:  # Модель вернула не json
        return {"priority": "medium", "category": "other"}



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=(ENVIRONMENT=="development"))