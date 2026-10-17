/* Gate de acceso OBLIGATORIO: sin sesion valida -> login.html directo.
   Usa la confirmacion real de Firebase (AUTH.onChange), sin adivinar
   claves de localStorage ni usar un tiempo de espera fijo. */
(function () {
    var RUTA_LOGIN = "/login.html";
    var pagina = location.pathname.replace(/\/+$/, "");
    var publicas = ["/login.html", "/register.html", "/forgot-password.html", "", "/", "/index.html", "/index"];
    if (publicas.indexOf(pagina) !== -1) return;

    var decidido = false;
    function esperarAuth() {
        if (window.AUTH && typeof AUTH.onChange === "function") {
            AUTH.onChange(function (u) {
                if (decidido) return;
                decidido = true;
                if (!u) location.replace(RUTA_LOGIN + "?next=" + encodeURIComponent(location.pathname));
            });
        } else {
            setTimeout(esperarAuth, 100);
        }
    }
    document.addEventListener("DOMContentLoaded", esperarAuth);
})();
