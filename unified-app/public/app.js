/* Nexo — App Unificada — Lógica */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    const els = {
      authContainer: $("authContainer"),
      appContainer: $("appContainer"),
      authLogin: $("authLogin"),
      authRegister: $("authRegister"),
      authSiteName: $("authSiteName"),
      authSiteTagline: $("authSiteTagline"),
      loginForm: $("loginForm"),
      loginEmail: $("loginEmail"),
      loginPass: $("loginPass"),
      loginEmailErr: $("loginEmailErr"),
      loginPassErr: $("loginPassErr"),
      loginBtn: $("loginBtn"),
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
      userBadge: $("userBadge"),
      userAvatarSmall: $("userAvatarSmall"),
      userNameTop: $("userNameTop"),
      logoutBtn: $("logoutBtn"),
      logoutBtnProfile: $("logoutBtnProfile"),
      installBtn: $("installBtn"),
      installStatus: $("installStatus"),
      tabNav: $("tabNav"),
      tabContent: $("tabContent"),
      sidebar: $("sidebar"),
      sidebarOverlay: $("sidebarOverlay"),
      menuBtn: $("menuBtn"),
      pageTitle: $("pageTitle"),
      pageKicker: $("pageKicker"),
      heroSiteName: $("heroSiteName"),
      globalSearch: $("globalSearch"),
      themeToggle: $("themeToggle"),
      sidebarAvatar: $("sidebarAvatar"),
      sidebarName: $("sidebarName"),
      sidebarEmail: $("sidebarEmail"),
      downloadAppBtn: $("downloadAppBtn"),
      supportBtn: $("supportBtn"),
      supportModal: $("supportModal"),
      supportModalClose: $("supportModalClose"),
      supportModalBody: $("supportModalBody"),
      sidebarSiteName: $("sidebarSiteName"),
      sidebarSiteTagline: $("sidebarSiteTagline"),
      statProjects: $("statProjects"),
      projectNameInput: $("projectNameInput"),
      projectDescInput: $("projectDescInput"),
      projectPriority: $("projectPriority"),
      addProjectBtn: $("addProjectBtn"),
      projectFilters: $("projectFilters"),
      projectList: $("projectList"),
      userAvatar: $("userAvatar"),
      welcomeName: $("welcomeName"),
      welcomeEmail: $("welcomeEmail"),
      statTasks: $("statTasks"),
      statNotes: $("statNotes"),
      statGithub: $("statGithub"),
      nfcSupport: $("nfcSupport"),
      nfcIndicator: $("nfcIndicator"),
      nfcReadBtn: $("nfcReadBtn"),
      nfcStopBtn: $("nfcStopBtn"),
      nfcResult: $("nfcResult"),
      nfcWriteText: $("nfcWriteText"),
      nfcWriteBtn: $("nfcWriteBtn"),
      cameraSupport: $("cameraSupport"),
      cameraVideo: $("cameraVideo"),
      cameraPreview: $("cameraPreview"),
      cameraPlaceholder: $("cameraPlaceholder"),
      cameraStartBtn: $("cameraStartBtn"),
      cameraCaptureBtn: $("cameraCaptureBtn"),
      cameraStopBtn: $("cameraStopBtn"),
      photoForm: $("photoForm"),
      photoTitle: $("photoTitle"),
      photoContent: $("photoContent"),
      photoSaveBtn: $("photoSaveBtn"),
      noteTitle: $("noteTitle"),
      noteContent: $("noteContent"),
      addNoteBtn: $("addNoteBtn"),
      noteFilters: $("noteFilters"),
      notesList: $("notesList"),
      contactName: $("contactName"),
      contactPhone: $("contactPhone"),
      contactEmail: $("contactEmail"),
      contactOrg: $("contactOrg"),
      contactNote: $("contactNote"),
      saveContactBtn: $("saveContactBtn"),
      resetContactBtn: $("resetContactBtn"),
      contactosList: $("contactosList"),
      contactosCount: $("contactosCount"),
      noteModal: $("noteModal"),
      noteModalClose: $("noteModalClose"),
      noteModalBody: $("noteModalBody"),
      githubDetail: $("githubDetail"),
      ghIndicator: $("ghIndicator"),
      ghStatusText: $("ghStatusText"),
      ghStatusDetail: $("ghStatusDetail"),
      taskInput: $("taskInput"),
      taskCategory: $("taskCategory"),
      taskPriority: $("taskPriority"),
      addTaskBtn: $("addTaskBtn"),
      taskFilters: $("taskFilters"),
      taskList: $("taskList"),
      taskProgress: $("taskProgress"),
      taskModal: $("taskModal"),
      taskModalClose: $("taskModalClose"),
      taskModalBody: $("taskModalBody"),
      taskModalSave: $("taskModalSave"),
      taskModalDelete: $("taskModalDelete"),
      voiceBtn: $("voiceBtn"),
      voiceBtnText: $("voiceBtnText"),
      voiceStatus: $("voiceStatus"),
      voiceTranscript: $("voiceTranscript"),
      voiceClearBtn: $("voiceClearBtn"),
      voiceCopyBtn: $("voiceCopyBtn"),
      voiceSaveBtn: $("voiceSaveBtn"),
      ttsText: $("ttsText"),
      ttsBtn: $("ttsBtn"),
      chatMessages: $("chatMessages"),
      chatInput: $("chatInput"),
      chatSendBtn: $("chatSendBtn"),
      profileAvatar: $("profileAvatar"),
      profileName: $("profileName"),
      profileEmail: $("profileEmail"),
      colorPicker: $("colorPicker"),
      themePicker: $("themePicker"),
      avatarPicker: $("avatarPicker"),
      displayName: $("displayName"),
      aiApiKey: $("aiApiKey"),
      aiModel: $("aiModel"),
      aiBaseUrl: $("aiBaseUrl"),
      saveAiBtn: $("saveAiBtn"),
      savePrefsBtn: $("savePrefsBtn"),
      resetSiteBtn: $("resetSiteBtn"),
      goToSettingsBtn: $("goToSettingsBtn"),
      siteNameInput: $("siteNameInput"),
      siteTaglineInput: $("siteTaglineInput"),
      siteDescriptionInput: $("siteDescriptionInput"),
      sitePreviewName: $("sitePreviewName"),
      sitePreviewTagline: $("sitePreviewTagline"),
      sitePreviewDescription: $("sitePreviewDescription"),
      infoName: $("infoName"),
      infoEmail: $("infoEmail"),
      infoDate: $("infoDate"),
      brainSearch: $("brainSearch"),
      brainStats: $("brainStats"),
      brainResetBtn: $("brainResetBtn"),
      brainRotateBtn: $("brainRotateBtn"),
      brainOpenBtn: $("brainOpenBtn"),
      quartzSearch: $("quartzSearch"),
      quartzStats: $("quartzStats"),
      quartzList: $("quartzList"),
      toast: $("toast"),
      particles: $("particles"),
    };

    let currentUser = null;
    let allNotes = [];
    let nfcReader = null;
    let nfcAbortController = null;
    let nfcCapture = null;
    let cameraStream = null;
    let cameraCapture = null;

    const api = async (path, options = {}) => {
      const res = await fetch(path, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    };

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    let toastTimer;
    function toast(msg, kind = "info") {
      const el = els.toast;
      el.textContent = msg;
      el.dataset.kind = kind;
      el.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
    }

    function setErr(el, msg) { if (el) el.textContent = msg || ""; }

    function showAuthView(name) {
      document.querySelectorAll(".auth-view").forEach(v => v.classList.remove("active"));
      const id = name === "login" ? "authLogin" : "authRegister";
      const el = $(id);
      if (el) el.classList.add("active");
    }

    /* ---------------------------------------------------------------- avatares (DiceBear) */
    const DICEBEAR_BASE = "https://api.dicebear.com/9.x";
    const AVATAR_STYLES = [
      { id: "lorelei", name: "Lorelei" }, { id: "micah", name: "Micah" },
      { id: "avataaars", name: "Avataaars" }, { id: "bottts", name: "Bottts" },
      { id: "fun-emoji", name: "Fun Emoji" }, { id: "notionists", name: "Notionists" },
      { id: "adventurer", name: "Adventurer" }, { id: "thumbs", name: "Thumbs" },
    ];
    const DEFAULT_AVATAR = "lorelei";

    function avatarUrl(style, seed) {
      return `${DICEBEAR_BASE}/${style}/svg?seed=${encodeURIComponent(seed || "default")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    }

    function renderAvatar(styleId, container, seed) {
      const style = AVATAR_STYLES.find(s => s.id === styleId) || AVATAR_STYLES[0];
      container.innerHTML = `<img src="${avatarUrl(style.id, seed || "user")}" alt="${style.name}" loading="lazy">`;
      container.dataset.avatar = style.id;
    }

    function initAvatarPicker(container, activeId, onSelect) {
      container.innerHTML = "";
      AVATAR_STYLES.forEach(style => {
        const btn = document.createElement("button");
        btn.className = "avatar-option";
        btn.dataset.avatarId = style.id;
        btn.title = style.name;
        btn.innerHTML = `<img src="${avatarUrl(style.id, 'preview')}" alt="${style.name}" loading="lazy">`;
        if (style.id === activeId) btn.classList.add("active");
        btn.addEventListener("click", () => {
          container.querySelectorAll(".avatar-option").forEach(a => a.classList.remove("active"));
          btn.classList.add("active");
          if (onSelect) onSelect(style.id);
        });
        container.appendChild(btn);
      });
    }

    /* ---------------------------------------------------------------- tabs */
    const TAB_TITLES = {
      inicio: "Inicio",
      grafo: "Segundo cerebro",
      tareas: "Tareas",
      proyectos: "Proyectos",
      captura: "Captura NFC y cámara",
      contactos: "Contactos",
      github: "GitHub",
      voz: "Voz",
      chat: "Asistente IA",
      perfil: "Perfil",
      ajustes: "Ajustes",
    };

    const SITE_DEFAULTS = {
      name: "Nexo",
      tagline: "Centro de operaciones",
      description: "Tu segundo cerebro unificado",
    };

    function normalizeSite(site = {}) {
      return {
        name: String(site.name || "").trim() || SITE_DEFAULTS.name,
        tagline: site.tagline === undefined || site.tagline === null
          ? SITE_DEFAULTS.tagline
          : String(site.tagline).trim(),
        description: site.description === undefined || site.description === null
          ? SITE_DEFAULTS.description
          : String(site.description).trim(),
      };
    }

    function updateSitePreview() {
      if (!els.siteNameInput) return;
      const name = els.siteNameInput.value.trim() || SITE_DEFAULTS.name;
      const tagline = els.siteTaglineInput.value.trim();
      const description = els.siteDescriptionInput.value.trim();
      if (els.sitePreviewName) els.sitePreviewName.textContent = name;
      if (els.sitePreviewTagline) els.sitePreviewTagline.textContent = tagline;
      if (els.sitePreviewDescription) els.sitePreviewDescription.textContent = description || SITE_DEFAULTS.description;
    }

    function applySiteSettings(rawSite) {
      const site = normalizeSite(rawSite);
      document.title = `${site.name} · ${site.description || SITE_DEFAULTS.description}`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = site.description || SITE_DEFAULTS.description;

      if (els.authSiteName) els.authSiteName.textContent = site.name;
      if (els.authSiteTagline) els.authSiteTagline.textContent = site.description || SITE_DEFAULTS.description;
      if (els.sidebarSiteName) els.sidebarSiteName.textContent = site.name;
      if (els.sidebarSiteTagline) els.sidebarSiteTagline.textContent = site.tagline;
      if (els.pageKicker) els.pageKicker.textContent = site.name;
      if (els.heroSiteName) els.heroSiteName.textContent = site.name;
      if (els.sitePreviewName) els.sitePreviewName.textContent = site.name;
      if (els.sitePreviewTagline) els.sitePreviewTagline.textContent = site.tagline;
      if (els.sitePreviewDescription) els.sitePreviewDescription.textContent = site.description || SITE_DEFAULTS.description;
      return site;
    }

    function fillSiteForm(rawSite) {
      const site = normalizeSite(rawSite);
      if (els.siteNameInput) els.siteNameInput.value = site.name;
      if (els.siteTaglineInput) els.siteTaglineInput.value = site.tagline;
      if (els.siteDescriptionInput) els.siteDescriptionInput.value = site.description;
      updateSitePreview();
    }

    function closeSidebar() {
      if (!els.sidebar) return;
      els.sidebar.classList.remove("open");
      if (els.sidebarOverlay) els.sidebarOverlay.hidden = true;
    }

    function openSidebar() {
      if (!els.sidebar) return;
      els.sidebar.classList.add("open");
      if (els.sidebarOverlay) els.sidebarOverlay.hidden = false;
    }

    function showTab(name) {
      if (name === "grafo") import("/brain.js").catch(() => {});
      if (name !== "captura") {
        if (cameraStream || cameraCapture) resetCamera();
        if (nfcAbortController) stopNfcScan(false);
      }
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
      if (els.pageTitle) els.pageTitle.textContent = TAB_TITLES[name] || "Nexo";
      closeSidebar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => showTab(btn.dataset.tab));
    });
    if (els.menuBtn) els.menuBtn.addEventListener("click", openSidebar);
    if (els.sidebarOverlay) els.sidebarOverlay.addEventListener("click", closeSidebar);

    /* ---------------------------------------------------------------- auth */
    async function doRegister() {
      const name = els.regName.value.trim();
      const email = els.regEmail.value.trim().toLowerCase();
      const pass = els.regPass.value;
      const pass2 = els.regPass2.value;
      let ok = true;
      if (name.length < 2) { setErr(els.regNameErr, "Mínimo 2 caracteres."); ok = false; }
      if (!isEmail(email)) { setErr(els.regEmailErr, "Correo inválido."); ok = false; }
      if (pass.length < 8) { setErr(els.regPassErr, "Mínimo 8 caracteres."); ok = false; }
      if (pass !== pass2) { setErr(els.regPass2Err, "No coinciden."); ok = false; }
      if (!els.acceptTerms.checked) { toast("Acepta los términos.", "error"); ok = false; }
      if (!ok) return;

      els.registerBtn.disabled = true;
      els.registerBtn.querySelector(".btn-spinner").hidden = false;
      els.registerBtn.querySelector(".btn-text").textContent = "Creando…";

      try {
        const data = await api("/api/register", { method: "POST", body: JSON.stringify({ name, email, password: pass }) });
        const user = data.user;
        currentUser = user;
        toast("Cuenta creada. ¡Bienvenido!", "ok");
        await loadApp(user);
      } catch (err) {
        toast(err.message || "Error al crear cuenta.", "error");
      } finally {
        els.registerBtn.disabled = false;
        els.registerBtn.querySelector(".btn-spinner").hidden = true;
        els.registerBtn.querySelector(".btn-text").textContent = "Crear cuenta";
      }
    }

    async function doLogin() {
      const email = els.loginEmail.value.trim().toLowerCase();
      const pass = els.loginPass.value;
      if (!isEmail(email)) { setErr(els.loginEmailErr, "Correo inválido."); return; }
      if (!pass) { setErr(els.loginPassErr, "Ingresa contraseña."); return; }

      els.loginBtn.disabled = true;
      els.loginBtn.querySelector(".btn-spinner").hidden = false;
      els.loginBtn.querySelector(".btn-text").textContent = "Verificando…";

      try {
        const data = await api("/api/login", { method: "POST", body: JSON.stringify({ email, password: pass }) });
        const user = data.user;
        currentUser = user;
        toast("Sesión iniciada.", "ok");
        await loadApp(user);
      } catch (err) {
        setErr(els.loginPassErr, "Credenciales incorrectas.");
        toast(err.message || "Error.", "error");
      } finally {
        els.loginBtn.disabled = false;
        els.loginBtn.querySelector(".btn-spinner").hidden = true;
        els.loginBtn.querySelector(".btn-text").textContent = "Iniciar sesión";
      }
    }

    async function loadApp(user) {
      if (!user) {
        try {
          const data = await api("/api/me");
          user = data.user;
        } catch (e) { currentUser = null; showAuth(); return; }
      }
      currentUser = user;
      const site = applySiteSettings(user.site || {});
      fillSiteForm(site);

      const avatarId = AVATAR_STYLES.some(s => s.id === user.avatar) ? user.avatar : DEFAULT_AVATAR;
      renderAvatar(avatarId, els.userAvatar, user.email);
      renderAvatar(avatarId, els.userAvatarSmall, user.email);
      if (els.sidebarAvatar) renderAvatar(avatarId, els.sidebarAvatar, user.email);
      els.welcomeName.textContent = `Hola, ${user.displayName || user.name}`;
      els.welcomeEmail.textContent = user.email;
      els.userNameTop.textContent = user.displayName || user.name;
      if (els.sidebarName) els.sidebarName.textContent = user.displayName || user.name;
      if (els.sidebarEmail) els.sidebarEmail.textContent = user.email;
      els.profileAvatar.innerHTML = `<img src="${avatarUrl(avatarId, user.email)}" alt="">`;
      els.profileName.textContent = user.name;
      els.profileEmail.textContent = user.email;
      els.displayName.value = user.displayName || user.name;
      if (els.aiApiKey) els.aiApiKey.value = user.aiApiKey || "";
      if (els.aiModel) els.aiModel.value = user.aiModel || "";
      if (els.aiBaseUrl) els.aiBaseUrl.value = user.aiBaseUrl || "";
      els.infoName.textContent = user.name;
      els.infoEmail.textContent = user.email;
      els.infoDate.textContent = new Date(user.createdAt).toLocaleDateString("es-ES", { dateStyle: "medium" });

      els.colorPicker.querySelectorAll(".color-swatch").forEach(s => {
        s.classList.toggle("active", s.dataset.color === (user.accent || "#8b5cf6"));
      });
      initAvatarPicker(els.avatarPicker, avatarId, (id) => {
        renderAvatar(id, els.userAvatar, user.email);
        renderAvatar(id, els.userAvatarSmall, user.email);
        els.profileAvatar.innerHTML = `<img src="${avatarUrl(id, user.email)}" alt="">`;
      });

      applyTheme(user.accent || "#8b5cf6");
      applyThemeMode(user.theme || "oscuro");
      els.themePicker.querySelectorAll(".theme-option").forEach(b => b.classList.toggle("active", b.dataset.theme === (user.theme || "oscuro")));

      els.authContainer.hidden = true;
      els.appContainer.hidden = false;
      showTab("inicio");

      loadTasks();
      loadProjects();
      loadNotes();
      loadContactos();
      loadGithubStatus();
      initVoice();
      initCaptureTools();
    }

    function applyTheme(color) {
      document.documentElement.style.setProperty("--accent", color);
      document.documentElement.style.setProperty("--accent-glow", color + "73");
    }
    function applyThemeMode(mode) {
      document.body.classList.toggle("light", mode === "claro");
    }

    function showAuth() {
      resetCamera();
      stopNfcScan(false);
      closeNoteModal();
      applySiteSettings(SITE_DEFAULTS);
      fillSiteForm(SITE_DEFAULTS);
      els.appContainer.hidden = true;
      els.authContainer.hidden = false;
      showAuthView("login");
    }

    async function logout() {
      resetCamera();
      stopNfcScan(false);
      closeNoteModal();
      currentUser = null;
      try { await api("/api/logout", { method: "POST" }); } catch (e) {}
      toast("Sesión cerrada.", "ok");
      setTimeout(() => showAuth(), 300);
    }

    /* ---------------------------------------------------------------- tareas */
    let allTasks = [];

    function sortTasks(tasks) {
      return [...tasks].sort((a, b) => {
        const statusRank = (t) => (t.status === "pendiente" ? 0 : 1);
        const priorityRank = { alta: 0, media: 1, baja: 2 };
        const diffStatus = statusRank(a) - statusRank(b);
        if (diffStatus !== 0) return diffStatus;
        const diffPriority = (priorityRank[a.priority] || 9) - (priorityRank[b.priority] || 9);
        if (diffPriority !== 0) return diffPriority;
        const aDue = Date.parse(a.due_date || "9999-12-31");
        const bDue = Date.parse(b.due_date || "9999-12-31");
        if (aDue !== bDue) return aDue - bDue;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    async function loadTasks() {
      if (!currentUser) return;
      try {
        const data = await api("/api/tasks");
        allTasks = data.tasks || [];
        renderTasks(allTasks);
        updateTaskCount(allTasks);
      } catch (e) { console.error(e); }
    }

    function renderTasks(tasks) {
      const filter = els.taskFilters?.querySelector(".filter-btn.active")?.dataset.filter || "todas";
      const sorted = sortTasks(tasks);
      let filtered = sorted;
      if (filter === "pendiente") filtered = sorted.filter(t => t.status === "pendiente");
      if (filter === "completada") filtered = sorted.filter(t => t.status === "completada");
      if (filter === "alta") filtered = sorted.filter(t => t.priority === "alta");
      if (filter === "media") filtered = sorted.filter(t => t.priority === "media");
      if (filter === "baja") filtered = sorted.filter(t => t.priority === "baja");

      if (filtered.length === 0) {
        els.taskList.innerHTML = '<p class="empty-state">Sin tareas en este filtro.</p>';
        return;
      }
      els.taskList.innerHTML = "";
      filtered.forEach(t => {
        const dueLabel = t.due_date ? ` · ${t.due_date}` : "";
        const categoryLabel = t.category ? ` · ${t.category}` : "";
        const div = document.createElement("div");
        div.className = "task-item clickable" + (t.status === "completada" ? " completed" : "");
        div.innerHTML = `
          <button class="task-check ${t.status === 'completada' ? 'checked' : ''}" data-id="${t.id}"></button>
          <span class="task-main">
            <span class="task-title">${escapeHtml(t.title)}</span>
            ${t.description ? `<span class="task-description">${escapeHtml(t.description)}</span>` : ""}
            <span class="task-meta">
              <span class="task-priority-badge ${t.priority}">${t.priority}</span>
              ${t.due_date ? `<span class="task-due">${escapeHtml(t.due_date)}</span>` : ""}
              ${t.category ? `<span class="task-category-label">${escapeHtml(t.category)}</span>` : ""}
              <span class="task-date">${new Date(t.created_at).toLocaleDateString("es-ES", { dateStyle: "medium" })}</span>
            </span>
          </span>
          <button class="task-delete" data-id="${t.id}" title="Eliminar">✕</button>
        `;
        div.querySelector(".task-check").addEventListener("click", (e) => { e.stopPropagation(); toggleTask(t.id, t.status); });
        div.querySelector(".task-delete").addEventListener("click", (e) => { e.stopPropagation(); deleteTaskById(t.id); });
        div.addEventListener("click", () => openTaskModal(t));
        els.taskList.appendChild(div);
      });
    }

    function openTaskModal(task) {
      const body = document.getElementById("taskModalBody");
      const dueInput = document.createElement("input");
      dueInput.type = "date";
      dueInput.id = "taskModalDue";
      dueInput.maxLength = 10;
      dueInput.className = "task-modal-due";
      dueInput.placeholder = "Fecha límite (opcional)";
      dueInput.value = task.due_date || "";

      const categoryInput = document.createElement("input");
      categoryInput.type = "text";
      categoryInput.id = "taskModalCategory";
      categoryInput.list = "taskCategoryOptions";
      categoryInput.placeholder = "Categoría (opcional)";
      categoryInput.maxLength = 80;
      categoryInput.className = "task-modal-category";
      categoryInput.value = task.category || "";

      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.id = "taskModalTitleInput";
      titleInput.placeholder = "Título de la tarea";
      titleInput.maxLength = 200;
      titleInput.className = "task-modal-title";
      titleInput.value = task.title || "";

      const descInput = document.createElement("textarea");
      descInput.id = "taskModalDescription";
      descInput.placeholder = "Descripción de la tarea";
      descInput.maxLength = 2000;
      descInput.className = "task-modal-desc";
      descInput.value = task.description || "";

      body.innerHTML = "";
      body.append(titleInput, dueInput, categoryInput, descInput);
      if (els.taskModal) {
        els.taskModal.dataset.taskId = task.id;
        els.taskModal.hidden = false;
        document.body.style.overflow = "hidden";
      }
    }

    function closeTaskModal() {
      if (els.taskModal) {
        els.taskModal.hidden = true;
        document.body.style.overflow = "";
      }
    }

    async function saveTask() {
      const id = els.taskModal?.dataset.taskId;
      if (!id) return;
      const title = els.taskModal?.querySelector("#taskModalTitleInput")?.value.trim() || "";
      const description = els.taskModal?.querySelector("#taskModalDescription")?.value.trim() || "";
      const due_date = els.taskModal?.querySelector("#taskModalDue")?.value || "";
      const category = els.taskModal?.querySelector("#taskModalCategory")?.value.trim() || "";
      if (!title) { toast("Escribe un título para la tarea.", "error"); return; }
      try {
        await api("/api/tasks", { method: "PUT", body: JSON.stringify({ id, title, description, due_date, category }) });
        toast("Tarea actualizada.", "ok");
        closeTaskModal();
        loadTasks();
      } catch (e) { toast(e.message || "Error al actualizar la tarea.", "error"); }
    }

    async function deleteTask() {
      const id = els.taskModal?.dataset.taskId;
      const title = allTasks.find(t => t.id === id)?.title || "";
      if (!id) return;
      if (!confirm(`¿Eliminar "${title}"?`)) return;
      try {
        await api("/api/tasks", { method: "DELETE", body: JSON.stringify({ id }) });
        toast("Tarea eliminada.", "ok");
        closeTaskModal();
        loadTasks();
      } catch (e) { toast(e.message || "Error al eliminar la tarea.", "error"); }
    }

    async function toggleTask(id, currentStatus) {
      const newStatus = currentStatus === "completada" ? "pendiente" : "completada";
      try {
        await api("/api/tasks", { method: "PUT", body: JSON.stringify({ id, status: newStatus }) });
        loadTasks();
      } catch (e) { toast("Error al actualizar tarea.", "error"); }
    }

    async function deleteTaskById(id) {
      try {
        await api("/api/tasks", { method: "DELETE", body: JSON.stringify({ id }) });
        loadTasks();
        toast("Tarea eliminada.", "ok");
      } catch (e) { toast("Error al eliminar.", "error"); }
    }

    async function addTask() {
      const title = els.taskInput.value.trim();
      if (!title) return;
      const priority = els.taskPriority.value;
      const category = els.taskCategory.value.trim();
      try {
        await api("/api/tasks", { method: "POST", body: JSON.stringify({ title, priority, category }) });
        els.taskInput.value = "";
        els.taskCategory.value = "";
        loadTasks();
        toast("Tarea agregada.", "ok");
      } catch (e) { toast("Error al agregar.", "error"); }
    }

    function updateTaskCount(tasks) {
      const pending = tasks.filter(t => t.status === "pendiente").length;
      const total = tasks.length;
      if (els.statTasks) els.statTasks.textContent = pending;
      if (els.taskProgress) els.taskProgress.textContent = `${pending}/${total} completadas`;
    }

    function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

    /* ---------------------------------------------------------------- proyectos */
    let allProjects = [];

    async function loadProjects() {
      if (!currentUser) return;
      try {
        const data = await api("/api/projects");
        allProjects = data.projects || [];
        renderProjects(allProjects);
        updateProjectStats();
      } catch (e) { console.error(e); }
    }

    function renderProjects(projects) {
      const filter = els.projectFilters?.querySelector(".filter-btn.active")?.dataset.filter || "todos";
      let filtered = projects;
      if (filter === "activo") filtered = projects.filter(p => p.status === "activo");
      if (filter === "completado") filtered = projects.filter(p => p.status === "completado");

      if (!filtered.length) {
        els.projectList.innerHTML = '<p class="empty-state">Sin proyectos. Crea el primero arriba.</p>';
        return;
      }
      els.projectList.innerHTML = "";
      filtered.forEach(p => {
        const div = document.createElement("div");
        div.className = "project-card";
        div.innerHTML = `
          <div class="project-top">
            <strong>${escapeHtml(p.name)}</strong>
            <div class="project-actions">
              <button class="btn btn-ghost btn-sm" data-action="toggle" data-id="${p.id}">${p.status === "completado" ? "Reabrir" : "Completar"}</button>
              <button class="task-delete" data-action="delete" data-id="${p.id}" title="Eliminar">✕</button>
            </div>
          </div>
          ${p.description ? `<p class="project-desc">${escapeHtml(p.description)}</p>` : ""}
          <div class="project-meta">
            <span class="project-status ${p.status}">${p.status}</span>
            <span class="task-priority-badge ${p.priority}">${p.priority}</span>
            <span class="project-desc">${new Date(p.created_at).toLocaleDateString("es-ES", { dateStyle: "medium" })}</span>
          </div>
        `;
        div.querySelector('[data-action="toggle"]').addEventListener("click", () => toggleProject(p));
        div.querySelector('[data-action="delete"]').addEventListener("click", () => deleteProject(p.id));
        els.projectList.appendChild(div);
      });
    }

    async function addProject() {
      const name = els.projectNameInput.value.trim();
      if (!name) { toast("Escribe un nombre para el proyecto.", "error"); return; }
      const description = els.projectDescInput.value.trim();
      const priority = els.projectPriority.value;
      try {
        await api("/api/projects", { method: "POST", body: JSON.stringify({ name, description, priority }) });
        els.projectNameInput.value = "";
        els.projectDescInput.value = "";
        await loadProjects();
        toast("Proyecto creado.", "ok");
      } catch (e) { toast(e.message || "Error al crear el proyecto.", "error"); }
    }

    async function toggleProject(project) {
      const status = project.status === "completado" ? "activo" : "completado";
      try {
        await api("/api/projects", { method: "PUT", body: JSON.stringify({ id: project.id, status }) });
        await loadProjects();
      } catch (e) { toast("Error al actualizar el proyecto.", "error"); }
    }

    async function deleteProject(id) {
      try {
        await api("/api/projects", { method: "DELETE", body: JSON.stringify({ id }) });
        await loadProjects();
        toast("Proyecto eliminado.", "ok");
      } catch (e) { toast("Error al eliminar el proyecto.", "error"); }
    }

    function updateProjectStats() {
      if (els.statProjects) {
        els.statProjects.textContent = allProjects.filter(p => p.status === "activo").length;
      }
    }

    /* ---------------------------------------------------------------- captura */
    const NOTE_KIND_LABELS = { nota: "Nota", contacto: "Contacto", foto: "Foto", nfc: "NFC" };

    function nfcSupported() {
      return "NDEFReader" in window;
    }

    function cameraSupported() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    function nfcReadyMessage() {
      return nfcSupported()
        ? "Compatible. Acerca una etiqueta NDEF al móvil."
        : "Web NFC no está disponible. Usa Chrome en Android con HTTPS.";
    }

    function cameraReadyMessage() {
      return cameraSupported()
        ? "Disponible. La cámara se enciende solo al abrirla."
        : "La cámara no está disponible en este navegador.";
    }

    function initCaptureTools() {
      const hasNfc = nfcSupported();
      setNfcStatus(nfcReadyMessage(), hasNfc ? "ok" : "warn");
      if (els.nfcReadBtn) els.nfcReadBtn.disabled = !hasNfc;
      if (els.nfcWriteBtn) els.nfcWriteBtn.disabled = !hasNfc;

      if (els.cameraSupport) els.cameraSupport.textContent = cameraReadyMessage();
      if (els.cameraStartBtn) els.cameraStartBtn.disabled = !cameraSupported();
    }

    function setNfcStatus(message, kind) {
      if (els.nfcSupport) els.nfcSupport.textContent = message;
      if (els.nfcIndicator) els.nfcIndicator.className = "status-indicator " + (kind || "warn");
    }

    function decodeNfcRecord(record) {
      try {
        if (typeof record.data === "string") return record.data;
        return new TextDecoder(record.encoding || "utf-8").decode(record.data);
      } catch {
        return "";
      }
    }

    function parseVCard(text) {
      const out = { name: "", phone: "", email: "", org: "", note: "" };
      const unfolded = text.replace(/\r?\n[ \t]/g, "");
      unfolded.split(/\r?\n/).forEach((line) => {
        const idx = line.indexOf(":");
        if (idx < 0) return;
        const rawKey = line.slice(0, idx).split(";")[0].toUpperCase();
        const key = rawKey.includes(".") ? rawKey.split(".").pop() : rawKey;
        const value = line.slice(idx + 1)
          .replace(/\\n/gi, "\n")
          .replace(/\\,/g, ",")
          .replace(/\\;/g, ";")
          .trim();
        if (key === "FN" && !out.name) out.name = value;
        else if (key === "N" && !out.name) {
          const parts = value.split(";");
          out.name = [parts[1], parts[0]].filter(Boolean).join(" ").trim();
        }
        else if (key === "TEL" && !out.phone) out.phone = value;
        else if (key === "EMAIL" && !out.email) out.email = value;
        else if (key === "ORG" && !out.org) out.org = value;
        else if (key === "NOTE" && !out.note) out.note = value;
      });
      return out;
    }

    function parseNfcMessage(message) {
      const textParts = [];
      let contact = null;
      for (const record of message.records || []) {
        const value = decodeNfcRecord(record);
        if (!value) continue;
        if (record.recordType === "mime" && /vcard/i.test(record.mediaType || "")) {
          contact = parseVCard(value);
        } else {
          textParts.push(value);
        }
      }
      const contactText = contact
        ? [contact.phone, contact.email, contact.org, contact.note].filter(Boolean).join(" · ")
        : "";
      const content = [textParts.join("\n").trim(), contactText].filter(Boolean).join("\n");
      const title = (contact && contact.name) || content.split("\n")[0].slice(0, 120) || "Etiqueta NFC";
      return { title, content: content.slice(0, 10000), contact, source: "nfc" };
    }

    function renderNfcResult(capture, serialNumber) {
      if (!capture) {
        els.nfcResult.innerHTML = '<p class="empty-state">Acerca una etiqueta NFC compatible para leerla.</p>';
        return;
      }
      const contact = capture.contact || {};
      const isContact = !!(contact.name || contact.phone || contact.email || contact.org);
      const contactRows = [
        contact.phone ? `<span>Teléfono: ${escapeHtml(contact.phone)}</span>` : "",
        contact.email ? `<span>Correo: ${escapeHtml(contact.email)}</span>` : "",
        contact.org ? `<span>Organización: ${escapeHtml(contact.org)}</span>` : "",
      ].filter(Boolean).join("");

      els.nfcResult.innerHTML = `
        <span class="note-kind kind-${isContact ? "contacto" : "nfc"}">${isContact ? "Contacto" : "NFC"}</span>
        <strong>${escapeHtml(capture.title)}</strong>
        <p>${escapeHtml(capture.content || "Sin texto legible.")}</p>
        ${serialNumber ? `<p>Serie: ${escapeHtml(serialNumber)}</p>` : ""}
        ${contactRows ? `<div class="nfc-contact">${contactRows}</div>` : ""}
        <div class="nfc-actions">
          <button class="btn btn-primary btn-sm" type="button" data-nfc-save="nota">Guardar como nota</button>
          ${isContact ? '<button class="btn btn-ghost btn-sm" type="button" data-nfc-save="contacto">Guardar como contacto</button>' : ""}
        </div>
      `;
    }

    function handleNfcReading(event) {
      const capture = parseNfcMessage(event.message);
      nfcCapture = capture;
      renderNfcResult(capture, event.serialNumber);
      setNfcStatus("Etiqueta leída. Guarda el contenido o acerca otra.", "ok");
    }

    async function startNfcScan() {
      if (!("NDEFReader" in window)) {
        toast("Web NFC no está disponible en este navegador.", "error");
        return;
      }
      try {
        stopNfcScan(false);
        nfcAbortController = new AbortController();
        nfcReader = new window.NDEFReader();
        nfcReader.addEventListener("reading", handleNfcReading);
        await nfcReader.scan({ signal: nfcAbortController.signal });
        if (els.nfcReadBtn) els.nfcReadBtn.hidden = true;
        if (els.nfcStopBtn) els.nfcStopBtn.hidden = false;
        setNfcStatus("Escaneando... acerca una etiqueta NFC.", "ok");
      } catch (err) {
        nfcReader = null;
        nfcAbortController = null;
        setNfcStatus("No se pudo iniciar NFC. Revisa permisos y usa Chrome Android con HTTPS.", "warn");
        toast("No se pudo iniciar el escaneo NFC.", "error");
      }
    }

    function stopNfcScan(notify = true) {
      if (nfcAbortController) {
        try { nfcAbortController.abort(); } catch (e) {}
      }
      nfcAbortController = null;
      nfcReader = null;
      if (els.nfcReadBtn) els.nfcReadBtn.hidden = false;
      if (els.nfcStopBtn) els.nfcStopBtn.hidden = true;
      setNfcStatus(
        nfcSupported() ? "Escaneo detenido. Puedes iniciar otra lectura." : nfcReadyMessage(),
        "warn"
      );
      if (notify) toast("Escaneo NFC detenido.", "ok");
    }

    async function writeNfcTag() {
      if (!("NDEFReader" in window)) {
        toast("Web NFC no está disponible en este navegador.", "error");
        return;
      }
      const text = els.nfcWriteText.value.trim();
      if (!text) {
        toast("Escribe un texto para grabar en la etiqueta.", "error");
        els.nfcWriteText.focus();
        return;
      }
      try {
        setNfcStatus("Acerca una etiqueta NFC para escribir...", "ok");
        const writer = new window.NDEFReader();
        await writer.write({ records: [{ recordType: "text", data: text, lang: "es" }] });
        setNfcStatus("Etiqueta escrita correctamente.", "ok");
        toast("Etiqueta NFC escrita.", "ok");
      } catch (err) {
        setNfcStatus("No se pudo escribir. Acerca una etiqueta compatible y reintenta.", "warn");
        toast("No se pudo escribir la etiqueta NFC.", "error");
      }
    }

    async function saveNfcCapture(kind) {
      if (!nfcCapture) return;
      const payload = {
        kind,
        title: nfcCapture.title,
        content: nfcCapture.content,
        source: "nfc",
      };
      if (kind === "contacto") payload.contact = nfcCapture.contact || {};
      try {
        await createNote(payload);
        nfcCapture = null;
        renderNfcResult(null);
        setNfcStatus("Guardado. Acerca otra etiqueta o inicia una nueva lectura.", "ok");
      } catch (err) {
        toast(err.message || "Error al guardar la lectura NFC.", "error");
      }
    }

    function stopCameraStream() {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
      }
      if (els.cameraVideo) {
        try { els.cameraVideo.pause(); } catch (e) {}
        els.cameraVideo.srcObject = null;
        els.cameraVideo.hidden = true;
      }
    }

    function resetCamera() {
      stopCameraStream();
      cameraCapture = null;
      if (els.cameraPreview) {
        els.cameraPreview.hidden = true;
        els.cameraPreview.removeAttribute("src");
      }
      if (els.cameraPlaceholder) els.cameraPlaceholder.hidden = false;
      if (els.photoForm) els.photoForm.hidden = true;
      if (els.photoTitle) els.photoTitle.value = "";
      if (els.photoContent) els.photoContent.value = "";
      if (els.cameraStartBtn) els.cameraStartBtn.hidden = false;
      if (els.cameraCaptureBtn) els.cameraCaptureBtn.hidden = true;
      if (els.cameraStopBtn) els.cameraStopBtn.hidden = true;
      if (els.cameraSupport) els.cameraSupport.textContent = cameraReadyMessage();
    }

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast("La cámara no está disponible en este navegador.", "error");
        return;
      }
      if (!window.isSecureContext) {
        toast("La cámara requiere HTTPS o localhost.", "error");
        return;
      }
      try {
        resetCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        els.cameraVideo.srcObject = cameraStream;
        els.cameraVideo.hidden = false;
        els.cameraPlaceholder.hidden = true;
        await els.cameraVideo.play();
        els.cameraStartBtn.hidden = true;
        els.cameraCaptureBtn.hidden = false;
        els.cameraStopBtn.hidden = false;
        els.cameraSupport.textContent = "Cámara activa. Encuadra y pulsa Capturar.";
      } catch (err) {
        stopCameraStream();
        els.cameraPlaceholder.hidden = false;
        els.cameraSupport.textContent = "No se pudo abrir la cámara. Revisa el permiso del navegador.";
        toast("No se pudo abrir la cámara.", "error");
      }
    }

    function captureFrame(maxSize, quality) {
      const video = els.cameraVideo;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return "";
      const scale = Math.min(1, maxSize / Math.max(vw, vh));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", quality);
    }

    function capturePhoto() {
      if (!els.cameraVideo.videoWidth || !els.cameraVideo.videoHeight) {
        toast("La cámara aún no está lista.", "error");
        return;
      }
      let dataUrl = captureFrame(1280, 0.72);
      if (dataUrl.length > 900000) dataUrl = captureFrame(1024, 0.62);
      if (dataUrl.length > 900000) dataUrl = captureFrame(800, 0.55);
      if (!dataUrl) {
        toast("No se pudo capturar la foto.", "error");
        return;
      }

      cameraCapture = dataUrl;
      els.cameraPreview.src = dataUrl;
      els.cameraPreview.hidden = false;
      els.cameraPlaceholder.hidden = true;
      stopCameraStream();
      els.cameraStartBtn.hidden = false;
      els.cameraCaptureBtn.hidden = true;
      els.cameraStopBtn.hidden = true;
      els.photoForm.hidden = false;
      els.photoTitle.value = `Foto ${new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}`;
      els.cameraSupport.textContent = "Foto capturada. Añade un título o guárdala.";
    }

    async function savePhotoNote() {
      if (!cameraCapture) {
        toast("Primero captura una foto.", "error");
        return;
      }
      try {
        await createNote({
          kind: "foto",
          title: els.photoTitle.value.trim() || "Foto",
          content: els.photoContent.value.trim(),
          image: cameraCapture,
          source: "camara",
        });
        resetCamera();
      } catch (err) {
        toast(err.message || "Error al guardar la foto.", "error");
      }
    }

    async function loadNotes() {
      if (!currentUser) return;
      try {
        const data = await api("/api/notes");
        allNotes = data.notes || [];
        renderNotes(allNotes);
        if (els.statNotes) els.statNotes.textContent = String(allNotes.length);
      } catch (e) {
        console.error(e);
      }
    }

    function renderNotes(notes) {
      const filter = els.noteFilters?.querySelector(".filter-btn.active")?.dataset.filter || "todas";
      let filtered = notes;
      if (filter === "nfc") filtered = notes.filter((note) => note.source === "nfc");
      else if (filter !== "todas") filtered = notes.filter((note) => note.kind === filter);

      if (!filtered.length) {
        els.notesList.innerHTML = '<p class="empty-state">Sin notas en este filtro.</p>';
        return;
      }

      els.notesList.innerHTML = "";
      filtered.forEach((note) => {
        const contact = note.contact || {};
        const contactLine = note.kind === "contacto"
          ? [contact.phone, contact.email, contact.org].filter(Boolean).join(" · ")
          : "";
        const preview = contactLine || note.content || (note.hasImage ? "Foto guardada" : "Sin contenido");
        const div = document.createElement("div");
        div.className = "note-item";
        div.innerHTML = `
          <div class="note-main">
            <span class="note-kind kind-${note.kind}">${NOTE_KIND_LABELS[note.kind] || note.kind}</span>
            <strong>${escapeHtml(note.title)}</strong>
            <p>${escapeHtml(preview.slice(0, 180))}</p>
            <div class="note-meta">
              <span>${new Date(note.createdAt).toLocaleDateString("es-ES", { dateStyle: "medium" })}</span>
              <span>·</span>
              <span>${note.source === "nfc" ? "NFC" : note.source === "camara" ? "Cámara" : "Manual"}</span>
              ${note.hasImage ? "<span>·</span><span>Con foto</span>" : ""}
            </div>
          </div>
          <div class="note-actions">
            <button type="button" data-action="view">Ver</button>
            <button type="button" data-action="delete">Eliminar</button>
          </div>
        `;
        div.querySelector('[data-action="view"]').addEventListener("click", () => openNote(note.id));
        div.querySelector('[data-action="delete"]').addEventListener("click", () => deleteNote(note.id, note.title));
        els.notesList.appendChild(div);
      });
    }

    async function createNote(payload) {
      const data = await api("/api/notes", { method: "POST", body: JSON.stringify(payload) });
      toast("Guardado en Notas y capturas.", "ok");
      await loadNotes();
      await loadContactos();
      return data.note;
    }

    async function addManualNote() {
      const title = els.noteTitle.value.trim();
      const content = els.noteContent.value.trim();
      if (!title && !content) {
        toast("Escribe un título o el contenido de la nota.", "error");
        return;
      }
      try {
        await createNote({ kind: "nota", title, content, source: "manual" });
        els.noteTitle.value = "";
        els.noteContent.value = "";
      } catch (err) {
        toast(err.message || "Error al guardar la nota.", "error");
      }
    }

    async function openNote(id) {
      try {
        const data = await api(`/api/notes?id=${encodeURIComponent(id)}`);
        const note = data.note;
        const contact = note.contact || {};
        const contactRows = [
          contact.name ? `<span>Nombre: ${escapeHtml(contact.name)}</span>` : "",
          contact.phone ? `<span>Teléfono: ${escapeHtml(contact.phone)}</span>` : "",
          contact.email ? `<span>Correo: ${escapeHtml(contact.email)}</span>` : "",
          contact.org ? `<span>Organización: ${escapeHtml(contact.org)}</span>` : "",
        ].filter(Boolean).join("");

        els.noteModalBody.innerHTML = `
          <span class="note-kind kind-${note.kind}">${NOTE_KIND_LABELS[note.kind] || note.kind}</span>
          <h2 id="noteModalTitle">${escapeHtml(note.title)}</h2>
          <div class="note-meta">
            <span>${new Date(note.createdAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</span>
            <span>·</span>
            <span>${note.source === "nfc" ? "NFC" : note.source === "camara" ? "Cámara" : "Manual"}</span>
          </div>
          ${note.content ? `<p>${escapeHtml(note.content)}</p>` : ""}
          ${contactRows ? `<div class="nfc-contact">${contactRows}</div>` : ""}
          ${note.image ? `<img src="${note.image}" alt="${escapeHtml(note.title)}">` : ""}
        `;
        els.noteModal.hidden = false;
        document.body.style.overflow = "hidden";
      } catch (err) {
        toast("No se pudo abrir la nota.", "error");
      }
    }

    function closeNoteModal() {
      els.noteModal.hidden = true;
      document.body.style.overflow = "";
    }

    async function deleteNote(id, title) {
      if (!confirm(`¿Eliminar "${title}"?`)) return;
      try {
        await api("/api/notes", { method: "DELETE", body: JSON.stringify({ id }) });
        toast("Nota eliminada.", "ok");
        await loadNotes();
        await loadContactos();
      } catch (err) {
        toast(err.message || "Error al eliminar la nota.", "error");
      }
    }

    /* ---------------------------------------------------------------- contactos */
    function renderContactos(notes) {
      const list = notes.filter(n => n.kind === "contacto");
      if (!list.length) {
        els.contactosList.innerHTML = '<p class="empty-state">Aún no tienes contactos guardados.</p>';
        if (els.contactosCount) els.contactosCount.textContent = "0 contactos";
        return;
      }
      if (els.contactosCount) els.contactosCount.textContent = `${list.length} contact${list.length === 1 ? "o" : "os"}`;
      els.contactosList.innerHTML = "";
      list.forEach(note => {
        const c = note.contact || {};
        const phoneDigits = String(c.phone || "").replace(/\D/g, "");
        const whatsappHref = phoneDigits ? `https://wa.me/${encodeURIComponent(phoneDigits)}` : "#";
        const meta = [
          c.phone ? `Teléfono: ${escapeHtml(c.phone)}` : "",
          c.email ? `Correo: ${escapeHtml(c.email)}` : "",
          c.org ? `Org.: ${escapeHtml(c.org)}` : "",
        ].filter(Boolean).join(" · ");
        const div = document.createElement("div");
        div.className = "contact-card";
        div.innerHTML = `
          <div class="contact-info">
            <strong>${escapeHtml(note.title || c.name || "Contacto sin nombre")}</strong>
            ${meta ? `<div class="contact-meta">${meta}</div>` : ""}
            ${note.content ? `<div class="contact-note">${escapeHtml(note.content)}</div>` : ""}
          </div>
          <div class="contact-actions">
            ${phoneDigits ? `<a class="contact-link" href="${whatsappHref}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
            <button type="button" data-contact-open="${escapeHtml(note.id)}">Ver</button>
          </div>
        `;
        div.querySelector('[data-contact-open]').addEventListener("click", () => openNote(note.id));
        els.contactosList.appendChild(div);
      });
    }

    async function loadContactos() {
      if (!currentUser) return;
      try {
        const data = await api("/api/notes");
        renderContactos(data.notes || []);
      } catch (e) {
        console.error(e);
      }
    }

    async function saveContact() {
      const name = els.contactName.value.trim();
      const phone = els.contactPhone.value.trim();
      const email = els.contactEmail.value.trim();
      const org = els.contactOrg.value.trim();
      const note = els.contactNote.value.trim();
      if (!name && !phone && !email && !org) {
        toast("Escribe al menos un nombre o un dato del contacto.", "error");
        els.contactName.focus();
        return;
      }
      try {
        await createNote({
          kind: "contacto",
          title: name || phone || email || "Contacto",
          content: note,
          contact: { name, phone, email, org },
          source: "manual",
        });
        els.contactName.value = "";
        els.contactPhone.value = "";
        els.contactEmail.value = "";
        els.contactOrg.value = "";
        els.contactNote.value = "";
        await loadContactos();
      } catch (err) {
        toast(err.message || "Error al guardar el contacto.", "error");
      }
    }

    function resetContactForm() {
      els.contactName.value = "";
      els.contactPhone.value = "";
      els.contactEmail.value = "";
      els.contactOrg.value = "";
      els.contactNote.value = "";
    }

    /* ---------------------------------------------------------------- github */
    async function loadGithubStatus() {
      const user = "gpb-codes";
      try {
        const res = await fetch(`https://api.github.com/users/${user}`, { headers: { "Accept": "application/vnd.github+json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        els.ghStatusText.textContent = "API pública disponible";
        els.ghStatusDetail.textContent = `${data.login} · ${data.public_repos} repos públicos · ${data.followers} seguidores`;
        els.ghIndicator.className = "status-indicator ok";
        els.statGithub.textContent = data.public_repos;

        // Recent repos
        const r2 = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=5`, { headers: { "Accept": "application/vnd.github+json" } });
        if (r2.ok) {
          const repos = await r2.json();
          if (Array.isArray(repos) && repos.length) {
            els.githubDetail.innerHTML = repos.map(r => `
              <div class="github-repo">
                <a href="${r.html_url}" target="_blank" rel="noreferrer">${escapeHtml(r.name)}</a>
                <span class="github-repo-meta">${escapeHtml(r.description || "Sin descripción")} · ⭐ ${r.stargazers_count}</span>
              </div>
            `).join("");
          } else {
            els.githubDetail.innerHTML = '<p class="empty-state">Sin repositorios públicos.</p>';
          }
        }
      } catch (e) {
        els.ghStatusText.textContent = "No disponible";
        els.ghStatusDetail.textContent = "No se pudo consultar la API pública de GitHub. Verifica tu conexión.";
        els.ghIndicator.className = "status-indicator warn";
        els.statGithub.textContent = "—";
        if (els.githubDetail) els.githubDetail.innerHTML = '<p class="empty-state">Actividad no disponible.</p>';
      }
    }

    /* ---------------------------------------------------------------- voz */
    let recognition = null;
    let isRecording = false;

    function initVoice() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        els.voiceStatus.textContent = "Tu navegador no soporta reconocimiento de voz.";
        els.voiceBtn.disabled = true;
        return;
      }
      recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        els.voiceTranscript.value += transcript + " ";
      };
      recognition.onerror = (event) => {
        els.voiceStatus.textContent = "Error: " + event.error;
        isRecording = false;
        els.voiceBtn.classList.remove("recording");
        els.voiceBtnText.textContent = "Iniciar dictado";
      };
      recognition.onend = () => {
        if (isRecording) { recognition.start(); }
      };
    }

    els.voiceBtn.addEventListener("click", () => {
      if (!recognition) return;
      if (isRecording) {
        isRecording = false;
        recognition.stop();
        els.voiceBtn.classList.remove("recording");
        els.voiceBtnText.textContent = "Iniciar dictado";
        els.voiceStatus.textContent = "Dictado detenido.";
      } else {
        isRecording = true;
        recognition.start();
        els.voiceBtn.classList.add("recording");
        els.voiceBtnText.textContent = "Detener dictado";
        els.voiceStatus.textContent = "Escuchando...";
      }
    });

    els.voiceClearBtn.addEventListener("click", () => { els.voiceTranscript.value = ""; });
    els.voiceCopyBtn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(els.voiceTranscript.value); toast("Copiado.", "ok"); }
      catch { toast("No se pudo copiar.", "error"); }
    });
    els.voiceSaveBtn.addEventListener("click", () => {
      const text = els.voiceTranscript.value.trim();
      if (!text) { toast("No hay texto para guardar.", "error"); return; }
      api("/api/tasks", { method: "POST", body: JSON.stringify({ title: text.slice(0, 80), description: text, priority: "media" }) })
        .then(() => { toast("Guardado como tarea.", "ok"); loadTasks(); })
        .catch(() => toast("Error al guardar.", "error"));
    });

    els.ttsBtn.addEventListener("click", () => {
      const text = els.ttsText.value.trim();
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      speechSynthesis.speak(utterance);
    });

    /* ---------------------------------------------------------------- chat */
    els.chatSendBtn.addEventListener("click", sendChat);
    els.chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChat(); });

    function sendChat() {
      const msg = els.chatInput.value.trim();
      if (!msg) return;
      els.chatInput.value = "";

      const msgDiv = document.createElement("div");
      msgDiv.className = "chat-msg chat-msg-user";
      msgDiv.innerHTML = `<div class="chat-avatar">Tú</div><div class="chat-bubble">${escapeHtml(msg)}</div>`;
      els.chatMessages.appendChild(msgDiv);
      els.chatMessages.scrollTop = els.chatMessages.scrollHeight;

      const aiDiv = document.createElement("div");
      aiDiv.className = "chat-msg chat-msg-ai";
      aiDiv.innerHTML = `<div class="chat-avatar">AI</div><div class="chat-bubble">IA no disponible: no hay backend configurado. Conecta OpenCode o Hermes para habilitar el chat.</div>`;
      els.chatMessages.appendChild(aiDiv);
      els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    }

    /* ---------------------------------------------------------------- ajustes */
    if (els.saveAiBtn) {
      els.saveAiBtn.addEventListener("click", async () => {
        if (!currentUser) return;
        els.saveAiBtn.disabled = true;
        try {
          await api("/api/preferences", {
            method: "PUT",
            body: JSON.stringify({
              aiApiKey: els.aiApiKey?.value || null,
              aiModel: els.aiModel?.value.trim() || null,
              aiBaseUrl: els.aiBaseUrl?.value.trim() || null,
            }),
          });
          currentUser.aiApiKey = els.aiApiKey?.value || null;
          currentUser.aiModel = els.aiModel?.value.trim() || null;
          currentUser.aiBaseUrl = els.aiBaseUrl?.value.trim() || null;
          toast("API key del asistente guardada.", "ok");
        } catch (err) {
          toast(err.message || "Error al guardar la API key.", "error");
        } finally {
          els.saveAiBtn.disabled = false;
        }
      });
    }

    els.savePrefsBtn.addEventListener("click", async () => {
      if (!currentUser) return;
      const activeColor = els.colorPicker.querySelector(".color-swatch.active");
      const activeAvatar = els.avatarPicker.querySelector(".avatar-option.active");
      const activeTheme = els.themePicker.querySelector(".theme-option.active");
      const accent = activeColor ? activeColor.dataset.color : null;
      const avatar = activeAvatar ? activeAvatar.dataset.avatarId : null;
      const theme = activeTheme ? activeTheme.dataset.theme : null;
      const displayName = els.displayName.value.trim() || null;
      const siteName = els.siteNameInput.value.trim();
      const siteTagline = els.siteTaglineInput.value.trim();
      const siteDescription = els.siteDescriptionInput.value.trim();

      if (!siteName) {
        toast("El nombre de la web no puede estar vacío.", "error");
        els.siteNameInput.focus();
        return;
      }
      if (siteName.length > 40) {
        toast("El nombre de la web no puede superar 40 caracteres.", "error");
        els.siteNameInput.focus();
        return;
      }

      els.savePrefsBtn.disabled = true;
      try {
        const data = await api("/api/preferences", {
          method: "PUT",
          body: JSON.stringify({ avatar, accent, theme, displayName, siteName, siteTagline, siteDescription }),
        });

        const site = applySiteSettings(data.site || { name: siteName, tagline: siteTagline, description: siteDescription });
        currentUser.site = site;
        fillSiteForm(site);

        const nextDisplayName = displayName || currentUser.name;
        currentUser.displayName = nextDisplayName;
        els.displayName.value = nextDisplayName;
        els.welcomeName.textContent = `Hola, ${nextDisplayName}`;
        els.userNameTop.textContent = nextDisplayName;
        if (els.sidebarName) els.sidebarName.textContent = nextDisplayName;
        if (accent) {
          currentUser.accent = accent;
          applyTheme(accent);
        }
        if (theme) {
          currentUser.theme = theme;
          applyThemeMode(theme);
        }
        if (avatar) {
          currentUser.avatar = avatar;
          const seed = currentUser?.email || "user";
          renderAvatar(avatar, els.userAvatar, seed);
          renderAvatar(avatar, els.userAvatarSmall, seed);
          if (els.sidebarAvatar) renderAvatar(avatar, els.sidebarAvatar, seed);
          els.profileAvatar.innerHTML = `<img src="${avatarUrl(avatar, seed)}" alt="">`;
        }
        toast("Ajustes guardados.", "ok");
      } catch (err) {
        toast(err.message || "Error al guardar los ajustes.", "error");
      } finally {
        els.savePrefsBtn.disabled = false;
      }
    });

    if (els.resetSiteBtn) {
      els.resetSiteBtn.addEventListener("click", () => {
        els.siteNameInput.value = SITE_DEFAULTS.name;
        els.siteTaglineInput.value = SITE_DEFAULTS.tagline;
        els.siteDescriptionInput.value = SITE_DEFAULTS.description;
        updateSitePreview();
        toast("Identidad restablecida. Guarda para aplicar los cambios.", "ok");
      });
    }

    if (els.goToSettingsBtn) {
      els.goToSettingsBtn.addEventListener("click", () => showTab("ajustes"));
    }

    [els.siteNameInput, els.siteTaglineInput, els.siteDescriptionInput].forEach(input => {
      if (input) input.addEventListener("input", updateSitePreview);
    });

    els.colorPicker.addEventListener("click", (e) => {
      const swatch = e.target.closest(".color-swatch");
      if (!swatch) return;
      els.colorPicker.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
    });

    if (els.themePicker) {
      els.themePicker.addEventListener("click", (e) => {
        const opt = e.target.closest(".theme-option");
        if (!opt) return;
        els.themePicker.querySelectorAll(".theme-option").forEach(s => s.classList.remove("active"));
        opt.classList.add("active");
      });
    }

    els.avatarPicker.addEventListener("click", (e) => {
      const opt = e.target.closest(".avatar-option");
      if (!opt) return;
      els.avatarPicker.querySelectorAll(".avatar-option").forEach(a => a.classList.remove("active"));
      opt.classList.add("active");
    });

    /* ---------------------------------------------------------------- tareas */
    els.addTaskBtn.addEventListener("click", addTask);
    els.taskInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });
    if (els.taskCategory) els.taskCategory.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });
    els.taskFilters.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      els.taskFilters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadTasks();
    });
    if (els.taskModal) {
      els.taskModalClose?.addEventListener("click", closeTaskModal);
      els.taskModalSave?.addEventListener("click", saveTask);
      els.taskModalDelete?.addEventListener("click", deleteTask);
      document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeTaskModal));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !els.taskModal.hidden) closeTaskModal(); });
    }

    /* ---------------------------------------------------------------- proyectos */
    if (els.addProjectBtn) els.addProjectBtn.addEventListener("click", addProject);
    if (els.projectNameInput) {
      els.projectNameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addProject(); });
    }
    if (els.projectFilters) {
      els.projectFilters.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        els.projectFilters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProjects(allProjects);
      });
    }

    /* ---------------------------------------------------------------- captura */
    if (els.nfcReadBtn) els.nfcReadBtn.addEventListener("click", startNfcScan);
    if (els.nfcStopBtn) els.nfcStopBtn.addEventListener("click", () => stopNfcScan(true));
    if (els.nfcWriteBtn) els.nfcWriteBtn.addEventListener("click", writeNfcTag);
    if (els.nfcResult) {
      els.nfcResult.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-nfc-save]");
        if (!btn) return;
        saveNfcCapture(btn.dataset.nfcSave);
      });
    }
    if (els.cameraStartBtn) els.cameraStartBtn.addEventListener("click", startCamera);
    if (els.cameraCaptureBtn) els.cameraCaptureBtn.addEventListener("click", capturePhoto);
    if (els.cameraStopBtn) els.cameraStopBtn.addEventListener("click", resetCamera);
    if (els.photoSaveBtn) els.photoSaveBtn.addEventListener("click", savePhotoNote);
    if (els.addNoteBtn) els.addNoteBtn.addEventListener("click", addManualNote);
    if (els.noteContent) {
      els.noteContent.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addManualNote();
      });
    }
    if (els.noteFilters) {
      els.noteFilters.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        els.noteFilters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderNotes(allNotes);
      });
    }
    if (els.saveContactBtn) els.saveContactBtn.addEventListener("click", saveContact);
    if (els.resetContactBtn) els.resetContactBtn.addEventListener("click", resetContactForm);
    if (els.contactosList) {
      els.contactosList.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-contact-open]");
        if (btn) openNote(btn.dataset.contactOpen);
      });
    }
    if (els.noteModalClose) els.noteModalClose.addEventListener("click", closeNoteModal);
    document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeNoteModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.noteModal && !els.noteModal.hidden) closeNoteModal();
    });

    /* ---------------------------------------------------------------- búsqueda global */
    if (els.globalSearch) {
      els.globalSearch.addEventListener("input", () => {
        const q = els.globalSearch.value.trim().toLowerCase();
        if (!q) { renderProjects(allProjects); loadTasks(); return; }
        const tasks = Array.from(els.taskList.querySelectorAll(".task-item"));
        tasks.forEach(item => {
          item.hidden = !item.querySelector(".task-title").textContent.toLowerCase().includes(q);
        });
        renderProjects(allProjects.filter(p =>
          p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
        ));
      });
      els.globalSearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const q = els.globalSearch.value.trim().toLowerCase();
          if (!q) return;
          const taskMatch = Array.from(els.taskList.querySelectorAll(".task-item")).some(i => !i.hidden);
          showTab(taskMatch ? "tareas" : "proyectos");
        }
      });
    }

    /* ---------------------------------------------------------------- tema rápido */
    if (els.themeToggle) {
      els.themeToggle.addEventListener("click", async () => {
        if (!currentUser) return;
        const next = document.body.classList.contains("light") ? "oscuro" : "claro";
        applyThemeMode(next);
        els.themePicker.querySelectorAll(".theme-option").forEach(b => b.classList.toggle("active", b.dataset.theme === next));
        currentUser.theme = next;
        try { await api("/api/preferences", { method: "PUT", body: JSON.stringify({ theme: next }) }); } catch (e) {}
        toast(next === "claro" ? "Tema claro activado." : "Tema oscuro activado.", "ok");
      });
    }

    /* ---------------------------------------------------------------- quick voice */
    if ($("quickVoiceBtn")) {
      $("quickVoiceBtn").addEventListener("click", () => showTab("voz"));
    }

    /* ---------------------------------------------------------------- particles */
    function initParticles() {
      const canvas = els.particles;
      const ctx = canvas.getContext("2d");
      let w, h, particles = [];
      const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
      resize();
      window.addEventListener("resize", resize);
      const count = Math.min(60, Math.floor((w * h) / 22000));
      for (let i = 0; i < count; i++) particles.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5+0.3, vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25, a: Math.random()*0.4+0.15 });
      function draw() {
        ctx.clearRect(0,0,w,h);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(167, 139, 250, ${p.a})`; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 120) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(139,92,246,${0.1*(1-dist/120)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
        requestAnimationFrame(draw);
      }
      draw();
    }


    // PWA install prompt
    let deferredInstallPrompt = null;
    const setInstallStatus = (text, showBtn = false) => {
      if (els.installStatus) els.installStatus.textContent = text;
      if (els.installBtn) els.installBtn.hidden = !showBtn;
    };
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      setInstallStatus("Nexo se puede instalar como app web. Acepta el aviso del navegador para instalarla.", true);
    });
    if (els.installBtn) {
      els.installBtn.addEventListener("click", async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        try {
          const choice = await deferredInstallPrompt.userChoice;
          if (choice === "accepted") setInstallStatus("¡Instalación aceptada! Abre Nexo desde los iconos de tu dispositivo.", false);
          else setInstallStatus("La instalación se canceló. Puedes intentarlo de nuevo desde el navegador.", false);
        } catch (e) {
          setInstallStatus("La instalación no se pudo completar.", false);
        }
        deferredInstallPrompt = null;
        els.installBtn.hidden = true;
      });
    }
    setInstallStatus("Nexo está instalable como app web. Usa “Instalar como app” en el navegador si el sistema lo pide.");

    if (els.downloadAppBtn) els.downloadAppBtn.addEventListener("click", downloadApp);
    if (els.supportBtn) els.supportBtn.addEventListener("click", showSupportModal);
    if (els.supportModalClose) els.supportModalClose.addEventListener("click", closeSupportModal);
    document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeSupportModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && els.supportModal && !els.supportModal.hidden) closeSupportModal();
    });

    // Descargar app y apoyo al proyecto
    async function downloadApp() {
      toast("Preparando la app descargable...", "info");
      try {
        const [html, css, appJs, avatarsJs] = await Promise.all([
          fetch("/index.html").then(r => r.text()),
          fetch("/styles.css").then(r => r.text()),
          fetch("/app.js").then(r => r.text()),
          fetch("/avatars.js").then(r => r.text())
        ]);
        const base = location.origin + "/";
        const selfContained = html
          .replace('<head>', `<head><base href="${base}">`)
          .replace('<link rel="stylesheet" href="styles.css">', `<style>${css}</style>`)
          .replace('<script src="app.js"></script>', `<script>${appJs}</script>`)
          .replace('<script src="avatars.js"></script>', `<script>${avatarsJs}</script>`);
        const blob = new Blob([selfContained], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Nexo-Segundo-Cerebro.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast("Descargando la app autodefinida...", "ok");
      } catch (err) {
        toast("No se pudo preparar la app descargable.", "error");
      }
    }

    function closeSupportModal() {
      if (els.supportModal) {
        els.supportModal.hidden = true;
        document.body.style.overflow = "";
      }
    }

    function openBankTransfer() {
      // Banco Estado es el banco preferido por el usuario; abre su página de transferencias.
      window.open("https://www.bancoestado.cl/cims/Transferencia_de_Balance", "_blank", "noopener");
    }

    function showSupportModal() {
      if (!els.supportModalBody) return;
      els.supportModalBody.innerHTML = `
        <h2>Apoyar Nexo</h2>
        <div class="support-list">
          <div class="support-row"><span class="support-label">RUT</span><span class="support-value">22536637-3</span></div>
          <div class="support-row"><span class="support-label">Banco</span><span class="support-value">Estado</span></div>
          <div class="support-row"><span class="support-label">CuentaRUT</span><span class="support-value">00022536637</span></div>
          <div class="support-row"><span class="support-label">Monto sugerido</span><span class="support-value">10.000 CLP</span></div>
          <div class="support-row"><span class="support-label">Descripción</span><span class="support-value">Apoyo al proyecto Nexo (segundo cerebro)</span></div>
        </div>
        <div class="support-cta">
          <a class="btn btn-primary btn-sm" href="https://www.bancoestado.cl/cims/Transferencia_de_Balance" target="_blank" rel="noopener">Abrir transferencia Banco Estado</a>
        </div>
      `;
      if (els.supportModal) {
        els.supportModal.hidden = false;
        document.body.style.overflow = "hidden";
      }
    }

    // Event listeners
    els.loginForm.addEventListener("submit", (e) => { e.preventDefault(); doLogin(); });
    els.registerForm.addEventListener("submit", (e) => { e.preventDefault(); doRegister(); });
    els.logoutBtn.addEventListener("click", logout);
    if (els.logoutBtnProfile) els.logoutBtnProfile.addEventListener("click", logout);

    document.querySelectorAll("[data-auth]").forEach(btn => {
      btn.addEventListener("click", () => showAuthView(btn.dataset.auth));
    });

    document.querySelectorAll(".toggle-pass").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = $(btn.dataset.target);
        if (input) input.type = input.type === "password" ? "text" : "password";
      });
    });

    async function boot() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
      initParticles();
      try {
        const data = await api("/api/me");
        await loadApp(data.user);
      } catch (e) {
        currentUser = null;
        showAuth();
      }
    }
    boot();
  }
})();
