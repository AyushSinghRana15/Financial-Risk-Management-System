FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libcurl4-openssl-dev \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY Backend/ ./Backend/
COPY Models/ ./Models/

EXPOSE 7860

CMD ["uvicorn", "Backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
