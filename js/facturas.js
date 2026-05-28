function renderDocumento(esFactura) {

  const simplificada = document.getElementById("facturaSimplificada")?.checked;

  const area = document.getElementById(
    esFactura ? "printFactura" : "printHoja"
  );

  area.className = esFactura ? "factura-doc" : "hoja-pedido";

  const numFactura = document.getElementById("facturaNum")?.value || "";

  if (!pedido.length) {
    area.innerHTML = `<div class="muted">No hay productos en el pedido.</div>`;
    return;
  }

  // Datos cliente
  const cliente = {
    nombre: document.getElementById("cliNombre")?.value || "",
    telefono: document.getElementById("cliTelefono")?.value || "",
    direccion: document.getElementById("cliDireccion")?.value || "",
    cp: document.getElementById("cliCP")?.value || "",
    cif: document.getElementById("cliCIF")?.value || "",
    fecha: window.fechaPedidoActual || hoyISO()
  };

  // Totales
  const { totalQty, descuento } = descuentoHelados();
  const totalNormal = pedido.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const total = Math.max(0, totalNormal - descuento);

  const base = total;
  const iva = Number((total * (IVA_PCT / 100)).toFixed(2));
  const totalFinal = Number((base + iva).toFixed(2));


  /* ========= FACTURA SIMPLIFICADA ========= */
  if (simplificada && esFactura) {

    let html = `
      <div class="factura-rapida">
        <h2>Factura simplificada</h2>

        <div class="ticket-info">
          <div><strong>Nº Factura:</strong> ${esc(numFactura)}</div>
          <div><strong>Fecha:</strong> ${esc(cliente.fecha)}</div>
        </div>

        <table class="ticket-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${pedido.map(l => `
              <tr>
                <td>${esc(l.nombre)}</td>
                <td>${l.cantidad}</td>
                <td>${eur(l.precio * l.cantidad)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="margin-top:10px; font-size:13px; color:#666; text-align:right;">
          <div><strong>Helados:</strong> ${totalQty}</div>

          ${descuento > 0 ? `
            <div>
              <strong>Promoción aplicada:</strong>
              - ${eur(descuento)}
            </div>
          ` : ""}
        </div>

        <div class="ticket-totales">
          <div><span>Base imponible:</span> <strong>${eur(total)}</strong></div>
          <div><span>IVA (10%):</span> <strong>${eur(iva)}</strong></div>
          <div class="ticket-total-final">
            <span>Total:</span> <strong>${eur(totalFinal)}</strong>
          </div>
        </div>

        <p class="ticket-gracias">Gracias por su compra</p>
      </div>
    `;

    area.innerHTML = html;
    return;
  }


  /* ========= FACTURA NORMAL / HOJA ========= */
  let html = `
<div class="factura-header-pro" 
     style="display:flex; justify-content:space-between; align-items:flex-start; gap:40px;">

  <div class="empresa-info" style="flex:1;">
    <h3>Empresa</h3>
    <div>Transpiking W.P. Global, S.L</div>
    <div>CL San Sebastian 62 ENT 1</div>
    <div>08030 Barcelona</div>
    <div>CIF: B22613558</div>
    <br>
    <div><strong>Nº Pedido:</strong> ${esc(document.getElementById("pedidoNum")?.value || "")}</div>
    <div><strong>Nº Factura:</strong> ${esc(numFactura)}</div>
    <div><strong>Fecha:</strong> ${esc(cliente.fecha)}</div>
  </div>

  <div class="empresa-logo" style="flex:1; text-align:center;">
    <img src="logo.png" alt="Logo empresa" style="max-width:200px;">
  </div>

  ${!simplificada ? `
  <div class="cliente-info" style="flex:1; text-align:left;">
    <h3>Cliente</h3>
    <div><strong>${esc(cliente.nombre)}</strong></div>
    <div>${esc(cliente.direccion)}</div>
    <div>${esc(cliente.cp)}</div>
    <div>CIF/NIF: ${esc(cliente.cif)}</div>
    <div>Tel: ${esc(cliente.telefono)}</div>
  </div>
  ` : ""}
</div>
`;

  html += `
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
    ${pedido.map(l => `
      <tr>
        <td>${esc(l.nombre)}</td>
        <td>${esc(l.tipo)}</td>
        <td class="right">${eur(l.precio)}</td>
        <td class="right">${l.cantidad}</td>
        <td class="right">${eur(l.precio * l.cantidad)}</td>
      </tr>
    `).join("")}
  </tbody>
</table>
`;

  html += `
<div class="box" style="max-width:420px;margin-left:auto">
  <div style="display:flex;justify-content:space-between">
    <div>${esFactura ? "Base imponible" : "<strong>Total</strong>"}</div>
    <div><strong>${eur(total)}</strong></div>
  </div>
`;

  if (esFactura) {
    html += `
  <div style="display:flex;justify-content:space-between">
    <div>IVA (10%)</div>
    <div><strong>${eur(iva)}</strong></div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-top:6px">
    <div>Total (IVA incl.)</div>
    <div><strong>${eur(totalFinal)}</strong></div>
  </div>
`;
  }

  html += `</div>`;
  area.innerHTML = html;
}


