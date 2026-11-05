export function renderBackendPage() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Todo API endpoint'leri</title>
  <style>
    :root {
      color-scheme: light;
      --blue: #1478cf;
      --blue-dark: #07599f;
      --gray: #e7edf2;
      --border: #d3dde5;
      --text: #162536;
      --muted: #647585;
      --green: #237b55;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-width: 280px;
      background: #fff;
      color: var(--text);
      font: 14px/1.4 Arial, sans-serif;
    }
    main { width: min(100%, 720px); margin: 0 auto; padding: 28px 20px 34px; }
    h1 { margin: 0 0 6px; font-size: 1.35rem; }
    .subtitle { margin: 0 0 24px; color: var(--muted); }
    .base-url {
      display: inline-block;
      margin-bottom: 18px;
      padding: 7px 10px;
      border-radius: 6px;
      background: #eef6fd;
      color: var(--blue-dark);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: .82rem;
    }
    .endpoint {
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--gray);
      box-shadow: 0 2px 5px rgba(34, 57, 78, .08);
      transition: opacity .2s, transform .2s;
    }
    .endpoint.focused { transform: translateY(-2px); }
    .method {
      display: inline-block;
      margin-right: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      background: var(--blue);
      color: #fff;
      font: 700 .78rem ui-monospace, SFMono-Regular, Consolas, monospace;
    }
    .route { font: 700 .95rem ui-monospace, SFMono-Regular, Consolas, monospace; }
    .description { margin: 10px 0 14px; color: var(--muted); }
    .details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .detail {
      padding: 10px;
      border-radius: 6px;
      background: #fff;
      border: 1px solid var(--border);
    }
    .detail strong {
      display: block;
      margin-bottom: 4px;
      color: var(--muted);
      font-size: .72rem;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    code {
      color: var(--blue-dark);
      font: .8rem ui-monospace, SFMono-Regular, Consolas, monospace;
    }
    pre {
      overflow: auto;
      margin: 16px 0 0;
      padding: 12px;
      border-radius: 6px;
      background: #14283b;
      color: #eaf5ff;
      font-size: .78rem;
    }
    .notes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 16px;
    }
    .note {
      padding: 13px;
      border: 1px dashed var(--border);
      border-radius: 8px;
    }
    .note h2 { margin: 0 0 6px; font-size: .9rem; }
    .note p { margin: 0; color: var(--muted); font-size: .82rem; }
    .note strong { color: var(--green); }
    .focus-dim .endpoint:not(.focused), .focus-dim .note:not(.focused) { opacity: .4; }
    @media (max-width: 540px) {
      main { padding-inline: 14px; }
      .details, .notes { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main id="canvas">
    <h1 id="title">Backend API</h1>
    <p class="subtitle">ASP.NET Core .NET 10 Minimal API endpoint görünümü</p>
    <div class="base-url" id="base-url"></div>

    <article class="endpoint" data-node="get-todos">
      <div><span class="method">GET</span><span class="route">/todos</span></div>
      <p class="description">Todo listesini JSON olarak döndürür.</p>
      <div class="details">
        <div class="detail"><strong>Response</strong><code>200 OK</code></div>
        <div class="detail"><strong>Service</strong><code>TodoService</code></div>
        <div class="detail"><strong>Storage</strong><code>in-memory</code></div>
      </div>
      <pre aria-label="Örnek JSON response">[
  { "id": 1, "text": "Sample Todo", "done": false }
]</pre>
    </article>

    <div class="notes">
      <article class="note" data-node="openapi">
        <h2>OpenAPI</h2>
        <p><code>/openapi/v1.json</code><br>Development ortamında yayınlanır.</p>
      </article>
      <article class="note" data-node="cors">
        <h2>CORS</h2>
        <p><strong>AllowAnyOrigin</strong><br>Geliştirme kolaylığı için açık.</p>
      </article>
    </div>
  </main>
  <script>
    (() => {
      const instanceId = new URLSearchParams(location.search).get("instanceId") || "";
      fetch("/state?instanceId=" + encodeURIComponent(instanceId))
        .then((response) => response.ok ? response.json() : Promise.reject(new Error("state")))
        .then((state) => {
          document.getElementById("title").textContent = state.projectName + " · Backend API";
          document.getElementById("base-url").textContent = state.apiBaseUrl;
          const canvas = document.getElementById("canvas");
          if (state.focus !== "all") {
            canvas.classList.add("focus-dim");
            document.querySelector('[data-node="' + state.focus + '"]')?.classList.add("focused");
          }
        })
        .catch(() => {});
    })();
  </script>
</body>
</html>`;
}
