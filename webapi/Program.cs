var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<TodoApp.Services.TodoService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/todos", (TodoApp.Services.TodoService todoservice) =>
{
    var todos = todoservice.GetTodos();
    return todos;
})
.WithName("GetTodos");

app.Run();
