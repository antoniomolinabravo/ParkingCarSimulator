// Versión 0.1.5
// - Cambios en el console.log
// - Cambio en el orden de los argumentos de actualizar: milisegundos y luego cámara
// - ancho y alto están ahora más accesibles a través de o_o.ancho y o_o.alto
// - el canvas real se borra antes de pintar encima el canvas virtual

var scripts = document.getElementsByTagName("script");
var o_oURL = scripts[scripts.length-1].src;

(function(window){

    // REQUEST-ANIM-FRAME
    window.requestAnimFrame=(function(){
	return window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame || 
	function(callback){
	    window.setTimeout(callback,33);
	};
    })();

    window.o_o = {
	
	// Tamaño del Viewport en pixels (CANVAS)
	ancho:	240,	    // Ancho del CANVAS viewport
	alto:	160,	    // Alto del CANVAS viewport
	//
	// OPCIONES //##############################################################################
	// Estas son por defecto pero podrán sobreescribirse al iniciar el framework
	// #########################################################################################
	
	opciones: {
	    id:		"",	    // Id del elemento HTML que será sustituido por el CANVAS viewport
	    pantalla:	"normal",   // Modo de pantalla: "normal" o "completa"
	    pixel:	1,	    // Tamaño de los pixels: 1, 2, 3, 4 ...
	    teclas:	false,	    // ¿Van a usarse las teclas?
	    raton:	false,	    // ¿Va a usarse el ratón?
	    toques:	false	    // ¿Van a usarse toques de pantalla?
	},
	
	// Información sobre el dispositivo
	dispositivo: {
	    android:	    /android/i.test(navigator.userAgent),
	    iPhone:	    /iPhone/i.test(navigator.userAgent),
	    iPad:	    /iPad/i.test(navigator.userAgent),
	    blackberry:	    /BlackBerry/i.test(navigator.userAgent),
	    windowsMobile:  /IEMobile/i.test(navigator.userAgent)
	},

	// VISTA //#################################################################################
	// Elementos relacionados con la visualización
	// #########################################################################################
	
	vista: {
	    
	    // Referencias al Viewport (CANVAS)
	    viewport:	null,	    // Elemento <canvas> visible
	    contexto:	null,	    // Contexto gráfico del viewport visible
	    
	    // Posición del Viewport (CANVAS), en la página (pos. cliente + scroll)
	    paginaX:	0,	    // Posición X del CANVAS en la página (pos. cliente + scroll)
	    paginaY:	0,	    // Posición Y del CANVAS en la página (pos. cliente + scroll)

	    // Style del Viewport (CSS)
	    sAncho:	240,	    // Ancho del style del viewport
	    sAlto:	160	    // Alto del style del viewport
	    
	},
	

	// ESCENAS Y OBJETOS //#####################################################################
	// Puede haber varias escenas definidas, pero solamente una activa
	// #########################################################################################

	escenas:	{},	// Lista de escenas del programa
	escenaActiva:	null,	// Referencia a la escena que está en marcha
	objetos:	[],	// Array de objetos que se actualizarán y pintarán en cada iteración
	animation:	null,	// Referencia al Animation Frame del bucle principal, para pararlo
	ultimoMs:	0,	// Valor de los milisegundos de la última iteración
	
	
	// CARGADOR //##############################################################################
	// Elementos relacionados con el cargador de archivos
	// #########################################################################################
	
	cargador: {
	    archivosTotal:	0,	// Número total de archivos que van a cargarse
	    archivosFaltan:	0,	// Número de archivos que faltan por cargar
	    archivosLista:	[],	// Lista de archivos que se cargarán antes de empezar
	    escenaDespues:	""	// Nombre (String) de la escena que se ejecutará al final
	},
	

	// ELEMENTOS USABLES //#####################################################################
	// Imágenes y sonidos cargados, que podrán utilizarse donde queramos
	// #########################################################################################
	
	imagenes: 	{},	// Lista de imágenes que se han cargado
	sonidos:	{},	// Lista de sonidos que se han cargado


	// CONTROL DE USUARIO //####################################################################
	// Elementos para el control del usuario: teclas, ratón y toques
	// #########################################################################################

	teclas:		[],	// Array de booleans: true es pulsada y false es no-pulsada
	raton: {
	    x:		0,	// Posición X actual del ratón
	    y:		0,	// Posición Y actual del ratón
	    p:		false,	// Botón pulsado (en el momento actual)
	    p_antes:	false,	// Botón pulsado antes (en la iteración anterior)
	    pulsado:	false,	// Es true si en esta iteración hemos pasado de no-pulsado a pulsado
	    soltado:	false	// Es true si en esta iteración hemos pasado de pulsado a no-pulsado
	},
	toques:	{
	    principal: {
		x:	    0,	    // Posición X del dedo principal, tiene sentido si .p es true
		y:	    0,	    // Posición Y del dedo principal, tiene sentido si .p es true
		p:	    false,  // Dedo en la pantalla, si es false, .x e .y no sirven
		p_antes:    false,  // Dedo en la pantalla antes (en la iteración anterior)
		pulsado:    false,  // Es true si en esta iteración hemos pasado de no-pulsado a pulsado
		soltado:    false   // Es true si en esta iteración hemos pasado de pulsado a no-pulsado
	    },
	    secundario: {
		x:	    0,	    // Posición X del dedo secundario, tiene sentido si .p es true
		y:	    0,	    // Posición Y del dedo secundario, tiene sentido si .p es true
		p:	    false,  // Dedo en la pantalla, si es false, .x e .y no sirven
		p_antes:    false,  // Dedo en la pantalla antes (en la iteración anterior)
		pulsado:    false,  // Es true si en esta iteración hemos pasado de no-pulsado a pulsado
		soltado:    false   // Es true si en esta iteración hemos pasado de pulsado a no-pulsado
	    }
	},

	// INICIAR //###############################################################################
	// Inicializa el o_o. Crea el canvas y procesa la configuración
	// #########################################################################################
	
	iniciar: function(anchoCanvas, altoCanvas, configuracion) {

	    // Informamos por consola
	    console.log("o_o: Iniciando framework");
	    
	    // Referencias
	    var o_o	    = this;
	    var vista	    = o_o.vista;
	    var opciones    = o_o.opciones;

	    // Copiamos los valores de configuración (si existen) en las opciones de o_o
	    if(configuracion) {
		for(var propiedad in configuracion ) {
		    o_o.opciones[propiedad] = configuracion[propiedad];
		}
	    }

	    // Guardamos el tamaño que se ha especificado para el canvas
	    o_o.ancho	    = anchoCanvas;
	    o_o.alto	    = altoCanvas;

	    // Creamos el canvas con javascript
	    vista.viewport	    = document.createElement('canvas');
	    vista.viewport.width    = o_o.ancho;
	    vista.viewport.height   = o_o.alto;
	    
	    // Vemos dónde debemos crear el viewport
	    if( opciones.id == "" ){
		// Si el ID está vacío, lo pegamos al body al final del todo
		document.body.appendChild(vista.viewport);
		o_o.padre = document.body;
	    }else{
		// Si nos dan un ID, sustituimos lo que sea por el viewport
		var elemento = document.getElementById(opciones.id);
		elemento.parentNode.replaceChild(vista.viewport, elemento);
		o_o.padre = elemento.parentNode;
	    }
	    
	    // Obtenemos y guardamos el contexto gráfico
	    vista.contexto = vista.viewport.getContext('2d');

	    // Añadimos los eventos de cambio de tamaño y de orientación
	    window.addEventListener('resize', o_o.evento.redimensionarVentana, false);
	    window.addEventListener('orientationchange', o_o.evento.redimensionarVentana, false);
	    window.addEventListener('scroll', o_o.evento.scrollPagina, false);
	    
	    // Si vamos a usar las teclas
	    if(opciones.teclas){
		// Asignamos los eventos del teclado
		window.top.addEventListener('keydown', o_o.evento.pulsarTecla, false);
		window.top.addEventListener('keyup',   o_o.evento.soltarTecla, false);
		// Información por consola
		console.log("o_o: Iniciada la detección de Teclas");
	    }
	    
	    // Si vamos a usar el ratón
	    if(opciones.raton){
		// Asignamos los eventos del ratón
		o_o.vista.viewport.addEventListener('mousedown', o_o.evento.pulsarRaton, false);
		document.addEventListener("mousemove", o_o.evento.moverRaton, false);
		document.addEventListener("mouseup", o_o.evento.soltarRaton, false);
		// Información por consola
		console.log("o_o: Iniciada la detección del Ratón");
	    }
	    
	    // Si vamos a usar toques
	    if(opciones.toques){
		o_o.vista.viewport.addEventListener('touchstart', o_o.evento.pulsarToque, false);
		o_o.vista.viewport.addEventListener('touchmove', o_o.evento.moverToque, false);
		document.addEventListener('touchend', o_o.evento.soltarToque, false);
		// Información por consola
		console.log("o_o: Iniciada la detección de Toques");
	    }
	    
	    // Redimensionamos por primera vez la pantalla antes de empezar a pintar
	    o_o.evento.redimensionarVentana();
	    // Obtenemos la información del scroll por primera vez
	    o_o.evento.scrollPagina();
	    
	    // Mostramos la Splash Screen
	    o_o.splash();
	},
		
	usarArchivo: function(nombreArchivo){
	    // Verificamos si el archivo es una imagen, y si lo es, la devolvemos
	    if(o_o.imagenes.hasOwnProperty(nombreArchivo)) return o_o.imagenes[nombreArchivo];
	    // Verificamos si el archivo es un sonido, y si lo es, lo devolvemos
	    if(o_o.sonidos.hasOwnProperty(nombreArchivo)) return o_o.sonidos[nombreArchivo];
	    // Si no es nada, devolvemos null
	    console.error("o_o: Intento de usar el archivo inexistente ("+nombreArchivo+")");
	    return null;
	},
	
	accion: function(nombreEscena,archivos){
	
	    // Referencias
	    var cargador = o_o.cargador;
	    // URL base
	    var URLbase = o_oURL.replace(/\/[^\/]+$/,"")+"/";

	    // Detenemos el bucle principal si estaba funcionando
	    cancelAnimationFrame(o_o.animation);
		
	    // Cogemos la lista de archivos que cargaremos antes de ir a la escena (si la hay)
	    cargador.archivosLista = archivos || [];
			
	    // Guardamos qué escena ejecutaremos cuando todo esté cargado
	    cargador.escenaDespues = nombreEscena;
			
	    // Reseteamos los contadores de archivos totales y archivos que faltan
	    cargador.archivosTotal = cargador.archivosLista.length; 
	    cargador.archivosFaltan = cargador.archivosTotal;
			
	    // Mandamos cargar los archivos dependiendo del tipo y les asignamos su evento onArchivoCargado
	    for(var i=0, j=cargador.archivosTotal; i<j; i++){
		var archivo;
		
		// Cogemos los tres últimos caracteres del nombre del archivo
		var extension = cargador.archivosLista[i].slice(-3);
				
		if(extension == ".js"){ //Si es un javascript ".js"
				
		    var script = document.createElement('script');
		    script.type = 'text/javascript';
		    script.src = URLbase+cargador.archivosLista[i];
		    script.onload = o_o.evento.cargarArchivo;
		    var head= document.getElementsByTagName('head')[0];
		    head.appendChild(script);
					
		}else if(extension == "png"){ //Si es una imagen ".png"

		    // Cogemos el nombre del archivo sin ruta
		    archivo = cargador.archivosLista[i].split("/").pop();
		    // También quitamos la extensión
		    archivo = archivo.slice(0,-4);
		    
		    var img = document.createElement('img');
		    img.src = URLbase+cargador.archivosLista[i];
		    img.onload = o_o.evento.cargarArchivo;
		    // Lo metemos en la lista de imágenes
		    o_o.imagenes[archivo] = img;
					
		}else if(extension == "ogg"){ //Si es un sonido ".ogg"
		    
		    // Cogemos el nombre del archivo sin ruta
		    archivo = cargador.archivosLista[i].split("/").pop();
		    // También quitamos la extensión
		    archivo = archivo.slice(0,-4);

		    // Si estamos en un navegador de Android, no cargaremos los sonidos!
		    if(o_o.dispositivo.android){
			// En Android en vez de cargar los sonidos, creamos un objeto falso
			// que simule su funcionalidad, así todo va bien, pero sin sonidos.
			o_o.sonidos[archivo] = {};
			o_o.sonidos[archivo].play = function(){};
			cargador.archivosFaltan--;			
		    }else{
			// Si no estamos en Android, podemos cargar el sonido
			var audio = new Audio(URLbase+cargador.archivosLista[i]);
			audio.addEventListener('canplaythrough',o_o.evento.cargarArchivo, false );
			audio.load();
			// Lo metemos en la lista de sonidos
			o_o.sonidos[archivo] = audio;
		    }
		}
		
	    }
	
	    // Información por consola
	    console.log("o_o: Iniciada carga de "+o_o.cargador.archivosFaltan+" archivos");
	    console.log("o_o: Programada escena '"+o_o.cargador.escenaDespues+"' después de la carga");
	    // Hacemos una primera llamada a cargarArchivo por si no hay nada que cargar
	    // Este evento se ejecutará también, cada vez que se cargue un archivo
	    o_o.evento.cargarArchivo();
	},
		
	agregarObjeto: function(nuevoObjeto) {
	    // Incluimos el objeto nuevo en la lista de objetos que se actualizarán / pintarán
	    o_o.objetos.push(nuevoObjeto);
	    // Información por consola
	    console.log("o_o: Añadido nuevo objeto de tipo '"+nuevoObjeto.constructor.name+"'");
	},
	
	crearEscena: function(nombre,nuevaEscena) {
	    	    
	    // Una escena es una función, la metemos en el array asociativo (objeto) o_o.escenas
	    o_o.escenas[nombre] = nuevaEscena;
	    
	    // Referencias para más comodidad
	    var escena = o_o.escenas[nombre];
	    
	    // Cada escena tiene su propio Canvas Virtual X donde pintamos y al final de cada
	    // iteración del bucle principal, volcamos su contenido en el Canvas Principal
	    escena.viewportX = document.createElement('canvas');
	    escena.contextoX = escena.viewportX.getContext('2d');
	    escena.viewportX.width = o_o.ancho;
	    escena.viewportX.height = o_o.alto;
	    
	    // Cada escena tiene también su propia cámara
	    escena.camara = {
		x:	0,	// Posición x de la cámara en la escena
		y:	0	// Posición y de la cámara en la escena
	    }

	},
				
	bucle: function (){
	    var i,j;
	    
	    // Referencias
	    var o_o = window.o_o;
	    
	    // Control del tiempo
	    var ahora = Date.now();
	    var ms = ahora - o_o.ultimoMs;
	    o_o.ultimoMs = ahora;
	    // Máximo intervalo de ms
	    ms = ms>1000? 1000: ms;
	    
	    // Programamos la siguiente ejecución del bucle
	    o_o.animation = requestAnimFrame(o_o.bucle);

	    // Actualizamos el ratón si está activado
	    if(o_o.opciones.raton){
		o_o.raton.pulsado = (o_o.raton.p==true && o_o.raton.p_antes==false);
		o_o.raton.soltado = (o_o.raton.p==false && o_o.raton.p_antes==true);
		o_o.raton.p_antes = o_o.raton.p;
	    }
	    
	    // Actualizamos los toques si están activados
	    if(o_o.opciones.toques){
		// Toque principal
		o_o.toques.principal.pulsado = (o_o.toques.principal.p==true && o_o.toques.principal.p_antes==false);
		o_o.toques.principal.soltado = (o_o.toques.principal.p==false && o_o.toques.principal.p_antes==true);
		o_o.toques.principal.p_antes = o_o.toques.principal.p;
		// Toque secundario
		o_o.toques.secundario.pulsado = (o_o.toques.secundario.p==true && o_o.toques.secundario.p_antes==false);
		o_o.toques.secundario.soltado = (o_o.toques.secundario.p==false && o_o.toques.secundario.p_antes==true);
		o_o.toques.secundario.p_antes = o_o.toques.secundario.p;
	    }
	    
	    // Actualizar Objetos
	    for (i=0,j=o_o.objetos.length; i<j ; i++) {
		o_o.objetos[i].actualizar(ms,o_o.escenaActiva.camara);
	    }
	    
	    // Pintar en Virtual
	    for (i=0,j=o_o.objetos.length; i<j ; i++) {
		o_o.objetos[i].pintar(o_o.escenaActiva.contextoX,o_o.escenaActiva.camara);
	    }
	    
	    // Borramos Real // Swap Virtual->Real // Borramos Virtual
	    o_o.vista.contexto.clearRect(0, 0, o_o.ancho, o_o.alto);
	    o_o.vista.contexto.drawImage(o_o.escenaActiva.viewportX,0,0);
	    o_o.escenaActiva.contextoX.clearRect(0, 0, o_o.ancho, o_o.alto);
	    
	},
	
	evento: {
	    
	    redimensionarVentana: function (){
		
		// Asignamos el tamaño establecido al elemento canvas
		o_o.vista.viewport.width = o_o.ancho;
		o_o.vista.viewport.height = o_o.alto;

		if(o_o.opciones.pantalla=="completa"){
		    
		    // Guardamos el tamaño de la ventana en la que tenemos que colocar el canvas
		    var wAncho = window.innerWidth;
		    var wAlto = window.innerHeight;

		    // Calculamos la relación de aspecto original y de la ventana
		    var relacion = o_o.ancho/o_o.alto;
		    var wRelacion = wAncho / wAlto;

		    // Para poner a pantalla completa cambiaremos el ancho del style, NO del canvas
		    var styleAncho = o_o.ancho;
		    // El ancho depende de si la relación de la ventana es más ancha o más alta que la que queremos
		    // - si la ventana es más estrecha horizontalmente que el canvas, sobrará espacio arriba y abajo
		    //   > ponemos como ancho del canvas, el ancho de la ventana
		    // - si la ventana es más alargada horizontalmente que el canvas, sobrará espacio en los lados
		    //   > ponemos como ancho del canvas, el ancho que debería tener, manteniendo su relación de aspecto
		    styleAncho=(wRelacion<relacion)? wAncho : Math.floor(wAlto * relacion) ;
		    // Asignamos el ancho al style del canvas, NO al propio canvas
		    o_o.vista.viewport.style.width=styleAncho+"px";
		    // El alto NO, porque queremos que mantenga su relación de aspecto original

		    // Centramos el canvas horizontal y/o verticalmente
		    var left = Math.floor((wAncho-styleAncho)/2); 
		    var top = Math.floor((wAlto-(styleAncho/relacion))/2);
		    o_o.vista.viewport.style.position="fixed";
		    o_o.vista.viewport.style.zIndex="9999";
		    o_o.vista.viewport.style.left = left+"px";
		    o_o.vista.viewport.style.top = top+"px";

		    // Guardamos los datos de style
		    o_o.vista.sAncho	= styleAncho;
		    o_o.vista.sAlto	= styleAncho / relacion;
		    
		} else {
		    
		    // Asignamos el ancho al style del canvas, NO al propio canvas
		    o_o.vista.viewport.style.width=o_o.ancho+"px";
		    
		    // Lo ponemos en el sitio que le corresponde
		    o_o.vista.viewport.style.position="relative";
		    o_o.vista.viewport.style.left = "0px";
		    o_o.vista.viewport.style.top = "0px";
		    
		    // Guardamos los datos de style
		    o_o.vista.sAncho    = o_o.ancho;
		    o_o.vista.sAlto	= o_o.alto;
		    
		}
		// Información por consola
		console.log("o_o: Canvas redimensionado a "+o_o.vista.sAncho+"x"+o_o.vista.sAlto);
	    },
	    
	    scrollPagina: function(){
		var scrollTop, scrollLeft;
		
		// Usamos las distintas formas que hay para obtener la posición del scroll
		if(typeof(window.pageYOffset) == 'number') {
		    // Para los que cumplen con la especificación del DOM, y de IE9 para arriba
		    scrollTop = window.pageYOffset;
		    scrollLeft = window.pageXOffset;
		} else {
		    // Solución para IE6-8
		    if(document.body && document.body.scrollTop) {
			// Forma caprichosa de IE
			scrollTop = document.body.scrollTop;
			scrollLeft = document.body.scrollLeft;
		    } else if(document.documentElement && document.documentElement.scrollTop) {
			// Forma estandar de IE6+
			scrollTop = document.documentElement.scrollTop;
			scrollLeft = document.documentElement.scrollLeft;
		    }
		}
		// Ahora que tenemos el desplazamiento de scroll, sacamos la posición del canvas
		var rect = o_o.vista.viewport.getClientRects();
		o_o.vista.paginaX = rect[0].left + scrollLeft;
		o_o.vista.paginaY = rect[0].top + scrollTop;
	    },
	    
	    cargarArchivo: function (evento){ 
		
		// Se hace una llamada inicial, que no tendrá evento, las demás sí son de evento
		if(evento!=null) {
		    // Si es un audio, quitamos el evento oncanplaythrough por problemas en Firefox
		    evento.target.removeEventListener('canplaythrough',o_o.evento.cargarArchivo, false );
		    // Ponemos información en la consola
		    console.log("o_o: Archivo '"+evento.target.src+"' cargado (faltan "+o_o.cargador.archivosFaltan+" archivos)");		    
		}

		// Actualizamos el contador de archivos que faltan
		o_o.cargador.archivosFaltan--;
				
		// Verificamos si hemos acabado (esperamos a -1 porque hicimos una primera llamada adicional a onArchivoCargado)
		if(o_o.cargador.archivosFaltan<0){
		    // Información por consola
		    console.log("o_o: Carga de archivos completa");
		    // Si ya está todo cargado, borramos el viewport
		    o_o.vista.viewport.width = o_o.vista.viewport.width;
		    // Eliminamos todos los objetos
		    o_o.objetos = [];
		    // Cargamos la escena cuyo nombre (string) hemos asignado a la propiedad escenaDespues
		    o_o.escenaActiva = o_o.escenas[o_o.cargador.escenaDespues];
		    // Información por consola
		    console.log("o_o: Creando escena '"+o_o.cargador.escenaDespues+"'");
		    o_o.escenaActiva();
		    // Ponemos el bucle principal en marcha
		    o_o.ultimoMs = Date.now();	// Primer dato de tiempo
		    // Información por consola
		    console.log("o_o: Bucle principal en marcha!");
		    o_o.bucle();  
		} else {
		    // Si aún no está todo cargado, repintamos la Splash Screen con el contador actualizado
		    o_o.splash();
		}
	    },
	    
	    // EVENTO: TECLAS //####################################################################
	    // -------------------------------------------------------------------------------------
	    
	    pulsarTecla: function(evento){
		var codigo = evento.which ? evento.which : evento.keyCode;
		// Si pulsamos una tecla, actualizamos su estado a true
		o_o.teclas[codigo] = true;
	    },

	    soltarTecla: function(evento){
		var codigo = evento.which ? evento.which : evento.keyCode;
		// Si soltamos una tecla, actualizamos su estado a false
		o_o.teclas[codigo] = false;
	    },
	    
	    // EVENTO: RATON //#####################################################################
	    // -------------------------------------------------------------------------------------
	    
	    pulsarRaton: function(evento){
		evento.preventDefault();
		o_o.raton.p = true;
		return false;
	    },

	    moverRaton: function(evento){
		evento.preventDefault();
		var vista = o_o.vista;
		// evento.clientX/Y nos da la posición en la ventana, tenemos que hacerla relativa al canvas
		o_o.raton.x = (evento.pageX - vista.paginaX) * (o_o.ancho/vista.sAncho);
		o_o.raton.y = (evento.pageY - vista.paginaY) * (o_o.alto/vista.sAlto);
		return false;
	    },

	    soltarRaton: function(evento){
		evento.preventDefault();
		o_o.raton.p = false;
		return false;
	    },
	    
	    // EVENTO: TOQUES //####################################################################
	    // -------------------------------------------------------------------------------------

	    pulsarToque: function(evento){ 
		evento.preventDefault();
		//document.dispatchEvent('touchmove');
		o_o.evento.actualizarToque(evento);
		return false;
	    },

	    moverToque: function(evento){
		evento.preventDefault();
		o_o.evento.actualizarToque(evento);
		return false;
	    },

	    soltarToque: function(evento){
		evento.preventDefault();
		o_o.evento.actualizarToque(evento);
		return false;
	    },

	    // Esta función se ejecuta cada vez que algo cambie con los toques
	    // y se encarga de gestionar toda la información de toques
	    actualizarToque: function(evento){ // evento.originalEvent.touches!!!!!!!
		//evento.touches es un touchList
		var t = evento.touches;
		//var t = evento.originalEvent.touches;
		// Supondremos que los toques principal y secundario no están pulsados
		o_o.toques.principal.p = false;
		o_o.toques.secundario.p = false;
		// Buscamos en la lista de toques
		for (var i=0; i<t.length; i++) {
		    // Referencia
		    var vista = o_o.vista;
		    // Si pasamos por el toque con identificador 0, lo guardamos en principal
		    if(t[i].identifier==0){ 
			o_o.toques.principal.x = (t[i].pageX - vista.paginaX) * (o_o.ancho/vista.sAncho);
			o_o.toques.principal.y = (t[i].pageY - vista.paginaY) * (o_o.alto/vista.sAlto);
			o_o.toques.principal.p = true;
		    }
		    // Si pasamos por el toque con identificador 1, lo guardamos en secundario
		    if(t[i].identifier==1){
			o_o.toques.secundario.x = (t[i].pageX - vista.paginaX) * (o_o.ancho/vista.sAncho);
			o_o.toques.secundario.y = (t[i].pageY - vista.paginaY) * (o_o.alto/vista.sAlto);
			o_o.toques.secundario.p = true;
		    }
		}
	    }
	},
	
	splash:function(){
	    
	    // Referencias
	    var c = o_o.vista.contexto;
	    var ancho = o_o.ancho;
	    var alto = o_o.alto;

	    // Fondo negro
	    c.fillStyle='#000000';
	    c.fillRect(0, 0, ancho, alto);
	    
	    // Calculamos el cuadrado más grande que se pueda dibujar
	    var lado = ancho>alto? alto : ancho;
	    var x0 = (ancho - lado) / 2;
	    var y0 = (alto - lado) / 2;
	    
	    // Trasladamos todo para centrar
	    c.save();
	    c.translate(x0, y0);
	    
	    // Círculos blancos
	    c.strokeStyle='#ffffff';
	    c.lineWidth = lado/20;
	    // Círculo izquierdo
	    c.beginPath();
	    c.arc(lado/3,lado/2,lado/9,0,Math.PI*2,false);
	    c.stroke();
	    // Círculo derecho
	    c.beginPath();
	    c.arc(2*lado/3,lado/2,lado/9,0,Math.PI*2,false);
	    c.stroke();
	    
	    // Barra Fondo
	    c.strokeStyle='#ffffff';
	    c.beginPath();
	    c.moveTo(2*lado/5,3*lado/4);
	    c.lineTo(3*lado/5,3*lado/4);
	    c.stroke();
	    
	    // Cálculos para la barra de carga
	    var rel=(o_o.vista.cargarTotal-o_o.vista.cargarFaltan)/o_o.vista.cargarTotal;
	    var centro=lado/2;
	    var izquierda=2*lado/5-centro;
	    var derecha=3*lado/5-centro;

	    // Barra cargado
	    c.strokeStyle='#666666';
	    c.lineWidth = (lado/20);
	    c.beginPath();
	    c.moveTo(centro+izquierda*rel,3*lado/4);
	    c.lineTo(centro+derecha*rel,3*lado/4);
	    c.stroke();
	    
	    c.restore();
	},
	
	// Cambia entre pantalla completa o normal
	pantallaCompleta: function(completa){
	    if(completa){
		o_o.opciones.pantalla = "completa";
	    }else{
		o_o.opciones.pantalla = "normal";
	    }
	    // Actualizamos para aplicar los cambios
	    o_o.evento.redimensionarVentana();
	    o_o.evento.scrollPagina();
	},
	
	// Nombres fáciles // ######################################################################
	
	A: function(nombreEscena,archivos){
	    o_o.accion(nombreEscena,archivos);
	},
	E: function(nombre,nuevaEscena){
	    o_o.crearEscena(nombre,nuevaEscena);
	},
	I: function(anchoCanvas, altoCanvas, configuracion){
	    o_o.iniciar(anchoCanvas, altoCanvas, configuracion);
	},
	O: function(nuevoObjeto){
	    o_o.agregarObjeto(nuevoObjeto);
	},
	U: function(nombreArchivo){
	    return o_o.usarArchivo(nombreArchivo);
	}
	
    }

    // Llegados aquí, el framework ya está definido en el objeto window
    console.log("o_o: Framework declarado y dispuesto para usarse");
})(window);

/*
TODO:
- La opción pixel: "x2","x3","x4"
- Opción camara: auto, aplica la traslación de la cámara antes del bucle de pintar.
   ctx.setTransform(1, 0, 0, 1, 0, 0); // Resetea todas las transformaciones
-.qrstcolorfondo {
    display: none;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    background: rgba(0,0,0,0.7);
}
*/

// Para obtener el código de pulsación de las teclas, descomenta esta línea
// document.addEventListener('keydown', function(e){alert(e.which ? e.which : e.keyCode);}, false);
