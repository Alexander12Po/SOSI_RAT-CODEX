const BACKEND_URL = "https://backend-dni.onrender.com";

// ============ LOADER ============
const loaderScreen = document.getElementById("loaderScreen");
if (loaderScreen) {
    async function despertarBackend() {
        let listo = false;
        while (!listo) {
            try {
                const res = await fetch(BACKEND_URL + "/estado");
                const data = await res.json();
                listo = data.listo === true;
            } catch (err) { listo = false; }
            if (!listo) await new Promise(r => setTimeout(r, 1500));
        }
        loaderScreen.classList.add("despegando");
        setTimeout(() => { loaderScreen.style.display = "none"; }, 600);
    }
    despertarBackend();
}

// ============ CONSULTA DNI (solo en consulta.html) ============
const btnConsultar = document.getElementById("btnConsultar");
const dniInput = document.getElementById("dni");
const resultsSection = document.getElementById("resultsSection");
const resultsContainer = document.getElementById("resultsContainer");

if (btnConsultar && dniInput) {
    btnConsultar.addEventListener("click", consultarDNI);
    dniInput.addEventListener("keydown", e => { if (e.key === "Enter") consultarDNI(); });
    dniInput.addEventListener("input", e => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
    });
}

async function consultarDNI() {
    const dni = dniInput.value.trim();
    if (dni.length !== 8) {
        dniInput.style.animation = "shake 0.4s ease";
        dniInput.style.borderColor = "var(--rojo)";
        setTimeout(() => { dniInput.style.borderColor = ""; }, 1000);
        return;
    }

    btnConsultar.disabled = true;
    btnConsultar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Consultando...';
    resultsSection.style.display = "none";
    resultsContainer.innerHTML = "";

    try {
        const res = await fetch(BACKEND_URL + "/consulta-dni", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni: dni })
        });
        const data = await res.json();

        if (!data.success) {
            showError(data.error || "No se encontró información.");
        } else {
            renderResults(data);
        }
    } catch (err) {
        showError("Error de conexión con el servidor.");
    }

    btnConsultar.disabled = false;
    btnConsultar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Consultar';
}

function parseTexto(texto) {
    const r = {
        dni: "", apellidos: "", nombres: "", genero: "",
        fechaNacimiento: "", edad: "", departamentoNac: "", provinciaNac: "",
        fechaInscripcion: "", fechaEmision: "", fechaCaducidad: "",
        padre: "", madre: "", restriccion: "",
        direccion: "", departamentoDir: "", provinciaDir: "", distrito: "",
        ubigeoReniec: "", ubigeoInei: "", ubigeoSunat: "", codigoPostal: "",
        matrimonio: "", nacimiento: "", defuncion: "", certNacido: "", certDefuncion: "", hijos: ""
    };
    if (!texto) return r;

    texto.split("\n").forEach(linea => {
        const l = linea.trim();
        if (!l) return;
        const match = l.match(/\*\*(.+?)\*\*\s*:\s*`?([^`]*)`?/);
        if (match) {
            const key = match[1].trim().toUpperCase();
            const val = match[2].trim();
            switch (key) {
                case "DNI": r.dni = val; break;
                case "APELLIDOS": r.apellidos = val; break;
                case "NOMBRES": r.nombres = val; break;
                case "GENERO": r.genero = val; break;
                case "FECHA NACIMIENTO":
                    const p = val.split(")");
                    r.fechaNacimiento = p[0].replace("(", "").trim();
                    r.edad = p[1] ? p[1].replace("(", "").replace(")", "").trim() : "";
                    break;
                case "DEPARTAMENTO": if (!r.departamentoNac) r.departamentoNac = val; else r.departamentoDir = val; break;
                case "PROVINCIA": if (!r.provinciaNac) r.provinciaNac = val; else r.provinciaDir = val; break;
                case "FECHA INSCRIPCION": r.fechaInscripcion = val; break;
                case "FECHA EMISION": r.fechaEmision = val; break;
                case "FECHA CADUCIDAD": r.fechaCaducidad = val; break;
                case "PADRE": r.padre = val; break;
                case "MADRE": r.madre = val; break;
                case "RESTRICCION": r.restriccion = val; break;
                case "DIRECCION": r.direccion = val; break;
                case "DISTRITO": r.distrito = val; break;
                case "UBIGEO RENIEC": r.ubigeoReniec = val; break;
                case "UBIGEO INEI": r.ubigeoInei = val; break;
                case "UBIGEO SUNAT": r.ubigeoSunat = val; break;
                case "CODIGO POSTAL": r.codigoPostal = val; break;
                case "MATRIMONIO": r.matrimonio = val; break;
                case "NACIMIENTO": r.nacimiento = val; break;
                case "DEFUNCION": r.defuncion = val; break;
                case "CERT. NACIDO": r.certNacido = val; break;
                case "CERT. DEFUNCIÓN": case "CERT. DEFUNCION": r.certDefuncion = val; break;
                case "HIJOS": r.hijos = val; break;
            }
        }
    });
    return r;
}

function renderResults(data) {
    const d = parseTexto(data.texto);
    resultsSection.style.display = "block";
    resultsContainer.innerHTML = "";

    const fotoSrc = data.imagen ? "data:image/jpeg;base64," + data.imagen : "https://via.placeholder.com/110x110/1a0a0a/c0152f?text=DNI";

    resultsContainer.innerHTML += `
        <div class="card profile-card" style="animation-delay:0.05s">
            <div class="card-header">
                <div class="card-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                <h3>Información Personal</h3>
            </div>
            <div class="profile-top">
                <div class="profile-photo"><img src="${fotoSrc}" alt="Foto DNI"></div>
                <div class="profile-info">
                    <h2>${d.nombres || "—"}</h2>
                    <p class="lastname">${d.apellidos || "—"}</p>
                    <div class="profile-tags">
                        <span class="tag tag-dni">DNI: ${d.dni || "—"}</span>
                        <span class="tag tag-gender">${d.genero || "—"}</span>
                        ${d.edad ? `<span class="tag tag-age">${d.edad} años</span>` : ""}
                    </div>
                </div>
            </div>
        </div>
    `;

    resultsContainer.innerHTML += buildCard("calendar-alt", "Nacimiento", [
        { label: "Fecha de Nacimiento", value: d.fechaNacimiento || "—" },
        { label: "Edad", value: d.edad ? `${d.edad} años` : "—" },
        { label: "Departamento", value: d.departamentoNac || "—" },
        { label: "Provincia", value: d.provinciaNac || "—" }
    ]);

    resultsContainer.innerHTML += buildCard("id-card", "Datos del DNI", [
        { label: "Fecha Inscripción", value: d.fechaInscripcion || "—" },
        { label: "Fecha Emisión", value: d.fechaEmision || "—" },
        { label: "Fecha Caducidad", value: d.fechaCaducidad || "—" },
        { label: "Restricción", value: d.restriccion || "—" }
    ]);

    resultsContainer.innerHTML += buildCard("users", "Familia", [
        { label: "Padre", value: d.padre || "—" },
        { label: "Madre", value: d.madre || "—" },
        { label: "Hijos", value: d.hijos || "—" },
        { label: "Estado Civil", value: d.matrimonio === "1" ? "Casado(a)" : d.matrimonio === "0" ? "Soltero(a)" : d.matrimonio || "—" }
    ]);

    resultsContainer.innerHTML += buildCard("map-marker-alt", "Dirección", [
        { label: "Dirección", value: d.direccion || "—", full: true },
        { label: "Departamento", value: d.departamentoDir || "—" },
        { label: "Provincia", value: d.provinciaDir || "—" },
        { label: "Distrito", value: d.distrito || "—" }
    ]);

    resultsContainer.innerHTML += buildCard("map-pin", "Ubigeo", [
        { label: "Ubigeo RENIEC", value: d.ubigeoReniec || "—", code: true },
        { label: "Ubigeo INEI", value: d.ubigeoInei || "—", code: true },
        { label: "Ubigeo SUNAT", value: d.ubigeoSunat || "—", code: true },
        { label: "Código Postal", value: d.codigoPostal || "—", code: true }
    ]);

    resultsContainer.innerHTML += buildCard("file-alt", "Actas / Certificados", [
        { label: "Matrimonio", value: d.matrimonio === "1" ? "Sí" : "No", cls: d.matrimonio === "1" ? "yes" : "no" },
        { label: "Nacimiento", value: d.nacimiento === "1" ? "Sí" : "No", cls: d.nacimiento === "1" ? "yes" : "no" },
        { label: "Defunción", value: d.defuncion === "1" ? "Sí" : "No", cls: d.defuncion === "1" ? "yes" : "no" },
        { label: "Cert. Nacido", value: d.certNacido === "1" ? "Sí" : "No", cls: d.certNacido === "1" ? "yes" : "no" },
        { label: "Cert. Defunción", value: d.certDefuncion === "1" ? "Sí" : "No", cls: d.certDefuncion === "1" ? "yes" : "no" }
    ]);

    setTimeout(() => { resultsSection.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
}

function buildCard(icon, title, items) {
    const icons = {
        "calendar-alt": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        "id-card": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/></svg>',
        "users": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
        "map-marker-alt": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
        "map-pin": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
        "file-alt": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
    };

    const itemsHTML = items.map(item => {
        const cls = ["info-item", item.full ? "full" : ""].filter(Boolean).join(" ");
        const valCls = ["info-value", item.code ? "code" : "", item.cls || ""].filter(Boolean).join(" ");
        return `<div class="${cls}"><span class="info-label">${item.label}</span><span class="${valCls}">${item.value}</span></div>`;
    }).join("");

    return `
        <div class="card" style="animation-delay:${0.1 + Math.random() * 0.3}s">
            <div class="card-header">
                <div class="card-icon">${icons[icon] || icons["file-alt"]}</div>
                <h3>${title}</h3>
            </div>
            <div class="info-grid">${itemsHTML}</div>
        </div>
    `;
}

function showError(msg) {
    resultsSection.style.display = "block";
    resultsContainer.innerHTML = `
        <div class="error-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h3>Error</h3>
            <p>${msg}</p>
        </div>
    `;
}

const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
    @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(shakeStyle);