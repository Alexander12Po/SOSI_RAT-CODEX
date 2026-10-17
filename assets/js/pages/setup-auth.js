/* SOSI CODEX — setup-auth.js
   Utilidad para activar Supabase desde la consola del navegador (una sola vez):
   localStorage.setItem("sosi_supabase", JSON.stringify({url:"https://xxx.supabase.co", anonKey:"sb_publishable_..."}))
   Este script añade el botón "Activar" en login.html que abre un diálogo con 2 campos. */
(function () {
    const grid = document.getElementById("oauthGrid");
    if (!grid || window.SOSI_SUPABASE?.enabled) return;

    const box = document.createElement("div");
    box.className = "auth-setup";
    box.innerHTML = `
        <details class="auth-setup-det">
            <summary>⚙ Configurar Supabase (avanzado)</summary>
            <input id="suUrl" class="auth-input" placeholder="https://xxxx.supabase.co" inputmode="url">
            <input id="suKey" class="auth-input" placeholder="anon key pública (sb_publishable_...)">
            <button type="button" class="auth-btn auth-btn-ghost" id="suSave">Guardar y activar</button>
            <p class="auth-setup-note">Se guarda solo en este navegador (localStorage). Usa únicamente la clave ANON/PUBLIC.</p>
        </details>`;
    grid.parentNode.insertBefore(box, grid.nextSibling);

    box.querySelector("#suSave").addEventListener("click", () => {
        const url = box.querySelector("#suUrl").value.trim();
        const key = box.querySelector("#suKey").value.trim();
        if (!/^https:\/\/.+\.supabase\.co$/.test(url)) { AUTH.toast("URL de Supabase no válida.", "error"); return; }
        if (key.length < 20) { AUTH.toast("La anon key no parece válida.", "error"); return; }
        localStorage.setItem("sosi_supabase", JSON.stringify({ url, anonKey: key }));
        location.reload();
    });
})();
