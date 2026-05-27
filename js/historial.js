let pedidoActualId = null;
/* ========= CARGAR HISTORIAL ========= */
async function cargarHistorial() {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false })
  // ← AQUÍ EL CAMBIO

    if (error) throw error;

    if (!Array.isArray(data)) return;

    renderResumenDia(data);
    renderTablaHistorial(data);

  } catch (err) {
    console.error("Error cargando historial:", err);
  }
}


/* ========= RESUMEN DEL DÍA ========= */
function renderResumenDia(data) {
  const hoy = hoyISO();

  const pedidosHoy = data.filter(p => p.fecha === hoy);
  const totalHoy = pedidosHoy.reduce(
  (s, p) => s + Number(p.total_final || p.total || 0),
  0
  );

  const html = `
    <h3>Resumen del día</h3>

    <div style="margin-bottom:10px">
      <strong>Fecha:</strong> ${hoy}
    </div>

    <table>
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Dirección</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${pedidosHoy.map(p => `
          <tr>
            <td>${p.numero_pedido || ""}</td>
            <td>${p.cliente_direccion || ""}</td>
            <td>${eur(p.total_final || p.total)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div style="margin-top:15px;font-size:20px;font-weight:bold;text-align:right;">
      TOTAL DEL DÍA: ${eur(totalHoy)}
    </div>
  `;

  document.getElementById("resumenDia").innerHTML = html;
}

/* ========= TABLA PRINCIPAL DEL HISTORIAL ========= */
function renderTablaHistorial(data) {
  let html = `
    <table>
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Factura</th>
          <th>Ruta</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  html += data.map(p => `
    <tr onclick="reimprimirPedido(${p.id})" style="cursor:pointer">
      <td>${p.numero_pedido || ""}</td>
      <td>${p.cliente_direccion || ""}</td>
      <td>${p.fecha || ""}</td>
      <td>${eur(p.total_final || p.total || 0)}</td>
      <td>${p.requiere_factura ? "SI" : "NO"}</td>

      <td>
        <select
          onclick="event.stopPropagation()"
          onchange="cambiarRuta(${p.id}, this.value)"
        >
          ${["Pendiente", "Ruta 1", "Ruta 2", "Entregado"]
            .map(r => `<option value="${r}" ${p.ruta === r ? "selected" : ""}>${r}</option>`)
            .join("")}
        </select>
      </td>

      <td>
        <button onclick="event.stopPropagation(); reimprimirPedido(${p.id})">
          Ver
        </button>

        <button onclick="event.stopPropagation(); reimprimirPedido(${p.id}, true)">
          Factura
        </button>
      </td>
    </tr>
  `).join("");

  html += `</tbody></table>`;
  document.getElementById("historialTabla").innerHTML = html;
}

/* ========= REIMPRIMIR PEDIDO ========= */
async function reimprimirPedido(id, abrirFactura = false) {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Productos
    pedido = data.productos || [];
    pedidoActualId = data.id;
    window.fechaPedidoActual = data.fecha;

    // Cliente
    document.getElementById("cliNombre").value = data.cliente_nombre || "";
    document.getElementById("cliDireccion").value = data.cliente_direccion || "";
    document.getElementById("cliTelefono").value = data.cliente_telefono || "";
    document.getElementById("cliCIF").value = data.cliente_cif || "";

    // Pedido
    document.getElementById("pedidoNum").value = data.numero_pedido || "";

    // Factura
    document.getElementById("facturaNum").value = data.numero_factura || "";
    document.getElementById("requiereFactura").checked = data.requiere_factura || false;

    renderPedidoTabla();

    cambiarTab(abrirFactura ? "factura" : "hoja");
    renderDocumento(abrirFactura);

  } catch (err) {
    console.error("Error reimprimiendo pedido:", err);
    alert("Error cargando pedido");
  }
}

/* ========= CAMBIAR RUTA ========= */
async function cambiarRuta(id, ruta) {
  try {
    const { error } = await supabase
      .from("pedidos")
      .update({ ruta })
      .eq("id", id);

    if (error) throw error;

  } catch (err) {
    console.error("Error actualizando ruta:", err);
    alert("Error actualizando ruta");
  }
}

/* ========= DESCARGAR RUTA ========= */
async function descargarRuta(ruta) {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("ruta", ruta);

    if (error) throw error;

    let totalRuta = 0;

    const html = `
<html>
<head>
<title>${ruta}</title>
<style>
  body{ font-family:Arial; padding:20px; }
  h1{ margin-bottom:20px; }
  table{ width:100%; border-collapse:collapse; }
  th, td{ border:1px solid #ccc; padding:10px; text-align:left; }
  th{ background:#f3f3f3; }
  .total{ margin-top:20px; font-size:22px; font-weight:bold; text-align:right; }
</style>
</head>
<body>

<h1>${ruta}</h1>

<div style="
  margin-bottom:20px;
  font-size:18px;
">
  <strong>Fecha:</strong> ${hoyISO()}
  <strong>Repartidor:</strong> __________
</div>

<table>
<thead>
<tr>
  <th>Pedido</th>
  <th>Direccion</th>
  <th>Telefono</th>
  <th>Total</th>
</tr>
</thead>
<tbody>
${data.map(p => {
  totalRuta += Number(p.total_final || p.total || 0);
  return `
<tr>
  <td>${p.numero_pedido || ""}</td>
  <td>${p.cliente_direccion || ""}</td>
  <td>${p.cliente_telefono || ""}</td>
  <td>${Number(p.total_final || p.total || 0).toFixed(2)} €</td>
</tr>`;
}).join("")}
</tbody>
</table>

<div class="total">
TOTAL RUTA: ${totalRuta.toFixed(2)} €
</div>

</body>
</html>
`;

    const ventana = window.open("", "_blank");
    ventana.document.write(html);
    ventana.document.close();
    ventana.print();

  } catch (err) {
    console.error("Error descargando ruta:", err);
    alert("Error cargando ruta");
  }
}
