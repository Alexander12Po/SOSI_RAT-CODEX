/* Gate de acceso: muestra el login primero en la página principal */
(function () {
  var KEY = 'sosi_gate_ok';
  function close() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    var g = document.getElementById('authGate');
    if (g) g.hidden = true;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var gate = document.getElementById('authGate');
    if (!gate) return;
    // Si ya pasó el gate en esta sesión, no molestar
    try { if (sessionStorage.getItem(KEY) === '1') { gate.hidden = true; return; } } catch (e) {}
    // Ocultar si ya hay sesión de usuario iniciada
    setTimeout(function () {
      try {
        var u = (typeof AUTH !== 'undefined' && AUTH.user) ? AUTH.user() : null;
        if (u) gate.hidden = true;
      } catch (e) {}
    }, 600);
    var skip = document.getElementById('authGateSkip');
    if (skip) skip.addEventListener('click', function (ev) { ev.preventDefault(); close(); });
  });
})();
