/* ============================================================
   SOSI CODEX — sidebar.js  (v6)
   Menú lateral: se genera desde SERVICIOS + toggle + overlay
   Agrupado por categoría con subopciones desplegables.
   ============================================================ */

(function initSidebar() {
    const nav = document.getElementById("sidebarNav");

    /* Generar dinámicamente las opciones reales del proyecto */
    if (nav && typeof SERVICIOS !== "undefined") {
        let html = `
            <span class="nav-section">General</span>
            <a href="index.html" class="nav-item ${location.pathname.endsWith("index.html") || location.pathname === "/" ? "active" : ""}">${svgIcon("home", 15)}<span>Inicio</span></a>`;

        CATEGORIAS.forEach(cat => {
            const items = SERVICIOS.filter(s => s.cat === cat.id);
            if (!items.length) return;
            const activoEnCat = items.some(s => s.href === location.pathname.split("/").pop());
            html += `<span class="nav-section">${cat.nombre}</span>`;
            items.forEach(s => {
                const esActual = s.href === location.pathname.split("/").pop();
                html += `<a href="${s.href}" class="nav-item ${esActual ? "active" : ""}">${svgIcon(s.icon, 15)}<span>${s.nombre}</span></a>`;
            });
        });

        nav.innerHTML = html;
    }

    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const sidebarToggle = document.getElementById("sidebarToggle");
    const menuBtn = document.getElementById("menuBtn");

    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);

    function toggle() {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");
    }

    function close() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    }

    overlay.addEventListener("click", close);
    if (sidebarToggle) sidebarToggle.addEventListener("click", toggle);
    if (menuBtn) menuBtn.addEventListener("click", toggle);

    document.addEventListener("click", (e) => {
        if (!sidebar.classList.contains("open")) return;
        const dentro = sidebar.contains(e.target);
        const esBoton =
            (menuBtn && menuBtn.contains(e.target)) ||
            (sidebarToggle && sidebarToggle.contains(e.target));
        if (!dentro && !esBoton) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
    });
})();
