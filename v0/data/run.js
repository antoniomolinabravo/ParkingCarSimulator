// Inicialización
o_o.I(300, 400, {
    id: "pagina",
    pantalla: "normal",
    teclas: true,
    toques: true
});

fondo = "mapa_park01";

// Escena: aparcamiento
o_o.E("aparcamiento",function(){
    // Fondo con el mapa
    o_o.O( new FondoImagen(o_o.U(fondo),o_o.ancho,o_o.alto) );
    // Coche rojo
    o_o.O( new Coche(250,480,-2.6) );
});

// Asignación y carga de archivos
o_o.A("aparcamiento",[
    "fondoimagen.js",
    "enfocador.js",
    fondo+".png",
    "coche.js"
]);