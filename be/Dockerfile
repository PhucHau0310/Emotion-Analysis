FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to /app/src instead of /app
WORKDIR /app/src

# Copy requirements first for better caching
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the entire project
COPY . /app/

EXPOSE 8000

# Run uvicorn from the src directory
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]