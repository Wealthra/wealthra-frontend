# Docker Quick Start Guide

## Quick Commands

### Production Build
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Development Mode
```bash
# Start dev server with hot-reload
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose -f docker-compose.dev.yml down
```

## Configuration

### Setting API URL

**Option 1: Edit docker-compose.yml**
```yaml
build:
  args:
    - VITE_API_URL=http://your-backend-url:8080
```

**Option 2: Use environment variable**
```bash
VITE_API_URL=http://your-backend-url:8080 docker-compose up -d
```

**Option 3: Create .env file**
```env
VITE_API_URL=http://your-backend-url:8080
```

## Access Points

- **Production**: http://localhost:3000
- **Development**: http://localhost:5173

## Troubleshooting

### Port Conflicts
If port 3000 or 5173 is already in use, edit the port mapping:
```yaml
ports:
  - "3001:80"  # Change 3000 to any available port
```

### Rebuild After Changes
```bash
docker-compose build --no-cache
docker-compose up -d
```

### View Container Logs
```bash
docker-compose logs -f frontend
```

### Access Container Shell
```bash
docker-compose exec frontend sh
```

