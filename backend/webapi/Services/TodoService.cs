namespace TodoApp.Services;

using TodoApp.Models;
using System.Collections.Generic;

public class TodoService
{
    // Well-known id of the seed todo, so tests and manual requests can refer to it.
    public static readonly Guid SeedTodoId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    private static List<Todo> _todos = new List<Todo>()
    {
        new Todo { Id = SeedTodoId, Text = "Sample Todo", Done = false }
    };

    public List<Todo> GetTodos()
    {
        return _todos;
    }

    public void AddTodo(Todo todo)
    {
        todo.Id = Guid.NewGuid();
        _todos.Add(todo);
    }

    public void UpdateTodo(Todo todo)
    {
        var existingTodo = _todos.Find(t => t.Id == todo.Id);
        if (existingTodo != null)
        {
            existingTodo.Text = todo.Text;
            existingTodo.Done = todo.Done;
        }
    }

    public void RemoveTodo(Todo todo)
    {
        _todos.Remove(todo);
    }
}