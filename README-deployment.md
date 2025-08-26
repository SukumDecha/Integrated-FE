# Deployment Scripts for Disk Space Management

## Scripts Overview

### 1. `deploy.sh` - Smart Deployment

Automatically checks disk space before deployment and runs cleanup if needed.

```bash
./deploy.sh
```

### 2. `docker-cleanup.sh` - Full Cleanup

Comprehensive Docker cleanup to free maximum disk space:

- Stops all containers
- Removes unused images, volumes, networks
- Clears build cache

```bash
./docker-cleanup.sh
```

### 3. `quick-cleanup.sh` - Emergency Cleanup

Fast cleanup for critical low disk space situations.

```bash
./quick-cleanup.sh
```

## Manual Commands

### Check disk space

```bash
df -h /
```

### Quick Docker cleanup

```bash
docker system prune -a -f --volumes
```

### Remove specific items

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Clear build cache
docker builder prune -a -f
```

## Deployment Process

1. **Recommended**: Use the smart deployment script

   ```bash
   ./deploy.sh
   ```

2. **Manual**: Traditional deployment

   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

3. **Emergency**: If deployment fails due to space

   ```bash
   ./quick-cleanup.sh
   ./deploy.sh
   ```
