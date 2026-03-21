# Connection Trails

Vite/React app for the Connection Trail voting flow.

## Environment

Create a local `.env` file before running the app:

```bash
cp .env.example .env
```

Required variables:

- `VITE_VOTE_API_URL`: absolute URL for the vote counts and vote submission endpoint.

If the variable is missing or invalid, the app falls back to bundled counts and saves votes locally until sync can be retried.
