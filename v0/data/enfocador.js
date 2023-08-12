function Enfocador(minX,minY,maxX,maxY,Ax,Ay){
    
    // Datos para el enfoque
    this.minX =	    minX;   // Posición X mínima de la zona enfocable (generalmente 0)
    this.minY =	    minY;   // Posición Y mínima de la zona enfocable (generalmente 0)
    this.maxX =	    maxX;   // Posición X máxima de la zona enfocable (generalmente el ancho del mapa)
    this.maxY =	    maxY;   // Posición Y máxima de la zona enfocable (generalmente el alto del mapa)
    this.Ax =	    Ax;	    // Desplazamiento X máximo del objeto enfocado respecto el centro de la cámara 
    this.Ay =	    Ay;	    // Desplazamiento Y máximo del objeto enfocado respecto el centro de la cámara
    // Valores Ax=0 y Ay=0, hacen que el objeto esté en el centro en todo momento
    
    // Datos del Viewport
    this.alto =	    o_o.alto;
    this.ancho =    o_o.ancho;
    this.cenX =	    o_o.ancho/2;
    this.cenY =	    o_o.alto/2;
}

Enfocador.prototype.enfocar=function(x,y,cam){

    //Seguimiento HORIZONTAL de la cámara
    if(x-this.cenX-cam.x<-this.Ax) {
	// A la izquierda del centro
	cam.x=x-this.cenX+this.Ax;
	if(cam.x<this.minX) cam.x=this.minX;
    } else if(x-this.cenX-cam.x>this.Ax){
	// A la derecha del centro
	cam.x=x-this.cenX-this.Ax;
	if(cam.x>this.maxX-this.ancho) cam.x=this.maxX-this.ancho;
    }
    //Seguimiento VERTICAL de la cámara
    if(y-this.cenY-cam.y<-this.Ay){
	// Encima del centro
	cam.y=y-this.cenY+this.Ay;
	if(cam.y<this.minY) cam.y=this.minY;
    } else if(y-this.cenY-cam.y>this.Ay){
	// Debajo del centro
	cam.y=y-this.cenY-this.Ay;
	if(cam.y>this.maxY-this.alto) cam.y=this.maxY-this.alto;
    }

}