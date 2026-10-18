import { useState, useEffect } from "react";
import { ApiClient } from "./api_client";
import { Todo } from "./models";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    setLoading(true);
    ApiClient.get("/todos")
      .then(response => setTodos(response.data))
      .catch(error => console.error("Error fetching todos:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Todos</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {todos.map((todo, index) => (
            <li key={index}>{todo.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
