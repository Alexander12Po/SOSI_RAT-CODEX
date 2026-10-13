const BACKEND_URL = "https://backend-dni.onrender.com";

document.getElementById("btnConsultar").addEventListener("click", consultarDNI);

async function despertarBackend() {
  const pantalla = document.getElementById("pantalla-carga");
  let listo = false;

  while (!listo) {
    try {
      const res = await fetch(BACKEND_URL + "/estado");
      const data = await res.json();
      listo = data.listo === true;
    } catch (err) {
      listo = false;
    }
    if (!listo) {
      await new Promise(function(r) { setTimeout(r, 1500); });
    }
  }

  pantalla.classList.add("despegando");
  setTimeout(function() {
    pantalla.style.display = "none";
  }, 600);
}

despertarBackend();

async function consultarDNI() {
  const dni = document.getElementById("dni").value.trim();
  const resultadoDiv = document.getElementById("resultado");
  const boton = document.getElementById("btnConsultar");

  if (!dni) { return; }

  boton.disabled = true;
  boton.textContent = "Consultando...";
  resultadoDiv.className = "";
  resultadoDiv.style.display = "block";
  resultadoDiv.textContent = "Buscando...";

  try {
    const res = await fetch(BACKEND_URL + "/consulta-dni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: dni })
    });
    const data = await res.json();

    resultadoDiv.innerHTML = "";

    if (!data.success) {
      resultadoDiv.textContent = data.error || "Ocurrio un error.";
    } else {
      resultadoDiv.classList.add("con-datos");

      if (data.imagen) {
        const fotoContainer = document.createElement("div");
        fotoContainer.className = "foto-container";
        const img = document.createElement("img");
        img.src = "data:image/jpeg;base64," + data.imagen;
        fotoContainer.appendChild(img);
        resultadoDiv.appendChild(fotoContainer);
      }

      if (data.texto) {
        const datosDiv = document.createElement("div");
        datosDiv.className = "datos-texto";
        const lineas = data.texto.split("\n");
        lineas.forEach(function(linea) {
          if (linea.trim() === "") return;
          const partes = linea.split(":");
          const p = document.createElement("p");
          p.style.margin = "4px 0";
          if (partes.length > 1) {
            p.innerHTML = "<strong>" + partes[0] + ":</strong>" + partes.slice(1).join(":");
          } else {
            p.textContent = linea;
          }
          datosDiv.appendChild(p);
        });
        resultadoDiv.appendChild(datosDiv);
      }
    }
  } catch (err) {
    resultadoDiv.textContent = "Error de conexion con el servidor.";
  }

  boton.disabled = false;
  boton.textContent = "Consultar";
}
