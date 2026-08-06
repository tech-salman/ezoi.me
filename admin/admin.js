/* ezoi.me Admin Console — no backend, all in-browser.
 * Auth runs client-side (PBKDF2). Edits are committed to the GitHub repo
 * via the REST API (which redeploys GitHub Pages automatically). */
(function () {
  "use strict";

  /* ===================== Config ===================== */
  var CONFIG = {
    user: "tech-salman",
    repo: "ezoi.me",
    branch: "main",
    // PBKDF2-SHA256(150k, static salt) of password "ezoi"
    saltB64: "ZXpvaS1hZG1pbi1zdGF0aWMtc2FsdC12MQ==",
    hashB64: "AJ5H58h+nDFMjZHV5I3uDM+Jvj5s7M0ECABhJdXrhpo=",
    adminUser: "admin",
    // files selectable in the editor (repo-relative)
    editable: [
      "index.html",
      "styles.css",
      "js/app.js",
      "blogs/index.html",
      "islamAI/index.html",
      "pages/index.html",
      "404.html",
      "robots.txt",
      "CNAME",
      "README.md",
      "_redirects",
      "redirect-map.txt"
    ]
  };

  /* ===================== State ===================== */
  var state = {
    authed: false,
    token: null, // GitHub PAT (memory only)
    shaCache: {} // path -> latest blob sha
  };

  /* ===================== DOM ===================== */
  function $(id) { return document.getElementById(id); }
  function show(el) { el.hidden = false; }
  function hide(el) { el.hidden = true; }
  function toast(msg, kind) {
    var t = $("toast");
    t.textContent = msg;
    t.className = "toast" + (kind ? " " + kind : "");
    show(t);
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { hide(t); }, 3200);
  }
  function setStatus(box, msg, kind) {
    box.textContent = msg;
    box.className = "status-line" + (kind ? " " + kind : "");
    show(box);
  }

  /* ===================== Crypto (PBKDF2 auth) ===================== */
  function b64ToBytes(b64) {
    var bin = atob(b64);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }
  function bytesToB64(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function verifyPassword(pass) {
    return crypto.subtle
      .importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"])
      .then(function (key) {
        return crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: b64ToBytes(CONFIG.saltB64), iterations: 150000, hash: "SHA-256" },
          key,
          256
        );
      })
      .then(function (bits) {
        return bytesToB64(new Uint8Array(bits)) === CONFIG.hashB64;
      });
  }

  /* ===================== GitHub API ===================== */
  function gh(path, opts) {
    opts = opts || {};
    var headers = { Accept: "application/vnd.github+json" };
    if (state.token) headers.Authorization = "Bearer " + state.token;
    if (opts.json !== false && opts.body) headers["Content-Type"] = "application/json";
    return fetch("https://api.github.com" + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? (typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body)) : undefined
    }).then(function (res) {
      return res.text().then(function (txt) {
        var data = null;
        try { data = txt ? JSON.parse(txt) : null; } catch (e) {}
        if (!res.ok) {
          var msg = (data && (data.message || (data.errors && data.errors[0] && data.errors[0].message))) || ("HTTP " + res.status);
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  function getFile(path) {
    return gh("/repos/" + CONFIG.user + "/" + CONFIG.repo + "/contents/" + path + "?ref=" + CONFIG.branch)
      .then(function (d) {
        state.shaCache[path] = d.sha;
        return { content: decodeContent(d.content), sha: d.sha, path: d.path, name: d.name };
      });
  }
  function decodeContent(b64) {
    // GitHub returns base64 with newlines
    return decodeURIComponent(escape(atob(b64.replace(/\s/g, ""))));
  }
  function encodeContent(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function commitFile(path, content, message) {
    var body = {
      message: message,
      content: encodeContent(content),
      branch: CONFIG.branch
    };
    if (state.shaCache[path]) body.sha = state.shaCache[path];
    return gh("/repos/" + CONFIG.user + "/" + CONFIG.repo + "/contents/" + path, {
      method: "PUT",
      body: body
    }).then(function (d) {
      state.shaCache[path] = d.content.sha;
      return d;
    });
  }

  function listCommits() {
    return gh("/repos/" + CONFIG.user + "/" + CONFIG.repo + "/commits?per_page=12&sha=" + CONFIG.branch)
      .then(function (list) {
        return (list || []).map(function (c) {
          return {
            sha: c.sha.slice(0, 7),
            msg: c.commit.message.split("\n")[0],
            author: c.commit.author.name,
            date: c.commit.author.date
          };
        });
      });
  }

  function triggerWorkflow() {
    return gh("/repos/" + CONFIG.user + "/" + CONFIG.repo + "/actions/workflows/static.yml/dispatches", {
      method: "POST",
      body: { ref: CONFIG.branch }
    });
  }

  /* ===================== Auth flow ===================== */
  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var u = $("login-user").value.trim();
    var p = $("login-pass").value;
    if (u !== CONFIG.adminUser) {
      showErr($("login-error"), "Unknown username.");
      return;
    }
    var btn = $("login-btn");
    btn.disabled = true;
    btn.textContent = "Verifying…";
    verifyPassword(p).then(function (ok) {
      if (!ok) { showErr($("login-error"), "Incorrect password."); return; }
      state.authed = true;
      hide($("login-view"));
      show($("app-view"));
      initApp();
    }).catch(function () {
      showErr($("login-error"), "Browser missing crypto support (use HTTPS/modern browser).");
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "Sign in";
    });
  });
  function showErr(box, msg) { box.textContent = msg; show(box); }

  $("logout-btn").addEventListener("click", function () {
    state.authed = false; state.token = null;
    hide($("app-view")); show($("login-view"));
    $("login-pass").value = "";
  });

  /* ===================== App init ===================== */
  function initApp() {
    // populate file select
    var sel = $("file-select");
    sel.innerHTML = "";
    CONFIG.editable.forEach(function (p) {
      var o = document.createElement("option");
      o.value = p; o.textContent = p;
      sel.appendChild(o);
    });
    // nav
    Array.prototype.forEach.call(document.querySelectorAll(".nav-item"), function (n) {
      n.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".nav-item"), function (x) { x.classList.remove("active"); });
        Array.prototype.forEach.call(document.querySelectorAll(".panel"), function (x) { x.classList.remove("active"); });
        n.classList.add("active");
        $("panel-" + n.getAttribute("data-panel")).classList.add("active");
        if (n.getAttribute("data-panel") === "deploy") refreshCommits();
      });
    });
    // theme toggle
    $("theme-toggle").addEventListener("click", function () {
      var b = document.body;
      b.setAttribute("data-theme", b.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
    // token connect
    $("token-connect").addEventListener("click", connectToken);
    $("token-input").addEventListener("keydown", function (e) { if (e.key === "Enter") connectToken(); });
    // editor
    $("editor-save").addEventListener("click", saveEditor);
    $("editor-cancel").addEventListener("click", function () { loadSelectedFile(); });
    $("file-reload").addEventListener("click", loadSelectedFile);
    $("file-new").addEventListener("click", newFile);
    sel.addEventListener("change", loadSelectedFile);
    $("editor").addEventListener("input", function () {
      $("editor-count").textContent = $("editor").value.length + " chars";
    });
    // blog
    $("blog-slug").addEventListener("input", function () {
      $("blog-preview-path").textContent = "/blogs/" + ($("blog-category").value) + "/" + slugify($("blog-slug").value || "<slug>") + "/";
    });
    $("blog-category").addEventListener("change", function () {
      $("blog-preview-path").textContent = "/blogs/" + ($("blog-category").value) + "/" + slugify($("blog-slug").value || "<slug>") + "/";
    });
    $("blog-create").addEventListener("click", createBlogPost);
    // deploy
    $("deploy-refresh").addEventListener("click", refreshCommits);
    $("deploy-trigger").addEventListener("click", runDeploy);

    // already have token? keep banner logic ready but show it
    show($("token-banner"));
    $("settings-repo").textContent = CONFIG.user + "/" + CONFIG.repo + " @ " + CONFIG.branch;
  }

  function connectToken() {
    var tok = $("token-input").value.trim();
    if (!tok) { showErr($("token-error"), "Enter a token."); return; }
    $("token-connect").disabled = true;
    gh("/user").then(function (u) {
      // confirm it has access to the repo
      return gh("/repos/" + CONFIG.user + "/" + CONFIG.repo).then(function () {
        state.token = tok;
        $("conn-chip").textContent = "connected as " + (u.login || "user");
        $("conn-chip").classList.remove("chip-off");
        $("conn-chip").classList.add("chip-on");
        hide($("token-banner"));
        toast("Connected to GitHub", "ok");
      });
    }).catch(function (err) {
      showErr($("token-error"), "Token rejected: " + err.message);
    }).then(function () { $("token-connect").disabled = false; });
  }

  /* ===================== File editor ===================== */
  var currentPath = null;
  function loadSelectedFile() {
    if (!state.token) { toast("Connect a GitHub token first", "err"); show($("token-banner")); return; }
    var path = $("file-select").value;
    currentPath = path;
    $("editor").value = "Loading…";
    getFile(path).then(function (f) {
      $("editor").value = f.content;
      $("editor-count").textContent = f.content.length + " chars";
      $("editor-meta").textContent = "Editing " + f.path + " — last SHA " + (f.sha || "").slice(0, 10);
      hide($("editor-status"));
    }).catch(function (err) {
      $("editor").value = "";
      setStatus($("editor-status"), "Could not load " + path + ": " + err.message, "err");
    });
  }
  function saveEditor() {
    if (!currentPath) return;
    var content = $("editor").value;
    $("editor-save").disabled = true;
    setStatus($("editor-status"), "Committing to " + CONFIG.branch + "…");
    commitFile(currentPath, content, "admin: update " + currentPath)
      .then(function () {
        setStatus($("editor-status"), "✓ Saved. GitHub Pages will redeploy automatically.", "ok");
        toast("Saved " + currentPath, "ok");
      })
      .catch(function (err) {
        setStatus($("editor-status"), "Save failed: " + err.message, "err");
      })
      .then(function () { $("editor-save").disabled = false; });
  }
  function newFile() {
    var p = prompt("New file path (repo-relative), e.g. pages/hello.html");
    if (!p) return;
    p = p.trim().replace(/^\/+/, "");
    if (CONFIG.editable.indexOf(p) === -1) CONFIG.editable.push(p);
    var o = document.createElement("option");
    o.value = p; o.textContent = p + " (new)";
    $("file-select").appendChild(o);
    $("file-select").value = p;
    currentPath = p;
    $("editor").value = "";
    $("editor-count").textContent = "0 chars";
    $("editor-meta").textContent = "New file: " + p;
  }

  /* ===================== Blog generator ===================== */
  function slugify(s) {
    return (s || "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  }
  function createBlogPost() {
    if (!state.token) { toast("Connect a GitHub token first", "err"); show($("token-banner")); return; }
    var title = $("blog-title").value.trim();
    var body = $("blog-body").value;
    var cat = $("blog-category").value;
    if (!title) { setStatus($("blog-status"), "Title is required.", "err"); return; }
    if (!body.trim()) { setStatus($("blog-status"), "Body is required.", "err"); return; }
    var slug = slugify($("blog-slug").value) || slugify(title);
    var excerpt = $("blog-excerpt").value.trim() || title;
    var date = new Date().toISOString().slice(0, 10);
    var html = renderBlogPost(title, excerpt, date, body);
    var path = "blogs/" + cat + "/" + slug + "/index.html";

    $("blog-create").disabled = true;
    setStatus($("blog-status"), "Publishing to " + path + "…");
    commitFile(path, html, "admin: new blog post " + slug)
      .then(function () {
        setStatus($("blog-status"), "✓ Published at /blogs/" + cat + "/" + slug + "/ — live after deploy.", "ok");
        toast("Blog post published", "ok");
        $("blog-title").value = ""; $("blog-slug").value = ""; $("blog-excerpt").value = ""; $("blog-body").value = "";
        $("blog-preview-path").textContent = "";
      })
      .catch(function (err) {
        setStatus($("blog-status"), "Publish failed: " + err.message, "err");
      })
      .then(function () { $("blog-create").disabled = false; });
  }
  function renderBlogPost(title, excerpt, date, body) {
    return [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '  <meta charset="UTF-8" />',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '  <meta name="description" content="' + escapeAttr(excerpt) + '" />',
      '  <meta name="robots" content="index, follow" />',
      '  <link rel="canonical" href="https://ezoi.me/blogs/" />',
      "  <title>" + escapeHtml(title) + " — ezoi.me Blogs</title>",
      '  <link rel="stylesheet" href="../../styles.css" />',
      '  <style>',
      "    .post-page { max-width: 760px; margin: 0 auto; padding: 60px 20px; }",
      "    .post-title { font-size: 2.2rem; margin-bottom: 8px; }",
      "    .post-meta { color: var(--muted); margin-bottom: 30px; }",
      "    .post-body { line-height: 1.75; font-size: 1.05rem; }",
      "    .post-body img { max-width: 100%; border-radius: 12px; }",
      "    .back-link { display: inline-block; margin-top: 40px; color: #8fdbff; }",
      "  </style>",
      "</head>",
      "<body>",
      '  <div class="bg-grid" aria-hidden="true"></div>',
      '  <div class="post-page">',
      '    <h1 class="post-title">' + escapeHtml(title) + "</h1>",
      '    <div class="post-meta">' + escapeHtml(date) + "</div>",
      '    <article class="post-body">' + body + "</article>",
      '    <a class="back-link" href="/blogs/">← Back to Blogs</a>',
      "  </div>",
      "</body>",
      "</html>"
    ].join("\n");
  }
  function escapeHtml(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }

  /* ===================== Deploy / history ===================== */
  function refreshCommits() {
    if (!state.token) { toast("Connect a GitHub token first", "err"); return; }
    listCommits().then(function (items) {
      var ul = $("commit-list");
      ul.innerHTML = "";
      items.forEach(function (c) {
        var li = document.createElement("li");
        li.innerHTML = '<div class="commit-msg">' + escapeHtml(c.msg) + "</div>" +
          '<div class="commit-meta">' + escapeHtml(c.author) + " • " + c.sha + " • " + new Date(c.date).toLocaleString() + "</div>";
        ul.appendChild(li);
      });
    }).catch(function (err) {
      setStatus($("deploy-status"), "Could not load history: " + err.message, "err");
    });
  }
  function runDeploy() {
    if (!state.token) { toast("Connect a GitHub token first", "err"); return; }
    $("deploy-trigger").disabled = true;
    setStatus($("deploy-status"), "Triggering deploy workflow…");
    triggerWorkflow().then(function () {
      setStatus($("deploy-status"), "✓ Workflow dispatched. Check Actions tab / wait for deploy.", "ok");
      toast("Deploy triggered", "ok");
    }).catch(function (err) {
      setStatus($("deploy-status"), "Failed: " + err.message, "err");
    }).then(function () { $("deploy-trigger").disabled = false; });
  }
})();
