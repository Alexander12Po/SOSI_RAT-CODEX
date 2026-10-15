/* ============================================================
   SOSI CODEX — export.js
   Copiar texto y descargar imagen/foto desde los resultados
   ============================================================ */

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
            const ok = await copyText(state.texto || "");
            showToast(ok ? "Texto copiado" : "No se pudo copiar");
        } else if (action === "copy-field") {
            const value = btn.closest(".data-row")?.querySelector(".data-value")?.textContent || "";
            const ok = await copyText(value.trim());
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
