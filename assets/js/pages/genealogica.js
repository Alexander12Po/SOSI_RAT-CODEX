/* ============================================================
   SOSI CODEX — pages/genealogica.js
   Consulta Genealógica: DNI → árbol del bot → resultado denso
   + botón "Descargar PDF" (jsPDF) solo con resultado válido.
   ============================================================ */

(function initGenealogica() {
    const form = document.getElementById("gnForm");
    const btn = document.getElementById("gnBtnConsultar");
    const dniInput = document.getElementById("gnDni");
    const hint = document.getElementById("gnHint");
    const resultsSection = document.getElementById("resultsSection");
    const resultsContainer = document.getElementById("resultsContainer");
    const idleSection = document.getElementById("idleSection");

    if (!form || !btn || !dniInput || !resultsSection || !resultsContainer) return;

    let lastResult = null;

    /* --- v13: instrucciones + empty state + historial --- */
    HISTORY_UI.mountTips("tipCard", [
        "Ingrese los 8 dígitos del DNI, sin espacios.",
        "El árbol genealógico puede tardar unos segundos.",
        "Podrá descargar el resultado en PDF al finalizar."
    ]);
    const idle = idleSection ? HISTORY_UI.create(idleSection, {
        page: "genealogica",
        title: "Realiza una consulta",
        subtitle: "Los resultados aparecerán aquí una vez completada la búsqueda.",
        onPick: (it) => { dniInput.value = it.label; form.requestSubmit ? form.requestSubmit() : null; }
    }) : null;

    /* Solo dígitos, máximo 8 */
    dniInput.addEventListener("input", () => {
        dniInput.value = dniInput.value.replace(/\D/g, "").slice(0, CONFIG.DNI.longitud);
        if (hint) hint.classList.remove("show");
    });

    function setLoading(on) {
        btn.disabled = on;
        btn.innerHTML = on
            ? `<span>Consultando…</span><svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.spinner}</svg>`
            : `<span>Consultar</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
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

    /* ---------- Render propio: árbol genealógico denso ---------- */

    /* Titular de una línea tipo "NOMBRES: X APELLIDOS: Y DNI: Z EDAD: W" */
    function titularFrom(texto, dni) {
        let nombre = "", edad = "";
        const mNom = texto.match(/NOMBRES?:\s*(.+?)(?=\s+(?:APELLIDOS|DNI|EDAD)\b|$)/i);
        const mApe = texto.match(/APELLIDOS?:\s*(.+?)(?=\s+(?:NOMBRES|DNI|EDAD)\b|$)/i);
        const mEdad = texto.match(/\bEDAD:\s*(\d+)/i);
        if (mNom || mApe) {
            nombre = [mNom && mNom[1], mApe && mApe[1]].filter(Boolean).join(", ").trim();
        } else {
            const d = parseTexto(texto);
            if (camposLlenos(d) >= 2 && (d.nombres || d.apellidos)) nombre = [d.apellidos, d.nombres].filter(Boolean).join(", ");
            if (d.edad) edad = String(d.edad);
        }
        if (mEdad) edad = mEdad[1];
        return { nombre, edad };
    }

    function renderArbol(container, data) {
        const texto = PDFX.normalize(data.texto);
        const lineas = texto.split("\n");
        const totalPersonas = lineas.filter(l => /\d+\s*\|/.test(l)).length;
        const t = titularFrom(texto, data.dni);

        const titular = t.nombre
            ? `<div class="gn-titular">
                 <div class="gn-t-avatar">${svgIcon("users", 16)}</div>
                 <div class="gn-t-info">
                   <span class="gn-t-name">${escapeHTML(t.nombre)}</span>
                   <span class="gn-t-meta">
                     <span class="gn-tag">${svgIcon("idcard", 11)}DNI ${escapeHTML(data.dni)}</span>
                     ${t.edad ? `<span class="gn-tag">${svgIcon("calendar", 11)}${escapeHTML(String(t.edad))} años</span>` : ""}
                     ${totalPersonas ? `<span class="gn-tag">${svgIcon("briefcase", 11)}${totalPersonas} familiares</span>` : ""}
                   </span>
                 </div>
               </div>`
            : "";

        /* Bloque de árbol: cada línea original en su propia fila, orden exacto */
        const filas = lineas.map((l, i) => {
            if (l.trim() === "") return `<div class="gn-gap"></div>`;
            const esPersona = /\d+\s*\|/.test(l);
            return `<div class="gn-line ${esPersona ? "gn-person" : "gn-plain"}">` +
                   (esPersona ? `<span class="gn-dot"></span>` : "") +
                   `<pre class="gn-txt">${escapeHTML(l)}</pre></div>`;
        }).join("");

        container.innerHTML = `
            ${titular}
            <div class="card gn-tree-card">
              <div class="card-header">
                <div class="card-icon">${svgIcon("file", 14)}</div>
                <h3>Árbol genealógico</h3>
                <span class="gn-count">${lineas.length} líneas</span>
              </div>
              <div class="gn-tree">${filas}</div>
            </div>
            <div class="action-bar">
              <button class="ab-btn" data-export="copy">${svgIcon("copy", 13)}<span>Copiar texto</span></button>
              <button class="ab-btn ab-pdf" id="btnPdf">${svgIcon("download", 13)}<span>Descargar PDF</span></button>
            </div>`;
    }

    /* ---------- Consulta ---------- */

    async function consultar(e) {
        if (e) e.preventDefault();
        const dni = dniInput.value.trim();

        if (dni.length !== CONFIG.DNI.longitud) {
            dniInput.classList.add("nb-invalid");
            if (hint) hint.classList.add("show");
            setTimeout(() => dniInput.classList.remove("nb-invalid"), 1600);
            dniInput.focus();
            return;
        }
        if (hint) hint.classList.remove("show");

        setLoading(true);
        showSkeleton();

        try {
            const res = await fetch(CONFIG.BACKEND_URL + CONFIG.ENDPOINTS.consultaGenealogica, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni })
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();

            resultsContainer.innerHTML = "";
            if (!data.success || !(data.texto || "").trim()) {
                lastResult = null;                       /* sin resultado → sin botón PDF */
                showError(resultsContainer, data.error || "No se encontró información genealógica para este DNI.");
            } else {
                lastResult = { dni, texto: data.texto };
                renderArbol(resultsContainer, lastResult);
                HIST.push("genealogica", { label: dni, kind: "DNI" });
                if (idle) idle.refresh();
                wirePdf();
            }
            setTimeout(() => resultsSection.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
        } catch (err) {
            resultsContainer.innerHTML = "";
            lastResult = null;                           /* error → sin botón PDF */
            showError(resultsContainer,
                "La consulta genealógica no pudo completarse. Si el servidor aún no expone el endpoint \"" +
                CONFIG.ENDPOINTS.consultaGenealogica + "\", indícalo y se implementará. No se muestran resultados simulados.");
        }

        setLoading(false);
    }

    /* ---------- PDF ---------- */

    function wirePdf() {
        const b = document.getElementById("btnPdf");
        if (!b) return;
        b.addEventListener("click", () => {
            if (!lastResult || !lastResult.texto) return; /* solo con resultado válido */
            b.disabled = true;
            try {
                PDFX.generate({
                    title: "Consulta Genealógica - SOSI CODEX",
                    subtitle: "DNI consultado: " + lastResult.dni,
                    body: lastResult.texto
                });
            } catch (err) {
                alert("No se pudo generar el PDF: " + err.message);
            } finally {
                b.disabled = false;
            }
        });
    }

    form.addEventListener("submit", consultar);
})();
