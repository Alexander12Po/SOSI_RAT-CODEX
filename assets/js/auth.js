/* ============================================================
   SOSI CODEX — auth.js
   Capa de autenticación con Supabase Auth (OAuth + correo).
   - Reutiliza CONFIG.SUPABASE (URL + anon key pública).
   - Sesión gestionada por supabase-js (persistencia segura:
     localStorage con tokens JWT del propio SDK; refresh automático).
   - Renderiza el widget de cuenta en topbar y sidebar.
   - No bloquea páginas públicas: solo muestra estado de sesión.
   ============================================================ */

const AUTH = (() => {
    const PROVIDERS = [
        { id: "google",  nombre: "Google" },
        { id: "github",  nombre: "GitHub" },
        { id: "discord", nombre: "Discord" }
    ];

    let client = null;          // instancia Supabase
    let ready = false;          // cliente inicializado correctamente
    let cfg = null;             // CONFIG.SUPABASE
    const listeners = [];       // suscriptores de cambios de sesión
    let currentUser = null;

    function notify() { listeners.forEach(fn => { try { fn(currentUser); } catch (_) {} }); }

    /* ---------- inicialización ---------- */
    async function init() {
        cfg = (typeof CONFIG !== "undefined" && CONFIG.SUPABASE) ? CONFIG.SUPABASE : null;
        if (!cfg || !cfg.enabled || !cfg.url || !cfg.anonKey || !window.supabase) {
            /* Sin credenciales todavía: igualmente mostramos el widget (botón "Iniciar sesión") */
            renderAccount();
            return false;
        }
        try {
            client = window.supabase.createClient(cfg.url, cfg.anonKey, {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            });
            const { data } = await client.auth.getSession();
            currentUser = data.session ? data.session.user : null;
            client.auth.onAuthStateChange((_evt, session) => {
                currentUser = session ? session.user : null;
                renderAccount();
                notify();
            });
            ready = true;
            renderAccount();
            return true;
        } catch (e) {
            console.warn("[auth] no disponible:", e && e.message);
            return false;
        }
    }

    /* ---------- helpers de usuario ---------- */
    function nombre(u) {
        if (!u) return "";
        const m = u.user_metadata || {};
        return m.full_name || m.name || m.preferred_username || m.user_name ||
               (u.email ? u.email.split("@")[0] : "Usuario");
    }
    function iniciales(u) {
        const n = nombre(u);
        return n.slice(0, 2).toUpperCase();
    }
    function avatarHtml(u, size) {
        size = size || 30;
        const m = (u && u.user_metadata) || {};
        const url = m.avatar_url || m.picture || m.avatar_url;
        if (url) {
            return `<img class="acct-avatar" src="${url}" alt="" referrerpolicy="no-referrer" style="width:${size}px;height:${size}px">`;
        }
        return `<span class="acct-avatar acct-avatar-txt" style="width:${size}px;height:${size}px">${iniciales(u)}</span>`;
    }

    /* ---------- OAuth ---------- */
    async function oauth(providerId) {
        if (!ready) { toast("Autenticación no configurada todavía.", "error"); return; }
        try {
            const { error } = await client.auth.signInWithOAuth({
                provider: providerId,
                options: { redirectTo: location.origin + location.pathname }
            });
            if (error) toast(error.message || "No se pudo iniciar sesión.", "error");
        } catch (e) {
            toast("Error al iniciar sesión con el proveedor.", "error");
        }
    }

    /* ---------- correo / contraseña ---------- */
    async function signUp(email, password, displayName) {
        requireReady();
        const { error } = await client.auth.signUp({
            email, password,
            options: { data: { full_name: displayName }, emailRedirectTo: location.origin + "/login" }
        });
        if (error) throw new Error(traducirError(error));
    }
    async function signIn(email, password) {
        requireReady();
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new Error(traducirError(error));
    }
    async function resetPassword(email) {
        requireReady();
        const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: location.origin + "/login?reset=1"
        });
        if (error) throw new Error(traducirError(error));
    }
    async function updatePassword(newPassword) {
        requireReady();
        const { error } = await client.auth.updateUser({ password: newPassword });
        if (error) throw new Error(traducirError(error));
    }
    async function signOut() {
        if (!ready) return;
        await client.auth.signOut();
        currentUser = null;
        renderAccount();
        notify();
    }

    function traducirError(e) {
        const m = (e.message || "").toLowerCase();
        if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
        if (m.includes("already registered") || m.includes("already exists")) return "Ese correo ya está registrado.";
        if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Espera un momento.";
        if (m.includes("confirm")) return "Revisa tu correo para confirmar la cuenta antes de iniciar sesión.";
        if (m.includes("password")) return "La contraseña no cumple los requisitos mínimos.";
        return e.message || "Ocurrió un error inesperado.";
    }
    function requireReady() {
        if (!ready) throw new Error("La autenticación no está configurada. Añade las credenciales de Supabase en config.js.");
    }

    /* ---------- estado ---------- */
    function user() { return currentUser; }
    function isConfigured() { return ready; }
    function onChange(fn) { listeners.push(fn); fn(currentUser); }

    /* ---------- widget de cuenta (topbar + sidebar) ---------- */
    function renderAccount() {
        const slotTop = document.getElementById("accountSlot");
        const slotSide = document.getElementById("accountSidebar");
        if (slotTop) slotTop.innerHTML = accountTopbarHtml();
        if (slotSide) slotSide.innerHTML = accountSidebarHtml();
        bindAccountEvents();
    }

    function accountTopbarHtml() {
        if (currentUser) {
            return `
            <div class="acct-wrap">
                <button class="acct-btn" id="acctBtn" aria-label="Menú de cuenta" aria-haspopup="true">
                    ${avatarHtml(currentUser, 28)}
                    <span class="acct-name">${esc(nombre(currentUser))}</span>
                </button>
                <div class="acct-menu" id="acctMenu" role="menu">
                    <div class="acct-menu-head">
                        ${avatarHtml(currentUser, 34)}
                        <div>
                            <div class="acct-menu-name">${esc(nombre(currentUser))}</div>
                            <div class="acct-menu-mail">${esc(currentUser.email || "")}</div>
                        </div>
                    </div>
                    <a href="/perfil.html" class="acct-item" role="menuitem">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
                        Mi perfil
                    </a>
                    <a href="/configuracion.html" class="acct-item" role="menuitem">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
                        Configuración
                    </a>
                    <button class="acct-item acct-logout" id="acctLogout" type="button">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Cerrar sesión
                    </button>
                </div>
            </div>`;
        }
        return `<a href="/login.html" class="btn-login" id="btnLoginTop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Iniciar sesión
        </a>`;
    }

    function accountSidebarHtml() {
        if (currentUser) {
            return `
            <div class="side-acct">
                ${avatarHtml(currentUser, 34)}
                <div class="side-acct-info">
                    <div class="side-acct-name">${esc(nombre(currentUser))}</div>
                    <div class="side-acct-mail">${esc(currentUser.email || "")}</div>
                </div>
                <button class="side-acct-out" id="sideAcctLogout" aria-label="Cerrar sesión" title="Cerrar sesión">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
            </div>`;
        }
        return `
        <div class="side-acct side-acct-guest">
            <div class="side-acct-info">
                <div class="side-acct-name">Sin sesión</div>
                <div class="side-acct-mail">Inicia sesión para tu perfil</div>
            </div>
            <a href="/login.html" class="side-acct-btn">Entrar</a>
        </div>`;
    }

    function bindAccountEvents() {
        const btn = document.getElementById("acctBtn");
        const menu = document.getElementById("acctMenu");
        if (btn && menu) {
            btn.addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("open"); });
            document.addEventListener("click", () => menu.classList.remove("open"));
            document.addEventListener("keydown", (e) => { if (e.key === "Escape") menu.classList.remove("open"); });
        }
        const out1 = document.getElementById("acctLogout");
        const out2 = document.getElementById("sideAcctLogout");
        [out1, out2].forEach(el => el && el.addEventListener("click", async () => {
            await signOut();
            toast("Sesión cerrada.", "ok");
        }));
    }

    /* ---------- UI compartida ---------- */
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }
    function toast(msg, tipo) {
        let t = document.querySelector(".auth-toast");
        if (!t) { t = document.createElement("div"); t.className = "auth-toast"; document.body.appendChild(t); }
        t.textContent = msg;
        t.className = "auth-toast show " + (tipo || "");
        clearTimeout(t._h);
        t._h = setTimeout(() => t.classList.remove("show"), 2600);
    }

    return {
        init, oauth, signUp, signIn, resetPassword, updatePassword, signOut,
        user, isConfigured, onChange, providers: PROVIDERS,
        nombre, avatarHtml, esc, toast
    };
})();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AUTH.init());
} else {
    AUTH.init();
}
