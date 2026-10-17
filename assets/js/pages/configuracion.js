/* SOSI CODEX — configuracion.js (cambio de contraseña; protegido) */
(function () {
    const form = document.getElementById("pwForm");
    const errBox = document.getElementById("cfgErr");
    const okBox = document.getElementById("cfgOk");
    const btn = document.getElementById("cfgBtn");
    const guest = document.getElementById("cfgGuest");

    document.querySelector(".auth-eye").addEventListener("click", function () {
        const inp = document.getElementById(this.dataset.target);
        inp.type = inp.type === "password" ? "text" : "password";
    });

    AUTH.onChange(u => {
        if (!u) {
            form.style.display = "none";
            guest.style.display = "block";
            guest.innerHTML = 'Inicia sesión para gestionar tu contraseña. <a class="auth-link" href="/login.html">Ir a iniciar sesión</a>';
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errBox.classList.remove("show"); okBox.classList.remove("show");
        const np = document.getElementById("npass").value;
        if (np.length < 8) {
            errBox.textContent = "La nueva contraseña debe tener al menos 8 caracteres.";
            errBox.classList.add("show"); return;
        }
        btn.disabled = true; btn.classList.add("loading");
        try {
            await AUTH.updatePassword(np);
            okBox.textContent = "Contraseña actualizada correctamente.";
            okBox.classList.add("show");
            document.getElementById("npass").value = "";
        } catch (err) {
            errBox.textContent = AUTH.traducirError(err) || "No se pudo actualizar la contraseña.";
            errBox.classList.add("show");
        } finally {
            btn.disabled = false; btn.classList.remove("loading");
        }
    });
})();
