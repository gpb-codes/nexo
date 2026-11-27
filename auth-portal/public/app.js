/* Auth Portal — lógica */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    views: {
      login: $("viewLogin"),
      register: $("viewRegister"),
      dashboard: $("viewDashboard"),
    },
    loginForm: $("loginForm"),
    loginEmail: $("loginEmail"),
    loginPass: $("loginPass"),
    loginEmailErr: $("loginEmailErr"),
    loginPassErr: $("loginPassErr"),
    loginBtn: $("loginBtn"),
    rememberMe: $("rememberMe"),
    registerForm: $("registerForm"),
    regName: $("regName"),
    regEmail: $("regEmail"),
    regPass: $("regPass"),
    regPass2: $("regPass2"),
    regNameErr: $("regNameErr"),
    regEmailErr: $("regEmailErr"),
    regPassErr: $("regPassErr"),
    regPass2Err: $("regPass2Err"),
    acceptTerms: $("acceptTerms"),
    registerBtn: $("registerBtn"),
    strengthBar: $("strengthBar"),
    userAvatar: $("userAvatar"),
    welcomeName: $("welcomeName"),
    userEmail: $("userEmail"),
    logoutBtn: $("logoutBtn"),
    colorPicker: $("colorPicker"),
    avatarPicker: $("avatarPicker"),
    displayName: $("displayName"),
    savePrefsBtn: $("savePrefsBtn"),
    infoName: $("infoName"),
    infoEmail: $("infoEmail"),
    infoDate: $("infoDate"),
    infoSession: $("infoSession"),
    toast: $("toast"),
    particles: $("particles"),
  };

  /* ---------------------------------------------------------------- utils */
  const SESSION_KEY = "auth_portal_session";

  const getSession = () => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  };
  const setSession = (s) => {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  };

  const api = async (path, options = {}) => {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  };

  const hash = async (str) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const uid = () => "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  let toastTimer;
  function toast(msg, kind = "info") {
    const el = els.toast;
    el.textContent = msg;
    el.dataset.kind = kind;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
  }

  /* ---------------------------------------------------------------- views */
  function showView(name) {
    const current = document.querySelector(".view.active");
    if (current && current.id === "view" + capitalize(name)) return;
    if (current) {
      current.classList.add("exit");
      setTimeout(() => {
        current.classList.remove("active", "exit");
        const next = els.views[name];
        if (next) next.classList.add("active");
      }, 250);
    } else {
      const next = els.views[name];
      if (next) next.classList.add("active");
    }
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------------------------------------------------------------- validación */
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  function setErr(el, msg) {
    el.textContent = msg || "";
    const field = el.closest(".field");
    if (field) field.classList.toggle("has-error", !!msg);
  }

  function clearErrs() {
    document.querySelectorAll(".error").forEach(e => { e.textContent = ""; });
    document.querySelectorAll(".field").forEach(f => f.classList.remove("has-error"));
  }

  /* ---------------------------------------------------------------- registro */
  function passwordStrength(pw) {
    if (!pw) return "";
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return "weak";
    if (score === 2) return "fair";
    if (score === 3) return "good";
    return "strong";
  }

  els.regPass.addEventListener("input", () => {
    const cls = passwordStrength(els.regPass.value);
    els.strengthBar.className = "strength " + cls;
  });

  els.registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrs();
    const name = els.regName.value.trim();
    const email = els.regEmail.value.trim().toLowerCase();
    const pass = els.regPass.value;
    const pass2 = els.regPass2.value;
    let ok = true;

    if (name.length < 2) { setErr(els.regNameErr, "El nombre debe tener al menos 2 caracteres."); ok = false; }
    if (!isEmail(email)) { setErr(els.regEmailErr, "Correo inválido."); ok = false; }
    if (pass.length < 8) { setErr(els.regPassErr, "Mínimo 8 caracteres."); ok = false; }
    if (pass !== pass2) { setErr(els.regPass2Err, "Las contraseñas no coinciden."); ok = false; }
    if (!els.acceptTerms.checked) { toast("Debes aceptar los términos.", "error"); ok = false; }

    if (!ok) return;

    els.registerBtn.disabled = true;
    els.registerBtn.querySelector(".btn-spinner").hidden = false;
    els.registerBtn.querySelector(".btn-text").textContent = "Creando…";

    try {
      const data = await api("/api/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password: pass }),
      });
      const user = data.user;
      setSession({ userId: user.id, email: user.email, loginAt: new Date().toISOString() });
      toast("Cuenta creada. ¡Bienvenido!", "ok");
      await new Promise(r => setTimeout(r, 400));
      loadDashboard(user);
      showView("dashboard");
    } catch (err) {
      toast(err.message || "Error al crear la cuenta.", "error");
    } finally {
      els.registerBtn.disabled = false;
      els.registerBtn.querySelector(".btn-spinner").hidden = true;
      els.registerBtn.querySelector(".btn-text").textContent = "Crear cuenta";
    }
  });

  /* ---------------------------------------------------------------- login */
  els.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrs();
    const email = els.loginEmail.value.trim().toLowerCase();
    const pass = els.loginPass.value;
    let ok = true;

    if (!isEmail(email)) { setErr(els.loginEmailErr, "Correo inválido."); ok = false; }
    if (!pass) { setErr(els.loginPassErr, "Ingresa tu contraseña."); ok = false; }
    if (!ok) return;

    els.loginBtn.disabled = true;
    els.loginBtn.querySelector(".btn-spinner").hidden = false;
    els.loginBtn.querySelector(".btn-text").textContent = "Verificando…";

    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });
      const user = data.user;
      setSession({ userId: user.id, email: user.email, loginAt: new Date().toISOString() });
      toast("Sesión iniciada. ¡Bienvenido de vuelta!", "ok");
      await new Promise(r => setTimeout(r, 400));
      loadDashboard(user);
      showView("dashboard");
    } catch (err) {
      setErr(els.loginPassErr, "Correo o contraseña incorrectos.");
      toast(err.message || "Credenciales inválidas.", "error");
    } finally {
      els.loginBtn.disabled = false;
      els.loginBtn.querySelector(".btn-spinner").hidden = true;
      els.loginBtn.querySelector(".btn-text").textContent = "Iniciar sesión";
    }
  });

  /* ---------------------------------------------------------------- logout */
  els.logoutBtn.addEventListener("click", () => {
    setSession(null);
    toast("Sesión cerrada.", "ok");
    setTimeout(() => showView("login"), 300);
  });

  /* ---------------------------------------------------------------- avatares SVG (GrokBot + Coucou/Mochi) */
  /* ---------------------------------------------------------------- avatares (DiceBear — open source, 61 estilos) */
  const DICEBEAR_BASE = "https://api.dicebear.com/9.x";
  const AVATAR_STYLES = [
    { id: "lorelei", name: "Lorelei", desc: "Ilustrado" },
    { id: "micah", name: "Micah", desc: "Moderno" },
    { id: "avataaars", name: "Avataaars", desc: "Clásico" },
    { id: "bottts", name: "Bottts", desc: "Robot" },
    { id: "fun-emoji", name: "Fun Emoji", desc: "Emoji" },
    { id: "notionists", name: "Notionists", desc: "Notion" },
    { id: "adventurer", name: "Adventurer", desc: "Aventurero" },
    { id: "thumbs", name: "Thumbs", desc: "Pulgar" },
  ];
  const DEFAULT_AVATAR = "lorelei";

  function avatarUrl(style, seed) {
    const params = new URLSearchParams({ seed: seed || "default", backgroundColor: "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf" });
    return `${DICEBEAR_BASE}/${style}/svg?${params.toString()}`;
  }

  function renderAvatar(styleId, container, seed) {
    const style = AVATAR_STYLES.find(s => s.id === styleId) || AVATAR_STYLES[0];
    const url = avatarUrl(style.id, seed || "user");
    container.innerHTML = `<img src="${url}" alt="${style.name}" loading="lazy">`;
    container.dataset.avatar = style.id;
  }

  async function loadDashboard(user) {
    if (!user) {
      const sess = getSession();
      if (!sess) return showView("login");
      try {
        const data = await api(`/api/me?id=${sess.userId}`);
        user = data.user;
      } catch (err) {
        setSession(null);
        return showView("login");
      }
    }

    const displayName = user.displayName || user.name;
    const avatarId = AVATAR_STYLES.some(s => s.id === user.avatar) ? user.avatar : DEFAULT_AVATAR;
    renderAvatar(avatarId, els.userAvatar, user.email);
    els.welcomeName.textContent = `Hola, ${displayName}`;
    els.userEmail.textContent = user.email;
    els.displayName.value = displayName;
    els.infoName.textContent = user.name;
    els.infoEmail.textContent = user.email;
    els.infoDate.textContent = new Date(user.createdAt).toLocaleDateString("es-ES", { dateStyle: "medium" });
    els.infoSession.textContent = new Date(getSession().loginAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });

    // color picker
    els.colorPicker.querySelectorAll(".color-swatch").forEach(s => {
      s.classList.toggle("active", s.dataset.color === (user.accent || "#8b5cf6"));
    });
    // avatar picker
    els.avatarPicker.querySelectorAll(".avatar-option").forEach(a => {
      a.classList.toggle("active", a.dataset.avatarId === avatarId);
    });

    applyTheme(user.accent || "#8b5cf6");
  }

  function applyTheme(color) {
    document.documentElement.style.setProperty("--accent", color);
    // derive glow
    document.documentElement.style.setProperty("--accent-glow", color + "73");
  }

  // color picker
  els.colorPicker.addEventListener("click", (e) => {
    const swatch = e.target.closest(".color-swatch");
    if (!swatch) return;
    els.colorPicker.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
    swatch.classList.add("active");
  });

  // avatar picker
  function initAvatarPicker() {
    els.avatarPicker.innerHTML = "";
    AVATAR_STYLES.forEach(style => {
      const btn = document.createElement("button");
      btn.className = "avatar-option";
      btn.dataset.avatarId = style.id;
      btn.title = style.name;
      btn.innerHTML = `<img src="${avatarUrl(style.id, 'preview')}" alt="${style.name}" loading="lazy">`;
      els.avatarPicker.appendChild(btn);
    });
  }

  els.avatarPicker.addEventListener("click", (e) => {
    const opt = e.target.closest(".avatar-option");
    if (!opt) return;
    els.avatarPicker.querySelectorAll(".avatar-option").forEach(a => a.classList.remove("active"));
    opt.classList.add("active");
    const sess = getSession();
    renderAvatar(opt.dataset.avatarId, els.userAvatar, sess ? sess.email : 'user');
  });

  // save preferences
  els.savePrefsBtn.addEventListener("click", async () => {
    const sess = getSession();
    if (!sess) return;

    const activeColor = els.colorPicker.querySelector(".color-swatch.active");
    const activeAvatar = els.avatarPicker.querySelector(".avatar-option.active");
    const accent = activeColor ? activeColor.dataset.color : null;
    const avatar = activeAvatar ? activeAvatar.dataset.avatarId : null;
    const displayName = els.displayName.value.trim() || null;

    try {
      await api("/api/preferences", {
        method: "PUT",
        body: JSON.stringify({ id: sess.userId, avatar, accent, displayName }),
      });
      // Update local display
      if (accent) applyTheme(accent);
      if (avatar) renderAvatar(avatar, els.userAvatar, sess.email);
      if (displayName) els.welcomeName.textContent = `Hola, ${displayName}`;
      toast("Preferencias guardadas en la base de datos.", "ok");
    } catch (err) {
      toast(err.message || "Error al guardar.", "error");
    }
  });

  /* ---------------------------------------------------------------- toggles */
  document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $(btn.dataset.target);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  /* ---------------------------------------------------------------- switch views */
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  /* ---------------------------------------------------------------- forgot */
  $("forgotLink").addEventListener("click", (e) => {
    e.preventDefault();
    toast("Recuperación de contraseña: próximamente.", "info");
  });

  /* ---------------------------------------------------------------- particles */
  function initParticles() {
    const canvas = els.particles;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(80, Math.floor((w * h) / 18000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.5 + 0.2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${p.a})`;
        ctx.fill();
      });
      // connect nearby
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    initParticles();
    initAvatarPicker();
    const sess = getSession();
    if (sess) {
      loadDashboard().then(() => showView("dashboard")).catch(() => { setSession(null); showView("login"); });
      return;
    }
    showView("login");
  }

  boot();
})();
