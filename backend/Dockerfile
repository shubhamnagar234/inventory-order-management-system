FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (caching optimization)
COPY requirements.txt .
RUN apt-get update && apt-get install -y gcc libc-dev && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port Uvicorn runs on
EXPOSE 8000

# Command to run the server using Railway's dynamic port (defaults to 8000 locally)
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"