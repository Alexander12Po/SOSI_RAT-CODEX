/* ============================================================
   SOSI CODEX — results.js
   Renderizado de resultados: denso, alineado y legible
   ============================================================ */

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/* ---------- Componentes ---------- */

function rowItem(item) {
    const valCls = ["data-value"];
    const raw = String(item.value ?? "—");
    const empty = !item.value || item.value === "—" || item.value === "";
    if (empty) valCls.push("v-empty");
    if (item.code) valCls.push("v-code");
    if (item.date) valCls.push("v-date");
    if (item.cls) valCls.push(item.cls);
    const copyBtn = empty ? "" :
        `<button class="row-copy" data-export="copy-field" aria-label="Copiar ${item.label}" title="Copiar">${svgIcon("copy", 11)}</button>`;
    // data-value: valor EXACTO para copiar (sin markdown ni decoración)
    return `<div class="data-row" data-value="${escapeHTML(String(item.value ?? ""))}">
        <span class="data-label">${item.label}</span>
        <span class="rv"><span class="${valCls.join(" ")}">${escapeHTML(raw)}</span>${copyBtn}</span>
    </div>`;
}

function dataCard(icon, title, items, delay = 0) {
    return `<div class="card" style="animation-delay:${delay}s">
        <div class="card-header">
            <div class="card-icon">${svgIcon(icon, 14)}</div>
            <h3>${title}</h3>
        </div>
        <div class="data-list">${items.map(rowItem).join("")}</div>
    </div>`;
}

function actaCell(label, on) {
    return `<div class="acta-cell">
        <i>${label}</i>
        <span class="acta-dot ${on ? "on" : "off"}">${on ? "Sí" : "No"}</span>
    </div>`;
}

function actaCard(delay = 0) {
    return (d) => `<div class="card" style="animation-delay:${delay}s">
        <div class="card-header">
            <div class="card-icon">${svgIcon("file", 14)}</div>
            <h3>Actas y certificados</h3>
        </div>
        <div class="acta-grid">
            ${actaCell("Matrimonio", d.matrimonio === "1")}
            ${actaCell("Nacimiento", d.nacimiento === "1")}
            ${actaCell("Defunción", d.defuncion === "1")}
            ${actaCell("Cert. Nacido", d.certNacido === "1")}
            ${actaCell("Cert. Def.", d.certDefuncion === "1")}
        </div>
    </div>`;
}

function profileBand(d, fotoSrc) {
    const estado = estadoDocumento(d);
    const civil = d.matrimonio === "1" ? "Casado(a)" : d.matrimonio === "0" ? "Soltero(a)" : "";
    const fullPhoto = fotoSrc || "";
    const photoHTML = fullPhoto
        ? `<img src="${fullPhoto}" alt="Foto del titular">`
        : svgIcon("user", 30);

    return `<div class="profile-band">
        <div class="pb-photo">${photoHTML}</div>
        <div class="pb-info">
            <div class="pb-name">${escapeHTML(`${d.nombres || "—"} ${d.apellidos || ""}`.trim())}</div>
            <div class="pb-tags">
                <span class="pb-tag t-dni">${svgIcon("idcard", 12)} ${escapeHTML(d.dni || "—")}</span>
                ${d.genero ? `<span class="pb-tag">${svgIcon("user", 11)} ${escapeHTML(d.genero)}</span>` : ""}
                ${d.edad ? `<span class="pb-tag">${svgIcon("calendar", 11)} ${escapeHTML(d.edad)} años</span>` : ""}
                ${civil ? `<span class="pb-tag">${svgIcon("users", 11)} ${escapeHTML(civil)}</span>` : ""}
                ${d.restriccion ? `<span class="pb-tag t-gold">${svgIcon("alert", 11)} ${escapeHTML(d.restriccion)}</span>` : ""}
            </div>
        </div>
        <div class="pb-status">
            ${estado
                ? `<span class="pill ${estado.ok ? "pill-ok" : "pill-warn"}">${svgIcon(estado.ok ? "check" : "alert", 12)} ${estado.texto}</span>`
                : `<span class="pill pill-ok">${svgIcon("shieldCheck", 12)} Verificado</span>`}
        </div>
    </div>`;
}

/** Barra de acciones bajo el perfil: copiar todo / descargar foto */
function actionBar(dni, tieneFoto) {
    return `<div class="action-bar">
        <button class="ab-btn" data-export="copy">${svgIcon("copy", 13)}<span>Copiar datos</span></button>
        <button class="ab-btn ${tieneFoto ? "" : "is-off"}" data-export="photo">${svgIcon("download", 13)}<span>Descargar foto</span></button>
        <a class="ab-btn ab-new" href="#dni" id="btnNueva">${svgIcon("search", 13)}<span>Nueva</span></a>
    </div>`;
}

function rawCard(texto, fotoSrc) {
    const img = fotoSrc
        ? `<div class="pb-photo" style="width:100%;height:auto;margin:0 16px 16px;">
             <img src="${fotoSrc}" alt="Documento" style="width:100%;border-radius:8px;">
           </div>`
        : "";
    return `<div class="card">
        <div class="card-header">
            <div class="card-icon">${svgIcon("file", 14)}</div>
            <h3>Resultado del bot</h3>
        </div>
        ${img}
        <div class="raw-block">${escapeHTML(texto)}</div>
    </div>`;
}

/* ---------- Render principal ---------- */

function renderResults(container, data) {
    const d = parseTexto(data.texto);
    const fotoSrc = data.imagen ? "data:image/jpeg;base64," + data.imagen : "";

    // Texto plano profesional pre-generado para el botón Copiar.
    // Se guarda en data-* para que export.js lo use directamente.
    data.datos = d;
    data.plano = formatoPlano(data.texto, d);

    // Fallback: si el parseo falla, mostrar texto crudo tal cual + copiar
    if (camposLlenos(d) < 2 && data.texto) {
        container.innerHTML = `
            ${rawCard(data.texto, fotoSrc)}
            <div class="action-bar">
                <button class="ab-btn" data-export="copy">${svgIcon("copy", 13)}<span>Copiar respuesta</span></button>
                ${fotoSrc ? `<button class="ab-btn" data-export="photo">${svgIcon("download", 13)}<span>Descargar foto</span></button>` : ""}
            </div>`;
        return;
    }

    const band = profileBand(d, fotoSrc);

    const cards = [
        dataCard("calendar", "Nacimiento", [
            { label: "Fecha", value: d.fechaNacimiento || "—", date: true },
            { label: "Edad", value: d.edad ? d.edad + " años" : "—" },
            { label: "Departamento", value: d.departamentoNac || "—" },
            { label: "Provincia", value: d.provinciaNac || "—" }
        ], 0.05),

        dataCard("idcard", "Documento", [
            { label: "Inscripción", value: d.fechaInscripcion || "—", date: true },
            { label: "Emisión", value: d.fechaEmision || "—", date: true },
            { label: "Caducidad", value: d.fechaCaducidad || "—", date: true },
            { label: "Restricción", value: d.restriccion || "Sin restricción", cls: d.restriccion ? "v-no" : "v-yes" }
        ], 0.1),

        dataCard("users", "Familia", [
            { label: "Padre", value: d.padre || "—" },
            { label: "Madre", value: d.madre || "—" },
            { label: "Hijos", value: d.hijos || "—" }
        ], 0.15),

        dataCard("mapPin", "Dirección", [
            { label: "Dirección", value: d.direccion || "—" },
            { label: "Departamento", value: d.departamentoDir || "—" },
            { label: "Provincia", value: d.provinciaDir || "—" },
            { label: "Distrito", value: d.distrito || "—" }
        ], 0.2),

        dataCard("zap", "Ubigeo", [
            { label: "RENIEC", value: d.ubigeoReniec || "—", code: true },
            { label: "INEI", value: d.ubigeoInei || "—", code: true },
            { label: "SUNAT", value: d.ubigeoSunat || "—", code: true },
            { label: "C. Postal", value: d.codigoPostal || "—", code: true }
        ], 0.25),

        actaCard(0.3)(d)
    ].join("");

    container.innerHTML = `
        ${band}
        ${actionBar(d.dni, !!fotoSrc)}
        <div class="cards-masonry">${cards}</div>
    `;
}

function showError(container, msg) {
    container.innerHTML = `<div class="error-card">
        <div class="ec-icon">${svgIcon("alert", 24)}</div>
        <h3>No se pudo completar la consulta</h3>
        <p>${escapeHTML(msg)}</p>
    </div>`;
}
