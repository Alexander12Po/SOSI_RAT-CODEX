/* ============================================================
   SOSI CODEX — pages/home.js  (v5)
   Cuadrícula de servicios: icono + nombre, sin párrafos.
   Puntos de estado por color (verde = vivo, ámbar = pronto).
   ============================================================ */

(function initHome() {
    const grid = document.getElementById("servicesGrid");
    if (!grid) return;

    const SERVICIOS = [
        { icon: "idcard",     nombre: "DNI",              href: "consulta.html", live: true },
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

    grid.innerHTML = SERVICIOS.map((s, i) => `
        <a href="${s.href}" class="svc ${s.live ? "svc-live" : "svc-soon"}" style="animation-delay:${0.04 * i}s">
            <div class="svc-icon">${svgIcon(s.icon, 18)}</div>
            <h3>${s.nombre}</h3>
            <span class="svc-go">${svgIcon("arrowRight", 14)}</span>
        </a>
    `).join("");
})();
