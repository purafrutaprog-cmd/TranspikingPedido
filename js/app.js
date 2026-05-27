// APP
// =========================
//   CONFIGURACIÓN EMPRESA
// =========================
const EMPRESA = {
  nombre: "Transpiking W.P. Global, S.L",
  direccion: "CL san sebatian 62 ENT 1",
  cp: "08030 Barcelona",
  cif: "B22613558"
};

const IVA_PCT = 10;
const HELADOS_UMBRAL = 100;
const HELADOS_PRECIO_PROMO = 0.95;

// =========================
//        ESTADO
// =========================
let cliente = null;
let clienteEditando = null;

// =========================
//        HELPERS
// =========================

// Formatea euros
const eur = (n) => `${Number(n || 0).toFixed(2)} €`;

// Escapa HTML para evitar inyecciones
const esc = (s) => String(s || "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

// Fecha actual en formato YYYY-MM-DD
function hoyISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// =========================
//        INICIO APP
// =========================
document.addEventListener("DOMContentLoaded", () => {
  try {
    cargarClientes();
    cargarCatalogo();
    renderPedidoTabla();
    renderClientes();
  } catch (err) {
    console.error("Error inicializando la app:", err);
    alert("Hubo un error cargando la aplicación.");
  }
});

// =========================
//     CAMBIO DE TABS
// =========================
function cambiarTab(tab) {

  // Activar pestaña visual
  document.querySelectorAll(".tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tab);
  });

  // Mostrar/ocultar secciones
  const secciones = ["pedido", "hoja", "factura", "historial"];
  secciones.forEach(id => {
    const el = document.getElementById(`tab-${id}`);
    if (el) el.classList.toggle("hidden", id !== tab);
  });

// Render dinámico según pestaña
if (tab === "hoja") {
  setTimeout(() => renderDocumento(false), 30);
}

if (tab === "factura") {
  setTimeout(() => renderDocumento(true), 30);
}

if (tab === "historial") {
  cargarHistorial();
}

}
