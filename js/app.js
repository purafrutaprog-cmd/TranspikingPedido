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
