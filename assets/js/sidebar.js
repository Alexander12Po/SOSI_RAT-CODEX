/* ============================================================
   SOSI CODEX — sidebar.js
   Menú lateral: toggle móvil + overlay
   ============================================================ */

(function initSidebar() {
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
