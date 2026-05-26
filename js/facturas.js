async function finalizarPedido() {

  // Generar número de pedido si falta
  if (!document.getElementById("pedidoNum").value) {
    await generarNumeroPedido();
  }

  // Guardar pedido solo una vez
  if (!window.pedidoGuardado) {
    await guardarPedido();
    window.pedidoGuardado = true;
  }

  const requiereFactura =
    document.getElementById("requiereFactura")?.checked === true;

  // Siempre mostrar hoja
  cambiarTab("hoja");
  renderDocumento(false);

  // Mostrar factura solo si está marcado
if (requiereFactura) {
  if (!document.getElementById("facturaNum").value) {
    await generarNumeroFactura();
  }
  cambiarTab("factura");
  renderDocumento(true);
}
}

/* ========= RENDER HOJA / FACTURA ========= */
function renderDocumento(esFactura) {
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
    nombre: document.getElementById("cliNombre").value,
    telefono: document.getElementById("cliTelefono").value,
    direccion: document.getElementById("cliDireccion").value,
    cp: document.getElementById("cliCP").value,
    cif: document.getElementById("cliCIF").value,
    fecha: window.fechaPedidoActual || hoyISO()
  };

  // Totales
  const { aplica, totalQty, descuento } = descuentoHelados();
  const totalNormal = pedido.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const total = Math.max(0, totalNormal - descuento);

  const base = total;
  const iva = Number((total * (IVA_PCT / 100)).toFixed(2));
  const totalFinal = Number((base + iva).toFixed(2));

  /* ========= HTML PRINCIPAL ========= */
  let html = `
<div class="factura-header-pro">
  <div class="empresa-info">
    <h2>Transpiking W.P. Global, S.L</h2>
    <div>CL San Sebastian 62 ENT 1</div>
    <div>08030 Barcelona</div>
    <div>CIF: B22613558</div>
    <div><strong>Nº Pedido:</strong> ${esc(document.getElementById("pedidoNum").value)}</div>
    <div><strong>Nº Factura:</strong> ${esc(numFactura)}</div>
    <div><strong>Fecha:</strong> ${esc(cliente.fecha)}</div>
  </div>

  <div class="empresa-logo">
    <img src="logo.png" alt="Logo empresa">
  </div>
</div>

<div class="box cliente-box">
  <h3>Datos del cliente</h3>
  <div><strong>${esc(cliente.nombre)}</strong></div>
  <div>${esc(cliente.direccion)}</div>
  <div>${esc(cliente.cp)}</div>
  <div>CIF/NIF: ${esc(cliente.cif)}</div>
  <div>Tel: ${esc(cliente.telefono)}</div>
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
    ${pedido.map(l => `
      <tr>
        <td>${esc(l.nombre)}</td>
        <td>${esc(l.tipo)}</td>
        <td class="right">${eur(l.precio)}</td>
        <td class="right">${l.cantidad}</td>
        <td class="right">${eur(l.precio * l.cantidad)}</td>
      </tr>
    `).join("")}

    ${descuento > 0 ? `
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

  /* ========= TOTALES ========= */
  html += `
<div class="box" style="max-width:420px;margin-left:auto">
  <div style="display:flex;justify-content:space-between">
    <div>${esFactura ? "Base imponible" : "<strong>Total</strong>"}</div>
    <div><strong>${eur(esFactura ? total : total)}</strong></div>
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

async function generarNumeroFactura() {
  const { data, error } = await supabase
    .from("contador_facturas")
    .select("ultimo_numero")
    .eq("id", 1)
    .single();

  if (error) {
    alert("Error obteniendo contador de facturas");
    return null;
  }

  const siguiente = Number(data.ultimo_numero || 0) + 1;

  const { error: updateError } = await supabase
    .from("contador_facturas")
    .update({ ultimo_numero: siguiente })
    .eq("id", 1);

  if (updateError) {
    alert("Error actualizando contador de facturas");
    return null;
  }

  const año = new Date().getFullYear();
  const numeroFactura = `F-${año}-${String(siguiente).padStart(4, "0")}`;

  document.getElementById("facturaNum").value = numeroFactura;

  return numeroFactura;
}

