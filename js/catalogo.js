/* ========= CATÁLOGO FIJO ========= */
let CATALOGO = [];

/* ========= CARGAR CATÁLOGO ========= */
async function cargarCatalogo() {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("nombre");

    if (error) throw error;

    CATALOGO = Array.isArray(data) ? data : [];

    // Aviso de stock bajo
    const heladosBajos = CATALOGO.filter(p =>
      p.tipo === "Helados" && Number(p.stock) < 200
    );

    if (heladosBajos.length > 0) {
      alert(
        "⚠️ STOCK BAJO DE HELADOS:\n\n" +
        heladosBajos
          .map(p => `${p.nombre}: ${p.stock} unidades`)
          .join("\n")
      );
    }

    cargarCatalogoSelect();

  } catch (err) {
    console.error("Error cargando catálogo:", err);
    alert("Error cargando productos");
  }
}

/* ========= SELECT DE PRODUCTOS ========= */
function cargarCatalogoSelect() {
  const sel = document.getElementById("selProducto");
  sel.innerHTML = "";

  const tipos = [...new Set(CATALOGO.map(p => p.tipo))]
    .sort((a, b) => a.localeCompare(b));

  tipos.forEach(tipo => {
    const og = document.createElement("optgroup");
    og.label = tipo;

    CATALOGO
      .filter(p => p.tipo === tipo)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nombre} — ${eur(p.precio)}`;
        og.appendChild(opt);
      });

    sel.appendChild(og);
  });
}

/* ========= BUSCADOR DE PRODUCTOS ========= */
document.getElementById("buscarProducto")
  .addEventListener("input", function () {

    const texto = this.value.trim().toLowerCase();
    const filtrados = CATALOGO.filter(p =>
      p.nombre.toLowerCase().includes(texto)
    );

    const sel = document.getElementById("selProducto");
    sel.style.display = filtrados.length ? "block" : "none";

    renderProductosFiltrados(filtrados);
  });

function renderProductosFiltrados(lista) {
  const sel = document.getElementById("selProducto");
  sel.innerHTML = lista.map(p =>
    `<option value="${p.id}">${p.nombre} — ${eur(p.precio)}</option>`
  ).join("");
}

/* ========= AÑADIR PRODUCTO ========= */
async function addProducto() {
  const id = document.getElementById("selProducto").value;
  const cant = parseInt(document.getElementById("selCantidad").value || "0", 10);

  if (!id || cant < 1) return;

  const prod = CATALOGO.find(p => p.id === id);
  if (!prod) return;

  // Control de stock
  if (prod.stock < cant) {
    alert("No hay suficiente stock");
    return;
  }

  // Línea existente → sumar
  const existente = pedido.find(l => l.id === id);
  if (existente) {
    existente.cantidad += cant;
  } else {
    pedido.push({ ...prod, cantidad: cant });
  }

  // Restar stock local
  prod.stock -= cant;

  // Actualizar stock en BD
  const { error } = await supabase
    .from("productos")
    .update({ stock: prod.stock })
    .eq("id", prod.id);

  if (error) {
    console.error(error);
    alert("Error actualizando stock");
    return;
  }

  renderPedidoTabla();
}

/* ========= TABLA EDITABLE ========= */
function renderPedidoTabla() {
  const cont = document.getElementById("pedidoTabla");

  if (!pedido.length) {
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

  pedido.forEach((l, idx) => {
    html += `
      <tr>
        <td>
          <select data-idx="${idx}" class="line-prod">
            ${CATALOGO.map(p =>
              `<option value="${p.id}" ${p.id === l.id ? "selected" : ""}>
                ${esc(p.nombre)} — ${eur(p.precio)}
              </option>`
            ).join("")}
          </select>
        </td>
        <td>${esc(l.tipo)}</td>
        <td class="right">${eur(l.precio)}</td>
        <td class="right">
          <input data-idx="${idx}" class="line-cant" type="number" min="1"
            value="${l.cantidad}" style="max-width:120px">
        </td>
        <td class="right">${eur(l.precio * l.cantidad)}</td>
        <td class="right">
          <button class="danger line-del" data-idx="${idx}" style="padding:7px 10px">
            Eliminar
          </button>
        </td>
      </tr>`;
  });

  html += `</tbody></table>`;
  cont.innerHTML = html;

  /* === EVENTOS === */

  // Cambiar cantidad
  cont.querySelectorAll(".line-cant").forEach(inp => {
    inp.addEventListener("input", (e) => {
      const i = Number(e.target.dataset.idx);
      const nueva = Number(e.target.value || 1);
      const anterior = pedido[i].cantidad;
      const diferencia = nueva - anterior;

      const prod = CATALOGO.find(p => p.id === pedido[i].id);

      if (prod.stock < diferencia) {
        alert("No hay suficiente stock");
        e.target.value = anterior;
        return;
      }

      prod.stock -= diferencia;
      pedido[i].cantidad = Math.max(1, nueva);

      renderPedidoTabla();
    });
  });

  // Eliminar línea
  cont.querySelectorAll(".line-del").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const i = Number(e.target.dataset.idx);
      pedido.splice(i, 1);
      renderPedidoTabla();
    });
  });

  // Cambiar producto
  cont.querySelectorAll(".line-prod").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const i = Number(e.target.dataset.idx);
      const nuevoId = e.target.value;
      const prod = CATALOGO.find(p => p.id === nuevoId);
      if (!prod) return;

      const cantidad = pedido[i].cantidad;

      // Fusionar si ya existe
      const j = pedido.findIndex((x, idx) => idx !== i && x.id === nuevoId);
      if (j >= 0) {
        pedido[j].cantidad += cantidad;
        pedido.splice(i, 1);
      } else {
        pedido[i] = { ...prod, cantidad };
      }

      renderPedidoTabla();
    });
  });
}
