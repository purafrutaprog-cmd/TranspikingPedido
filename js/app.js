// APP
document.addEventListener("DOMContentLoaded", ()=>{

  cargarCatalogoSelect();
  renderPedidoTabla();
  renderClientes();
  cargarClientes();

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

function cargarCatalogoSelect(){
  const sel = document.getElementById("selProducto");
  sel.innerHTML = "";

  const tipos = [...new Set(CATALOGO.map(p=>p.tipo))].sort((a,b)=>a.localeCompare(b));
  tipos.forEach(tipo=>{
    const og=document.createElement("optgroup");
    og.label=tipo;
    CATALOGO.filter(p=>p.tipo===tipo).sort((a,b)=>a.nombre.localeCompare(b.nombre)).forEach(p=>{
      const opt=document.createElement("option");
      opt.value=p.id;
      opt.textContent = `${p.nombre} — ${eur(p.precio)}`;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
}
/* ========= HELPERS ========= */
const eur = (n)=> Number(n||0).toFixed(2)+" €";
const esc = (s)=> String(s||"")
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  .replaceAll('"',"&quot;").replaceAll("'","&#039;");


function hoyISO(){
  const d=new Date();
  const mm=String(d.getMonth()+1).padStart(2,"0");
  const dd=String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

