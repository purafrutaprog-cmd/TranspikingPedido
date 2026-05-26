/* ========= CLIENTES ========= */
let CLIENTES = [];

/* ========= GUARDAR / EDITAR CLIENTE ========= */
async function addCliente() {
  const nombre = document.getElementById("cliNombre").value.trim();
  const direccion = document.getElementById("cliDireccion").value.trim();
  const codigoP = document.getElementById("cliCP").value.trim();
  const telefono = document.getElementById("cliTelefono").value.trim();
  const nif = document.getElementById("cliCIF").value.trim();

  if (!direccion) {
    alert("Escribe una dirección");
    return;
  }

  try {
    let res;

    // EDITAR
    if (clienteEditando) {
      res = await supabase
        .from("clientes")
        .update({ nombre, direccion, codigoP, telefono, nif })
        .eq("id", clienteEditando);
    } 
    // NUEVO
    else {
      res = await supabase
        .from("clientes")
        .insert([{ nombre, direccion, codigoP, telefono, nif }]);
    }

    if (res.error) throw res.error;

    await cargarClientes();
    alert("Cliente guardado");

  } catch (err) {
    console.error("Error guardando cliente:", err);
    alert("No se pudo guardar el cliente");
  }
}

/* ========= CARGAR CLIENTES ========= */
async function cargarClientes() {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("direccion");

    if (error) throw error;

    CLIENTES = Array.isArray(data) ? data : [];
    renderClientes();

  } catch (err) {
    console.error("Error cargando clientes:", err);
  }
}

/* ========= RENDER CLIENTES ========= */
function renderClientes() {
  renderClientesFiltrados(CLIENTES);
}

/* ========= BUSCADOR ========= */
document.getElementById("buscarCliente")
  .addEventListener("input", function () {
    const texto = this.value.toLowerCase().trim();

    const filtrados = CLIENTES.filter(cli =>
      (cli.direccion || "").toLowerCase().includes(texto)
    );

    renderClientesFiltrados(filtrados);
  });

/* ========= SELECCIONAR CLIENTE ========= */
document.addEventListener("change", function (e) {
  if (e.target.id !== "selCliente") return;

  const clienteId = e.target.value;
  const cli = CLIENTES.find(c => c.id == clienteId);
  if (!cli) return;

  clienteEditando = cli.id;

  document.getElementById("cliNombre").value = cli.nombre || "";
  document.getElementById("cliDireccion").value = cli.direccion || "";
  document.getElementById("cliCP").value = cli.codigoP || "";
  document.getElementById("cliTelefono").value = cli.telefono || "";
  document.getElementById("cliCIF").value = cli.nif || "";
});

/* ========= RENDER SELECT ========= */
function renderClientesFiltrados(lista) {
  const sel = document.getElementById("selCliente");
  sel.innerHTML = lista
    .map(cli => `<option value="${cli.id}">${cli.direccion}</option>`)
    .join("");
}
