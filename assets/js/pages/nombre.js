/* ============================================================
   SOSI CODEX — pages/nombre.js
   Búsqueda por Nombre (nombre.html)
   Formulario vertical: Nombres / Apellido paterno / Apellido materno
   ============================================================ */

(function initNombre() {
    const form = document.getElementById("nbForm");
    const btn = document.getElementById("nbBtnBuscar");
    const inpNombres = document.getElementById("nbNombres");
    const inpPaterno = document.getElementById("nbPaterno");
    const inpMaterno = document.getElementById("nbMaterno");
    const resultsSection = document.getElementById("resultsSection");
    const resultsContainer = document.getElementById("resultsContainer");
    const idleSection = document.getElementById("idleSection");

    if (!form || !btn || !inpNombres || !inpPaterno || !inpMaterno) return;

    let lastResult = null;
    wireExport(resultsContainer, () => lastResult);

    /* --- v13: instrucciones + empty state + historial --- */
    HISTORY_UI.mountTips("tipCard", [
        "La búsqueda requiere al menos nombres y apellido paterno.",
        "Escriba solo letras, sin números ni símbolos.",
        "Tildes y ñ son bienvenidas (ej. Nuñez, Ávila)."
    ]);
    const idle = idleSection ? HISTORY_UI.create(idleSection, {
        page: "nombre",
        title: "Realiza una consulta",
        subtitle: "Los resultados aparecerán aquí una vez completada la búsqueda.",
        onPick: (it) => {
            const parts = it.label.split(", ");
            inpNombres.value = parts[0] || "";
            inpPaterno.value = parts[1] || "";
            inpMaterno.value = parts[2] || "";
            form.requestSubmit ? form.requestSubmit() : buscar();
        }
    }) : null;

    /* Solo letras, espacios, apóstrofes y tildes — sin números */
    [inpNombres, inpPaterno, inpMaterno].forEach(inp => {
        inp.addEventListener("input", () => {
            inp.value = inp.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+/g, "");
        });
    });

    function setLoading(on) {
        btn.disabled = on;
        btn.innerHTML = on
            ? `<span>Buscando…</span><svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.spinner}</svg>`
            : `<span>Buscar</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
    }

    function showSkeleton() {
        if (idle) idle.hide();
        resultsSection.style.display = "block";
        resultsContainer.className = "results-grid";
        resultsContainer.innerHTML = `
            <div class="skeleton" style="min-height:90px"></div>
            <div class="cards-masonry">
                <div class="skeleton"></div><div class="skeleton"></div>
                <div class="skeleton"></div><div class="skeleton"></div>
            </div>`;
    }

    async function buscar(e) {
        if (e) e.preventDefault();

        const nombres = inpNombres.value.trim();
        const paterno = inpPaterno.value.trim();
        const materno = inpMaterno.value.trim();

        /* Validación: al menos nombre + apellido paterno */
        let invalid = false;
        [[inpNombres, nombres], [inpPaterno, paterno]].forEach(([el, val]) => {
            if (val.length < 2) {
                el.classList.add("nb-invalid");
                invalid = true;
                setTimeout(() => el.classList.remove("nb-invalid"), 1600);
            }
        });
        if (invalid) return;

        setLoading(true);
        showSkeleton();

        try {
            const res = await fetch(CONFIG.BACKEND_URL + CONFIG.ENDPOINTS.consultaNombre, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombres, paterno, materno })
            });

            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();

            resultsContainer.innerHTML = "";
            if (!data.success) {
                lastResult = null;
                showError(resultsContainer, data.error || "No se encontraron personas con ese nombre.");
            } else {
                lastResult = { dni: "", texto: data.texto || "", imagen: data.imagen || "" };
                renderResults(resultsContainer, lastResult);
                HIST.push("nombre", { label: [nombres, paterno, materno].filter(Boolean).join(", "), kind: "Nombre" });
                if (idle) idle.refresh();
            }
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 120);
        } catch (err) {
            resultsContainer.innerHTML = "";
            lastResult = null;
            showError(resultsContainer,
                "La búsqueda por nombre aún no está disponible en el servidor. Se requiere el endpoint \"" +
                CONFIG.ENDPOINTS.consultaNombre + "\". No se muestran resultados simulados.");
        }

        setLoading(false);
    }

    form.addEventListener("submit", buscar);
})();
