FROM ollama/ollama:0.30.6

WORKDIR /app

COPY ./ollama_startup.sh /scripts/ollama_startup.sh

ENTRYPOINT [ "/bin/bash", "/scripts/ollama_startup.sh" ]