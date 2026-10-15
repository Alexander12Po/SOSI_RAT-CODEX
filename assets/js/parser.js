/* ============================================================
   SOSI CODEX — parser.js
   Convierte el texto plano del bot en datos estructurados
   ============================================================ */

const CAMPOS_VACIOS = () => ({
    dni: "", apellidos: "", nombres: "", genero: "",
    fechaNacimiento: "", edad: "", departamentoNac: "", provinciaNac: "",
    fechaInscripcion: "", fechaEmision: "", fechaCaducidad: "",
    padre: "", madre: "", restriccion: "",
    direccion: "", departamentoDir: "", provinciaDir: "", distrito: "",
    ubigeoReniec: "", ubigeoInei: "", ubigeoSunat: "", codigoPostal: "",
    matrimonio: "", nacimiento: "", defuncion: "", certNacido: "", certDefuncion: "", hijos: ""
});

/**
 * Parseo robusto: ignora markdown (* ` _ # > -) y solo exige
 * "ETIQUETA: valor" por línea. Departamentos/provincias se asignan
 * por orden de aparición (primero = nacimiento, segundo = dirección).
 */
function parseTexto(texto) {
    const r = CAMPOS_VACIOS();
    if (!texto) return r;

    let vistoDepartamento = false;
    let vistoProvincia = false;

    texto.split("\n").forEach(linea => {
        const limpio = linea.replace(/[*`_#>\-]/g, "").trim();
        if (!limpio) return;
        const idx = limpio.indexOf(":");
        if (idx === -1) return;

        const key = limpio.slice(0, idx).trim().toUpperCase();
        const val = limpio.slice(idx + 1).trim();
        if (!val) return;

        switch (key) {
            case "DNI": r.dni = val; break;
            case "APELLIDOS": r.apellidos = val; break;
            case "NOMBRES": r.nombres = val; break;
            case "GENERO": case "GÉNERO": r.genero = val; break;
            case "FECHA NACIMIENTO": case "FECHA DE NACIMIENTO": {
                const p = val.split(")");
                r.fechaNacimiento = p[0].replace("(", "").trim();
                r.edad = p[1] ? p[1].replace("(", "").replace(")", "").replace(/a[nñ]os/i, "").trim() : "";
                break;
            }
            case "EDAD": if (!r.edad) r.edad = val; break;
            case "DEPARTAMENTO":
                if (!vistoDepartamento) { r.departamentoNac = val; vistoDepartamento = true; }
                else { r.departamentoDir = val; }
                break;
            case "PROVINCIA":
                if (!vistoProvincia) { r.provinciaNac = val; vistoProvincia = true; }
                else { r.provinciaDir = val; }
                break;
            case "FECHA INSCRIPCION": case "FECHA DE INSCRIPCION": r.fechaInscripcion = val; break;
            case "FECHA EMISION": case "FECHA DE EMISION": r.fechaEmision = val; break;
            case "FECHA CADUCIDAD": case "FECHA DE CADUCIDAD": r.fechaCaducidad = val; break;
            case "PADRE": r.padre = val; break;
            case "MADRE": r.madre = val; break;
            case "RESTRICCION": case "RESTRICCIÓN": r.restriccion = val; break;
            case "DIRECCION": case "DIRECCIÓN": r.direccion = val; break;
            case "DISTRITO": r.distrito = val; break;
            case "UBIGEO RENIEC": r.ubigeoReniec = val; break;
            case "UBIGEO INEI": r.ubigeoInei = val; break;
            case "UBIGEO SUNAT": r.ubigeoSunat = val; break;
            case "CODIGO POSTAL": case "CÓDIGO POSTAL": r.codigoPostal = val; break;
            case "MATRIMONIO": r.matrimonio = val; break;
            case "NACIMIENTO": r.nacimiento = val; break;
            case "DEFUNCION": case "DEFUNCIÓN": r.defuncion = val; break;
            case "CERT. NACIDO": case "CERT NACIDO": r.certNacido = val; break;
            case "CERT. DEFUNCION": case "CERT. DEFUNCIÓN": case "CERT DEFUNCION": r.certDefuncion = val; break;
            case "HIJOS": r.hijos = val; break;
        }
    });
    return r;
}

function camposLlenos(d) {
    return Object.values(d).filter(v => v).length;
}

/** Estado de caducidad del documento para la píldora de estado */
function estadoDocumento(d) {
    if (!d.fechaCaducidad) return null;
    const f = new Date(d.fechaCaducidad);
    if (isNaN(f.getTime())) return null;
    return f.getTime() >= Date.now()
        ? { ok: true, texto: "Vigente" }
        : { ok: false, texto: "Caducado" };
}
