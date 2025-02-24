# Use Python 3.11 (or any preferred version)
FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies directly (without virtual environment)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app files
COPY . .

# Expose port 8000
EXPOSE 8000

# Start FastAPI using uvicorn with hot reloading
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
