async function cargarHistorial(){

  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("id", { ascending:false });

  if(error){
    console.log(error);
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Factura</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

const hoy = hoyISO();

const pedidosHoy = data.filter(p => p.fecha === hoy);

const totalHoy = pedidosHoy.reduce(
  (s,p) => s + Number(p.total || 0),
  0
);

document.getElementById("resumenDia").innerHTML = `

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

          <td>${eur(p.total || 0)}</td>
        </tr>

      `).join("")}

    </tbody>
  </table>

  <div
    style="
      margin-top:15px;
      font-size:20px;
      font-weight:bold;
      text-align:right;
    "
  >
    TOTAL DEL DÍA:
    ${eur(totalHoy)}
  </div>

`;
  data.forEach(p => {

    html += `
      <tr>
        <td>${p.numero_pedido || ""}</td>
        <td>${p.cliente_direccion || ""}</td>
        <td>${p.fecha || ""}</td>
        <td>${eur(p.total || 0)}</td>
        <td>
          ${p.requiere_factura ? "SI" : "NO"}
        </td>

        <td>

         <button onclick="reimprimirPedido(${p.id})">
          Ver
         </button>

          <button onclick="reimprimirPedido(${p.id}, true)">
            Factura
          </button>

        </td>
        
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById("historialTabla").innerHTML = html;
}
async function reimprimirPedido(id, abrirFactura = false){

  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("id", id)
    .single();

  if(error){
    console.log(error);
    alert("Error cargando pedido");
    return;
  }

  // RECUPERAR PRODUCTOS
  pedido = data.productos || [];

  // RECUPERAR CLIENTE
  document.getElementById("cliNombre").value =
    data.cliente_nombre || "";

  document.getElementById("cliDireccion").value =
    data.cliente_direccion || "";

  document.getElementById("cliTelefono").value =
    data.cliente_telefono || "";

  document.getElementById("cliCIF").value =
    data.cliente_cif || "";

  // PEDIDO
  document.getElementById("pedidoNum").value =
    data.numero_pedido || "";

  // FACTURA
  document.getElementById("facturaNum").value =
    data.numero_factura || "";

  // CHECK FACTURA
  document.getElementById("requiereFactura").checked =
    data.requiere_factura || false;

  renderPedidoTabla();

  if(abrirFactura){

    cambiarTab("factura");

    renderDocumento(true);

  } else {

    cambiarTab("hoja");

    renderDocumento(false);

  }

}
