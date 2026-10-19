var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<TodoApp.Services.TodoService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors();

app.MapGet("/todos", (TodoApp.Services.TodoService todoservice) =>
{
    var todos = todoservice.GetTodos();
    return todos;
})
.WithName("GetTodos");

app.Run();

// Exposes the entry point to WebApplicationFactory in the test project.
public partial class Program { }
