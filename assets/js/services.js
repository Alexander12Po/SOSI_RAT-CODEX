/* ============================================================
   SOSI CODEX — services.js
   Catálogo único de servicios (fuente para home + sidebar)
   live = implementado · soon = aún no disponible (se indica claro)
   ============================================================ */

const CATEGORIAS = [
    { id: "personales", nombre: "Personales" },
    { id: "vehiculares", nombre: "Vehiculares" },
    { id: "contactos",  nombre: "Contactos" },
    { id: "inmobiliar", nombre: "Inmobiliario" },
    { id: "otros",      nombre: "Otros" }
];

/* key = parámetro de consulta (servicio.html?key=xxx) */
const SERVICIOS = Object.freeze([
    { key: "dni",         icon: "idcard",    nombre: "DNI",             cat: "personales" },
    { key: "dni-azul",    icon: "idcard",    nombre: "DNI Azul",        cat: "personales" },
    { key: "dni-amarillo",icon: "idcard",    nombre: "DNI Amarillo",    cat: "personales" },
    { key: "dni-elec",    icon: "chip",      nombre: "DNI Electrónico", cat: "personales" },
    { key: "dni-virtual", icon: "cloud",     nombre: "DNI Virtual",     cat: "personales" },
    { key: "genealogica", icon: "users",     nombre: "Genealógica",      cat: "personales" },
    { key: "nombre",      icon: "search",    nombre: "Búsqueda por Nombre", cat: "personales" },
    { key: "vehicular",   icon: "car",       nombre: "Vehicular",       cat: "vehiculares" },
    { key: "telefonos",   icon: "phone",     nombre: "Teléfonos",       cat: "contactos" },
    { key: "inmuebles",   icon: "mapPin",    nombre: "Inmuebles",       cat: "inmobiliar" },
    { key: "sueldos",     icon: "coin",      nombre: "Sueldos",         cat: "otros" },
    { key: "trabajos",    icon: "briefcase", nombre: "Trabajos",        cat: "otros" },
    { key: "c4",          icon: "shield",    nombre: "C4",              cat: "otros" }
]);

/* Servicios con backend real implementado */
const LIVE_KEYS = Object.freeze({ dni: true, nombre: true, genealogica: true });

/* Página propia por servicio (fuera de consulta.html) */
function svcHref(s) {
    if (s.key === "nombre") return "nombre.html";
    if (s.key === "genealogica") return "genealogica.html";
    return LIVE_KEYS[s.key] ? "consulta.html?key=" + s.key : "servicio.html?key=" + s.key;
}
function svcLive(s) {
    return !!LIVE_KEYS[s.key];
}
function svcByKey(key) {
    return SERVICIOS.find(s => s.key === key) || null;
}
