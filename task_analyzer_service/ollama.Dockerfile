FROM alpine/ollama:0.33.2

WORKDIR /app

COPY ./ollama_startup.sh /scripts/ollama_startup.sh

ENTRYPOINT [ "/bin/sh", "/scripts/ollama_startup.sh" ]