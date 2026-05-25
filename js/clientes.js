/* ========= CLIENTES ========= */
let CLIENTES = [];
	
/* ========= CLIENTE ========= */

async function addCliente(){

  const nombre = document.getElementById("cliNombre").value.trim();
  const direccion = document.getElementById("cliDireccion").value.trim();
  const codigoP = document.getElementById("cliCP").value.trim();
  const telefono = document.getElementById("cliTelefono").value.trim();
  const nif = document.getElementById("cliCIF").value.trim();

  if(!direccion){
    alert("Escribe una direccion");
    return;
  }

  let error;

  // EDITAR
  if(clienteEditando){

    const res = await supabase
      .from("clientes")
      .update({
        nombre,
        direccion,
        codigoP,
        telefono,
        nif
      })
      .eq("id", clienteEditando);

    error = res.error;

  } else {

    // NUEVO
    const res = await supabase
      .from("clientes")
      .insert([
        {
          nombre,
          direccion,
          codigoP,
          telefono,
          nif
        }
      ]);

    error = res.error;
  }

  if(error){
    console.log(error);
    alert(error.message);
    return;
  }

  await cargarClientes();

  alert("Cliente guardado");
}
	

	
async function cargarClientes(){

  const { data, error } = await supabase
    .from("clientes")
    .select("*");

  if(error){
    console.log(error);
    return;
  }

  CLIENTES = data;

  renderClientes();
}
/* ========= RENDER CLIENTES ========= */
function renderClientes(){

  renderClientesFiltrados(CLIENTES);

}
	document
  .getElementById("buscarCliente")
  .addEventListener("input", function(){

    const texto = this.value.toLowerCase();

    const filtrados = CLIENTES.filter(cli =>
      (cli.direccion || "")
      .toLowerCase()
      .includes(texto)
    );

    renderClientesFiltrados(filtrados);
});
	document.addEventListener("change", function(e){

  if(e.target.id === "selCliente"){

    const clienteId = e.target.value;

    const cli = CLIENTES.find(c => c.id == clienteId);
	  clienteEditando = cli.id;

    if(!cli) return;

    document.getElementById("cliNombre").value = cli.nombre || "";
    document.getElementById("cliDireccion").value = cli.direccion || "";
    document.getElementById("cliCP").value = cli.codigoP || "";
    document.getElementById("cliTelefono").value = cli.telefono || "";
    document.getElementById("cliCIF").value = cli.nif || "";

  }

});

	function renderClientesFiltrados(lista){

  const sel = document.getElementById("selCliente");

  sel.innerHTML = "";

  lista.forEach(cli => {

    sel.innerHTML += `
      <option value="${cli.id}">
        ${cli.direccion}
      </option>
    `;
  });
}


