/* ========= ESTADO ========= */
let pedido = []; // líneas: {id,tipo,nombre,precio,cantidad}
let cliente = null;
let clienteEditando = null;

/* ========= AÑADIR PRODUCTO (SUMA SI EXISTE) ========= */
function addProducto(){
  const id = document.getElementById("selProducto").value;
  const cant = parseInt(document.getElementById("selCantidad").value || "0", 10);
  if(!id || !cant || cant < 1) return;

  const prod = CATALOGO.find(p=>p.id===id);
  if(!prod) return;

// ✅ CONTROL DE STOCK
if(false){
  alert("No hay suficiente stock");
  return;
}
	
  const existente = pedido.find(l=>l.id===id);
  if(existente){
    existente.cantidad += cant;
  } else {
    pedido.push({...prod, cantidad:cant});
  }
// ✅ RESTAR STOCK
  prod.stock -= cant;
supabase
  .from("productos")
  .update({ stock: prod.stock })
  .eq("id", prod.id);

localStorage.setItem("catalogo", JSON.stringify(CATALOGO));	
	
  renderPedidoTabla();
}

/* ========= TABLA EDITABLE ========= */
function renderPedidoTabla(){
  const cont = document.getElementById("pedidoTabla");
  if(!pedido.length){
    cont.innerHTML = `<div class="muted">Aún no hay productos añadidos.</div>`;
    return;
  }

  let html = `<table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Tipo</th>
        <th class="right">Precio</th>
        <th class="right">Cantidad</th>
        <th class="right">Importe</th>
        <th class="right">Acción</th>
      </tr>
    </thead><tbody>`;

  pedido.forEach((l, idx)=>{
    html += `<tr>
      <td>
        <select data-idx="${idx}" class="line-prod">
          ${CATALOGO.map(p=>`<option value="${p.id}" ${p.id===l.id?'selected':''}>${esc(p.nombre)} — ${eur(p.precio)}</option>`).join("")}
        </select>
      </td>
      <td>${esc(l.tipo)}</td>
      <td class="right">${eur(l.precio)}</td>
      <td class="right"><input data-idx="${idx}" class="line-cant" type="number" min="1" value="${l.cantidad}" style="max-width:120px"></td>
      <td class="right">${eur(l.precio*l.cantidad)}</td>
      <td class="right"><button class="danger line-del" data-idx="${idx}" style="padding:7px 10px">Eliminar</button></td>
    </tr>`;
  });

  html += `</tbody></table>`;
  cont.innerHTML = html;

  // eventos cantidad
  cont.querySelectorAll(".line-cant").forEach(inp=>{
    inp.addEventListener("input", (e)=>{
      const i = parseInt(e.target.dataset.idx,10);
      const v = parseInt(e.target.value||"1",10);
		const diferencia = v - pedido[i].cantidad;

const prod = CATALOGO.find(p => p.id === pedido[i].id);

if(prod.stock < diferencia){
  alert("No hay suficiente stock");
  e.target.value = pedido[i].cantidad;
  return;
}

prod.stock -= diferencia;
      pedido[i].cantidad = Math.max(1, isNaN(v)?1:v);
      renderPedidoTabla();
    });
  });

  // eventos eliminar
  cont.querySelectorAll(".line-del").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      const i = parseInt(e.target.dataset.idx,10);
      pedido.splice(i,1);
      renderPedidoTabla();
    });
  });

  // eventos cambiar producto (y fusionar si ya existe)
  cont.querySelectorAll(".line-prod").forEach(sel=>{
    sel.addEventListener("change",(e)=>{
      const i = parseInt(e.target.dataset.idx,10);
      const nuevoId = e.target.value;
      const prod = CATALOGO.find(p=>p.id===nuevoId);
      if(!prod) return;

      const cantidad = pedido[i].cantidad;
      // si ya hay otra línea con ese producto, fusionar
      const j = pedido.findIndex((x, idx)=> idx!==i && x.id===nuevoId);
      if(j >= 0){
        pedido[j].cantidad += cantidad;
        pedido.splice(i,1);
      } else {
        pedido[i] = {...prod, cantidad};
      }
      renderPedidoTabla();
    });
  });
}

/* ========= DOCUMENTOS ========= */
async function generarNumeroPedido() {

  // Obtener contador actual
  const { data, error } = await supabase
    .from("contador_pedidos")
    .select("ultimo_numero")
    .eq("id", 1)
    .single();

  if(error){
    console.log(error);
    alert("Error obteniendo contador");
    return null;
  }

  // siguiente número
  const siguiente = Number(data.ultimo_numero || 0) + 1;

  // guardar inmediatamente
  const { error:updateError } = await supabase
    .from("contador_pedidos")
    .update({
      ultimo_numero: siguiente
    })
    .eq("id", 1);

  if(updateError){
    console.log(updateError);
    alert("Error actualizando contador");
    return null;
  }

  // generar número visible
  const año = new Date().getFullYear();

  const numeroPedido =
    `P-${año}-${String(siguiente).padStart(4,"0")}`;

  // ponerlo en pantalla
  document.getElementById("pedidoNum").value =
    numeroPedido;

  return numeroPedido;
}
async function guardarPedido(){

  const total = pedido.reduce(
    (s,l)=> s + (l.precio * l.cantidad),
    0
  );

  const pedidoData = {

    numero_pedido:
      document.getElementById("pedidoNum").value,

requiere_factura:
  document.getElementById("requiereFactura").checked,

numero_factura:
  document.getElementById("requiereFactura").checked
    ? document.getElementById("facturaNum").value
    : null,

    cliente_nombre:
      document.getElementById("cliNombre").value || "",

    cliente_direccion:
      document.getElementById("cliDireccion").value || "",

    cliente_telefono:
      document.getElementById("cliTelefono").value || "",

    cliente_cif:
      document.getElementById("cliCIF").value || "",

    total: total,

    productos: pedido

  };

  console.log(pedidoData);

  const { error } = await supabase
    .from("pedidos")
    .insert([pedidoData]);

  if(error){

    console.log(error);

    alert(error.message);

    return false;
  }

  return true;
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

/* ========= NUEVO PEDIDO ========= */
function nuevoPedido(){
  window.pedidoGuardado = false;
  pedido = [];
  cliente = null;
  clienteEditando = null;
  document.getElementById("cliNombre").value = "";
  document.getElementById("cliTelefono").value = "";
  document.getElementById("cliDireccion").value = "";
  document.getElementById("cliCP").value = "";
  document.getElementById("cliCIF").value = "";
  document.getElementById("cliObs").value = "";
  document.getElementById("selCantidad").value = 1;
  renderPedidoTabla();
  cambiarTab("pedido");
}




