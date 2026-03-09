# PulseSync Monorepo

This repository uses **npm workspaces** and contains:

- `backend` - Node.js + Express API server
- `mobile` - Expo React Native app

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (comes with modern Node.js)

## Setup

1. Install dependencies from the repo root:

   ```bash
   npm install
   ```

2. Create local environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp mobile/.env.example mobile/.env
   ```

3. Update environment values:
   - `backend/.env` contains server secrets and private config.
   - `mobile/.env` must contain only public values (for example `EXPO_PUBLIC_API_URL`).

### Backend environment

Create your backend env file by copying the example:

```bash
cp backend/.env.example backend/.env
```

Then fill in the real secret values in `backend/.env` (OpenAI, Spotify, Supabase, JWT secret).
Never commit `backend/.env` to git.

## Run apps

From the repo root:

- Run backend only:

  ```bash
  npm run dev:backend
  ```

- Run mobile only:

  ```bash
  npm run dev:mobile
  ```

- Run backend and mobile together:

  ```bash
  npm run dev
  ```

Backend health check endpoint:

```bash
http://localhost:4000/health
```
