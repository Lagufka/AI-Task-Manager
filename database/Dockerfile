FROM postgres:15-alpine

ENV POSTGRES_DB=app_db \
    POSTGRES_USER=app_user \
    POSTGRES_PASSWORD=app_password

COPY create_tables.sql /docker-entrypoint-initdb.d/

RUN chmod 755 /docker-entrypoint-initdb.d/create_tables.sql
