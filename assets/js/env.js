/* ============================================================
   SOSI CODEX — env.js
   Puente de configuración: Vercel Environment Variables → CONFIG.

   Prioridad:
   1) window.SOSI_ENV (inyectado por vercel.json con ${env.XXX})
   2) localStorage override "sosi_supabase" {url, anonKey} (solo anon key pública)
   3) valores de config.js (por defecto vacíos)

   NOTA DE SEGURIDAD: aquí solo puede existir la clave ANON/PUBLIC.
   La service_role/secret JAMÁS se expone en el navegador.
   ============================================================ */
(function () {
    var base = ((typeof CONFIG !== "undefined" && CONFIG.SUPABASE) ? CONFIG.SUPABASE : {});
    try { if (base === window.SOSI_SUPABASE) base = {}; } catch (e) {}
    base = Object.assign({}, base);

    /* --- Inyección en el despliegue: Vercel sustituye ${env.XXX} por el valor
       de la variable de entorno al publicar. Si los marcadores no fueron
       sustituidos (entorno local), se ignoran automáticamente. --- */
    try {
        var tplUrl = "${env.SUPABASE_URL}";
        var tplKey = "${env.SUPABASE_ANON_KEY}";
        if (/^https:\/\/.+/.test(tplUrl)) base.url = tplUrl;
        if (/^[A-Za-z0-9_\-\.]{20,}$/.test(tplKey)) base.anonKey = tplKey;
    } catch (e) {}
    /* SOSI_ENV puede venir como objeto (inyectado en runtime por Vercel) o
       como bloque de texto sustituido en el despliegue. */
    var raw = window.SOSI_ENV;
    if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch (e) { raw = null; } }
    var inj = (raw && typeof raw === "object") ? raw : {};
    var url = inj.SUPABASE_URL || base.url || "";
    var key = inj.SUPABASE_ANON_KEY || base.anonKey || "";
    try {
        var ov = JSON.parse(localStorage.getItem("sosi_supabase") || "null");
        if (ov && !url && ov.url) url = ov.url;
        if (ov && !key && ov.anonKey) key = ov.anonKey;
    } catch (e) {}
    window.SOSI_SUPABASE = {
        enabled: !!(url && key),
        url: url,
        anonKey: key,
        providers: base.providers || ["google", "github", "discord"]
    };
})();
