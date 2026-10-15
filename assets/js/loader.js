/* ============================================================
   SOSI CODEX — loader.js
   Espera del backend (cold start de Render)
   ============================================================ */

(function initLoader() {
    const loaderScreen = document.getElementById("loaderScreen");
    if (!loaderScreen) return;

    async function despertarBackend() {
        let listo = false;
        let intentos = 0;

        while (!listo && intentos < CONFIG.LOADER.maxIntentos) {
            try {
                const res = await fetch(CONFIG.BACKEND_URL + CONFIG.ENDPOINTS.estado);
                const data = await res.json();
                listo = data.listo === true;
            } catch (err) {
                listo = false;
            }
            intentos++;
            if (!listo) await new Promise(r => setTimeout(r, CONFIG.LOADER.intervaloMs));
        }

        if (listo) {
            loaderScreen.classList.add("out");
            setTimeout(() => { loaderScreen.style.display = "none"; }, 600);
            return;
        }

        const sub = loaderScreen.querySelector(".loader-sub");
        if (sub) sub.textContent = "El servidor está tardando más de lo normal.";

        if (loaderScreen.querySelector(".loader-retry")) return;
        const btn = document.createElement("button");
        btn.textContent = "Reintentar";
        btn.className = "loader-retry";
        btn.onclick = () => {
            btn.remove();
            if (sub) sub.textContent = "Conectando con el servidor…";
            despertarBackend();
        };
        loaderScreen.querySelector(".loader-content").appendChild(btn);
    }

    despertarBackend();
})();
