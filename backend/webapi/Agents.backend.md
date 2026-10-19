# Agents.backend.md

Backend specific rules. For the general rules see [../Agents.md](../Agents.md).

## Technology

- .NET 10, ASP.NET Core **Minimal API** (controllers are not used)
- OpenAPI: `Microsoft.AspNetCore.OpenApi` (`AddOpenApi` / `MapOpenApi`, Development only)
- Project file: `webapi.csproj` (`Nullable` disabled, `ImplicitUsings` enabled)
- Data is currently kept in memory; there is no database.

## Folder Structure

```
backend/
├── Program.cs          # DI registrations, middleware, endpoint definitions
├── Models/             # Data models / DTOs (namespace TodoApp.Models)
├── Services/           # Business logic (namespace TodoApp.Services)
├── appsettings.json
└── webapi.http         # Manual endpoint tests
```

If the endpoint group grows, create an `Endpoints/` folder and split it out of
`Program.cs` with an extension method (`app.MapTodoEndpoints()`).

## Minimal API Rules

- Endpoints are defined in `Program.cs` (or an extension method) with `app.MapGet/MapPost/MapPut/MapDelete`.
- Give every endpoint `.WithName("...")`; the name follows the `<Verb><Resource>` format (`GetTodos`, `CreateTodo`).
- Routes are plural and lowercase: `/todos`, `/todos/{id}`.
- Services are received as endpoint parameters through DI; do not create them with `new`.
- Return the correct HTTP status codes with `Results` / `TypedResults`:
  `200 Ok`, `201 Created`, `204 NoContent`, `400 BadRequest`, `404 NotFound`.
- Do not write business logic in endpoints; only take the request, call the service and return the result.
- Input validation is done at the endpoint level (e.g. `400` for an empty `Text`).
- When needed, enrich the OpenAPI documentation with `.WithTags("Todos")` and `.Produces<T>()`.

## Models

- Namespace: `TodoApp.Models`; the file name is the same as the class name (`Todo.cs`).
- Properties are PascalCase; they are serialized to JSON as camelCase (ASP.NET Core default).
- If the request/response needs a different shape than the entity, create a separate DTO (such as `CreateTodoRequest`); do not accept fields like `Id` from the client.
- For simple data carriers `record` can be preferred; do not break consistency with the existing `Todo` class.

## Services

- Namespace: `TodoApp.Services`; the class name is `<Resource>Service`.
- Registered in DI in `Program.cs` (`AddSingleton` / `AddScoped`). A stateful in-memory service is a Singleton.
- All business logic and data access live in services.
- The in-memory list is accessed from multiple requests, so take care of thread-safety (`lock` or `ConcurrentDictionary`).
- Do not use `_todos.Count + 1` for id generation (it collides after a delete); use an incrementing counter.
- For a record that is not found, return `bool` / `null` instead of silently passing, so that the endpoint can return `404`.
- Service code must not depend on `HttpContext`.
- If a database is introduced, extract a service interface (`ITodoService`) and add a repository layer.

## CORS

- Currently `AllowAnyOrigin` (for development convenience). Before going to production, restrict it to the webapp origin only (e.g. `http://localhost:3000`).
- Middleware order: `UseHttpsRedirection` → `UseCors` → endpoints.

## Code Style

- Standard C# naming: types/methods PascalCase, private fields `_camelCase`, parameters camelCase.
- One type per file; the `namespace` is file-scoped (`namespace X;`).
- If async I/O is added, method names end with `Async` and accept a `CancellationToken`.
- Remove unused `using`s.

## Running and Verification

```bash
cd backend
dotnet build          # build
dotnet run            # start the API
```

- Test endpoints with `webapi.http`; when you add a new endpoint, add a sample request there.
- In Development the OpenAPI document is published at `/openapi/v1.json`.
- The webapp expects `http://localhost:5000`; if the port changes, `webapp/src/api_client.ts` must be updated as well.
