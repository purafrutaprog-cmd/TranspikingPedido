/* ========= ESTADO ========= */
let pedido = [];
let pedidoActualId = null;

/* ========= DESCUENTO HELADOS ========= */
function descuentoHelados() {
  const helados = pedido.filter(l =>
    String(l.tipo || "").toLowerCase() === "helados"
  );

  const totalQty = helados.reduce((s, l) => s + Number(l.cantidad || 0), 0);

  if (totalQty < HELADOS_UMBRAL)
    return { aplica: false, totalQty, descuento: 0 };

  let descuento = 0;

  for (const l of helados) {
    const diff = Number(l.precio) - HELADOS_PRECIO_PROMO;
    if (diff > 0) descuento += diff * Number(l.cantidad || 0);
  }

  return { aplica: true, totalQty, descuento };
}

/* ========= GENERAR NÚMERO DE PEDIDO ========= */
async function generarNumeroPedido() {
  try {
    const { data, error } = await supabase
      .from("contador_pedidos")
      .select("ultimo_numero")
      .eq("id", 1)
      .single();

    if (error) throw error;

    const siguiente = Number(data.ultimo_numero || 0) + 1;

    const { error: updateError } = await supabase
      .from("contador_pedidos")
      .update({ ultimo_numero: siguiente })
      .eq("id", 1);

    if (updateError) throw updateError;

    const año = new Date().getFullYear();
    const numeroPedido = `P-${año}-${String(siguiente).padStart(4, "0")}`;

    document.getElementById("pedidoNum").value = numeroPedido;

    return numeroPedido;

  } catch (err) {
    console.error("Error generando número de pedido:", err);
    alert("Error generando número de pedido");
    return null;
  }
}

async function generarNumeroFactura() {

  try {

    const { data, error } = await supabase
      .from("contador_facturas")
      .select("ultimo_numero")
      .eq("id", 1);

    if (error) throw error;


    let ultimo = 0;


    if (data && data.length > 0) {
      ultimo = Number(data[0].ultimo_numero || 0);
    }


    const siguiente = ultimo + 1;


    const { error:updateError } = await supabase
      .from("contador_facturas")
      .upsert({
        id:1,
        ultimo_numero:siguiente
      });


    if(updateError) throw updateError;


    const año = new Date().getFullYear();

    const numeroFactura =
      `F-${año}-${String(siguiente).padStart(4,"0")}`;


    document.getElementById("facturaNum").value =
      numeroFactura;


    return numeroFactura;


  } catch(e){

    console.error("Error generando factura:", e);
    alert("Error generando número de factura");

    return null;
  }
}
/* ========= GUARDAR PEDIDO ========= */
async function guardarPedido() {
  try {
    if (window.guardandoPedido) return false;
    window.guardandoPedido = true;

    if (!pedido.length) {
      alert("No puedes guardar un pedido vacío");
      window.guardandoPedido = false;
      return false;
    }

    const { descuento } = descuentoHelados();

    const totalNormal = pedido.reduce(
      (s, l) => s + (l.precio * l.cantidad),
      0
    );

    const total = Math.max(0, totalNormal - descuento);

   const requiereFactura = true;

    const totalFinal = total;

    const pedidoData = {
      numero_pedido: document.getElementById("pedidoNum").value,
      requiere_factura: requiereFactura,
      numero_factura: document.getElementById("facturaNum").value,
      cliente_nombre: document.getElementById("cliNombre").value || "",
      cliente_direccion: document.getElementById("cliDireccion").value || "",
      cliente_cp: document.getElementById("cliCP").value || "",
      cliente_telefono: document.getElementById("cliTelefono").value || "",
      cliente_cif: document.getElementById("cliCIF").value || "",
      total,
      total_final: totalFinal,
      fecha: hoyISO(),
      productos: pedido,
      vendedor: document.getElementById("vendedor")?.value || null,
      observaciones: document.getElementById("observaciones")?.value || ""
    };

    let error;

    if (pedidoActualId) {

      const res = await supabase
        .from("pedidos")
        .update(pedidoData)
        .eq("id", pedidoActualId);

      error = res.error;

    } else {

      const res = await supabase
        .from("pedidos")
        .insert([pedidoData])
        .select("id")
        .single();

      error = res.error;

      if (!error) {
        pedidoActualId = res.data.id; // ← GUARDAR ID REAL
      }
    }

    if (error) throw error;

    window.guardandoPedido = false;
    return true;

  } catch (err) {
    console.error("Error guardando pedido:", err);
    alert("Error guardando pedido");
    window.guardandoPedido = false;
    return false;
  }
}

/* ========= FINALIZAR PEDIDO ========= */
async function finalizarPedido() {

  // Generar número de pedido si falta
  if (!document.getElementById("pedidoNum").value) {
    await generarNumeroPedido();
  }

  const requiereFactura = true;

  // Generar número de factura si corresponde
 if (requiereFactura || facturaSimplificada) {

  if(!document.getElementById("facturaNum").value){
      await generarNumeroFactura();
  }

}
  // Guardar pedido
  await guardarPedido();

  // Mostrar hoja o factura
cambiarTab("factura");
renderDocumento(true);
}


/* ========= NUEVO PEDIDO ========= */
function nuevoPedido() {

  window.guardandoPedido = false;

  pedido = [];
  cliente = null;
  clienteEditando = null;

  pedidoActualId = null;

  window.fechaPedidoActual = hoyISO();
  window.vendedorActual = "";

  // Limpiar campos seguros
  [
    "cliNombre",
    "cliTelefono",
    "cliDireccion",
    "cliCP",
    "cliCIF",
    "cliObs",
    "observaciones",
    "pedidoNum",
    "facturaNum"
  ].forEach(id => {

    const el = document.getElementById(id);

    if (el) {
      el.value = "";
    }

  });


  // Nuevo número automático
  generarNumeroPedido();


  // Factura siempre activa
  generarNumeroFactura();


  renderPedidoTabla();

  cambiarTab("pedido");
}


