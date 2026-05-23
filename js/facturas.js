/* ========= PROMO HELADOS (>=100 => 0,95€/ud) ========= */
function descuentoHelados(){
  const helados = pedido.filter(l=>String(l.tipo||"").toLowerCase()==="helados");
  const totalQty = helados.reduce((s,l)=>s + Number(l.cantidad||0), 0);

  if(totalQty < HELADOS_UMBRAL) return { aplica:false, totalQty, descuento:0 };

  let descuento = 0;
  for(const l of helados){
    const diff = Number(l.precio) - HELADOS_PRECIO_PROMO;
    if(diff > 0) descuento += diff * Number(l.cantidad||0);
  }
  return { aplica:true, totalQty, descuento };
}
async function generarHoja(){

  if(
    !document.getElementById("pedidoNum").value
  ){
    await generarNumeroPedido();
  }
if(!window.pedidoGuardado){

  await guardarPedido();

  window.pedidoGuardado = true;
}
  cambiarTab("hoja");
  renderDocumento(false);
}
function generarFactura(){
  cambiarTab("factura");
  renderDocumento(true);
}

async function finalizarPedido(){

  if(!document.getElementById("pedidoNum").value){
    await generarNumeroPedido();
  }

  if(!window.pedidoGuardado){
    await guardarPedido();
    window.pedidoGuardado = true;
  }

  // SIEMPRE HOJA
  cambiarTab("hoja");
  renderDocumento(false);

  // FACTURA OPCIONAL
  const requiereFactura = document.getElementById("requiereFactura").checked;

  if(requiereFactura){
    setTimeout(() => {
      cambiarTab("factura");
      renderDocumento(true);
    }, 300);
  }
}

function renderDocumento(esFactura){
  const area = document.getElementById(esFactura ? "printFactura" : "printHoja");
  const numFactura = document.getElementById("facturaNum")?.value || "";
  if(!pedido.length){
    area.innerHTML = `<div class="muted">No hay productos en el pedido.</div>`;
    return;
  }
const cliente = {
  nombre: document.getElementById("cliNombre").value,
  telefono: document.getElementById("cliTelefono").value,
  direccion: document.getElementById("cliDireccion").value,
  cp: document.getElementById("cliCP").value,
  cif: document.getElementById("cliCIF").value,
  fecha: hoyISO()
};
  const { aplica, totalQty, descuento } = descuentoHelados();
  const totalNormal = pedido.reduce((s,l)=>s + l.precio*l.cantidad, 0);
  const total = Math.max(0, totalNormal - descuento);

const base = total;
const iva = total * (IVA_PCT / 100);
const totalFinal = base + iva;
  let html = `
    
<div class="encabezado-datos">
  
  <!-- BOX EMPRESA -->
  <div class="box">
    <div class="empresa-con-logo">
      <div>
        <h3 style="margin-top:0">Empresa</h3>
        <div><strong>Transpiking W.P. Global, S.L</strong></div>
        <div>CL San Sebastian 62 ENT 1</div>
        <div>08030 Barcelona</div>
        <div>CIF: B22613558</div>
		<div>
      <strong>Nº Pedido:</strong>
       ${esc(document.getElementById("pedidoNum").value)}
       </div>
        <div><strong>Nº Factura:</strong> ${esc(numFactura)}</div>
        <div><strong>Fecha:</strong> ${esc(cliente.fecha || hoyISO())}</div>
      </div>
    <img src="logo.png" class="logo-factura" alt="Logo empresa">
    </div>
  </div>
  <!-- BOX CLIENTE -->
  <div class="box">
  <h3 style="margin-top:0">Cliente</h3>

  <div><strong>${esc(cliente.nombre || "")}</strong></div>

  <div>${esc(cliente.direccion || "")}</div>

  <div>${esc(cliente.cp || "")}</div>

  <div>CIF/NIF: ${esc(cliente.cif || "")}</div>

  <div>Tel: ${esc(cliente.telefono || "")}</div>
</div>

</div>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Tipo</th>
          <th class="right">Precio</th>
          <th class="right">Cantidad</th>
          <th class="right">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${pedido.map(l=>`
          <tr>
            <td>${esc(l.nombre)}</td>
            <td>${esc(l.tipo)}</td>
            <td class="right">${eur(l.precio)}</td>
            <td class="right">${l.cantidad}</td>
            <td class="right">${eur(l.precio*l.cantidad)}</td>
          </tr>
        `).join("")}

        ${descuento>0 ? `
          <tr>
            <td>
              <strong>Descuento promoción helados</strong>
              <span class="pill">≥ ${HELADOS_UMBRAL} uds → ${HELADOS_PRECIO_PROMO.toFixed(2)} €/ud</span>
              <div class="muted">Helados totales: ${totalQty}</div>
            </td>
            <td class="muted">Helados</td>
            <td class="right">—</td>
            <td class="right">—</td>
            <td class="right"><strong>- ${eur(descuento)}</strong></td>
          </tr>
        ` : ""}
      </tbody>
    </table>
  `;

  if(esFactura){
    html += `

<div class="box" style="max-width:420px;margin-left:auto">
      <div style="display:flex;justify-content:space-between">
        <div>Base imponible</div>
        <div><strong>${eur(total)}</strong></div>
      </div>

      <div style="display:flex;justify-content:space-between">
        <div>IVA (10%)</div>
        <div><strong>${eur(iva)}</strong></div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:6px">
        <div>Total (IVA incl.)</div>
        <div><strong>${eur(totalFinal)}</strong></div>
      </div>
    </div>
    
    `;
  } else {
    html += `
      <div class="box" style="max-width:420px;margin-left:auto">
        <div style="display:flex;justify-content:space-between"><div><strong>Total</strong></div><div><strong>${eur(total)}</strong></div></div>
      </div>
    `;
  }


  area.innerHTML = html;
}

