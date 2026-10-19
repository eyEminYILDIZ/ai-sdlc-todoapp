using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Testing;
using TodoApp.Models;
using TodoApp.Services;

namespace webapi.tests;

// TodoService state is static, so these tests must not run in parallel with TodoServiceTests.
[Collection("TodoState")]
public class TodoEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TodoEndpointTests(WebApplicationFactory<Program> factory)
    {
        var field = typeof(TodoService).GetField("_todos", BindingFlags.NonPublic | BindingFlags.Static)!;
        field.SetValue(null, new List<Todo>
        {
            new Todo { Id = 1, Text = "Sample Todo", Done = false }
        });

        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetTodos_ReturnsOkWithJson()
    {
        var response = await _client.GetAsync("/todos");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetTodos_ReturnsSeedTodo()
    {
        var todos = await _client.GetFromJsonAsync<List<Todo>>("/todos");

        var todo = Assert.Single(todos!);
        Assert.Equal(1, todo.Id);
        Assert.Equal("Sample Todo", todo.Text);
        Assert.False(todo.Done);
    }

    [Fact]
    public async Task GetTodos_ReflectsServiceChanges()
    {
        new TodoService().AddTodo(new Todo { Text = "Added", Done = true });

        var todos = await _client.GetFromJsonAsync<List<Todo>>("/todos");

        Assert.Equal(2, todos!.Count);
        Assert.Contains(todos, t => t.Text == "Added" && t.Done);
    }

    [Fact]
    public async Task GetTodos_SendsCorsHeader_ForAnyOrigin()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/todos");
        request.Headers.Add("Origin", "http://example.com");

        var response = await _client.SendAsync(request);

        Assert.Equal("*", response.Headers.GetValues("Access-Control-Allow-Origin").Single());
    }
}
