/* ============================================================
   SOSI CODEX — pages/consulta.js
   Lógica de la página de consulta DNI
   ============================================================ */

(function initConsulta() {
    const btnConsultar = document.getElementById("btnConsultar");
    const dniInput = document.getElementById("dni");
    const resultsSection = document.getElementById("resultsSection");
    const resultsContainer = document.getElementById("resultsContainer");
    const fieldHint = document.getElementById("fieldHint");
    const idleSection = document.getElementById("idleSection");

    if (!btnConsultar || !dniInput || !resultsSection || !resultsContainer) return;

    /* Título dinámico según servicio (consulta.html?key=dni) */
    const key = new URLSearchParams(location.search).get("key") || "dni";
    const svc = svcByKey(key);
    if (svc) {
        document.title = svc.nombre + " — SOSI CODEX";
        const tt = document.querySelector(".topbar-title");
        if (tt) tt.textContent = "Consulta " + svc.nombre;
    }

    /* --- v13: instrucciones + empty state + historial --- */
    HISTORY_UI.mountTips("tipCard", [
        "Ingrese los 8 dígitos del DNI, sin espacios ni puntos.",
        "Puede pegar el número; se aceptan solo dígitos.",
        "Use Enter para buscar más rápido."
    ]);
    const idle = idleSection ? HISTORY_UI.create(idleSection, {
        page: "dni",
        title: "Realiza una consulta",
        subtitle: "Los resultados aparecerán aquí una vez completada la búsqueda.",
        onPick: (it) => { dniInput.value = it.label; consultarDNI(); }
    }) : null;
    if (document.body.classList.contains("no-results")) {
        document.body.classList.remove("no-results");
    }

    btnConsultar.addEventListener("click", consultarDNI);
    dniInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") consultarDNI();
    });
    dniInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, CONFIG.DNI.longitud);
        if (fieldHint) fieldHint.classList.remove("show");
    });

    // Estado actual para copiar/descargar desde los resultados
    let lastResult = null;
    wireExport(resultsContainer, () => lastResult);

    // "Nueva" limpia y devuelve el foco al input
    resultsContainer.addEventListener("click", (e) => {
        if (e.target.closest("#btnNueva")) {
            dniInput.value = "";
            lastResult = null;
            setTimeout(() => dniInput.focus(), 50);
        }
    });

    function setLoading(on) {
        btnConsultar.disabled = on;
        btnConsultar.innerHTML = on
            ? `<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.spinner}</svg>`
            : svgIcon("search", 16);
    }

    function showSkeleton() {
        if (idle) idle.hide();
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
            if (fieldHint) fieldHint.classList.add("show");
            setTimeout(() => {
                dniInput.style.borderColor = "";
                dniInput.style.animation = "";
            }, 900);
            dniInput.focus();
            return;
        }
        if (fieldHint) fieldHint.classList.remove("show");

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
                lastResult = null;
                showError(resultsContainer, data.error || "No se encontró información para este DNI.");
            } else {
                lastResult = { dni, texto: data.texto || "", imagen: data.imagen || "", datos: null, plano: "" };
                renderResults(resultsContainer, lastResult);
                HIST.push("dni", { label: dni, kind: "DNI" });
                if (idle) idle.refresh();
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
