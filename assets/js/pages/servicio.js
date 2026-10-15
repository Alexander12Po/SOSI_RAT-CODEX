/* ============================================================
   SOSI CODEX — pages/servicio.js
   Página genérica de servicios pendientes (servicio.html?key=xxx)
   Muestra el estado real del servicio: sin resultados simulados.
   ============================================================ */

(function initServicio() {
    const params = new URLSearchParams(location.search);
    const key = params.get("key");
    const svc = svcByKey(key);

    const titleEl = document.getElementById("svcTitle");
    const iconEl = document.getElementById("svcPendingIcon");
    const nameEl = document.getElementById("svcPendingName");
    const tagEl = document.querySelector(".svc-pending-tag");
    const msgEl = document.querySelector(".svc-pending-msg");

    if (!svc) {
        if (titleEl) titleEl.textContent = "Servicio";
        if (nameEl) nameEl.textContent = "Servicio no encontrado";
        if (msgEl) msgEl.textContent = "El servicio solicitado no existe en el catálogo.";
        return;
    }

    document.title = svc.nombre + " — SOSI CODEX";
    if (titleEl) titleEl.textContent = svc.nombre;
    if (iconEl) iconEl.innerHTML = svgIcon(svc.icon, 26, 1.8);
    if (nameEl) nameEl.textContent = svc.nombre;

    if (svcLive(svc)) {
        /* Si alguien llega aquí con un servicio ya implementado, redirigir */
        location.replace(svcHref(svc));
    }
})();
