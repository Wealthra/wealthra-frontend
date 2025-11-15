# Wealthra

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Docker Setup

This project includes Docker configuration for both development and production environments.

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Production Build with Docker

Build and run the production-ready container:

```sh
# Build and start the container
docker-compose up -d

# Or build first, then run
docker-compose build
docker-compose up -d
```

The application will be available at `http://localhost:3000`

To stop the container:

```sh
docker-compose down
```

### Development Mode with Docker

For development with hot-reload:

```sh
# Start development container
docker-compose -f docker-compose.dev.yml up

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

The development server will be available at `http://localhost:5173`

### Environment Variables

You can configure the API URL using environment variables:

**For Production (docker-compose.yml):**
```yaml
environment:
  - VITE_API_URL=http://your-backend-url:8080
```

**For Development (docker-compose.dev.yml):**
```yaml
environment:
  - VITE_API_URL=http://localhost:8080
```

Or create a `.env` file:
```env
VITE_API_URL=http://localhost:8080
```

### Docker Commands

```sh
# View logs
docker-compose logs -f frontend

# Rebuild without cache
docker-compose build --no-cache

# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# View running containers
docker ps

# Execute commands in container
docker-compose exec frontend sh
```

### Building Docker Image Manually

```sh
# Build the image
docker build -t wealthra-frontend .

# Run the container
docker run -p 3000:80 -e VITE_API_URL=http://localhost:8080 wealthra-frontend
```

### Troubleshooting

**Port already in use:**
- Change the port mapping in `docker-compose.yml`: `"3001:80"` instead of `"3000:80"`

**API connection issues:**
- Ensure your backend API is running and accessible
- Update `VITE_API_URL` environment variable to match your backend URL
- If backend is in another Docker container, use the service name instead of `localhost`

**Build fails:**
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`
