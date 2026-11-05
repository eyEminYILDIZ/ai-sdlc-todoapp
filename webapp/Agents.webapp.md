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

## End-to-End Tests and Browser Verification (Playwright)

- E2E tests live in `webapp/e2e/*.spec.ts` and use `@playwright/test` (config: [playwright.config.ts](playwright.config.ts)).
- `npm run e2e` starts the backend (`dotnet run`, port 5000) and the webapp (`npm start`, port 3000) automatically, or reuses them if already running.
- Other commands: `npm run e2e:ui` (interactive UI mode), `npm run e2e:report` (HTML report), `npm run typecheck:e2e` (typecheck the tests).
- One-time browser install: `npx playwright install chromium`.
- Prefer user-facing locators (`getByRole`, `getByText`, `getByLabel`); use `getByTestId` only when needed. Do not use CSS/XPath selectors or fixed `waitForTimeout` sleeps; rely on web-first assertions (`expect(locator).toBeVisible()`).
- Mock the API with `page.route("**/todos", ...)` for UI-state tests (loading, error, empty); use the real backend for integration smoke tests.
- When a UI change is made, add or update an e2e test and run `npm run e2e` together with `npm run typecheck`.

### Playwright MCP

The project-level [.mcp.json](../.mcp.json) registers the `playwright` MCP server (`@playwright/mcp`, headless Chromium, isolated profile, limited to `localhost:3000` and `localhost:5000`).

- Use it to look at the running app (snapshot / click / console / network) before and after a change; start the backend and `npm start` first.
- **Mandatory:** after every development / fix / feature, verify the change in the browser with the Playwright MCP tools (`mcp__playwright__*`) against the running app (backend + `npm start`): open the page, exercise the changed flow (snapshot / click / type), and check the console messages and network requests for errors. Do not consider the work complete until this browser check has passed, in addition to `typecheck` and `npm run e2e`.
- In the final report, state what was checked in the browser and the result. If the MCP tools are unavailable or the app cannot be started, say so explicitly instead of claiming the work is done.
- Use it to explore and reproduce; the repeatable checks must be written as `e2e/*.spec.ts` tests, not left as manual MCP sessions.
- The MCP server bundles its own Playwright version, so it may need a different Chromium than the tests do. If a tool answers `Browser "chrome-for-testing" is not installed`, run `npx @playwright/mcp install-browser chrome-for-testing`.
- MCP output (screenshots, traces) goes to `.playwright-mcp/` and must not be committed.
