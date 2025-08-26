#!/bin/bash

echo "🚨 Emergency Docker cleanup for low disk space..."

# Quick cleanup commands
docker system prune -a -f --volumes
docker builder prune -a -f

echo "✅ Quick cleanup completed!"
df -h /