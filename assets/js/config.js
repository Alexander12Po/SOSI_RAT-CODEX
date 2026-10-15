/* ============================================================
   SOSI CODEX — config.js
   Punto único de configuración global
   ============================================================ */

const CONFIG = Object.freeze({
    BACKEND_URL: "https://backend-dni.onrender.com",
    ENDPOINTS: {
        estado: "/estado",
        consultaDni: "/consulta-dni",
        consultaNombre: "/consulta-nombre"
    },
    LOADER: {
        maxIntentos: 15,
        intervaloMs: 1500
    },
    DNI: {
        longitud: 8
    }
});
