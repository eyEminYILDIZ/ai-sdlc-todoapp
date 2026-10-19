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
            new Todo { Id = 1, Text = "Sample Todo", Done = false }
        });
    }

    [Fact]
    public void GetTodos_ReturnsSeedTodo()
    {
        var todos = _service.GetTodos();

        var todo = Assert.Single(todos);
        Assert.Equal(1, todo.Id);
        Assert.Equal("Sample Todo", todo.Text);
        Assert.False(todo.Done);
    }

    [Fact]
    public void AddTodo_AssignsNextIdAndAppends()
    {
        var todo = new Todo { Id = 99, Text = "New", Done = true };

        _service.AddTodo(todo);

        Assert.Equal(2, todo.Id);
        var todos = _service.GetTodos();
        Assert.Equal(2, todos.Count);
        Assert.Same(todo, todos[1]);
    }

    [Fact]
    public void AddTodo_MultipleTimes_AssignsIncrementingIds()
    {
        var first = new Todo { Text = "A" };
        var second = new Todo { Text = "B" };

        _service.AddTodo(first);
        _service.AddTodo(second);

        Assert.Equal(2, first.Id);
        Assert.Equal(3, second.Id);
    }

    [Fact]
    public void UpdateTodo_ExistingId_UpdatesTextAndDone()
    {
        _service.UpdateTodo(new Todo { Id = 1, Text = "Updated", Done = true });

        var todo = Assert.Single(_service.GetTodos());
        Assert.Equal("Updated", todo.Text);
        Assert.True(todo.Done);
    }

    [Fact]
    public void UpdateTodo_UnknownId_DoesNothing()
    {
        _service.UpdateTodo(new Todo { Id = 42, Text = "Ghost", Done = true });

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
        _service.RemoveTodo(new Todo { Id = 1, Text = "Sample Todo", Done = false });

        Assert.Single(_service.GetTodos());
    }
}
