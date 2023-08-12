function Coche(posX,posY,angulo){
    
    // Referencias
    this.teclas = o_o.teclas;
    this.toque1 = o_o.toques.principal;
    this.toque2 = o_o.toques.secundario;

    // Posición y dirección
    this.x = posX;	// Posición x del punto medio del eje trasero
    this.y = posY;	// Posición y del punto medio del eje trasero
    this.ang = angulo;	// Dirección (Radianes) en la que mira el morro del coche (0: derecha)

    // Velocidad, aceleración y freno
    this.vel = 0;	// Velocidad lineal del coche
    this.acel = 0.1;	// Incremento de velocidad a cada iteración si estamos acelerando
    this.fren = 0.4;	// Decremento de velocidad a cada iteración si estamos frenando
    this.maxVelPos = 1.5;	// Velocidad lineal MÁXIMA POSTIVA del coche, viajando hacia adelante
    this.maxVelNeg = -0.5;// Velocidad lineal MÁXIMA NEGATIVA del coche, viajando hacia atrás

    // Volante
    this.angVol=0;	// Ángulo que está girado el volante (ruedas) izquierda: positivo
    this.incVol=0.003	// Cuanto gira el volante en cada iteracción si queremos girar
    this.maxVol=0.018;	// Giro máximo que es capaz de alcanzar el volante

    // Enfocador
    this.enfocador = new Enfocador(0,0,600,800,20,40);
    
    // Interacciones
    this.IZQ = false;	// Pulsación Izquierda
    this.DER = false;	// Pulsación Derecha
    this.ARR = false;	// Pulsación Arriba
    this.ABA = false;	// Pulsación Abajo
}

Coche.prototype.anguloVolante=function(angulo){
	this.angVol = angulo;
}

Coche.prototype.actualizar=function(ms,cam){
    // Reseteamos las interacciones
    this.IZQ = false;
    this.DER = false;
    this.ARR = false;
    this.ABA = false;
    
    // Interacciones con toques
    if(this.toque1.p){
	if(this.toque1.x>0 && this.toque1.x<75 && this.toque1.y>325 && this.toque1.y<400) this.IZQ=true;
	if(this.toque1.x>75 && this.toque1.x<150 && this.toque1.y>325 && this.toque1.y<400) this.DER=true;
	if(this.toque1.x>225 && this.toque1.x<300 && this.toque1.y>250 && this.toque1.y<325) this.ARR=true;
	if(this.toque1.x>225 && this.toque1.x<300 && this.toque1.y>325 && this.toque1.y<400) this.ABA=true;
    }
    if(this.toque2.p){
	if(this.toque2.x>0 && this.toque2.x<75 && this.toque2.y>325 && this.toque2.y<400) this.IZQ=true;
	if(this.toque2.x>75 && this.toque2.x<150 && this.toque2.y>325 && this.toque2.y<400) this.DER=true;
	if(this.toque2.x>225 && this.toque2.x<300 && this.toque2.y>250 && this.toque2.y<325) this.ARR=true;
	if(this.toque2.x>225 && this.toque2.x<300 && this.toque2.y>325 && this.toque2.y<400) this.ABA=true;
    }
    
    // Interacciones con teclas
    if(this.teclas[81]) this.IZQ = true;
    if(this.teclas[87]) this.DER = true;
    if(this.teclas[80]) this.ARR = true;
    if(this.teclas[76]) this.ABA = true;
    
    // Esta variable sirve para saber si estamos girando en alguna dirección
    var girando = false;

    if(this.IZQ) {
	// Estamos girando a la izquierda, incrementamos el giro del volante a la izquierda
	this.angVol-=this.incVol;
	// Si nos hemos pasado del giro máximo del volante, dejamos el valor máximo
	if(this.angVol<-this.maxVol) this.angVol=-this.maxVol;
	// Indicamos que estamos girando en alguna dirección
	girando = true;
    }

    if(this.DER) {
	// Estamos girando a la derecha, incrementamos el giro del volante a la derecha
	this.angVol+=this.incVol;
	// Si nos hemos pasado del giro máximo del volante, dejamos el valor máximo
	if(this.angVol>this.maxVol) this.angVol=this.maxVol;
	// Indicamos que estamos girando en alguna dirección
	girando = true;
    }
/*
    // Miramos si estamos girando, porque en caso contrario el volante debe volver al centro
    if(girando==false){
	if(this.angVol>0) {
	    // Si el volante está girado a la derecha, lo vamos girando a la izquierda
	    this.angVol-=this.incVol;
	    // Si el giro se hace negativo, nos hemos pasado. Lo dejamos en el centro
	    if(this.angVol<0) this.angVol=0;
	}else if(this.angVol<0) {
	    // Si el volante está girado a la izquierda, lo vamos girando a la derecha
	    this.angVol+=this.incVol;
	    // Si el giro se hace positivo, nos hemos pasado. Lo dejamos en el centro
	    if(this.angVol>0) this.angVol=0;
	}
    }
*/
    // Esta variable sirve para saber si estamos acelerando O FRENANDO
    var acelerando = false;

    // Si estamos acelerando, aumentamos la velocidad hasta su máximo positivo
    if(this.ARR) {
	// Aumentamos la velocidad de forma lineal
	// Si íbamos hacia adelante -> aceleramos
	if(this.vel>=0){
	    this.vel+=this.acel;
	}else if(this.vel<0){
	    this.vel+=this.fren;
	    if(this.vel>0) this.vel=0;
	}
	// Si nos hemos pasado de la velocidad máxima positiva, dejamos el valor máximo
	if(this.vel>this.maxVelPos) this.vel=this.maxVelPos;
	// Indicamos que estamos acelerando o frenando
	acelerando = true;
    }

    // Si estamos frenando, decrementamos la velocidad hasta su máximo negativo (marcha atrás)
    if(this.ABA) {
	// Decrementamos la velocidad de forma lineal
	// Si íbamos hacia adelante, estamos frenando, y si íbamos hacia atrás, estamos acelerando
	if(this.vel<=0){
	    this.vel-=this.acel;
	}else if(this.vel>0){
	    this.vel-=this.fren;
	    if(this.vel<0) this.vel=0;
	}
	//this.vel-=this.vel<0?this.acel:this.fren;
	// Si nos hemos pasado de la velocidad máxima negativa, dejamos el valor máximo
	if(this.vel<this.maxVelNeg) this.vel=this.maxVelNeg;
	// Indicamos que estamos acelerando o frenando
	acelerando = true;
    }

    // Si no estamos acelerando ni frenando, simplemente aplicamos un poco de rozamiento
    if(acelerando==false) this.vel*=0.98;

    // Giramos el coche dependiendo del giro del volante y la velocidad del coche
    this.ang+=this.angVol*this.vel*(ms/16.666);

    // Actualizamos la posición del coche en función de la velocidad y el ángulo de orientación
    this.x+=this.vel*Math.cos(this.ang)*(ms/16.666);
    this.y+=this.vel*Math.sin(this.ang)*(ms/16.666);

    // Enfocamos la cámara en la nave
    this.enfocador.enfocar(this.x,this.y,cam);
}


Coche.prototype.pintar=function(ctx,cam){
	var CHA_AX=50;	// Largo del chasis
	var CHA_AY=25;	// Ancho del chasis
	var EJE_TRA=10;	// Distancia entre la parte de atrás del chasis y el eje trasero
	var EJE_DEL=30;	// Distancia entre los dos ejes (afecta al giro del volante)
	var EJE_AY=11;	// Distancia entre las ruedas izquierdas y derechas
	var RUE_AX=15;	// Diámetro de las ruedas
	var RUE_AY=5;	// Ancho de las ruedas
	
	ctx.save();
	
	// Aplicamos el enfoque de la cámara
	ctx.translate(-cam.x,-cam.y);
	// Trasladamos el origen hasta el centro de giro del dibujo
	ctx.translate(this.x,this.y);
	// Rotamos respecto el centro de giro
	ctx.rotate(this.ang);
	// Pintamos las ruedas de atras que son fijas
	ctx.fillStyle = '#000';
	ctx.fillRect(-RUE_AX/2,-EJE_AY,RUE_AX,-RUE_AY);
	ctx.fillRect(-RUE_AX/2,EJE_AY,RUE_AX,RUE_AY);
	// Pintamos la rueda delantera izquierda
		ctx.save();
		ctx.translate(EJE_DEL,-EJE_AY);
		ctx.rotate(this.angVol*EJE_DEL);
		ctx.fillRect(-RUE_AX/2,0,RUE_AX,-RUE_AY);
		ctx.restore();
	// Pintamos la rueda delantera derecha
		ctx.save();
		ctx.translate(EJE_DEL,EJE_AY);
		ctx.rotate(this.angVol*EJE_DEL);
		ctx.fillRect(-RUE_AX/2,0,RUE_AX,RUE_AY);
		ctx.restore();
	// Pintamos el chasis respecto al centro de giro
	ctx.fillStyle = "rgba(255,0,0,0.5)";
	ctx.fillRect(-EJE_TRA,-(CHA_AY/2),CHA_AX,CHA_AY);
	// Pintamos el cristal delantero
	ctx.fillStyle = "rgba(255,255,255,0.7)";
	ctx.beginPath();
	ctx.moveTo(EJE_DEL/2,-CHA_AY/3);
	ctx.lineTo(EJE_DEL/2,CHA_AY/3);
	ctx.lineTo(EJE_DEL/1.2,CHA_AY/2);
	ctx.lineTo(EJE_DEL/1.2,-CHA_AY/2);
	ctx.lineTo(EJE_DEL/2,-CHA_AY/3);
	ctx.fill();
	// Pintamos el cristal trasero
	ctx.beginPath();
	ctx.moveTo(0,-CHA_AY/3);
	ctx.lineTo(0,CHA_AY/3);
	ctx.lineTo(-EJE_DEL/4,CHA_AY/3);
	ctx.lineTo(-EJE_DEL/4,-CHA_AY/3);
	ctx.lineTo(0,-CHA_AY/3);
	ctx.fill();
		
	ctx.restore();
	
	// Pintamos los botones de interacción
	ctx.fillStyle = this.IZQ? "rgba(255,255,255,0.7)":"rgba(255,255,255,0.3)";
	ctx.fillRect(5,330,65,65);
	ctx.fillStyle = this.DER? "rgba(255,255,255,0.7)":"rgba(255,255,255,0.3)";
	ctx.fillRect(80,330,65,65);
	ctx.fillStyle = this.ARR? "rgba(255,255,255,0.7)":"rgba(255,255,255,0.3)";
	ctx.fillRect(230,255,65,65);
	ctx.fillStyle = this.ABA? "rgba(255,255,255,0.7)":"rgba(255,255,255,0.3)";
	ctx.fillRect(230,330,65,65);
}

