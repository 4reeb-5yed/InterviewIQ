# Backend image. Build context is the server/ directory.
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install dependencies + the app package (editable needs the package present).
COPY pyproject.toml ./
COPY app ./app
RUN pip install --no-cache-dir -e .

# Migrations and config.
COPY migrations ./migrations
COPY alembic.ini ./

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
