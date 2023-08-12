/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-mpu-6050-web-server/

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

let scene, camera, rendered, cube, pasos, giro, radianes;
pasos = 0 ; giro = 0; radianes = 0;

function parentWidth(elem) {
  return elem.parentElement.clientWidth;
}

function parentHeight(elem) {
  return elem.parentElement.clientHeight;
}

// Create events for the sensor readings
if (!!window.EventSource) {
  var source = new EventSource('/events'); //http://192.168.0.12/events

  source.addEventListener('open', function(e) {
    console.log("Events Connected");
  }, false);

  source.addEventListener('error', function(e) {
    if (e.target.readyState != EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);
  
  source.addEventListener('pasos_reading', function(e) {
    //console.log("pasos_reading", e.data);
	pasos = parseInt(e.data)*+1;
	if(pasos!=0){
	  giro  = giro + pasos;
	  radianes = (giro==0)?1/2000:giro/2000;
      //coche.anguloVolante(radianes);
	  o_o.objetos[1].angVol = radianes;
	  //console.log("pasos_reading", radianes);
      // Change cube rotation after receiving the readinds
      //cube.rotation.x = obj.gyroY;
      //cube.rotation.z = radianes; //obj.gyroX;
      //cube.rotation.y = obj.gyroZ;
      //renderer.render(scene, camera);	
	}
  }, false);

}

function resetPosition(element){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/"+element.id, true);
  //console.log(element.id);
  xhr.send();
}
