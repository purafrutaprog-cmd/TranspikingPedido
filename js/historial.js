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
        </tr>
      </thead>
      <tbody>
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
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  document.getElementById("historialTabla").innerHTML = html;
}
