//INICIALIZAR VARIABLES DE BUSQUEDA
const inputSearchTit = document.querySelector("#ingresoTitulo");
const btnSearchTit = document.querySelector("#btnSearch1");
const listaCategorias = document.querySelector("#categorias");
const btnSearchCat = document.querySelector("#btnSearch2");
const inputPrecioMin = document.querySelector("#ingresoPrecioMin");
const inputPrecioMax = document.querySelector("#ingresoPrecioMax");
const btnSearchPrecios = document.querySelector("#btnSearch3");

//INICIALIZAR VARIABLES DEL CARRITO
let carritoVisible = false;
const carritoDeLibros = JSON.parse(localStorage.getItem("carrito")) || [];
const btnMostrarCarrito = document.querySelector("#btn-mostrar-carrito");
const carritoContenedor = document.querySelector(".carrito-contenedor");
const btnClose = document.querySelector(".btn-close");
const carritoContenido = document.querySelector("#carrito-contenido");
const btnComprar = document.querySelector("#btn-comprar");
const inputTitular = document.querySelector("#titular");
const inputCardNumber = document.querySelector("#card-number");
const inputCcv = document.querySelector("#ccv");

//CONTENEDOR PARA EXPONER TARJETAS
const contenedor = document.querySelector("#contenedor");

//LIBROS
const categoriaDeLibros = [
  "ficción latinoamericana",
  "no ficción",
  "poesía",
  "narrativa contemporánea",
  "narrativa argentina",
];

/* CONSTRUCTORES */

function Libro(codigo, titulo, autor, editorial, genero, precio, stock, img) {
  this.codigo = String(codigo);
  this.titulo = titulo;
  this.autor = autor;
  this.editorial = editorial;
  this.genero = genero;
  this.precio = precio;
  this.stock = stock;
  this.img = img;
}

function carritoItem(codigo, titulo, precio, img) {
  this.codigo = String(codigo);
  this.titulo = titulo;
  this.precio = precio;
  this.img = img;
  this.cantidad = 1;
  this.subtot = this.precio;
}

/* FUNCIONES DE BUSQUEDA Y FILTRADO */

function buscarPorTitulo(arr, filtro) {
  const libroEncontrado = arr.find((el) => el.titulo.includes(filtro));
  return libroEncontrado;
}

function filtrarPorTitulo(arr, filtro) {
  const libroEncontrado = arr.filter((el) => el.titulo.includes(filtro));
  return libroEncontrado;
}

function filtrarPorPrecio(arr, masBajo, masAlto) {
  const libroFiltrado = arr.filter(
    (el) => el.precio >= masBajo && el.precio <= masAlto
  );
  return libroFiltrado;
}

function filtrarPorGenero(arr, filtro) {
  return arr.filter((el) => el.genero == filtro);
}

function calcularTotal(arr) {
  return arr.reduce((acc, el) => {
    return (acc = acc + el.subtot);
  }, 0);
}

fetch("./db/db.json")
  .then((res) => res.json())
  .then((data) => {
    const { arrayDeLibros } = data;
    crearHtml(arrayDeLibros);

    // FUNCION PARA EXPONER TARJETAS ENCONTRADAS
    function crearHtml(arr) {
      //verifico si la búsqueda arrojó algún resultado
      arr.length === 0 &&
        Swal.fire({
          title: "No hay productos que cumplan con sus requerimientos",
          icon: "warning",
        });
      //llamo al elemento contenedor
      contenedor.innerHTML = "";
      //creo una variable con un estructura html
      let html;
      //construyo tarjetas para cada libro
      for (const el of arr) {
        const { img, titulo, precio, codigo } = el;
        html = `<div class = card>
      <img src=" ./img/${img}" alt="${titulo}">
      <div>      
        <p> $${precio} </p>
      </div>  
      <button class="producto-agregar btn" id=${codigo}>Agregar</button>
      </div>`;

        //se la agrego al contenedor
        contenedor.innerHTML += html;
      }
      const botonesAgregar = document.querySelectorAll(".producto-agregar");
      botonesAgregar.forEach((boton) =>
        boton.addEventListener("click", agregarAlCarrito)
      );
    }

    //EVENTOS DE BUSQUEDA

    // 1 - Filtra por palabra en título

    btnSearchTit.addEventListener("click", () => {
      const encontrado = filtrarPorTitulo(arrayDeLibros, inputSearchTit.value);
      crearHtml(encontrado);
    });

    // 2 - Filtra por categoría

    categoriaDeLibros.forEach((categoria) => {
      let option = document.createElement("option");
      option.value = categoria;
      option.innerText = categoria;
      listaCategorias.append(option);
    });

    btnSearchCat.addEventListener("click", () => {
      const categoriaActual =
        listaCategorias.options[listaCategorias.selectedIndex].value;
      const encontrado = filtrarPorGenero(arrayDeLibros, categoriaActual);
      crearHtml(encontrado);
    });

    // 3 - Filtra por rango de precios

    btnSearchPrecios.addEventListener("click", () => {
      const encontrado = filtrarPorPrecio(
        arrayDeLibros,
        inputPrecioMin.value,
        inputPrecioMax.value
      );
      crearHtml(encontrado);
    });

    //función para agregar un libro al carrito y actualizar información en LS y en pantalla
    function agregarAlCarrito(e) {
      const idBoton = e.currentTarget.id; //recupera el id del libro del id del botón
      const itemEnCarrito = carritoDeLibros.find(
        //check si el libro está en el carrito
        (item) => item.codigo == idBoton
      );
      if (itemEnCarrito != undefined) {
        //si es un libro que ya estaba en el carrito se actualiza cantidad
        Toastify({
          text: `${itemEnCarrito.titulo} ha sido agregado a su carrito`,
          duration: 3000,
          gravity: "bottom", // `top` or `bottom`
          position: "right", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "#3f0d12",
          },
        }).showToast();
        itemEnCarrito.cantidad++;
        itemEnCarrito.subtot += itemEnCarrito.precio;
      } else {
        const libroNuevo = arrayDeLibros.find(
          //si no estaba en el carrito lo busca en la base
          (libro) => libro.codigo == idBoton
        );
        Toastify({
          text: `${libroNuevo.titulo} ha sido agregado a su carrito`,
          duration: 3000,
          gravity: "bottom", // `top` or `bottom`
          position: "right", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "#3f0d12",
          },
        }).showToast();
        itemNuevo = new carritoItem(
          libroNuevo.codigo,
          libroNuevo.titulo,
          libroNuevo.precio,
          libroNuevo.img
        );
        carritoDeLibros.push(itemNuevo);
      }
      localStorage.setItem("carrito", JSON.stringify(carritoDeLibros)); //actualiza el carrito guardado
      if (carritoVisible) {
        mostrarInformacionCarrito(); //actualiza la información del carrito cada vez que se agrega
      }
    }

    //MOSTRAR CARRITO

    btnMostrarCarrito.addEventListener("click", () => {
      carritoVisible = true; //fue inicializada como false
      carritoContenedor.classList.remove("oculto");
      mostrarInformacionCarrito();
      it;
    });

    //OCULTAR CARRITO

    btnClose.addEventListener("click", () => {
      carritoContenedor.classList.add("oculto");
    });

    //función para desplegar la información del carrito
    function mostrarInformacionCarrito() {
      carritoContenido.innerHTML = "";
      //si no hay items en el carrito:
      if (carritoDeLibros.length == 0) {
        const p = document.createElement("p");
        p.innerText = "El carrito está vacío";
        carritoContenido.append(p);
        return;
      }
      //si hay items en el carrito:
      for (const item of carritoDeLibros) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td><img src="./img/${item.img}" class = "small" ></td>     
        <td>${item.titulo}</td>
        <td > <div class = "celda-cantidad">  <button id = ${item.codigo}  class = "bajar-cantidad"> - </button> ${item.cantidad}  <button id = ${item.codigo}  class = "subir-cantidad"> + </button> </div> </td>
        <td>$${item.subtot}</td>
        <td><button id = ${item.codigo}  class = "producto-eliminar">-</button></td>`;
        carritoContenido.append(tr);
      }

      //botones para eliminar filas del carrito
      const botonesEliminar = document.querySelectorAll(".producto-eliminar");
      botonesEliminar.forEach((boton) =>
        boton.addEventListener("click", eliminarDelCarrito)
      );

      function eliminarDelCarrito(e) {
        const idBoton = e.currentTarget.id;
        const itemABorrar = carritoDeLibros.find(
          (item) => item.codigo == idBoton
        );
        const indiceObjABorrar = carritoDeLibros.findIndex(
          (obj) => obj.codigo === itemABorrar.codigo
        );
        carritoDeLibros.splice(indiceObjABorrar, 1);
        mostrarInformacionCarrito();
        Toastify({
          text: `${itemABorrar.titulo} ha sido eliminado`,
          duration: 3000,
          gravity: "bottom", // `top` or `bottom`
          position: "right", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "#3f0d12",
          },
          // onClick: function () {}, // Callback after click
        }).showToast();

        localStorage.setItem("carrito", JSON.stringify(carritoDeLibros));
      }

      //botones para bajar / subir cantidad de un producto
      const botonesBajarCantidad = document.querySelectorAll(".bajar-cantidad");
      botonesBajarCantidad.forEach((boton) =>
        boton.addEventListener("click", bajarCantidad)
      );

      const botonesSubirCantidad = document.querySelectorAll(".subir-cantidad");
      botonesSubirCantidad.forEach((boton) =>
        boton.addEventListener("click", subirCantidad)
      );

      function subirCantidad(e) {
        const idBoton = e.currentTarget.id;
        const itemAModificar = carritoDeLibros.find(
          (item) => item.codigo == idBoton
        );
        itemAModificar.cantidad++;
        itemAModificar.subtot += itemAModificar.precio;

        mostrarInformacionCarrito();

        localStorage.setItem("carrito", JSON.stringify(carritoDeLibros));
      }

      function bajarCantidad(e) {
        const idBoton = e.currentTarget.id;
        const itemAModificar = carritoDeLibros.find(
          (item) => item.codigo == idBoton
        );
        if (itemAModificar.cantidad >= 1) {
          itemAModificar.cantidad--;
          itemAModificar.subtot -= itemAModificar.precio;
        }

        mostrarInformacionCarrito();

        localStorage.setItem("carrito", JSON.stringify(carritoDeLibros));
      }

      //le agrego una fila con el total de la compra
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan = "3">Total a pagar</td>             
            <td colspan =2>$${calcularTotal(carritoDeLibros)}</td>`;
      carritoContenido.append(tr);

      //fila con botón para vaciar el carrito
      const filaVaciarCarrito = document.createElement("tr");
      filaVaciarCarrito.innerHTML = `<td colspan = "5"> <button class="btn btn-success" id="btn-vaciar">   Vaciar
      </button> </td>`;
      carritoContenido.append(filaVaciarCarrito);

      const botonVaciar = document.querySelector("#btn-vaciar");
      botonVaciar.addEventListener("click", () => {
        Swal.fire({
          title: "¿Quiere vaciar el carrito?",
          text: "Toda la información guardada se perderá",
          icon: "warning",
          showDenyButton: true,
          confirmButtonText: "Vaciar",
          denyButtonText: `No vaciar`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            vaciarCarrito();
            Swal.fire("El carrito ha sido vaciado", "", "success");
          } else if (result.isDenied) {
            Swal.fire("El carrito sigue guardado", "", "info");
          }
        });
      });
    }

    function vaciarCarrito() {
      carritoDeLibros.splice(0, carritoDeLibros.length);
      localStorage.removeItem("carrito");
      mostrarInformacionCarrito(); //actualizar el carrito si está desplegado
    }

    //PAGAR CON TARJETA DE CREDITO

    function validarCreditCard() {
      let validInput =
        inputTitular.value.length > 0 &&
        inputCardNumber.value.length > 0 &&
        inputCcv.value.length > 0;
      return validInput;
    }

    btnComprar.addEventListener("click", () => {
      if (!validarCreditCard()) {
        Swal.fire({
          title: "Atención",
          text: "Debe completar los datos de su tarjeta",
          icon: "warning",
        });
        return;
      }
      const total = calcularTotal(carritoDeLibros);
      Swal.fire({
        title: "¿Quiere realizar la compra?",
        text: "Se debitará de su cuenta la suma de: $" + `${total}`,
        icon: "warning",
        showDenyButton: true,
        confirmButtonText: "Pagar",
        denyButtonText: `Cancelar`,
      }).then((result) => {
        if (result.isConfirmed) {
          vaciarCarrito();
          Swal.fire("Su compra ha sido realizada exitosamente", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Su compra ha sido cancelada", "", "info");
        }
      });
    });
    new Cleave("#card-number", {
      creditCard: true,
      onCreditCardTypeChanged: function (type) {
        console.log(type);
        switch (type) {
          case "visa":
            document.querySelector(".fa-cc-visa").classList.add("active");
            break;
          case "amex":
            document.querySelector(".fa-cc-amex").classList.add("active");
            break;
          case "diners":
            document
              .querySelector(".fa-cc-diners-club")
              .classList.add("active");
            break;
          case "mastercard":
            document.querySelector(".fa-cc-mastercard").classList.add("active");
            break;
          default:
            if (type === "unknown") {
              icons.forEach((icon) => icon.classList.remove("active"));
            }
            break;
        }
      },
    });
  });
