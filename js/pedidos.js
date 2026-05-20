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

    fecha:
  document.getElementById("fechaPedido").value
  || hoyISO(),

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
  
  document.getElementById("pedidoNum").value = "";
  document.getElementById("facturaNum").value = ""; 
  
  document.getElementById("selCantidad").value = 1;
  
  renderPedidoTabla();
  
  cambiarTab("pedido"); 
  
  generarNumeroPedido();
}




