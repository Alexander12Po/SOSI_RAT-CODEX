/* SOSI CODEX — register.js */
(function () {
    const form = document.getElementById("regForm");
    const errBox = document.getElementById("regErr");
    const okBox = document.getElementById("regOk");
    const btn = document.getElementById("regBtn");
    const meter = document.getElementById("pwMeter");
    const hint = document.getElementById("pwHint");

    AUTH.onChange(u => { if (u) location.replace("/"); });

    document.querySelectorAll(".oauth-btn").forEach(b =>
        b.addEventListener("click", () => AUTH.oauth(b.dataset.provider)));

    document.querySelectorAll(".auth-eye").forEach(b => {
        b.addEventListener("click", () => {
            const inp = document.getElementById(b.dataset.target);
            inp.type = inp.type === "password" ? "text" : "password";
        });
    });

    /* medidor de seguridad */
    document.getElementById("password").addEventListener("input", (e) => {
        const v = e.target.value;
        let score = 0;
        if (v.length >= 8) score++;
        if (/[A-ZÁÉÍÓÚÑ]/.test(v) && /[a-záéíóúñ]/.test(v)) score++;
        if (/\d/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        meter.className = "pw-meter" + (v ? " l" + Math.max(1, score) : "");
        hint.textContent = !v ? "" :
            score <= 1 ? "Seguridad baja" :
            score === 2 ? "Seguridad media" :
            score === 3 ? "Seguridad buena" : "Seguridad excelente";
    });

    function showErr(msg) {
        okBox.classList.remove("show");
        errBox.textContent = msg;
        errBox.classList.remove("show"); void errBox.offsetWidth;
        errBox.classList.add("show");
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errBox.classList.remove("show"); okBox.classList.remove("show");
        const name = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const p1 = document.getElementById("password").value;
        const p2 = document.getElementById("password2").value;
        const terms = document.getElementById("terms").checked;

        if (name.length < 2) { showErr("Escribe tu nombre de usuario (mínimo 2 caracteres)."); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr("Introduce un correo electrónico válido."); return; }
        if (p1.length < 8) { showErr("La contraseña debe tener al menos 8 caracteres."); return; }
        if (p1 !== p2) { showErr("Las contraseñas no coinciden."); return; }
        if (!terms) { showErr("Debes aceptar los términos y la política de privacidad."); document.getElementById("terms").focus(); return; }

        btn.disabled = true; btn.classList.add("loading");
        try {
            await AUTH.signUp(email, p1, name);
            okBox.textContent = "Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.";
            okBox.classList.add("show");
            form.querySelector('button[type="submit"]').disabled = false;
            btn.classList.remove("loading");
        } catch (err) {
            showErr(err.message || "No se pudo crear la cuenta.");
            btn.disabled = false; btn.classList.remove("loading");
        }
    });

    document.getElementById("termsLink").addEventListener("click", (e) => {
        e.preventDefault();
        showErr("Los términos y la política de privacidad aún no están publicados en esta plataforma.");
    });
})();
