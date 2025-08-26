#!/bin/bash

echo "🚀 Starting deployment with disk space management..."

# Function to check disk space (returns percentage used)
check_disk_space() {
    df / | tail -1 | awk '{print $5}' | sed 's/%//'
}

# Function to get available space in GB
get_available_space() {
    df -BG / | tail -1 | awk '{print $4}' | sed 's/G//'
}

# Check initial disk space
DISK_USAGE=$(check_disk_space)
AVAILABLE_SPACE=$(get_available_space)

echo "📊 Current disk usage: ${DISK_USAGE}%"
echo "💾 Available space: ${AVAILABLE_SPACE}GB"

# If disk usage is over 80% or available space is less than 2GB, run cleanup
if [ "$DISK_USAGE" -gt 80 ] || [ "$AVAILABLE_SPACE" -lt 2 ]; then
    echo "⚠️  Low disk space detected! Running cleanup..."
    ./docker-cleanup.sh
    
    # Check space after cleanup
    DISK_USAGE_AFTER=$(check_disk_space)
    AVAILABLE_SPACE_AFTER=$(get_available_space)
    echo "📊 Disk usage after cleanup: ${DISK_USAGE_AFTER}%"
    echo "💾 Available space after cleanup: ${AVAILABLE_SPACE_AFTER}GB"
    
    # If still not enough space, exit
    if [ "$DISK_USAGE_AFTER" -gt 90 ] || [ "$AVAILABLE_SPACE_AFTER" -lt 1 ]; then
        echo "❌ Still not enough disk space for deployment!"
        echo "Please manually free up more space or contact system administrator"
        exit 1
    fi
else
    echo "✅ Sufficient disk space available"
fi

echo "🛑 Stopping existing containers..."
docker-compose down

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🏗️  Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🔍 Checking service status..."
docker-compose ps

echo "📊 Final disk usage:"
df -h /

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost/itb-mshop"
echo "🗄️  Database: localhost:3306"