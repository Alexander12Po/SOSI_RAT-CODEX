/* SOSI CODEX — forgot.js (recuperación real vía Supabase) */
(function () {
    const form = document.getElementById("forgotForm");
    const errBox = document.getElementById("forgotErr");
    const okBox = document.getElementById("forgotOk");
    const btn = document.getElementById("forgotBtn");

    /* si el enlace de recuperación llega con ?reset=1 y hay sesión de recovery,
       pedimos la nueva contraseña directamente */
    const params = new URLSearchParams(location.search);
    if (params.get("reset") === "1") {
        AUTH.onChange(u => {
            if (!u) return;
            const np = prompt("Tu enlace de recuperación es válido. Escribe tu nueva contraseña (mínimo 8 caracteres):");
            if (np && np.length >= 8) {
                AUTH.updatePassword(np)
                    .then(() => { AUTH.toast("Contraseña actualizada.", "ok"); setTimeout(() => location.replace("/"), 800); })
                    .catch(e => AUTH.toast(e.message, "error"));
            }
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errBox.classList.remove("show"); okBox.classList.remove("show");
        const email = document.getElementById("email").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errBox.textContent = "Introduce un correo electrónico válido.";
            errBox.classList.add("show"); return;
        }
        btn.disabled = true; btn.classList.add("loading");
        try {
            await AUTH.resetPassword(email);
            okBox.textContent = "Si el correo existe, recibirás un enlace para restablecer tu contraseña.";
            okBox.classList.add("show");
            btn.disabled = false; btn.classList.remove("loading");
        } catch (err) {
            errBox.textContent = err.message || "No se pudo enviar el enlace.";
            errBox.classList.add("show");
            btn.disabled = false; btn.classList.remove("loading");
        }
    });
})();
