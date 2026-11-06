using System.Reflection;
using TodoApp.Models;
using TodoApp.Services;

namespace webapi.tests;

[Collection("TodoState")]
public class TodoServiceTests
{
    private readonly TodoService _service = new();

    // TodoService keeps its state in a static list, so reset it to the seed data for every test.
    public TodoServiceTests()
    {
        var field = typeof(TodoService).GetField("_todos", BindingFlags.NonPublic | BindingFlags.Static)!;
        field.SetValue(null, new List<Todo>
        {
            new Todo { Id = TodoService.SeedTodoId, Text = "Sample Todo", Done = false }
        });
    }

    [Fact]
    public void GetTodos_ReturnsSeedTodo()
    {
        var todos = _service.GetTodos();

        var todo = Assert.Single(todos);
        Assert.Equal(TodoService.SeedTodoId, todo.Id);
        Assert.Equal("Sample Todo", todo.Text);
        Assert.False(todo.Done);
    }

    [Fact]
    public void AddTodo_AssignsNewGuidAndAppends()
    {
        var clientId = Guid.NewGuid();
        var todo = new Todo { Id = clientId, Text = "New", Done = true };

        _service.AddTodo(todo);

        Assert.NotEqual(Guid.Empty, todo.Id);
        Assert.NotEqual(clientId, todo.Id);
        var todos = _service.GetTodos();
        Assert.Equal(2, todos.Count);
        Assert.Same(todo, todos[1]);
    }

    [Fact]
    public void AddTodo_MultipleTimes_AssignsDistinctIds()
    {
        var first = new Todo { Text = "A" };
        var second = new Todo { Text = "B" };

        _service.AddTodo(first);
        _service.AddTodo(second);

        Assert.NotEqual(Guid.Empty, first.Id);
        Assert.NotEqual(Guid.Empty, second.Id);
        Assert.NotEqual(first.Id, second.Id);
        Assert.NotEqual(TodoService.SeedTodoId, first.Id);
    }

    [Fact]
    public void UpdateTodo_ExistingId_UpdatesTextAndDone()
    {
        _service.UpdateTodo(new Todo { Id = TodoService.SeedTodoId, Text = "Updated", Done = true });

        var todo = Assert.Single(_service.GetTodos());
        Assert.Equal("Updated", todo.Text);
        Assert.True(todo.Done);
    }

    [Fact]
    public void UpdateTodo_UnknownId_DoesNothing()
    {
        _service.UpdateTodo(new Todo { Id = Guid.NewGuid(), Text = "Ghost", Done = true });

        var todo = Assert.Single(_service.GetTodos());
        Assert.Equal("Sample Todo", todo.Text);
        Assert.False(todo.Done);
    }

    [Fact]
    public void RemoveTodo_ExistingTodo_RemovesIt()
    {
        var existing = _service.GetTodos()[0];

        _service.RemoveTodo(existing);

        Assert.Empty(_service.GetTodos());
    }

    [Fact]
    public void RemoveTodo_UnknownTodo_DoesNothing()
    {
        // Removal is by reference, so an equal-looking but different instance is not removed.
        _service.RemoveTodo(new Todo { Id = TodoService.SeedTodoId, Text = "Sample Todo", Done = false });

        Assert.Single(_service.GetTodos());
    }
}
