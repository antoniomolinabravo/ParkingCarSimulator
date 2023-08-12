
function FondoImagen(imagen,ancho,alto) {
    this.imagen = imagen;
    this.ancho = ancho;
    this.alto = alto;
}

FondoImagen.prototype.actualizar = function (ms,cam) {
    // Nada
}

FondoImagen.prototype.pintar = function (ctx,cam) {
    ctx.save();
    // Aplicamos el enfoque de la cámara
    ctx.translate(-cam.x,-cam.y);
    // Pintamos la imagen
    ctx.drawImage(this.imagen, 0, 0);
    ctx.restore();
}