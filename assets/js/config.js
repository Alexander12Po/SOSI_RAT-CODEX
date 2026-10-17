/* ============================================================
   SOSI CODEX — config.js
   Punto único de configuración global
   ============================================================ */

const CONFIG = Object.freeze({
    /* Autenticación: Firebase Auth (ver assets/js/firebase.js).
       Ya no se depende de SUPABASE_URL / SUPABASE_ANON_KEY. */
    FIREBASE: { projectId: "sosi-codex" },
    BACKEND_URL: "https://backend-dni.onrender.com",
    ENDPOINTS: {
        estado: "/estado",
        consultaDni: "/consulta-dni",
        consultaNombre: "/consulta-nombre",
        consultaGenealogica: "/consulta-genealogica"
    },
    LOADER: {
        maxIntentos: 15,
        intervaloMs: 1500
    },
    DNI: {
        longitud: 8
    }
});
