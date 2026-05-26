// APP
/* ========= EMPRESA ========= */
const EMPRESA = {
  nombre: "Transpiking W.P. Global, S.L",
  direccion: "CL san sebatian 62 ENT 1",
  cp: "08030 Barcelona",
  cif: "B22613558"
};

const IVA_PCT = 10;

const HELADOS_UMBRAL = 100;
const HELADOS_PRECIO_PROMO = 0.95;

/* ========= ESTADO ========= */
let cliente = null;
let clienteEditando = null;

/* ========= HELPERS ========= */
const eur = (n)=> Number(n||0).toFixed(2)+" €";

const esc = (s)=> String(s||"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");

function hoyISO(){
  const d=new Date();
  const mm=String(d.getMonth()+1).padStart(2,"0");
  const dd=String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* ========= APP ========= */
document.addEventListener("DOMContentLoaded", ()=>{

  cargarClientes();
  cargarCatalogo();
  renderPedidoTabla();
  renderClientes();
  

});

function cambiarTab(tab){

  document.querySelectorAll(".tab").forEach(t=>{
    t.classList.toggle("active", t.dataset.tab===tab);
  });

  document.getElementById("tab-pedido")
    .classList.toggle("hidden", tab!=="pedido");

  document.getElementById("tab-hoja")
    .classList.toggle("hidden", tab!=="hoja");

  document.getElementById("tab-factura")
    .classList.toggle("hidden", tab!=="factura");

  document.getElementById("tab-historial")
    .classList.toggle("hidden", tab!=="historial");

  if(tab==="hoja") renderDocumento(false);

  if(tab==="factura") renderDocumento(true);

  if(tab==="historial"){
    cargarHistorial();
  }
}
