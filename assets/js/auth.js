/* ============================================================
   SOSI CODEX — auth.js (Firebase Authentication)
   - Registro / login / logout con correo y contrasena.
   - Recuperacion de contrasena real (sendPasswordResetEmail).
   - Persistencia segura: onAuthStateChanged + token ID fresco.
   - OAuth Google/GitHub/Discord listos para habilitarse en
     Firebase Console (proveedores); si faltan, avisa en espanol.
   - Widget de cuenta en topbar/sidebar.
   - La apiKey es publica por diseno; nunca secretos aqui.
   ============================================================ */

const AUTH = (() => {
    const PROVIDERS = [
        { id: "google",  nombre: "Google" },
        { id: "github",  nombre: "GitHub" },
        { id: "discord", nombre: "Discord" }
    ];

    let app = null, auth = null, db = null, providerFactories = {};
    let ready = false;
    let currentUser = null;      // { uid, email, displayName, photoURL, provider }
    let authResuelto = false;    // true cuando Firebase ya dio su primera respuesta real
    const listeners = [];

    function notify() { listeners.forEach(fn => { try { fn(currentUser); } catch (_) {} }); }

    function mapUser(u) {
        if (!u) return null;
        const prov = (u.providerData && u.providerData[0] && u.providerData[0].providerId) || "password";
        return {
            uid: u.uid,
            email: u.email || "",
            displayName: u.displayName || (u.email ? u.email.split("@")[0] : "Usuario"),
            photoURL: u.photoURL || "",
            provider: prov,
            emailVerified: !!u.emailVerified
        };
    }

    async function init() {
        const cfg = window.SOSI_FIREBASE;
        if (!cfg || !cfg.apiKey || !cfg.projectId) {
            console.warn("SOSI: falta assets/js/firebase.js");
            return false;
        }
        try {
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
            const fbAuth = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js");
            const fbStore = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
            app = initializeApp(cfg);
            auth = fbAuth.getAuth(app);
            db = fbStore.getFirestore(app);
            window.__FB_STORE_MODULE__ = fbStore;
            providerFactories = {
                google: () => new fbAuth.GoogleAuthProvider(),
                github: () => new fbAuth.GithubAuthProvider(),
                discord: () => new fbAuth.OAuthProvider("discord")
            };
            window.__FB_AUTH_MODULE__ = fbAuth;

            await fbAuth.getRedirectResult(auth).then((res) => {
                if (res && res.user) { /* sesion ya quedara via onAuthStateChanged */ }
            }).catch(() => {});

            fbAuth.onAuthStateChanged(auth, (u) => {
                authResuelto = true;
                currentUser = mapUser(u);
                renderAccount();
                notify();
                /* Gate: paginas protegidas sin sesion -> login.
                   Las unicas PUBLICAS son login, register y forgot-password.
                   index/panel es PROTEGIDO: sin sesion tambien redirige a login. */
                try {
                    const p = location.pathname.replace(/\/+$/, "");
                    const publicas = ["/login.html", "/register.html", "/forgot-password.html"];
                    if (!currentUser && publicas.indexOf(p) === -1) {
                        location.replace("/login.html");
                    } else if (currentUser && publicas.indexOf(p) !== -1 && p !== "/forgot-password.html") {
                        /* con sesion activa no debe quedarse en login/register: al panel */
                        location.replace("/index.html");
                    }
                } catch (e) {}
            });
            ready = true;
            renderAccount();
            return true;
        } catch (err) {
            console.error("SOSI: error inicializando Firebase", err);
            return false;
        }
    }

    /* ---------- API publica ---------- */

    /* Crea el documento de perfil en Firestore (coleccion "perfiles", doc = UID).
       Campos: es_admin:false, creditos:0, nombre_usuario, creado_en. */
    async function crearPerfil(uid, nombreUsuario) {
        try {
            const fs = window.__FB_STORE_MODULE__;
            if (!fs || !db) return;
            await fs.setDoc(fs.doc(db, "perfiles", uid), {
                es_admin: false,
                creditos: 0,
                nombre_usuario: nombreUsuario || "",
                creado_en: new Date().toISOString()
            });
        } catch (err) {
            console.warn("SOSI: no se pudo crear el perfil en Firestore:", err && err.message);
        }
    }

    async function signUp(email, password, displayName) {
        requireReady();
        const fb = window.__FB_AUTH_MODULE__;
        const cred = await fb.createUserWithEmailAndPassword(auth, email, password);
        if (displayName) await fb.updateProfile(cred.user, { displayName });
        await crearPerfil(cred.user.uid, displayName);
        try { await fb.sendEmailVerification(cred.user); } catch (_) {}
        return mapUser(cred.user);
    }

    async function signIn(email, password) {
        requireReady();
        const fb = window.__FB_AUTH_MODULE__;
        const cred = await fb.signInWithEmailAndPassword(auth, email, password);
        return mapUser(cred.user);
    }

    async function oauth(providerId) {
        requireReady();
        const fb = window.__FB_AUTH_MODULE__;
        const make = providerFactories[providerId];
        if (!make) throw new Error("Proveedor no soportado.");
        /* En moviles (ancho < 768px) signInWithPopup casi siempre falla o se
           queda colgado: usar directamente signInWithRedirect. */
        if (window.innerWidth < 768) {
            await fb.signInWithRedirect(auth, make());
            return;
        }
        try {
            const res = await fb.signInWithPopup(auth, make());
            if (res && res.user) await crearPerfil(res.user.uid, res.user.displayName || res.user.email);
        } catch (err) {
            if (err && (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-allowed")) {
                await fb.signInWithRedirect(auth, make());
            } else {
                throw err;
            }
        }
    }

    async function resetPassword(email) {
        requireReady();
        const fb = window.__FB_AUTH_MODULE__;
        await fb.sendPasswordResetEmail(auth, email, {
            redirectTo: location.origin + "/login.html?reset=1"
        });
    }

    async function updatePassword(newPassword) {
        requireReady();
        const fb = window.__FB_AUTH_MODULE__;
        if (!auth.currentUser) throw new Error("Inicia sesion primero.");
        await fb.updatePassword(auth.currentUser, newPassword);
    }

    async function signOut() {
        requireReady();
        const fb = window.__FB_AUTH_MODULE__;
        await fb.signOut(auth);
        location.href = "/login.html";
    }

    /* Token ID fresco para validar del lado del servidor (api/*.js) */
    async function getIdToken() {
        requireReady();
        const fb = window.__FB_AUTH_MODULE__;
        if (!auth.currentUser) return null;
        return await auth.currentUser.getIdToken(false);
    }

    function traducirError(e) {
        const c = (e && e.code) || "";
        const mapa = {
            "auth/invalid-email": "El correo electronico no es valido.",
            "auth/user-not-found": "Correo o contrasena incorrectos.",
            "auth/wrong-password": "Correo o contrasena incorrectos.",
            "auth/invalid-credential": "Correo o contrasena incorrectos.",
            "auth/email-already-in-use": "Ese correo ya esta registrado. Inicia sesion.",
            "auth/weak-password": "La contrasena es muy debil (minimo 6 caracteres).",
            "auth/too-many-requests": "Demasiados intentos. Espera un momento.",
            "auth/network-request-failed": "Sin conexion con Firebase. Revisa tu internet.",
            "auth/popup-closed-by-user": "Ventana de proveedor cerrada antes de terminar.",
            "auth/unauthorized-domain": "Este dominio no esta autorizado en Firebase (Authentication -> Authorized domains).",
            "auth/operation-not-allowed": "El proveedor aun esta deshabilitado en Firebase Console -> Authentication -> Sign-in method."
        };
        return mapa[c] || (e && e.message) || "No se pudo completar la operacion.";
    }

    function requireReady() {
        if (!ready || !auth) throw new Error("Firebase no esta disponible. Revisa tu conexion o recarga la pagina.");
    }

    function user() { return currentUser; }
    function isConfigured() { return ready; }
    function onChange(fn) { listeners.push(fn); if (authResuelto) fn(currentUser); }

    /* ---------- widget de cuenta ---------- */

    function nombre(u) { return u ? (u.displayName || u.email || "Usuario") : "Usuario"; }
    function iniciales(u) {
        const n = nombre(u);
        return n.slice(0, 2).toUpperCase();
    }
    function avatarHtml(u, size) {
        size = size || 34;
        if (u && u.photoURL) {
            return '<img src="' + esc(u.photoURL) + '" alt="" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover">';
        }
        return '<span class="acc-avatar" style="width:' + size + 'px;height:' + size + 'px">' + esc(iniciales(u)) + '</span>';
    }

    function renderAccount() {
        const slot = document.getElementById("accountSlot");
        if (!slot) return;
        const u = currentUser;
        if (!u) {
            slot.innerHTML = '<a class="btn btn-primary btn-sm" href="/login.html">Iniciar sesión</a>';
            return;
        }
        slot.innerHTML = accountTopbarHtml(u);
        bindAccountEvents();
    }

    function accountTopbarHtml(u) {
        return '' +
            '<div class="acc-wrap">' +
              '<button class="acc-btn" id="accBtn" aria-haspopup="true" aria-expanded="false">' +
                avatarHtml(u, 30) +
                '<span class="acc-name">' + esc(nombre(u)) + '</span>' +
              '</button>' +
              '<div class="acc-menu" id="accMenu" hidden>' +
                '<a href="/perfil.html">👤 Mi perfil</a>' +
                '<a href="/configuracion.html">⚙️ Configuración</a>' +
                '<button type="button" id="accLogout">🚪 Cerrar sesión</button>' +
              '</div>' +
            '</div>';
    }

    function accountSidebarHtml(u) {
        return '<div class="side-account">' + avatarHtml(u, 38) +
            '<div><strong>' + esc(nombre(u)) + '</strong><small>' + esc(u.email || "") + '</small></div></div>';
    }

    function bindAccountEvents() {
        const btn = document.getElementById("accBtn");
        const menu = document.getElementById("accMenu");
        if (!btn || !menu || btn.dataset.bound) return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            menu.hidden = !menu.hidden;
            btn.setAttribute("aria-expanded", String(!menu.hidden));
        });
        document.addEventListener("click", () => { menu.hidden = true; });
        const lo = document.getElementById("accLogout");
        if (lo) lo.addEventListener("click", () => { signOut().catch(err => toast(traducirError(err), "error")); });
    }

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function toast(msg, tipo) {
        let t = document.createElement("div");
        t.className = "sosi-toast sosi-toast-" + (tipo || "ok");
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add("show"), 10);
        setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2600);
    }

    return {
        init, signUp, signIn, oauth, resetPassword, updatePassword, signOut,
        getIdToken, user, isConfigured, onChange,
        nombre, avatarHtml, accountSidebarHtml, toast, traducirError, esc
    };
})();

document.addEventListener("DOMContentLoaded", () => { AUTH.init(); });
