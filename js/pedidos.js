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
    // 1. Obtener la última factura
    const { data, error } = await supabase
      .from("pedidos")
      .select("numero_factura")
      .not("numero_factura", "is", null)
      .order("numero_factura", { ascending: false })
      .limit(1);

    if (error) throw error;

    let nuevoNumero;

    if (!data || data.length === 0) {
      // Primera factura del año
      const año = new Date().getFullYear();
      nuevoNumero = `F-${año}-0001`;
    } else {
      // Extraer número y sumar 1
      const ultimo = data[0].numero_factura;
      const partes = ultimo.split("-");
      const num = parseInt(partes[2]) + 1;
      nuevoNumero = `${partes[0]}-${partes[1]}-${String(num).padStart(4, "0")}`;
    }

    // 2. Colocar el número en el input
    document.getElementById("facturaNum").value = nuevoNumero;

    return nuevoNumero;

  } catch (err) {
    console.error("Error generando número de factura:", err);
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

    const requiereFactura =
      document.getElementById("requiereFactura").checked;

    const iva = requiereFactura ? total * 0.10 : 0;

    const totalFinal = Number((total + iva).toFixed(2));

    const pedidoData = {
      numero_pedido: document.getElementById("pedidoNum").value,
      requiere_factura: requiereFactura,
      numero_factura: document.getElementById("facturaNum").value || null,
      cliente_nombre: document.getElementById("cliNombre").value || "",
      cliente_direccion: document.getElementById("cliDireccion").value || "",
      cliente_telefono: document.getElementById("cliTelefono").value || "",
      cliente_cif: document.getElementById("cliCIF").value || "",
      total,
      total_final: totalFinal,
      fecha: hoyISO(),
      productos: pedido,
      vendedor: document.getElementById("vendedor").value || null
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

  const requiereFactura = document.getElementById("requiereFactura").checked;
  const facturaSimplificada = document.getElementById("facturaSimplificada").checked;

  // Generar número de factura si corresponde
  if (requiereFactura || facturaSimplificada) {
    await generarNumeroFactura();
  }

  // Guardar pedido
  await guardarPedido();

  // Mostrar hoja o factura
  cambiarTab("hoja");
  renderDocumento(false);
}


/* ========= NUEVO PEDIDO ========= */
function nuevoPedido() {

  window.guardandoPedido = false;

  pedido = [];
  cliente = null;
  clienteEditando = null;

  delete window.pedidoId;
  window.fechaPedidoActual = hoyISO();

  // Reset campos cliente
  ["cliNombre", "cliTelefono", "cliDireccion", "cliCP", "cliCIF", "cliObs"]
    .forEach(id => document.getElementById(id).value = "");

  // Reset pedido
  document.getElementById("pedidoNum").value = "";
  document.getElementById("facturaNum").value = "";
  document.getElementById("selCantidad").value = 1;
  document.getElementById("requiereFactura").checked = false;

  pedidoActualId = null;

  renderPedidoTabla();
  cambiarTab("pedido");
}


