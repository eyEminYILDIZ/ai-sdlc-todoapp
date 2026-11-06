namespace TodoApp.Models;

public class Todo
{
    public Guid Id { get; set; }
    public string Text { get; set; }
    public bool Done { get; set; }
}