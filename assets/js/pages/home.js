/* ============================================================
   SOSI CODEX — pages/home.js
   Renderiza la cuadrícula de servicios desde datos
   ============================================================ */

(function initHome() {
    const grid = document.getElementById("servicesGrid");
    if (!grid) return;

    const SERVICIOS = [
        { icon: "idcard",     nombre: "Consulta DNI",     href: "consulta.html", live: true },
        { icon: "car",        nombre: "Vehicular",        href: "#" },
        { icon: "users",      nombre: "Genealógica",      href: "#" },
        { icon: "phone",      nombre: "Teléfonos",        href: "#" },
        { icon: "coin",       nombre: "Sueldos",          href: "#" },
        { icon: "briefcase",  nombre: "Trabajos",         href: "#" },
        { icon: "shield",     nombre: "C4",               href: "#" },
        { icon: "cloud",      nombre: "DNI Virtual",      href: "#" },
        { icon: "idcard",     nombre: "DNI Azul",         href: "#" },
        { icon: "idcard",     nombre: "DNI Amarillo",     href: "#" },
        { icon: "chip",       nombre: "DNI Electrónico",  href: "#" }
    ];

    grid.innerHTML = SERVICIOS.map(s => `
        <a href="${s.href}" class="svc ${s.live ? "svc-live" : ""}">
            <div class="svc-icon">${svgIcon(s.icon, 18)}</div>
            <h3>${s.nombre}</h3>
            ${s.live ? '<span class="svc-tag">Disponible</span>' : ""}
            <span class="svc-go">${svgIcon("arrowRight", 15)}</span>
        </a>
    `).join("");
})();
