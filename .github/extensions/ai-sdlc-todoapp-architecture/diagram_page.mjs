export function renderDiagramPage() {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ai-sdlc-todoapp mimarisi</title>
  <style>
    :root {
      color-scheme: light;
      --blue: #1478cf;
      --blue-dark: #07599f;
      --gray: #e7edf2;
      --gray-border: #d3dde5;
      --text: #162536;
      --muted: #647585;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-width: 280px;
      background: #fff;
      color: var(--text);
      font: 14px/1.35 Arial, sans-serif;
    }
    main {
      width: min(100%, 620px);
      margin: 0 auto;
      padding: 28px 20px 34px;
      text-align: center;
    }
    h1 {
      margin: 0 0 22px;
      font-size: 1.25rem;
      letter-spacing: .03em;
    }
    .flow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 9px;
    }
    .user {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-size: .85rem;
      font-weight: 700;
    }
    .users-mark {
      position: relative;
      width: 76px;
      height: 43px;
    }
    .users-mark::before,
    .users-mark::after {
      position: absolute;
      content: "";
      border-radius: 50%;
      background: var(--blue);
    }
    .users-mark::before {
      top: 0;
      left: 28px;
      width: 20px;
      height: 20px;
      box-shadow: -25px 6px 0 -2px var(--blue), 25px 6px 0 -2px var(--blue);
    }
    .users-mark::after {
      left: 14px;
      bottom: 0;
      width: 48px;
      height: 24px;
      border-radius: 24px 24px 3px 3px;
      box-shadow: -19px 0 0 -5px var(--blue), 19px 0 0 -5px var(--blue);
    }
    .arrow {
      height: 24px;
      color: #23384a;
      font-size: 1.8rem;
      line-height: 20px;
    }
    .node {
      width: min(100%, 270px);
      padding: 13px 15px;
      border: 1px solid var(--gray-border);
      border-radius: 7px;
      background: var(--gray);
      box-shadow: 0 2px 5px rgba(34, 57, 78, .08);
      transition: opacity .2s, transform .2s;
    }
    .node h2 {
      margin: 0;
      font-size: 1rem;
      letter-spacing: .025em;
    }
    .node p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: .78rem;
    }
    .node.primary {
      border-color: var(--blue-dark);
      background: var(--blue);
      color: #fff;
    }
    .node.primary p { color: #eaf5ff; }
    .node.database {
      border-color: var(--blue-dark);
      background: #2386d8;
      color: #fff;
    }
    .node.database p { color: #eaf5ff; }
    .data-label {
      margin: 1px 0 -3px;
      color: var(--muted);
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .data-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
    }
    .data-row .node { width: min(46%, 190px); }
    .data-row .node h2 { font-size: .84rem; }
    .focus-dim .node:not(.focused), .focus-dim .user:not(.focused) { opacity: .35; }
    .focused { transform: translateY(-2px); }
    .footer {
      margin-top: 22px;
      color: var(--muted);
      font-size: .76rem;
    }
    code {
      color: var(--blue-dark);
      font-size: .75rem;
    }
    @media (max-width: 520px) {
      main { padding-inline: 14px; }
      .data-row { gap: 7px; }
      .data-row .node { width: 48%; padding-inline: 8px; }
      .data-row .node h2 { font-size: .76rem; }
    }
  </style>
</head>
<body>
  <main id="canvas">
    <h1 id="project-name">ai-sdlc-todoapp</h1>
    <section class="flow" aria-label="Sistem mimarisi">
      <div class="user" data-node="user">
        <div class="users-mark" aria-hidden="true"></div>
        <div>USERS / CLIENTS</div>
      </div>
      <div class="arrow" aria-hidden="true">↓</div>
      <article class="node" data-node="webapp">
        <h2>WEBAPP</h2>
        <p>React + TypeScript</p>
      </article>
      <div class="arrow" aria-hidden="true">↓</div>
      <article class="node primary" data-node="api">
        <h2>API</h2>
        <p>ASP.NET Core Minimal API · <code>GET /todos</code></p>
      </article>
      <div class="arrow" aria-hidden="true">↓</div>
      <div class="data-label">DATA LAYER</div>
      <div class="data-row">
        <article class="node" data-node="storage">
          <h2>IN-MEMORY</h2>
          <p>Mevcut TodoService durumu</p>
        </article>
        <article class="node database" data-node="database">
          <h2>DATABASE</h2>
          <p id="database-mode">Varsayımsal kalıcı DB</p>
        </article>
      </div>
    </section>
    <div class="footer">API: <code id="api-url"></code> · JSON: <code>id, text, done</code></div>
  </main>
  <script>
    (() => {
      const instanceId = new URLSearchParams(location.search).get("instanceId") || "";
      const canvas = document.getElementById("canvas");
      fetch("/state?instanceId=" + encodeURIComponent(instanceId))
        .then((response) => response.ok ? response.json() : Promise.reject(new Error("state")))
        .then((state) => {
          document.getElementById("project-name").textContent = state.projectName;
          document.getElementById("api-url").textContent = state.apiBaseUrl;
          document.getElementById("database-mode").textContent = state.databaseMode;
          canvas.dataset.focus = state.focus;
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
