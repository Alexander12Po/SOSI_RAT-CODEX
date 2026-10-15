/* ============================================================
   SOSI CODEX — services.js
   Catálogo único de servicios (fuente para home + sidebar)
   live = implementado · soon = aún no disponible (se indica claro)
   ============================================================ */

const CATEGORIAS = [
    { id: "personales", nombre: "Personales" },
    { id: "vehiculares", nombre: "Vehiculares" },
    { id: "contactos",  nombre: "Contactos" },
    { id: "otros",      nombre: "Otros" }
];

const SERVICIOS = Object.freeze([
    { icon: "idcard",    nombre: "DNI",             href: "consulta.html", live: true,  cat: "personales" },
    { icon: "idcard",    nombre: "DNI Azul",        href: "#", cat: "personales" },
    { icon: "idcard",    nombre: "DNI Amarillo",    href: "#", cat: "personales" },
    { icon: "chip",      nombre: "DNI Electrónico", href: "#", cat: "personales" },
    { icon: "cloud",     nombre: "DNI Virtual",     href: "#", cat: "personales" },
    { icon: "users",     nombre: "Genealógica",     href: "#", cat: "personales" },
    { icon: "car",       nombre: "Vehicular",       href: "#", cat: "vehiculares" },
    { icon: "phone",     nombre: "Teléfonos",       href: "#", cat: "contactos" },
    { icon: "coin",      nombre: "Sueldos",         href: "#", cat: "otros" },
    { icon: "briefcase", nombre: "Trabajos",        href: "#", cat: "otros" },
    { icon: "shield",    nombre: "C4",              href: "#", cat: "otros" }
]);
