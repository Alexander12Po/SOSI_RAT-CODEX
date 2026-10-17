/* ============================================================
   SOSI CODEX — api/supabase-config.js  (Serverless en Vercel)
   Expone al navegador SOLO la URL del proyecto y la ANON KEY
   (clave publica), leidas de las Environment Variables reales
   de Vercel: SUPABASE_URL y SUPABASE_ANON_KEY.
   La service_role / secret JAMAS se lee ni se envia aqui.
   ============================================================ */
module.exports = (req, res) => {
    const url = process.env.SUPABASE_URL || "";
    const anonKey = process.env.SUPABASE_ANON_KEY || "";

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!url || !anonKey) {
        return res.status(501).json({
            ok: false,
            error: "Faltan SUPABASE_URL o SUPABASE_ANON_KEY en Vercel (Project Settings -> Environment Variables) y luego Redeploy."
        });
    }
    return res.status(200).json({ ok: true, url, anonKey });
};
