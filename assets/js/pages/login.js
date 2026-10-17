/* SOSI CODEX — login.js */
(function () {
    const form = document.getElementById("loginForm");
    const errBox = document.getElementById("loginErr");
    const btn = document.getElementById("loginBtn");

    /* si ya hay sesión, ir al panel (evita bucles con Firebase) */
    let redirigido = false;
    AUTH.onChange(u => {
        if (u && !redirigido && !/reset=1/.test(location.search)) {
            redirigido = true;
            location.replace("/index.html");
        }
    });

    /* OAuth — flujo real vía Firebase (redirige al proveedor) */
    document.querySelectorAll(".oauth-btn").forEach(b => {
        b.addEventListener("click", () => {
            AUTH.oauth(b.dataset.provider).catch(err => AUTH.toast(AUTH.traducirError(err), "error"));
        });
        b.disabled = false;
    });

    /* Mensaje de retorno desde un proveedor (cancelación o error) */
    try {
        const q = new URLSearchParams(location.search);
        if (q.get("oauth_error")) {
            AUTH.toast("El inicio de sesión con " + q.get("oauth_error") + " se canceló o falló. Inténtalo de nuevo.", "error");
            history.replaceState({}, "", location.pathname);
        }
    } catch (e) {}

    /* mostrar/ocultar contraseña */
    document.querySelectorAll(".auth-eye").forEach(btnEye => {
        btnEye.addEventListener("click", () => {
            const inp = document.getElementById(btnEye.dataset.target);
            inp.type = inp.type === "password" ? "text" : "password";
            btnEye.classList.toggle("off");
        });
    });

    function showErr(msg) {
        errBox.textContent = msg;
        errBox.classList.remove("show"); void errBox.offsetWidth;
        errBox.classList.add("show");
    }

    /* ---- modo restablecer contraseña (?reset=1) ---- */
    const esReset = /[?&]reset=1/.test(location.search);
    if (esReset) {
        document.querySelector(".auth-title").textContent = "Restablecer contraseña";
        document.querySelector(".auth-sub").textContent = "Define tu nueva contraseña de acceso";
        document.getElementById("oauthGrid").style.display = "none";
        document.querySelector(".auth-sep").style.display = "none";
        document.querySelector(".auth-row").style.display = "none";
        document.getElementById("email").closest(".auth-field").style.display = "none";
        document.getElementById("loginBtn").querySelector(".auth-btn-label").textContent = "Guardar nueva contraseña";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errBox.classList.remove("show");
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (password.length < 6) { showErr("La contraseña debe tener al menos 6 caracteres."); return; }

        btn.disabled = true; btn.classList.add("loading");
        try {
            if (esReset) {
                /* el enlace de recuperación ya dejó la sesión activa en el SDK */
                await AUTH.updatePassword(password);
                AUTH.toast("Contraseña actualizada. Inicia sesión.", "ok");
                setTimeout(() => location.replace("/login.html"), 700);
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr("Introduce un correo electrónico válido."); btn.disabled=false; btn.classList.remove("loading"); return; }
            await AUTH.signIn(email, password);
            /* persistencia: Firebase Auth guarda la sesión automáticamente.
               "Recordarme" se gestiona con el almacenamiento del SDK. */
            AUTH.toast("Sesión iniciada. Bienvenido.", "ok");
            /* navegacion la hace auth.js (onChange -> /index.html con sesion);
               aqui solo espera para evitar doble competing navigation */
            await new Promise(r => setTimeout(r, 800));
        } catch (err) {
            showErr(AUTH.traducirError(err));
            btn.disabled = false; btn.classList.remove("loading");
        }
    });
})();
