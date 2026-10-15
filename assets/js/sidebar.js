/* ============================================================
   SOSI CODEX — sidebar.js  (v6)
   Menú lateral: se genera desde SERVICIOS + toggle + overlay
   Agrupado por categoría con subopciones desplegables.
   ============================================================ */

(function initSidebar() {
    const nav = document.getElementById("sidebarNav");

    /* Generar dinámicamente las opciones reales del proyecto */
    let pageFile = location.pathname.replace(/^\/+/, "").replace(/\.html$/, "") || "index";
    if (typeof SERVICIOS !== "undefined") {
        let html = `
            <span class="nav-section">General</span>
            <a href="/" class="nav-item ${pageFile === "index" ? "active" : ""}">${svgIcon("home", 15)}<span>Inicio</span></a>`;

        const curKey = new URLSearchParams(location.search).get("key");

        CATEGORIAS.forEach(cat => {
            const items = SERVICIOS.filter(s => s.cat === cat.id);
            if (!items.length) return;
            html += `<span class="nav-section">${cat.nombre}</span>`;
            items.forEach(s => {
                const href = svcHref(s);
                const file = href.split("?")[0].replace(/\.html$/, "").replace(/^\/+/, "") || "index";
                const esActual = file === pageFile && (curKey === s.key || !curKey);
                html += `<a href="${href}" class="nav-item ${esActual ? "active" : ""}">${svgIcon(s.icon, 15)}<span>${s.nombre}</span></a>`;
            });
        });

        if (nav) nav.innerHTML = html;
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
