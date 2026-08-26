# Welcome to UKSRC|e-Merlin Archive UI!

## Runtime Configuration
This application uses server-side runtime configuration, not build-time frontend env injection.

At startup, the server reads required environment variables in runtime.server.ts.
Missing required values fail fast with a clear error.

### Required Environment Variables
SERVICE_HOST_URL
OIDC_SERVER_URL
OIDC_CLIENT_ID
OIDC_AUTH_CALLBACK

### How Config Flows
Environment variables are read on the server in runtime.server.ts.
Public-safe config is exposed by the root loader in root.tsx.
The app reads loader data and builds OIDC config in root.tsx.
Route components receive required runtime values via loader data and props (for example home.tsx passing apiBaseUrl to ArchiveService.tsx).
Shared API helper expects explicit apiBaseUrl in api.ts.
Local Development
Local development uses dotenv preloading from scripts in package.json.

dev script preloads dotenv before starting React Router
start script preloads dotenv before serving built output
Recommended local file: .env

Example values:
SERVICE_HOST_URL=http://localhost:8080/
OIDC_SERVER_URL=https://ska-iam.stfc.ac.uk/
OIDC_CLIENT_ID=your-client-id
OIDC_AUTH_CALLBACK=http://localhost:27981/archive-gui/auth-callback

### Production and Kubernetes
Do not rely on .env files inside containers in production.
Inject variables at runtime using platform environment configuration:

Kubernetes ConfigMap for non-sensitive values
Kubernetes Secret for sensitive values
Deployment env section to wire values into the container process
This enables one image to be promoted across environments with environment-only config changes.

### Troubleshooting
Error: Missing required environment variable: SERVICE_HOST_URL
Cause: SERVICE_HOST_URL not set in runtime environment.
Error: Missing required environment variable: OIDC_*
Cause: one of the required OIDC values is missing.
Error: API base URL is not defined
Cause: apiBaseUrl was not propagated to an API caller.
Tests
Runtime-config validation tests are in runtime.server.test.ts.
These verify:

required keys are enforced
missing keys throw expected errors
only public runtime keys are exposed

# Background

This system is based on React Router, a modern, production-ready template for building full-stack React applications.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:27981`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app

# As this service has a domain suffix, remember to add this to the URL
http://localhost:3000/archive-gui
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

