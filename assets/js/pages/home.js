/* ============================================================
   SOSI CODEX — pages/home.js  (v6 panel compacto)
   Cuadrícula 2 columnas por categoría + búsqueda real + filtros
   ============================================================ */

(function initHome() {
    const gridHost = document.getElementById("servicesGrid");
    if (!gridHost) return;

    let filtroCat = "todas";
    let textoBusqueda = "";

    function tarjeta(s, i) {
        const btnTxt = s.live ? "Consultar" : "Pronto";
        const btnIcon = s.live ? svgIcon("search", 11) : "";
        return `<a href="${s.href}" class="svc ${s.live ? "svc-live" : "svc-soon"}" style="animation-delay:${0.03 * i}s">
            <div class="svc-icon">${svgIcon(s.icon, 17)}</div>
            <h3>${s.nombre}</h3>
            <span class="svc-btn ${s.live ? "" : "soon"}">${btnIcon}${btnTxt}</span>
        </a>`;
    }

    function render() {
        const q = textoBusqueda.trim().toLowerCase();
        let html = "";
        let total = 0;
        let idx = 0;

        CATEGORIAS.forEach(cat => {
            if (filtroCat !== "todas" && filtroCat !== cat.id) return;
            const items = SERVICIOS.filter(s =>
                s.cat === cat.id && (!q || s.nombre.toLowerCase().includes(q))
            );
            if (!items.length) return;
            total += items.length;
            html += `<div class="cat-label">${cat.nombre}</div>
                <div class="services-grid">${items.map(s => tarjeta(s, idx++)).join("")}</div>`;
        });

        if (!total) {
            html = `<div class="services-grid"><div class="no-results show">Sin resultados</div></div>`;
        }
        gridHost.innerHTML = html;

        const count = document.getElementById("svcCount");
        if (count) count.textContent = total + " svcs";
    }

    /* Chips de categoría */
    const chipRow = document.getElementById("chipRow");
    if (chipRow) {
        const chips = [{ id: "todas", nombre: "Todos" }, ...CATEGORIAS];
        chipRow.innerHTML = chips.map(c =>
            `<button class="chip ${c.id === "todas" ? "on" : ""}" data-cat="${c.id}">${c.nombre}</button>`
        ).join("");
        chipRow.addEventListener("click", (e) => {
            const chip = e.target.closest(".chip");
            if (!chip) return;
            filtroCat = chip.dataset.cat;
            chipRow.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === chip));
            render();
        });
    }

    /* Búsqueda funcional */
    const input = document.getElementById("svcSearch");
    const clearBtn = document.getElementById("svcClear");
    if (input) {
        input.addEventListener("input", () => {
            textoBusqueda = input.value;
            if (clearBtn) clearBtn.classList.toggle("show", !!textoBusqueda);
            render();
        });
    }
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            input.value = "";
            textoBusqueda = "";
            clearBtn.classList.remove("show");
            render();
            input.focus();
        });
    }

    render();
})();
