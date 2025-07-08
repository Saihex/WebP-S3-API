FROM denoland/deno:latest

# Install native deps needed for sharp
USER root
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# App source
WORKDIR /app
COPY . .

RUN deno install --allow-scripts --allow-import
RUN deno cache src/main.ts --allow-import

CMD ["deno", "task", "run"]
