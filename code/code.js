class Comic 
{
    constructor(nombre,pais, precio, importacion, precioTotal)
    {
        this.nombre = nombre;
        this.pais = pais; 
        this.precio = parseFloat(precio);
        this.importacion = parseFloat(importacion);
        this.precioTotal = parseFloat(precioTotal);
    }
}

let carrito = []; //creo el carrito donde se van a guardar los comics
let totalCarrito = 0;
let totalPesos = 0;
let dolarBlue = 0;

//variables para modificar DOM
const comicElegido = document.getElementById("comicElegido"); 
const paisElegido = document.getElementById("paisElegido");
const botonEnvio = document.getElementById("enviarComic");
const displayCarrito = document.getElementById("areaCompra");
const displayDolarOficial= document.getElementById("dolarOficialDisplay");
const displayDolarBlue= document.getElementById("dolarBlueDisplay");
const displayTotal= document.getElementById("totalCarrito");

//variables para guardar el carrito y el precio del dolar blue en local storage y recuperarlo
let carritoStorage; 
let recuperarCarrito = localStorage.getItem("carro");
let carritoRecuperado = JSON.parse(recuperarCarrito);
let dolarStorage;
let recuperarDolar = localStorage.getItem("dolar");
let dolarRecuperado = JSON.parse(recuperarDolar);

//Variables que contienen los precios a asignar
const opcionesComics = 
{
    "SUPERMAN": 10,
    "BATMAN": 8,
    "FLASH": 9.5,
    "SPIDER-MAN": 12,
    "X-MEN": 11,
};

const opcionesPaises = 
{
    "ESTADOS UNIDOS": 50,
    "INGLATERRA": 20,
    "ESPAÑA": 10,
    "JAPÓN": 100,
};

const crearComic = () => //Crea un objeto cómic y lo agrega al carrito
{
    const nombreComic = comicElegido.value.toUpperCase(); 
    const paisComic = paisElegido.value.toUpperCase();
    const precio = opcionesComics[nombreComic];
    const importacion = opcionesPaises[paisComic];
    const precioTotal = precio + importacion;

    const comic = new Comic(nombreComic, paisComic, precio, importacion, precioTotal); //asigno lo ingresado por el usuario al comic a comprar
    if (!opcionesComics.hasOwnProperty(nombreComic) || !opcionesPaises.hasOwnProperty(paisComic)) //Si no se ingresa uno de los valores necesarios, da error.
    {
        Swal.fire
        ({
                title: 'Error',
                text: 'Por favor, elija una opción válida',
                icon: 'error',
                confirmButtonText: 'Ok'
        })
    }

    else
    {
        carrito.push(comic); //agrega el elemento al carrito
        Toast("Producto Agregado", "Blue", "White");
        mostrarCarrito(); //refresca el carrito en el html
    }
    comicElegido.value = ""; //limpia los campos despues de ejecutarse
    paisElegido.value = "";
}

const mostrarCarrito = () => //Muestra el carrito según lo que hay en el array
{
    displayCarrito.innerHTML = ""; //limpia el html para que no se pise al enviar varias veces

    !carrito.length && (displayCarrito.innerHTML = "<li>El carrito está vacio</li>"); //Si el carrito esta vacio, muestra este mensaje

    carrito.forEach ((comic, i) => displayCarrito.innerHTML += `<li>Compra de ${carrito[i].nombre} importado de ${carrito[i].pais} por un costo de ${carrito[i].precioTotal} $</li> 
    <button class="borrar" onclick="eliminarComic(${i})"></button>
    <button class="duplicar" onclick="duplicarComic(${i})"></button>`); //Copia el array en el html y agrega boton de borrado
    carritoStorage = JSON.stringify(carrito); //convierte el carrito a string de JSON
    localStorage.setItem("carro", carritoStorage); //guarda el carrito como string en el localStorage
    calcularTotal();
}

const restaurarCarrito = () => //Restaura el carrito y el precio del dolar blue a como estaba en el localStorage
{
    carrito.push.apply(carrito, carritoRecuperado);
    dolarBlue = dolarRecuperado;
}

const Toast = (texto, color1, color2) => //crea una alerta basada en parametros dados
{
    Toastify
    ({
            text: texto,
            duration: 3000,
            style: {background: color1, color: color2}
    }).showToast();
}

const eliminarComic = (i) => //Elimina el comic actualmente ingresado en el array y refresca el display
{
    Swal.fire //Llama un Sweet Alert de confirmación de borrado
    (
        {
            title: "Esta seguro de eliminar el producto?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar"
        }
    )

    .then((result) =>
    {
        if (result.isConfirmed) //Si se clickea "confirmar" se borra el comic del carrito
        {
            carrito.splice(i, 1);
            Toast("Producto eliminado", "red", "black");
            mostrarCarrito();
        }
    })

}

const duplicarComic = (i) => //Duplica el comic actualmente ingresado al array y refresca el display
{
    carrito.push(carrito[i]);
    Toast("Producto duplicado", "green", "black");
    mostrarCarrito();
}

const pedirDolar = async () => //Conecto a API de precio del dolar y guardo en variable el precio al día
{
    const resp = await
    fetch("https://api.bluelytics.com.ar/v2/latest")
    const data = await resp.json()
    dolarBlue = data["blue"].value_sell
    dolarOficial = data["oficial"].value_sell
    displayDolarOficial.innerHTML += dolarOficial;
    displayDolarBlue.innerHTML += dolarBlue;
    dolarStorage = JSON.stringify(dolarBlue); //convierte el dolar Blue a string de JSON
    localStorage.setItem("dolar", dolarStorage); //guarda el dolar como string en el localStorage
}

const calcularTotal = () => //Calcula el precio total y lo imprime en el html
{
    totalCarrito = 0;
    !carrito.length && (displayTotal.innerHTML = ""); //Si el carrito esta vacio, limpia el campo
    carrito.forEach ((comic, i) => 
    {
        totalCarrito += carrito[i].precioTotal;
        totalPesos = calcularPesos(totalCarrito);
        displayTotal.innerHTML = 
        `
        ${totalCarrito} USD$
        <br>
        ${totalPesos} ARS$
        `
    })
}

const calcularPesos = (a) => //calcula el precio en pesos según el dolar blue al día
{
    let calculoPesos = a * dolarBlue;
    return calculoPesos;
}

document.addEventListener("DOMContentLoaded", restaurarCarrito(), pedirDolar(), mostrarCarrito()); 
botonEnvio.onclick = () => {crearComic()};