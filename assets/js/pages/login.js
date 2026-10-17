/* SOSI CODEX — login.js */
(function () {
    const form = document.getElementById("loginForm");
    const errBox = document.getElementById("loginErr");
    const btn = document.getElementById("loginBtn");

    /* si ya hay sesión, ir al panel */
    AUTH.onChange(u => { if (u) location.replace("/"); });

    /* OAuth */
    document.querySelectorAll(".oauth-btn").forEach(b =>
        b.addEventListener("click", () => AUTH.oauth(b.dataset.provider)));

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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errBox.classList.remove("show");
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr("Introduce un correo electrónico válido."); return; }
        if (password.length < 6) { showErr("La contraseña debe tener al menos 6 caracteres."); return; }

        btn.disabled = true; btn.classList.add("loading");
        try {
            await AUTH.signIn(email, password);
            /* persistencia: supabase-js guarda la sesión automáticamente.
               "Recordarme" se gestiona con el almacenamiento del SDK. */
            AUTH.toast("Sesión iniciada. Bienvenido.", "ok");
            setTimeout(() => location.replace("/"), 500);
        } catch (err) {
            showErr(err.message || "No se pudo iniciar sesión.");
            btn.disabled = false; btn.classList.remove("loading");
        }
    });
})();
