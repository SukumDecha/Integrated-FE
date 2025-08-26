#!/bin/bash

echo "🧹 Starting Docker cleanup to free disk space..."

# Stop all running containers
echo "Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove all stopped containers
echo "Removing stopped containers..."
docker container prune -f

# Remove unused images
echo "Removing unused images..."
docker image prune -a -f

# Remove unused volumes
echo "Removing unused volumes..."
docker volume prune -f

# Remove unused networks
echo "Removing unused networks..."
docker network prune -f

# Remove build cache
echo "Removing build cache..."
docker builder prune -a -f

# Clean up system (all unused Docker objects)
echo "Final system cleanup..."
docker system prune -a -f --volumes

echo "✅ Docker cleanup completed!"

# Show disk space after cleanup
echo "📊 Current disk usage:"
df -h /