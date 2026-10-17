/* ============================================================
   SOSI CODEX — env.js
   Puente de configuracion de Supabase para hosting estatico.

   Fuentes (por prioridad):
   1) localStorage override "sosi_supabase" {url, anonKey}
      (panel "Configurar Supabase" del login; solo anon key publica)
   2) valores hardcodeados en config.js (CONFIG.SUPABASE)
   3) endpoint serverless /api/supabase-config (lee las variables
      REALES de Vercel: SUPABASE_URL y SUPABASE_ANON_KEY en runtime)

   NOTA DE SEGURIDAD: aqui solo puede existir la clave ANON/PUBLIC.
   La service_role/secret JAMAS se expone en el navegador.
   ============================================================ */
(function () {
    var base = ((typeof CONFIG !== "undefined" && CONFIG.SUPABASE) ? CONFIG.SUPABASE : {});
    try { if (base === window.SOSI_SUPABASE) base = {}; } catch (e) {}
    base = Object.assign({}, base);

    var url = base.url || "";
    var key = base.anonKey || "";

    /* Override local del usuario (anon key publica, no secreto) */
    try {
        var ov = JSON.parse(localStorage.getItem("sosi_supabase") || "null");
        if (ov && !url && ov.url) url = ov.url;
        if (ov && !key && ov.anonKey) key = ov.anonKey;
    } catch (e) {}

    function publicar() {
        window.SOSI_SUPABASE = {
            enabled: !!(url && key),
            url: url,
            anonKey: key,
            providers: base.providers || ["google", "github", "discord"]
        };
        document.dispatchEvent(new Event("sosi:env-ready"));
    }

    publicar();

    /* Si aun faltan credenciales, pedirlas al serverless de Vercel */
    if (!url || !key) {
        fetch("/api/supabase-config", { cache: "no-store" })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (j) {
                if (j && j.ok && j.url && j.anonKey) {
                    url = j.url; key = j.anonKey;
                    publicar();
                    /* Reintentar init de AUTH si ya se ejecuto sin credenciales */
                    try { if (window.AUTH && !AUTH.isConfigured()) AUTH.init(); } catch (e) {}
                }
            })
            .catch(function () { /* sigue sin credenciales: los botones lo indican */ });
    }
})();
