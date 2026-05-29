FROM python:3.11-slim

WORKDIR /app

# Install AWS CLI v2
RUN apt-get update && apt-get install -y curl unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip -q awscliv2.zip && ./aws/install && \
    rm -rf awscliv2.zip aws/ && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY Backend/requirements.txt /app/Backend/requirements.txt
RUN pip install --no-cache-dir -r /app/Backend/requirements.txt

# Copy application code
COPY Backend/ /app/Backend/

# Create empty Models directory (populated at runtime from S3)
RUN mkdir -p /app/Models

COPY Backend/aws/startup.sh /startup.sh
RUN chmod +x /startup.sh

EXPOSE 8000

ENTRYPOINT ["/startup.sh"]
