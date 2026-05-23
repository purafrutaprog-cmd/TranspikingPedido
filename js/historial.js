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
          <th>Ruta</th>
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

    <tr onclick="cargarPedido(${p.id})"
        style="cursor:pointer">

      <td>${p.numero_pedido || ""}</td>

      <td>${p.cliente_direccion || ""}</td>

      <td>${p.fecha || ""}</td>

      <td>${eur(p.total || 0)}</td>

      <td>
        ${p.requiere_factura ? "SI" : "NO"}
      </td>

      <td>

        <select onclick="event.stopPropagation()"
                onchange="cambiarRuta(${p.id}, this.value)">

          <option value="Pendiente"
            ${p.ruta === "Pendiente" ? "selected" : ""}>
            Pendiente
          </option>

          <option value="Ruta 1"
            ${p.ruta === "Ruta 1" ? "selected" : ""}>
            Ruta 1
          </option>

          <option value="Ruta 2"
            ${p.ruta === "Ruta 2" ? "selected" : ""}>
            Ruta 2
          </option>

          <option value="Entregado"
            ${p.ruta === "Entregado" ? "selected" : ""}>
            Entregado
          </option>

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

async function cambiarRuta(id, ruta){

  const { error } = await supabase
    .from("pedidos")
    .update({ ruta })
    .eq("id", id);

  if(error){

    console.log(error);

    alert("Error actualizando ruta");

    return;
  }

  console.log("Ruta actualizada");

}

async function descargarRuta(ruta){

  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("ruta", ruta);

  if(error){

    console.log(error);

    alert("Error cargando ruta");

    return;
  }

  let totalRuta = 0;

  let html = `
<html>
<head>

<title>${ruta}</title>

<style>

body{
  font-family:Arial;
  padding:20px;
}

h1{
  margin-bottom:20px;
}

table{
  width:100%;
  border-collapse:collapse;
}

th, td{
  border:1px solid #ccc;
  padding:10px;
  text-align:left;
}

th{
  background:#f3f3f3;
}

.total{
  margin-top:20px;
  font-size:22px;
  font-weight:bold;
  text-align:right;
}

</style>

</head>

<body>

<h1>${ruta}</h1>

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
`;

  data.forEach(p => {

    totalRuta += Number(p.total || 0);

    html += `
<tr>

<td>
${p.numero_pedido || ""}
</td>

<td>
${p.cliente_direccion || ""}
</td>

<td>
${p.cliente_telefono || ""}
</td>

<td>
${Number(p.total || 0).toFixed(2)} €
</td>

</tr>
`;
  });

  html += `
</tbody>
</table>

<div class="total">

TOTAL RUTA:
${totalRuta.toFixed(2)} €

</div>

</body>
</html>
`;

  const ventana = window.open("", "_blank");

  ventana.document.write(html);

  ventana.document.close();

  ventana.print();

}

async function cargarPedido(id){

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

  pedidoActualId = data.id;

  pedido = data.productos || [];

  document.getElementById("cliNombre").value =
    data.cliente_nombre || "";

  document.getElementById("cliDireccion").value =
    data.cliente_direccion || "";

  document.getElementById("cliTelefono").value =
    data.cliente_telefono || "";

  document.getElementById("cliCIF").value =
    data.cliente_cif || "";

  document.getElementById("pedidoNum").value =
    data.numero_pedido || "";

  document.getElementById("facturaNum").value =
    data.numero_factura || "";

  document.getElementById("requiereFactura").checked =
    data.requiere_factura || false;

  renderPedidoTabla();

  cambiarTab("pedido");

}
