/* ============================================================
   SOSI CODEX — history.js
   Búsquedas recientes (localStorage) + empty state + tarjetas
   de instrucciones para las páginas de consulta.
   ============================================================ */

const HIST = {
    MAX: 6,
    _key(page) { return 'sosi-hist-' + page; },

    load(page) {
        try { return JSON.parse(localStorage.getItem(this._key(page))) || []; }
        catch (e) { return []; }
    },

    push(page, item) {
        const list = this.load(page).filter(x => x.label !== item.label);
        list.unshift({ ...item, t: Date.now() });
        localStorage.setItem(this._key(page), JSON.stringify(list.slice(0, this.MAX)));
    },

    clear(page) { localStorage.removeItem(this._key(page)); }
};

const HISTORY_UI = (() => {
    const ic = {
        clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
        trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
        radar: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>',
        info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
    };

    function esc(s) {
        return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    /* --- Tarjeta de aviso / instrucciones --- */
    function mountTips(elId, items) {
        const el = document.getElementById(elId);
        if (!el) return;
        el.classList.add("tip-card");
        el.innerHTML = `
            <div class="tip-head">${ic.info}<span>Recomendaciones</span></div>
            <ul class="tip-list">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
    }

    /* --- Empty state + historial --- */
    function create(root, opts) {
        /* root: sección que ocupa el área inferior (visible cuando no hay resultados) */
        root.classList.add('query-idle');
        root.innerHTML = `
            <div class="empty-state">
                <div class="es-icon">${ic.radar}</div>
                <h3 class="es-title">${esc(opts.title)}</h3>
                <p class="es-sub">${esc(opts.subtitle)}</p>
            </div>
            <div class="hist-card" id="histCard" hidden>
                <div class="hist-head">
                    <span class="hh-left">${ic.clock} Búsquedas recientes</span>
                    <button type="button" class="hist-clear" id="histClear" aria-label="Borrar historial">${ic.trash}</button>
                </div>
                <div class="hist-chips" id="histChips"></div>
            </div>`;

        const chipsEl = root.querySelector('#histChips');
        const cardEl = root.querySelector('#histCard');
        const clearBtn = root.querySelector('#histClear');

        function render() {
            const list = HIST.load(opts.page);
            cardEl.hidden = list.length === 0;
            chipsEl.innerHTML = list.map((it, i) => `
                <button type="button" class="hist-chip" data-i="${i}">
                    <span class="hc-label">${esc(it.label)}</span>
                    ${it.kind ? `<span class="hc-kind">${esc(it.kind)}</span>` : ''}
                </button>`).join('');
        }

        chipsEl.addEventListener('click', (e) => {
            const chip = e.target.closest('.hist-chip');
            if (!chip) return;
            const it = HIST.load(opts.page)[+chip.dataset.i];
            if (it && opts.onPick) opts.onPick(it);
        });

        clearBtn.addEventListener('click', () => {
            HIST.clear(opts.page);
            render();
        });

        render();
        return { refresh: render, hide: () => { root.style.display = 'none'; } };
    }

    return { mountTips, create };
})();
