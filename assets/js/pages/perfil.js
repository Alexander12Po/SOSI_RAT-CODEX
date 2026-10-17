/* SOSI CODEX — perfil.js (protegido) */
(function () {
    const card = document.getElementById("profileCard");

    function render(u) {
        if (!u) {
            card.innerHTML = `<div class="guest-note">Necesitas iniciar sesión para ver tu perfil.<br><a href="/login.html">Iniciar sesión</a></div>`;
            return;
        }
        const m = u.user_metadata || {};
        const prov = (u.app_metadata && u.app_metadata.provider) || "correo";
        const created = u.created_at ? new Date(u.created_at).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" }) : "—";
        card.innerHTML = `
            <div class="profile-hero">
                ${AUTH.avatarHtml(u, 48)}
                <div>
                    <div class="profile-name">${AUTH.esc(AUTH.nombre(u))}</div>
                    <div class="profile-mail">${AUTH.esc(u.email || "")}</div>
                </div>
            </div>
            <div class="kv-row"><span class="kv-k">Proveedor</span><span class="kv-v">${AUTH.esc(prov)}</span></div>
            <div class="kv-row"><span class="kv-k">Correo verificado</span><span class="kv-v">${u.email_confirmed_at ? "Sí" : "Pendiente"}</span></div>
            <div class="kv-row"><span class="kv-k">Miembro desde</span><span class="kv-v">${created}</span></div>
            <div class="kv-row"><span class="kv-k">ID de usuario</span><span class="kv-v" style="font-family:var(--font-mono);font-size:11px">${AUTH.esc((u.uid || "").slice(0, 8))}…</span></div>`;
    }

    AUTH.onChange(render);
    /* si tras 1.5s sigue sin sesión y auth está configurado, redirigir a /login */
    setTimeout(() => { if (AUTH.isConfigured() && !AUTH.user()) location.replace("/login.html"); }, 1500);
})();
