namespace TodoApp.Services;

using TodoApp.Models;
using System.Collections.Generic;

public class TodoService
{
    private static List<Todo> _todos = new List<Todo>()
    {
        new Todo { Id = 1, Text = "Sample Todo", Done = false }
    };

    public List<Todo> GetTodos()
    {
        return _todos;
    }

    public void AddTodo(Todo todo)
    {
        todo.Id = _todos.Count + 1;
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