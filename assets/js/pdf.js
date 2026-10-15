/* ============================================================
   SOSI CODEX — pdf.js
   Generación de PDF con jsPDF (CDN): texto largo, salto de
   página automático, envoltura sin cortar líneas, marca de
   agua diagonal "SOSI CODEX" en todas las páginas.
   ============================================================ */

const PDFX = {
    MARGIN: 48,          /* pts · márgenes uniformes A4 (595x842) */
    LINE_H: 13.6,        /* interlineado consistente */
    BODY_SIZE: 10.5,     /* fuente legible 10-11pt */
    WATERMARK: { text: "SOSI CODEX", opacity: 0.10, angle: 45, size: 54 },

    /* Normaliza texto crudo del bot: CRLF, tabuladores, líneas vacías dobles */
    normalize(raw) {
        return String(raw || "")
            .replace(/\r\n?/g, "\n")
            .replace(/\t/g, "    ")
            .split("\n")
            .map(l => l.replace(/[ \u00A0]+$/g, ""))
            .join("\n");
    },

    /* Marca de agua diagonal centrada, semitransparente, gris claro */
    _watermark(doc, W, H) {
        const wm = this.WATERMARK;
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: wm.opacity }));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(wm.size);
        doc.setTextColor(160, 168, 180);
        doc.text(wm.text, W / 2, H / 2, { align: "center", angle: wm.angle });
        doc.restoreGraphicsState();
    },

    /* Línea divisoria discreta al pie */
    _footer(doc, W, H, pageNum) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(150, 158, 172);
        doc.text("SOSI CODEX — Consulta Genealógica", this.MARGIN, H - 24);
        doc.text(String(pageNum), W - this.MARGIN, H - 24, { align: "right" });
    },

    /* Genera y descarga el PDF.
       opts: { title, subtitle, body }  */
    generate(opts) {
        const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDFCtor) throw new Error("jsPDF no está disponible");

        const doc = new jsPDFCtor({ unit: "pt", format: "a4" });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        const M = this.MARGIN;
        const maxW = W - M * 2;

        let y = M;
        let page = 1;
        this._watermark(doc, W, H);

        /* ---- Encabezado ---- */
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(20, 30, 50);
        doc.text(opts.title || "Consulta Genealógica - SOSI CODEX", M, y + 6);
        y += 24;

        const fecha = new Date().toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(110, 120, 138);
        doc.text("Generado: " + fecha, M, y);
        if (opts.subtitle) {
            y += 13;
            doc.text(opts.subtitle, M, y);
        }
        y += 8;
        doc.setDrawColor(200, 206, 216);
        doc.setLineWidth(0.6);
        doc.line(M, y, W - M, y);
        y += 18;

        /* ---- Cuerpo: bloque por línea original, envuelta sin cortar ---- */
        const lines = this.normalize(opts.body).split("\n");
        doc.setFont("courier", "normal");
        doc.setFontSize(this.BODY_SIZE);
        doc.setTextColor(35, 42, 55);

        const ensureSpace = (needed) => {
            if (y + needed <= H - M - 20) return;      /* deja sitio para el pie */
            this._footer(doc, W, H, page);
            doc.addPage();
            page++;
            y = M;
            this._watermark(doc, W, H);
        };

        for (const raw of lines) {
            if (raw.trim() === "") {                    /* línea en blanco: respiro corto */
                if (y > M) y += this.LINE_H * 0.55;     /* evita blancos al inicio de página */
                continue;
            }
            /* splitTextToSize envuelve dentro del ancho; cada fragmento impreso
               es una línea completa → nunca se corta una línea entre páginas */
            const wrapped = doc.splitTextToSize(raw, maxW);
            for (let i = 0; i < wrapped.length; i++) {
                ensureSpace(this.LINE_H);
                doc.text(wrapped[i], M, y);
                y += this.LINE_H;
            }
        }
        this._footer(doc, W, H, page);

        /* ---- Nombre de archivo con fecha ---- */
        const d = new Date();
        const stamp = d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
        doc.save("consulta-genealogica-" + stamp + ".pdf");
        return stamp;
    }
};
