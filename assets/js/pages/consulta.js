/* ============================================================
   SOSI CODEX — pages/consulta.js
   Lógica de la página de consulta DNI
   ============================================================ */

(function initConsulta() {
    const btnConsultar = document.getElementById("btnConsultar");
    const dniInput = document.getElementById("dni");
    const resultsSection = document.getElementById("resultsSection");
    const resultsContainer = document.getElementById("resultsContainer");

    if (!btnConsultar || !dniInput || !resultsSection || !resultsContainer) return;

    btnConsultar.addEventListener("click", consultarDNI);
    dniInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") consultarDNI();
    });
    dniInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, CONFIG.DNI.longitud);
    });

    function setLoading(on) {
        btnConsultar.disabled = on;
        btnConsultar.innerHTML = on
            ? `<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.spinner}</svg>`
            : svgIcon("search", 16);
    }

    function showSkeleton() {
        resultsSection.style.display = "block";
        resultsContainer.className = "results-grid";
        resultsContainer.innerHTML = `
            <div class="skeleton" style="min-height:110px"></div>
            <div class="cards-masonry">
                <div class="skeleton"></div><div class="skeleton"></div>
                <div class="skeleton"></div><div class="skeleton"></div>
            </div>`;
    }

    async function consultarDNI() {
        const dni = dniInput.value.trim();

        if (dni.length !== CONFIG.DNI.longitud) {
            dniInput.style.animation = "shake 0.4s ease";
            dniInput.style.borderColor = "var(--danger)";
            setTimeout(() => {
                dniInput.style.borderColor = "";
                dniInput.style.animation = "";
            }, 900);
            dniInput.focus();
            return;
        }

        setLoading(true);
        showSkeleton();

        try {
            const res = await fetch(CONFIG.BACKEND_URL + CONFIG.ENDPOINTS.consultaDni, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni })
            });
            const data = await res.json();

            resultsContainer.innerHTML = "";
            if (!data.success) {
                showError(resultsContainer, data.error || "No se encontró información para este DNI.");
            } else {
                renderResults(resultsContainer, data);
            }
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 120);
        } catch (err) {
            resultsContainer.innerHTML = "";
            showError(resultsContainer, "Error de conexión con el servidor. Verifica tu internet e inténtalo de nuevo.");
        }

        setLoading(false);
    }
})();
