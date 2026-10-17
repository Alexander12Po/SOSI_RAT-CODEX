/* ============================================================
   SOSI CODEX — config.js
   Punto único de configuración global
   ============================================================ */

const CONFIG = Object.freeze({
    /* Supabase Auth — deja enabled:false hasta completar la configuración.
       Pega tu URL y tu anon key reales cuando tengas tu proyecto de Supabase. */
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
