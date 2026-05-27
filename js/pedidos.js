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

/* ========= GUARDAR PEDIDO ========= */
async function guardarPedido() {
  try {
    if (!pedido.length) {
      alert("No puedes guardar un pedido vacío");
      return false;
    }

    const pedidoId = window.pedidoId || crypto.randomUUID();
    window.pedidoId = pedidoId;

    const { descuento } = descuentoHelados();

    const totalNormal = pedido.reduce(
      (s, l) => s + (l.precio * l.cantidad),
      0
    );

    const total = Math.max(0, totalNormal - descuento);

    const pedidoData = {
      pedido_id: pedidoId,
      numero_pedido: document.getElementById("pedidoNum").value,

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

      total,
      fecha:
        document.getElementById("fechaPedido").value || hoyISO(),

      productos: pedido
    };

    const { error } = await supabase
      .from("pedidos")
      .upsert([pedidoData], {
        onConflict: "pedido_id"
      });

    if (error) throw error;

    return true;

  } catch (err) {
    console.error("Error guardando pedido:", err);
    alert("Error guardando pedido");
    return false;
  }
}

async function finalizarPedido() {

  // Generar número de pedido si falta
  if (!document.getElementById("pedidoNum").value) {
    await generarNumeroPedido();
    // Mantener los productos en memoria después de guardar
    pedido = [...pedido];

  }

  // Guardar pedido solo una vez
  if (!window.pedidoGuardado) {
    await guardarPedido();
    window.pedidoGuardado = true;
  }

  // SIEMPRE mostrar hoja de pedido
  cambiarTab("hoja");
  renderDocumento(false);

  // IMPORTANTE:
  // NO cambiar automáticamente a factura.
  // La factura solo se muestra cuando el usuario la pide.
}



/* ========= NUEVO PEDIDO ========= */
function nuevoPedido() {

  window.pedidoGuardado = false;
  delete window.pedidoId;
  window.fechaPedidoActual = null;

  pedido = [];
  cliente = null;
  clienteEditando = null;

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

  generarNumeroPedido();
}
