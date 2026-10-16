/* ============================================================
   SOSI CODEX — export.js
   Copiar texto y descargar imagen/foto desde los resultados
   ============================================================ */

/** Líneas que NUNCA deben copiarse (promoción, créditos, ayuda) */
const LINEAS_PROHIBIDAS = [
    /LEDERDATA/i,
    /\[\s*#/i,
    /^\s*\[.*\]\s*(→|->)/i,
    /^credits?\s*[:：]/i,
    /^wanted\s+for\b/i,
    /𖤍/,
    /^\s*[↞↠←→]\s*$/i,
    /(puedes visualizar|antes de usar)/i,
    /^se\s+encontr?o?\s+\d+\s+resultado/i,
];

/** ¿La línea es ruido del bot que debe excluirse del copiado? */
function esLineaRuido(linea) {
    const t = linea.trim();
    if (!t) return false;
    return LINEAS_PROHIBIDAS.some(rx => rx.test(t));
}

/** Limpia markdown/símbolos decorativos de una etiqueta o valor */
function limpiarFragmento(s) {
    return String(s || "")
        .replace(/[*`_#>]+/g, " ")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

/** Títulos fijos permitidos (el resto se capitaliza palabra por palabra) */
const TITULOS_EXACTOS = {
    "dni": "DNI",
    "apellidos": "Apellidos",
    "nombres": "Nombres",
    "genero": "Género",
    "género": "Género",
    "fecha de nacimiento": "Fecha de nacimiento",
    "fecha nacimiento": "Fecha de nacimiento",
    "padre": "Padre",
    "madre": "Madre",
    "hijos": "Hijos",
    "restriccion": "Restricción",
    "restricción": "Restricción",
    "fecha de emision": "Fecha de emisión",
    "fecha emision": "Fecha de emisión",
    "fecha de caducidad": "Fecha de caducidad",
    "fecha caducidad": "Fecha de caducidad",
    "direccion": "Dirección",
    "dirección": "Dirección",
    "departamento": "Departamento",
    "provincia": "Provincia",
    "distrito": "Distrito",
    "ubigeo reniec": "Ubigeo RENIEC",
    "ubigeo inei": "Ubigeo INEI",
    "ubigeo sunat": "Ubigeo SUNAT",
    "codigo postal": "Código postal",
    "edad": "Edad",
};

/** Título formal: "DNI" -> "DNI", "ubigeo reniec" -> "Ubigeo Reniec" */
function tituloFormal(key) {
    const t = limpiarFragmento(key);
    if (TITULOS_EXACTOS[t.toLowerCase()]) return TITULOS_EXACTOS[t.toLowerCase()];
    return t
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

/**
 * Genera el texto plano profesional que se enviará al portapapeles.
 * Se construye SOLO con datos legítimos parseados — nunca innerText
 * de la interfaz ni el texto crudo del bot con decoración.
 */
function formatoPlano(textoCrudo, d) {
    // 1) Versión preferida: campos estructurados ya parseados
    if (d && typeof d === "object") {
        const bloques = [];

        const push = (label, value) => {
            const v = limpiarFragmento(value);
            if (v && !esLineaRuido(v)) bloques.push(`${tituloFormal(label)}: ${v}`);
        };

        push("DNI", d.dni);
        push("apellidos", d.apellidos);
        push("nombres", d.nombres);
        push("género", d.genero);
        if (d.fechaNacimiento) {
            const fn = limpiarFragmento(d.fechaNacimiento);
            let ed = limpiarFragmento(d.edad).replace(/^\((.*)\)$/, "$1");
            if (!/^\d+$/.test(ed)) ed = "";
            push("fecha de nacimiento", fn && ed ? `${fn} (${ed} años)` : fn);
        } else if (d.edad) {
            let ed = limpiarFragmento(d.edad).replace(/^\((.*)\)$/, "$1");
            if (/^\d+$/.test(ed)) push("edad", `${ed} años`);
        }
        if (d.departamentoNac || d.provinciaNac) {
            const b = [];
            if (d.departamentoNac) b.push(`Departamento: ${limpiarFragmento(d.departamentoNac)}`);
            if (d.provinciaNac) b.push(`Provincia: ${limpiarFragmento(d.provinciaNac)}`);
            bloques.push("", "NACIMIENTO", ...b);
        }
        if (d.direccion || d.departamentoDir || d.provinciaDir || d.distrito) {
            const b = [];
            if (d.direccion) b.push(`Dirección: ${limpiarFragmento(d.direccion)}`);
            if (d.departamentoDir) b.push(`Departamento: ${limpiarFragmento(d.departamentoDir)}`);
            if (d.provinciaDir) b.push(`Provincia: ${limpiarFragmento(d.provinciaDir)}`);
            if (d.distrito) b.push(`Distrito: ${limpiarFragmento(d.distrito)}`);
            bloques.push("", "DIRECCIÓN", ...b);
        }
        if (d.ubigeoReniec || d.ubigeoInei || d.ubigeoSunat || d.codigoPostal) {
            const b = [];
            if (d.ubigeoReniec) b.push(`Ubigeo RENIEC: ${limpiarFragmento(d.ubigeoReniec)}`);
            if (d.ubigeoInei) b.push(`Ubigeo INEI: ${limpiarFragmento(d.ubigeoInei)}`);
            if (d.ubigeoSunat) b.push(`Ubigeo SUNAT: ${limpiarFragmento(d.ubigeoSunat)}`);
            if (d.codigoPostal) b.push(`Código postal: ${limpiarFragmento(d.codigoPostal)}`);
            bloques.push("", "UBICACIÓN", ...b);
        }
        if (d.matrimonio || d.nacimiento || d.defuncion || d.certNacido || d.certDefuncion) {
            const b = [];
            const siNo = v => { const x = limpiarFragmento(v); return /^(1|si|sí|true)$/i.test(x) ? "Sí" : (/^(0|no|false)$/i.test(x) ? "No" : x); };
            if (d.nacimiento) b.push(`Nacimiento: ${siNo(d.nacimiento)}`);
            if (d.matrimonio) b.push(`Matrimonio: ${siNo(d.matrimonio)}`);
            if (d.defuncion) b.push(`Defunción: ${siNo(d.defuncion)}`);
            if (d.certNacido) b.push(`Certificado de nacido: ${siNo(d.certNacido)}`);
            if (d.certDefuncion) b.push(`Certificado de defunción: ${siNo(d.certDefuncion)}`);
            bloques.push("", "ACTAS Y CERTIFICADOS", ...b);
        }
        push("padre", d.padre);
        push("madre", d.madre);
        if (d.hijos && limpiarFragmento(d.hijos).toUpperCase() !== "NO") push("hijos", d.hijos);
        push("restricción", d.restriccion);
        push("fecha de emision", d.fechaEmision);
        push("fecha de caducidad", d.fechaCaducidad);

        if (bloques.length) return bloques.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    }

    // 2) Fallback: texto crudo del bot, línea por línea, sin ruido ni markdown
    if (textoCrudo) {
        const salidas = [];
        String(textoCrudo).split("\n").forEach(linea => {
            if (esLineaRuido(linea)) return;
            const limpio = limpiarFragmento(linea);
            if (!limpio) return;
            const m = limpio.match(/^([A-Za-zÁÉÍÓÚÑáéíóúñ .]{2,40}):\s*(.+)$/);
            if (m && /^[a-z]/i.test(m[1]) && /[a-záéíóúñ]/i.test(m[1])) {
                salidas.push(`${tituloFormal(m[1])}: ${m[2].trim()}`);
            } else {
                salidas.push(limpio);
            }
        });
        return salidas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    }

    return "";
}

/** Copia texto al portapapeles con fallback para contextos sin API */
async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        throw new Error("clipboard no disponible");
    } catch (_) {
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.cssText = "position:fixed;left:-9999px;top:0";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            return ok;
        } catch (__) {
            return false;
        }
    }
}

/** Descarga una imagen (src normal o data URI) como archivo */
function downloadImage(src, filename) {
    const a = document.createElement("a");
    a.href = src;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/** Convierte un data URI base64 jpeg a Blob para descarga */
function saveBase64Image(base64, filename) {
    downloadImage("data:image/jpeg;base64," + base64, filename);
}

/** Toast compacto de confirmación */
function showToast(msg) {
    let t = document.getElementById("appToast");
    if (!t) {
        t = document.createElement("div");
        t.id = "appToast";
        t.className = "app-toast";
        document.body.appendChild(t);
    }
    t.innerHTML = svgIcon("check", 13) + `<span>${escapeHTML(msg)}</span>`;
    t.classList.add("show");
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/**
 * Enruta los clics de los botones de exportación dentro del área
 * de resultados. Uso: wireExport(container, getStateFn)
 * getStateFn() -> { dni, texto, imagen }
 */
function wireExport(container, getStateFn) {
    container.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-export]");
        if (!btn) return;
        const state = getStateFn() || {};
        const action = btn.dataset.export;

        if (action === "copy") {
            // Texto plano profesional generado desde los datos parseados,
            // nunca innerText/innerHTML de la interfaz.
            const txt = state.plano != null ? state.plano : formatoPlano(state.texto, state.datos);
            const ok = await copyText(txt || "");
            showToast(ok ? "Texto copiado" : "No se pudo copiar");
        } else if (action === "copy-field") {
            // Copia SOLO el valor del campo, sin botones decorativos ni markdown
            const row = btn.closest(".data-row");
            let v = row?.dataset.value || "";
            if (!v) {
                v = (row?.querySelector(".data-value")?.textContent || "")
                    .replace(/[\u219e\u21a0\u2190\u2192]/g, "")
                    .replace(/[*`_#>]+/g, "")
                    .trim();
            }
            const ok = await copyText(v);
            showToast(ok ? "Campo copiado" : "No se pudo copiar");
        } else if (action === "photo") {
            if (state.imagen) {
                saveBase64Image(state.imagen, `dni-${state.dni || "foto"}.jpg`);
                showToast("Foto descargada");
            } else {
                showToast("Este DNI no tiene foto");
            }
        }
    });
}
