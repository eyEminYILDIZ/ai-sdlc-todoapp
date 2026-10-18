# Agents.webapp.md

Web application specific rules. For the general rules see [../Agents.md](../Agents.md).

## Technology

- React 19 (function components + hooks), TypeScript 5 (`strict: true`)
- HTTP requests with Axios
- Webpack 5 (`ts-loader`, `css-loader`, `style-loader`, `html-webpack-plugin`)

## Folder Structure

```
webapp/src/
├── index.tsx        # Entry point
├── App.tsx          # Root component
├── api_client.ts    # Axios client (single instance)
├── models/          # Types of data coming from the API (index.ts barrel file)
├── global.d.ts      # Global type declarations
└── styles.css
```

As it grows: `components/` (reusable UI), `hooks/` (custom hooks), `services/` (API call functions).

## React + TypeScript Rules

- Use only function components; do not write class components.
- Component files are PascalCase (`TodoItem.tsx`), one main component per file.
- Components are exported with `export default`, other modules with named exports (follow the existing structure).
- Define an `interface` for props (`interface TodoItemProps`); do not use `any`, use `unknown` + narrowing if needed.
- Type props in the parameter instead of using `React.FC`: `function TodoItem({ todo }: TodoItemProps)`.
- Give state types explicitly: `useState<Todo[]>([])`.
- In list renders, use the record `id` as `key`, not the array `index` (`key={todo.id}`).
- Write the `useEffect` dependency array completely; add cleanup (cancellation / unmount check) for async operations.
- Move repeated data fetching / state logic into a custom hook (`useTodos`).
- Do not put derivable data in state; compute it during render.
- Instead of calling Axios directly in a component, extract API functions into a separate module (e.g. `services/todo_service.ts`).
- Show loading and error states to the user; do not settle for only `console.error`.
- Use `styles.css` for styling; inline styles only for dynamic values.

## Models

- Define a type under `src/models/` for every data shape returned by the API and export it through `models/index.ts`.
- Type fields must match the backend JSON one to one (camelCase): `id`, `text`, `done`.
- Import through the barrel: `import { Todo } from "./models";`.
- Use `interface` for types; if the backend model changes, update these types in the same change.

## Axios Client

- All HTTP requests go through the single `ApiClient` instance in [src/api_client.ts](src/api_client.ts); do not import `axios` directly in components.
- Common settings (`baseURL`, `headers`, timeout, interceptors) are kept only in this file.
- `baseURL` should be read from a build-time environment variable (webpack `DefinePlugin`) instead of being hard-coded; the default is `http://localhost:5000`.
- Type the requests: `ApiClient.get<Todo[]>("/todos")`; this way `response.data` is typed.
- Error handling: check with `axios.isAxiosError(error)` and show the user an understandable message.
- When cancellation is needed, pass an `AbortController` signal to the request (`{ signal }`) and cancel on unmount.
- If an interceptor is needed (auth token, global error), add it in `api_client.ts`.
- Endpoint paths must be exactly the same as the backend routes (`/todos`, `/todos/{id}`).

## Code Style

- Naming: components and types PascalCase, variables/functions camelCase; since existing file names (`api_client.ts`) are snake_case, keep that pattern in new util/service files.
- 2-space indentation, double-quoted strings (existing `App.tsx` style).
- Do not use `var`; prefer `const`, use `let` if needed.
- Do not leave unused imports and variables.

## Running and Verification

```bash
cd webapp
npm install
npm start            # webpack dev server
npm run typecheck    # tsc --noEmit — always run after a change
npm run build        # production build
```

- During development the backend (`http://localhost:5000`) must be running.
- Do not consider the work complete until `typecheck` passes without errors.
