/* Gate de acceso OBLIGATORIO: sin sesion valida -> login.html directo.
   El script inline de index.html ya redirige; aqui solo se asegura en
   paginas internas (consulta/nombre/genealogica/servicio/perfil). */
(function () {
    var RUTA_LOGIN = "/login.html";
    var pagina = location.pathname.replace(/\/+$/, "");
    var publicas = ["/login", "/register", "/forgot-password", "", "/index"];
    if (publicas.indexOf(pagina) !== -1) return;

    function tieneSesion() {
        try {
            var keys = Object.keys(localStorage).filter(function (k) {
                return k.indexOf("firebase-authentication") === 0 || (k.indexOf("firebase:") === 0 && k.indexOf(":credential") !== -1);
            });
            for (var i = 0; i < keys.length; i++) {
                var v = localStorage.getItem(keys[i]) || "";
                if (/"access_token"\s*:\s*"eyJ/.test(v)) return true;
            }
        } catch (e) {}
        return false;
    }

    /* Si Firebase confirma sesion real, AUTH la gestiona; si al cargar
       sigue sin sesion local, redirigir al login. */
    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(function () {
            if (!tieneSesion()) {
                var u = null;
                try { u = (window.AUTH && AUTH.user) ? AUTH.user() : null; } catch (e) {}
                if (!u) location.replace(RUTA_LOGIN + "?next=" + encodeURIComponent(location.pathname));
            }
        }, 900);
    });
})();
