# TodoApp

Full-stack todo list: ASP.NET Core minimal API + SQLite (`backend/`) and React + TypeScript + Vite (`frontend/`).

## Run it

Two terminals, both starting in `TodoApp/`:

```sh
# 1. Backend in Docker (http://localhost:5199), with hot reload — needs Docker Desktop running
docker compose up            # Ctrl+C to stop; `docker compose down` removes the container

# 2. Frontend (http://localhost:5173)
cd frontend
npm install                  # first time only
npm run dev
```

Open http://localhost:5173.

The backend runs in a Linux container (see `compose.yaml`) because Windows Smart App Control
blocks locally built .NET apps on this machine. Your code and `backend/app.db` stay on Windows
and are shared into the container, so edit them as usual.

### Without Docker

If Smart App Control is off (or on another machine), run the backend directly instead:

```sh
cd backend                   # must be inside backend/: `Data Source=app.db` is relative
dotnet watch                 # or: dotnet run
```

## How the pieces connect

```
Browser ──► Vite dev server :5173 ──/todos──► backend :5199 ──► SQLite (backend/app.db)
```

- `frontend/vite.config.ts` proxies `/todos` to the API, so the browser sees one origin and no CORS setup is needed.
  Set `API_URL` to point the proxy somewhere else, e.g. `API_URL=http://localhost:5299 npm run dev`.
- `frontend/src/api.ts` is the only file that makes HTTP calls. Its types mirror `Todo` and `TodoInput` in `backend/Models/`.
- `frontend/src/App.tsx` owns the list state; `frontend/src/TodoItem.tsx` renders one row (toggle, inline edit, delete).
- `backend/TodoApi.http` has ready-made requests for every endpoint.
