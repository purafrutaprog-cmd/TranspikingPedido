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
document.addEventListener("DOMContentLoaded", async () => {

  try {

    await cargarClientes();

    await cargarCatalogo();

    renderPedidoTabla();

    renderClientes();

    // cerrar rutas antiguas al abrir
    await cerrarRutasDiaAnterior();

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
async function cerrarRutasDiaAnterior(){

  const hoy = hoyISO();

  const ultimoCierre =
    localStorage.getItem("ultimoCierreRutas");

  if(ultimoCierre === hoy){
    return;
  }

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  const fechaAyer = ayer.toISOString().split("T")[0];


  const { error } = await supabase
    .from("pedidos")
    .update({
      ruta: "Entregado"
    })
    .eq("fecha", fechaAyer)
    .in("ruta", ["Ruta 1", "Ruta 2"]);


  if(error){
    console.error("Error cerrando rutas:", error);
    return;
  }


  localStorage.setItem(
    "ultimoCierreRutas",
    hoy
  );


  console.log("Rutas anteriores cerradas");
}
