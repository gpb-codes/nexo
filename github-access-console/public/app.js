/* GitHub Access Console — lógica de la interfaz */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    chip: $("statusChip"),
    chipText: $("statusText"),
    clock: $("clock"),
    progress: $("progressBar"),
    btnGenerate: $("btnGenerate"),
    btnTest: $("btnTest"),
    btnCopy: $("btnCopy"),
    keyBox: $("keyBox"),
    keyValue: $("keyValue"),
    keyEmpty: $("keyEmpty"),
    keyType: $("keyType"),
    fingerprint: $("fingerprint"),
    keyNote: $("keyNote"),
    metaHost: $("metaHost"),
    metaGit: $("metaGit"),
    metaTool: $("metaTool"),
    visHost: $("visHost"),
    counter: $("stepCounter"),
    nextText: $("nextText"),
    nextAction: $("nextAction"),
    terminal: $("terminal"),
    terminalEmpty: $("terminalEmpty"),
    eventCount: $("eventCount"),
    liveBadge: $("liveBadge"),
    liveText: $("liveText"),
    demoBanner: $("demoBanner"),
    demoBannerTitle: $("demoBannerTitle"),
    demoBannerText: $("demoBannerText"),
    toast: $("toast"),
    footHost: $("footHost"),
  };

  const state = {
    status: null,
    publicKey: "",
    lastTs: 0,
    demo: false,
    snapshot: null,
    busy: false,
    demoEvents: false,
  };

  const DEMO_STATUS = {
    host: "tu-equipo",
    os: "Linux",
    git: { name: "tu-cuenta", email: "tu@correo.dev", version: "git version 2.x" },
    key: {
      exists: false,
      public: "",
      fingerprint: "",
      path: "~/.ssh/id_ed25519",
      ssh_dir_perms: "700",
    },
    test: {},
    steps: [
      { id: 1, state: "active", detail: "Pendiente de generar" },
      { id: 2, state: "pending", detail: "Copia la clave y pégala en GitHub" },
      { id: 3, state: "pending", detail: "Sin comprobar todavía" },
    ],
    tools: { ssh: "/usr/bin/ssh", git: "/usr/bin/git", gh: "" },
  };

  const DEMO_EVENTS = [
    { iso: "", level: "info", actor: "guía", message: "Vista estática: ejecuta python3 server.py para ver el estado real." },
    { iso: "", level: "info", actor: "guía", message: "Paso 1 · Genera un par de claves ed25519 en tu equipo." },
    { iso: "", level: "info", actor: "guía", message: "Paso 2 · Copia la clave pública en GitHub → Settings → SSH and GPG keys." },
    { iso: "", level: "info", actor: "guía", message: "Paso 3 · Verifica con ssh -T git@github.com." },
  ];

  /* ---------------------------------------------------------------- utils */
  const timeOf = (iso) => {
    if (!iso) return "--:--:--";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "--:--:--";
    return d.toLocaleTimeString("es-ES", { hour12: false });
  };

  const dateOf = (iso) => {
    const d = new Date(iso);
    if (!iso || Number.isNaN(d.getTime())) return "una fecha desconocida";
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
  };

  let toastTimer;
  function toast(message, kind = "info") {
    const el = els.toast;
    el.textContent = message;
    el.dataset.kind = kind;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 4200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(options.timeout || 25000),
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  /* --------------------------------------------------------------- render */
  function chip(stateName, text) {
    els.chip.dataset.state = stateName;
    els.chipText.textContent = text;
  }

  function stepNodes() {
    return Array.from(document.querySelectorAll(".step"));
  }

  function renderStatus(data) {
    state.status = data;

    const keyExists = Boolean(data.key && data.key.exists);
    const test = data.test || {};
    const steps = data.steps || [];
    const done = steps.filter((s) => s.state === "done").length;

    // chip + progreso
    if (state.demo) {
      chip(state.snapshot ? "snapshot" : "offline",
           state.snapshot ? "instantánea" : "modo guía");
    } else if (test.ok) {
      chip("ok", "conectado");
    } else if (keyExists) {
      chip("warn", "clave sin autorizar");
    } else {
      chip("warn", "sin clave");
    }
    els.progress.style.width = `${Math.round((done / 3) * 100)}%`;
    els.liveText.textContent = state.demo ? "archivo" : "en vivo";
    els.liveBadge.dataset.mode = state.demo ? "archive" : "live";

    // metadatos
    els.metaHost.textContent = data.host || "—";
    els.visHost.textContent = data.host || "localhost";
    const name = data.git && data.git.name;
    const email = data.git && data.git.email;
    els.metaGit.textContent = name && email ? `${name} · ${email}` : (name || "sin configurar");
    const hasGh = data.tools && data.tools.gh;
    els.metaTool.textContent = hasGh ? "ssh + gh" : "OpenSSH";

    // pasos
    stepNodes().forEach((li) => {
      const id = Number(li.dataset.step);
      const s = steps.find((x) => x.id === id) || { state: "pending", detail: "" };
      li.dataset.state = s.state;
      const dot = li.querySelector(".step-dot");
      dot.textContent = s.state === "done" ? "✓" : String(id);
      const detail = $("detail" + id);
      if (detail) detail.textContent = s.detail || "";
    });
    els.counter.textContent = `${done}/3`;
    els.counter.dataset.complete = String(done === 3);

    // siguiente acción
    let next;
    if (state.demo) {
      next = state.snapshot
        ? "esta es una instantánea del proceso real; el registro completo está abajo."
        : "ejecuta el servidor local para activar la consola.";
    } else if (test.ok) {
      next = "todo listo: crea un repositorio y haz tu primer push.";
    } else if (keyExists) {
      next = "copia la clave pública y pégala en GitHub → SSH and GPG keys.";
    } else {
      next = "genera la clave para empezar.";
    }
    els.nextText.textContent = next;
    els.nextAction.querySelector(".next-icon").textContent = done === 3 ? "✓" : "→";

    // clave
    const pub = (data.key && data.key.public) || "";
    state.publicKey = pub;
    els.keyBox.dataset.empty = String(!pub);
    els.keyValue.textContent = pub;
    els.btnCopy.disabled = !pub;
    els.fingerprint.textContent = (data.key && data.key.fingerprint) || "—";
    els.keyType.textContent = "ED25519";
    if (data.key && data.key.fingerprint) {
      els.keyNote.textContent = "Copia la línea completa, sin espacios añadidos.";
    }

    // botones
    els.btnGenerate.disabled = state.demo || keyExists || state.busy;
    els.btnGenerate.querySelector("span").textContent = keyExists
      ? "Clave generada"
      : "Generar clave SSH";
    els.btnGenerate.querySelector("path").setAttribute(
      "d", keyExists ? "m5 13 4 4L19 7" : "M12 5v14M5 12h14");
    els.btnGenerate.classList.toggle("btn-primary", !keyExists && !state.demo);
    els.btnGenerate.classList.toggle("btn-ghost", keyExists || state.demo);

    els.btnTest.disabled = state.demo || !keyExists || state.busy;
    els.btnTest.querySelector("span").textContent =
      test.ok ? "Verificar de nuevo" : "Probar conexión";
    const testIsPrimary = keyExists && !test.ok && !state.demo;
    els.btnTest.classList.toggle("btn-primary", testIsPrimary);
    els.btnTest.classList.toggle("btn-ghost", !testIsPrimary);
  }

  function renderEvents(events) {
    if (!events.length) return;
    const nearBottom =
      els.terminal.scrollHeight - els.terminal.scrollTop - els.terminal.clientHeight < 90;

    events.forEach((ev) => {
      if (els.terminalEmpty) els.terminalEmpty.style.display = "none";
      const line = document.createElement("div");
      const actor = ev.actor || "consola";
      let level = ev.level || "info";
      if (actor === "agente" && level === "info") level = "agent";
      line.className = "log-line";
      line.dataset.level = level;
      line.dataset.actor = actor;

      const t = document.createElement("span");
      t.className = "log-time";
      t.textContent = timeOf(ev.iso);

      const a = document.createElement("span");
      a.className = "log-actor";
      a.textContent = actor;

      const m = document.createElement("span");
      m.className = "log-msg";
      m.textContent = ev.message || "";

      line.append(t, a, m);
      els.terminal.appendChild(line);
    });

    els.eventCount.textContent = `${els.terminal.querySelectorAll(".log-line").length} eventos`;
    if (nearBottom) els.terminal.scrollTop = els.terminal.scrollHeight;
  }

  /* ---------------------------------------------------------------- carga */
  async function refreshStatus() {
    try {
      const data = await api("/api/status", { timeout: 6000 });
      state.demo = false;
      state.snapshot = null;
      els.demoBanner.hidden = true;
      renderStatus(data);
    } catch {
      if (state.demo) return;
      state.demo = true;
      els.demoBanner.hidden = false;

      let snap = null;
      try {
        snap = await api("snapshot.json", { timeout: 6000 });
      } catch {
        snap = null;
      }

      if (snap && snap.status) {
        state.snapshot = snap;
        els.demoBannerTitle.textContent = "Instantánea.";
        els.demoBannerText.textContent =
          `Estado real congelado el ${dateOf(snap.generated_at)}. ` +
          "Los controles solo funcionan en la consola local.";
        renderStatus(snap.status);
        if (!state.demoEvents) {
          state.demoEvents = true;
          renderEvents(snap.events || []);
        }
      } else {
        state.snapshot = null;
        els.demoBannerTitle.textContent = "Modo estático.";
        els.demoBannerText.textContent =
          "No se encontró el servidor local, así que esta vista muestra la guía, " +
          "no el estado real. Ejecuta python3 server.py.";
        renderStatus(DEMO_STATUS);
        if (!state.demoEvents) {
          state.demoEvents = true;
          renderDemoEvents();
        }
      }
    }
  }

  function renderDemoEvents() {
    const now = Date.now();
    const events = DEMO_EVENTS.map((ev, i) => ({
      ...ev,
      iso: new Date(now - (DEMO_EVENTS.length - i) * 1500).toISOString(),
    }));
    renderEvents(events);
  }

  async function refreshEvents() {
    if (state.demo) return;
    try {
      const data = await api(`/api/events?after=${state.lastTs}`, { timeout: 6000 });
      const events = data.events || [];
      if (events.length) {
        state.lastTs = Math.max(state.lastTs, ...events.map((e) => e.ts || 0));
        renderEvents(events);
      }
    } catch {
      /* el estado se encarga de marcar la caída */
    }
  }

  /* -------------------------------------------------------------- acciones */
  async function withBusy(fn) {
    if (state.busy) return;
    state.busy = true;
    document.body.style.cursor = "progress";
    try {
      await fn();
    } finally {
      state.busy = false;
      document.body.style.cursor = "";
      if (state.status) renderStatus(state.status);
    }
  }

  async function generate() {
    await withBusy(async () => {
      els.btnGenerate.querySelector("span").textContent = "Generando…";
      try {
        const res = await api("/api/key", { method: "POST" });
        if (res.ok) {
          toast(res.already ? "La clave ya existía." : "Clave ed25519 creada.", "ok");
        } else {
          toast(res.message || "No se pudo generar la clave.", "error");
        }
      } catch (err) {
        toast(`Error: ${err.message}`, "error");
      }
      await refreshStatus();
      await refreshEvents();
    });
  }

  async function testConnection() {
    await withBusy(async () => {
      els.btnTest.querySelector("span").textContent = "Comprobando…";
      try {
        const res = await api("/api/test", { method: "POST", timeout: 40000 });
        if (res.ok) {
          toast("GitHub reconoce la clave. Conexión SSH lista.", "ok");
        } else {
          toast(res.message || "GitHub aún no reconoce la clave.", "warn");
        }
      } catch (err) {
        toast(`Error: ${err.message}`, "error");
      }
      await refreshStatus();
      await refreshEvents();
    });
  }

  /* ---------------------------------------------------------------- eventos */
  els.btnGenerate.addEventListener("click", generate);
  els.btnTest.addEventListener("click", testConnection);

  els.btnCopy.addEventListener("click", async () => {
    if (!state.publicKey) return;
    const ok = await copyText(state.publicKey);
    toast(ok ? "Clave pública copiada." : "No se pudo copiar. Selecciónala manualmente.", ok ? "ok" : "warn");
  });

  // Los enlaces a GitHub son manuales: dejamos rastro en el registro local.
  $("linkGithub").addEventListener("click", () => {
    if (state.demo) return;
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Abriendo GitHub → Settings → SSH and GPG keys.",
        level: "info",
        actor: "tú",
      }),
    }).catch(() => {});
  });

  /* ----------------------------------------------------------------- reloj */
  function tickClock() {
    const d = new Date();
    els.clock.textContent = d.toLocaleTimeString("es-ES", { hour12: false });
  }

  /* --------------------------------------------------------------- arranque */
  async function boot() {
    tickClock();
    setInterval(tickClock, 1000);
    els.footHost.textContent = location.host || "127.0.0.1:8787";

    renderStatus(DEMO_STATUS);
    await refreshStatus();
    await refreshEvents();

    setInterval(() => {
      if (!document.hidden && (!state.demo || !state.snapshot)) refreshStatus();
    }, 5000);
    setInterval(() => {
      if (!document.hidden && !state.demo) refreshEvents();
    }, 2000);
  }

  boot();
})();
