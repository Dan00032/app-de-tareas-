const fecha = document.querySelector("#fecha");
const lista = document.querySelector("#lista");
const input = document.querySelector("#input");
const botonEnter = document.querySelector("#enter");

const check = "fa-check-circle";
const uncheck = "fa-circle";
const lineThrough = "line-through";

let LIST;
let id;
//-------------------------------------------------------------------------------------
// Fecha actual
const FECHA = new Date();
fecha.innerHTML = FECHA.toLocaleDateString("es-MX", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

//-------------------------------------------------------------------------------------
// Función para agregar tarea a la lista
function agregarTarea(tarea, id, realizado, eliminado) {
  if (eliminado) return;

  const REALIZADO = realizado ? check : uncheck; 
  const LINE = realizado ? lineThrough : "";      

  const elemento = `
    <li id="elemento">
      <i class="far ${REALIZADO}" data="realizado" id="${id}"></i>
      <p class="text ${LINE}">${tarea}</p> 
      <i class="fas fa-trash de" data="eliminado" id="${id}"></i>
      <i class="fas fa-pen" data="editar" id="${id}"></i>
    </li>
  `;

  lista.insertAdjacentHTML("beforeend", elemento);
}

//-------------------------------------------------------------------------------------
// Marcar tarea como realizada
function tareaRealizada(element) {
  const idTarea = element.id; 
  const idUsuario = localStorage.getItem("id_usuario"); 
  if (!idUsuario) {
 Swal.fire({
        title: "¡Usuario no encontrado!",
        text: "No se encontró un usuario en sesión.",
        icon: "success",
        confirmButtonColor: "#3085d6"
    });    return;
  } 
  element.classList.toggle(check);
  element.classList.toggle(uncheck);
  element.parentNode.querySelector(".text").classList.toggle(lineThrough);  
  const tarea = LIST.find(t => t.id == idTarea);
  if (tarea) tarea.realizado = !tarea.realizado;
  localStorage.setItem("TODO", JSON.stringify(LIST));
  // Actualizar en backend
  fetch(`https://backend-apptareas.onrender.com/tareas/${idTarea}?id_usuario=${idUsuario}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },    
    body: JSON.stringify({ hecha: tarea.realizado })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Tarea actualizada en BD:", data);
    })
    .catch(err => {
      Swal.fire({
        title: "¡Error!",
        text: "No se pudo actualizar la tarea.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    });
  }

//-------------------------------------------------------------------------------------
// Eliminar tarea
function tareaEliminada(element) {
  const idTarea = element.id; 
  const idUsuario = localStorage.getItem("id_usuario");

  if (!idUsuario) {
 Swal.fire({
        title: "¡Usuario no encontrado!",
        text: "No se encontró un usuario en sesión.",
        icon: "success",
        confirmButtonColor: "#3085d6"
    });    return;
  }
   if (textoElemento && tarea.nombre) {
    textoElemento.textContent = tarea.nombre;
  }

 fetch(`https://backend-apptareas.onrender.com/tareas/${idTarea}?id_usuario=${idUsuario}`, {
  method: "DELETE"
})

 .then(res => {
    console.log("Respuesta backend:", res.status); 
    if (!res.ok) throw new Error("Error al eliminar en la BD");
    return res.text();
})

.then(data => {
    console.log("Backend dijo:", data);
    // Eliminar tarea del DOM
    element.parentNode.parentNode.removeChild(element.parentNode);
    // Actualizar lista y localStorage
    LIST = LIST.filter(t => t.id != idTarea);
    localStorage.setItem("TODO", JSON.stringify(LIST));
    
    // Mensaje de éxito
    Swal.fire({
        title: "¡Tarea eliminada!",
        text: "La tarea se eliminó correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6"
    });
})
.catch(err => {
    console.error("Error al eliminar tarea:", err);
    // Mensaje de error
    Swal.fire({
        title: "¡Error!",
        text: "No se pudo eliminar la tarea.",
        icon: "error",
        confirmButtonColor: "#d33"
    });
});
}

function cargarLista(array) {
  array.forEach(function (item) {
    agregarTarea(item.nombre, item.id, item.realizado, item.eliminado);
  });
}
//----------------------------------------------------------------------------
// Botón agregar tarea
botonEnter.addEventListener("click", () => {
  const tarea = input.value.trim();
  if (tarea) {
    crearTarea(tarea); // <-- llama a la función que envía al backend
    input.value = "";
  }
});
// Agregar tarea al presionar Enter
document.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    const tarea = input.value.trim();
    if (tarea) {
      crearTarea(tarea); // <-- llama a la función que envía al backend
      input.value = "";
    }
  }
});

// Marcar como realizada o eliminar
lista.addEventListener("click", function (event) {
  const element = event.target;
  const elementData = element.attributes.data.value;

  if (elementData === "realizado") {
    tareaRealizada(element);
  } else if (elementData === "eliminado") {
    tareaEliminada(element);
  } else if (elementData === "editar") {   
    tareaEditar(element);
  }


  localStorage.setItem("TODO", JSON.stringify(LIST));
});
//----------------------------------------------------------------------------------------
// Cargar tareas del usuario desde backend al iniciar
const id_usuario = localStorage.getItem("id_usuario");
if (id_usuario) {
  cargarTareasUsuario(id_usuario); // carga solo las tareas del usuario actual
} else {
  LIST = [];
  id = 0;
}
//----------------------------------------------------------------------------------------
// Función para crear tarea y enviarla al backend
function crearTarea(tema) {
  const id_usuario = localStorage.getItem("id_usuario");
  if (!id_usuario) {
 Swal.fire({
        title: "¡Usuario no encontrado!",
        text: "No se encontró un usuario en sesión.",
        icon: "success",
        confirmButtonColor: "#3085d6"
    });    return;
  }

  // Crea tarea
  const tarea = {
    tema: tema,
    hecha: false,
    id_usuario: id_usuario
  };

  // Guardar en backend y asociar al usuario
  fetch("https://backend-apptareas.onrender.com/tareas_con_usuario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(tarea)
})

    .then(res => res.json())
.then(data => {
  if (data.error) {
    console.error("Error al guardar en BD:", data.error);
    Swal.fire({
      title: "¡Error!",
      text: "Error al guardar la tarea en la base de datos.",
      icon: "error",
      confirmButtonColor: "#d33"
    });
    return;
  }
  if (!LIST) LIST = [];
  if (typeof id !== 'number') id = 0;
  LIST.push({
  id: data.tarea.id_tarea,
  nombre: data.tarea.tema,  
  realizado: data.tarea.hecha,
  eliminado: false
});
  id++;
  localStorage.setItem("TODO", JSON.stringify(LIST));

  agregarTarea(data.tarea.tema, data.tarea.id_tarea, data.tarea.hecha, false);
  console.log("Tarea creada y asociada al usuario:", data);

  Swal.fire({
    title: "¡Tarea guardada!",
    text: "La tarea se guardó correctamente en la base de datos.",
    icon: "success",
    confirmButtonColor: "#3085d6"
  });
})
.catch(err => {
  console.error("Error en la petición:", err);
  Swal.fire({
    title: "¡Error!",
    text: "No se pudo conectar con el servidor.",
    icon: "error",
    confirmButtonColor: "#d33"
  });
});
}
//-----------------------------------------------------------------------------------------
// Eliminar cuenta

document.addEventListener("DOMContentLoaded", () => {
  const btnEliminar = document.querySelector(".boton");

  btnEliminar.addEventListener("click", async () => {
    const idUsuario = localStorage.getItem("id_usuario");
    if (!idUsuario) {
      Swal.fire({
        title: "¡Error!",
        text: "No se encontró un usuario en sesión.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
      return;
    }

    Swal.fire({
      title: "⚠️ ¿Estás seguro?",
      text: "Se eliminará tu cuenta y todos tus datos. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const respuesta = await fetch(`https://backend-apptareas.onrender.com/eliminar/usuario/${idUsuario}`, {
          method: "DELETE",
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
          Swal.fire({
            title: "¡Cuenta eliminada!",
            text: resultado.mensaje,
            icon: "success",
            confirmButtonColor: "#3085d6"
          }).then(() => {
            localStorage.clear();
            window.location.href = "inicio.html";
          });
        } else {
          Swal.fire({
            title: "¡Error!",
            text: resultado.error,
            icon: "error",
            confirmButtonColor: "#d33"
          });
        }
      } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        Swal.fire({
          title: "¡Error!",
          text: "Error al conectar con el servidor.",
          icon: "error",
          confirmButtonColor: "#d33"
        });
      }
    });
  });
});

//--------------------------------------------------------------------------------------------
// Cerrar sesión
const btnLogout = document.getElementById("logout");
btnLogout.addEventListener("click", () => {
  window.location.href = "inicio.html";
});
//--------------------------------------------------------------------------------------------
// Actualizar datos
const btnActualizar = document.querySelector(".boton2");
btnActualizar.addEventListener("click", () => {
  window.location.href = "Actualizar.html";
});
//--------------------------------------------------------------------------------------------
// Función para cargar tareas del usuario desde backend
function cargarTareasUsuario(id_usuario) {
  localStorage.removeItem("TODO");
  LIST = [];
  id = 0;

  fetch(`https://backend-apptareas.onrender.com/usuario-con-tareas`)
    .then(res => res.json())
    .then(data => {
      const tareasUsuario = data.find(u => u.id_usuario == id_usuario)?.tareas || [];
      LIST = tareasUsuario.map(t => ({
        nombre: t.tema,
        id: t.id_tarea,
        realizado: t.hecha,
        eliminado: false
      }));
      id = LIST.length;
      cargarLista(LIST);
      localStorage.setItem("TODO", JSON.stringify(LIST));
    })
    .catch(err => console.error("Error al cargar tareas del usuario:", err));
}
//-------------------------------------------------------------------------------------
// Función para editar tarea
function tareaEditar(element) {
  const idTarea = element.id;
  const idUsuario = localStorage.getItem("id_usuario");

  if (!idUsuario) {
    alert("No se encontró un usuario en sesión.");
    return;
  }

  const textoTarea = element.parentNode.querySelector(".text");

  const inputEdicion = document.createElement("input");
  inputEdicion.type = "text";
  inputEdicion.value = textoTarea.innerText;
  inputEdicion.classList.add("input-editar");

  textoTarea.replaceWith(inputEdicion);
  inputEdicion.focus();

  const guardarCambios = () => {
    const nuevoTexto = inputEdicion.value.trim();
    if (!nuevoTexto) {
      alert("El texto no puede estar vacío.");
      return;
    }

    const tarea = LIST.find(t => t.id == idTarea);
    if (tarea) tarea.nombre = nuevoTexto;

    localStorage.setItem("TODO", JSON.stringify(LIST));

    fetch(`https://backend-apptareas.onrender.com/tareas/${idTarea}?id_usuario=${idUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema: nuevoTexto })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Tarea editada en BD:", data);

      const nuevoP = document.createElement("p");
      nuevoP.className = "text";
      nuevoP.innerText = nuevoTexto;
      inputEdicion.replaceWith(nuevoP);
    })
    .catch(err => {
      console.error("Error al editar tarea en BD:", err);
      alert("No se pudo editar la tarea");
    });
  };

  inputEdicion.addEventListener("blur", guardarCambios);
  inputEdicion.addEventListener("keyup", (e) => {
    if (e.key === "Enter") guardarCambios();
  });
}

