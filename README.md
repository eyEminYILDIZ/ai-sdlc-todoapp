# ai-sdlc-todoapp

A simple todo application built as an example of an AI-assisted software development lifecycle (SDLC). Humans and an AI agent work together on the same codebase, coordinated through a GitHub Project board.

- Repository: <https://github.com/eyEminYILDIZ/ai-sdlc-todoapp>
- Project board: <https://github.com/users/eyEminYILDIZ/projects/2>

## Project Structure

| Folder     | Description                                          |
|------------|------------------------------------------------------|
| `backend/` | ASP.NET Core (.NET 10) Minimal API                   |
| `webapp/`  | React + TypeScript web application (built by webpack) |

The web application fetches todos from the backend over JSON. Field names are camelCase (`id`, `text`, `done`).

## Backend

- .NET 10, ASP.NET Core Minimal API
- OpenAPI document served at `/openapi/v1.json` (Development only)
- Todos are kept in memory, there is no database
- CORS currently allows any origin

Run it:

```bash
cd backend
dotnet build
dotnet run
```

The API listens on `http://localhost:5000`.

### Endpoints

| Method | Route    | Description        |
|--------|----------|--------------------|
| GET    | `/todos` | List all todos     |

Manual requests are available in [backend/webapi.http](backend/webapi.http).

## Web App

- React 19 (function components and hooks)
- TypeScript 5 (`strict` mode)
- Axios for HTTP requests
- Webpack 5

Run it (the backend must be running on `http://localhost:5000`):

```bash
cd webapp
npm install
npm start            # webpack dev server
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

## Development Workflow

- Rules for contributors and AI agents are in [Agents.md](Agents.md), with sub-project rules in [backend/Agents.backend.md](backend/Agents.backend.md) and [webapp/Agents.webapp.md](webapp/Agents.webapp.md).
- Work is tracked on the GitHub Project board and done on feature branches (`feature/<short-description>`) that are merged into `main` through pull requests.
