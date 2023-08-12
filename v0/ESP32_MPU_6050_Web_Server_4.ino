/*********
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-mpu-6050-web-server/
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files.
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*********/

#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
//#include <Adafruit_MPU6050.h>
//#include <Adafruit_Sensor.h>
#include <Arduino_JSON.h>
#include "SPIFFS.h"

char serialData[30];   //array to hold received serial string

// Replace with your network credentials
const char* ssid = "avespana3002";
const char* password = "Arica2020";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Create an Event Source on /events
AsyncEventSource events("/events");

// Json Variable to Hold Sensor Readings
JSONVar readings;

// Timer variables
unsigned long lastTime = 0;  
unsigned long lastTimeTemperature = 0;
unsigned long lastTimeAcc = 0;
unsigned long gyroDelay = 200;
unsigned long temperatureDelay = 1000;
unsigned long accelerometerDelay = 200;

// Create a sensor object
//Adafruit_MPU6050 mpu;

//sensors_event_t a, g, temp;

float gyroX, gyroY, gyroZ;
float accX, accY, accZ;
float temperature;

//Gyroscope sensor deviation
float gyroXerror =  0.08;
float gyroYerror =  0.01;
float gyroZerror =  0.01;

//

//   MEJORADO 
//   se envia solo COUNT que representa el avance en un sentido para un lapso de tiempo en este caso 1/4 de segundo 250miliseg,
//   este dato se puede interpretar como N grados por cada paso desde el usuario final ,ej: 10grados por cada paso o 1grado por paso



const int portA = 34;
const int portB = 35;
int pulses=0, A_SIG=0, B_SIG=0, A_SIG_r=0, B_SIG_r=0;
int time_ret=1;
int count=0;

int prom_pulse=0, pulse1=0, pulse2=0;

volatile unsigned long lst_micros = 0;

/*
#include "Simple_MPU6050.h"         // incluye libreria Simple_MPU6050
#define MPU6050_ADDRESS_AD0_LOW     0x68      // direccion I2C con AD0 en LOW o sin conexion
#define MPU6050_ADDRESS_AD0_HIGH    0x69      // direccion I2C con AD0 en HIGH
#define MPU6050_DEFAULT_ADDRESS     MPU6050_ADDRESS_AD0_LOW // por defecto AD0 en LOW

Simple_MPU6050 mpu;       // crea objeto con nombre mpu
// ENABLE_MPU_OVERFLOW_PROTECTION();    // activa proteccion, ya no se requiere

// #define OFFSETS  -5114,     484,    1030,      46,     -14,       6  // Colocar valores personalizados

#define spamtimer(t) for (static uint32_t SpamTimer; (uint32_t)(millis() - SpamTimer) >= (t); SpamTimer = millis())
// spamtimer funcion para generar demora al escribir en monitor serie sin usar delay()

#define printfloatx(Name,Variable,Spaces,Precision,EndTxt) print(Name); {char S[(Spaces + Precision + 3)];Serial.print(F(" ")); Serial.print(dtostrf((float)Variable,Spaces,Precision ,S));}Serial.print(EndTxt);
// printfloatx funcion para mostrar en monitor serie datos para evitar el uso se multiples print()

// mostrar_valores funcion que es llamada cada vez que hay datos disponibles desde el sensor
void mostrar_valores (int16_t *gyro, int16_t *accel, int32_t *quat, uint32_t *timestamp) {  
  uint8_t SpamDelay = 100;      // demora para escribir en monitor serie de 100 mseg
  Quaternion q;         // variable necesaria para calculos posteriores
  VectorFloat gravity;        // variable necesaria para calculos posteriores
  float ypr[3] = { 0, 0, 0 };     // array para almacenar valores de yaw, pitch, roll
  float xyz[3] = { 0, 0, 0 };     // array para almacenar valores convertidos a grados de yaw, pitch, roll
  spamtimer(SpamDelay) {      // si han transcurrido al menos 100 mseg entonces proceder
    mpu.GetQuaternion(&q, quat);    // funcion para obtener valor para calculo posterior
    mpu.GetGravity(&gravity, &q);   // funcion para obtener valor para calculo posterior
    mpu.GetYawPitchRoll(ypr, &q, &gravity); // funcion obtiene valores de yaw, ptich, roll
    mpu.ConvertToDegrees(ypr, xyz);   // funcion convierte a grados sexagesimales
    Serial.printfloatx(F("Yaw")  , xyz[0], 9, 4, F(",   "));  // muestra en monitor serie rotacion de eje Z, yaw
    Serial.printfloatx(F("Pitch"), xyz[1], 9, 4, F(",   "));  // muestra en monitor serie rotacion de eje Y, pitch
    Serial.printfloatx(F("Roll") , xyz[2], 9, 4, F(",   "));  // muestra en monitor serie rotacion de eje X, roll
    Serial.println();       // salto de linea
  }
}




//


// Init MPU6050
void initMPU(){
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");
}
*/


void initSPIFFS() {
  if (!SPIFFS.begin()) {
    Serial.println("An error has occurred while mounting SPIFFS");
  }
  Serial.println("SPIFFS mounted successfully");
}

// Initialize WiFi
void initWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("");
  Serial.println(WiFi.localIP());
}

String getPasosReadings(){
  String S_count;
  
  //readings["gyroX"] = String(gyroX);
  //readings["gyroY"] = String(gyroY);
  //readings["gyroZ"] = String(gyroZ);

  //String jsonString = JSON.stringify(readings);
  //return jsonString;

  S_count = String(count);
  count = 0;
  return S_count;
}









void A_COUNT_UP(){
  if((long)(micros() - lst_micros) < time_ret*1000) return;
  lst_micros = micros();
  detachInterrupt(portA);

  A_SIG = 1;
  if(A_SIG == B_SIG) {pulses=-1;}   // si el que cambio es igual al otro avanza
  else {pulses=+1;}                     // si es distinto retrocede
  count+=pulses;

 //Serial.printf("A:%d h:%d  b:%d v:%d  P:%d  C:%d\n", A_SIG+3, A_SIG_r+1, B_SIG-1, B_SIG_r-3, pulses, count);
  attachInterrupt(digitalPinToInterrupt(portA), A_COUNT_DW , FALLING); //RISING
}

void B_COUNT_UP(){
  if((long)(micros() - lst_micros) < time_ret*1000) return;
  lst_micros = micros();
  detachInterrupt(portB);

  B_SIG = 1;
  if(B_SIG == A_SIG) pulses=1;   // si el que cambio es igual al otro avanza
  else pulses=-1;                     // si es distinto retrocede
  count+=pulses;
  
 //Serial.printf("b:%d h:%d  B:%d v:%d  P:%d  C:%d\n", A_SIG+3, A_SIG_r+1, B_SIG-1, B_SIG_r-3, pulses, count);
  attachInterrupt(digitalPinToInterrupt(portB), B_COUNT_DW, FALLING);
}

void A_COUNT_DW(){
  if((long)(micros() - lst_micros) < time_ret*1000) return;
  lst_micros = micros();
  detachInterrupt(portA);

  A_SIG = 0;
  if(A_SIG == B_SIG) {pulses=-1;}   // si el que cambio es igual al otro avanza
  else {pulses=1;}                     // si es distinto retrocede
  count+=pulses;

 //Serial.printf("A:%d h:%d  b:%d v:%d  P:%d  C:%d\n", A_SIG+3, A_SIG_r+1, B_SIG-1, B_SIG_r-3, pulses, count);
  attachInterrupt(digitalPinToInterrupt(portA), A_COUNT_UP , RISING); //RISING
}

void B_COUNT_DW(){
  if((long)(micros() - lst_micros) < time_ret*1000) return;
  lst_micros = micros();
  detachInterrupt(portB);

  B_SIG = 0;
  if(A_SIG == B_SIG) {pulses=+1;}   // si el que cambio es igual al otro avanza
  else {pulses=-1;}                     // si es distinto retrocede
  count+=pulses;
  
 //Serial.printf("a:%d h:%d  B:%d v:%d  P:%d  C:%d\n", A_SIG+3, A_SIG_r+1, B_SIG-1, B_SIG_r-3, pulses, count);
  attachInterrupt(digitalPinToInterrupt(portB), B_COUNT_UP , RISING);
}



/*
String getGyroReadings(){
  mpu.getEvent(&a, &g, &temp);

  float gyroX_temp = g.gyro.x;
  if(abs(gyroX_temp) > gyroXerror)  {
    gyroX += gyroX_temp/50.00;
    //gyroX = gyroX_temp;
  }
  
  float gyroY_temp = g.gyro.y;
  if(abs(gyroY_temp) > gyroYerror) {
    gyroY += gyroY_temp/70.00;
    //gyroY = gyroY_temp;
  }

  float gyroZ_temp = g.gyro.z;
  if(abs(gyroZ_temp) > gyroZerror) {
    gyroZ += gyroZ_temp/90.00;
    //gyroZ = gyroZ_temp;
  }

  readings["gyroX"] = String(gyroX);
  readings["gyroY"] = String(gyroY);
  readings["gyroZ"] = String(gyroZ);

  String jsonString = JSON.stringify(readings);
  return jsonString;
}

String getAccReadings() {
  mpu.getEvent(&a, &g, &temp);
  // Get current acceleration values
  accX = a.acceleration.x;
  accY = a.acceleration.y;
  accZ = a.acceleration.z;
  readings["accX"] = String(accX);
  readings["accY"] = String(accY);
  readings["accZ"] = String(accZ);
  String accString = JSON.stringify (readings);
  return accString;
}

String getTemperature(){
  mpu.getEvent(&a, &g, &temp);
  temperature = temp.temperature;
  return String(temperature);
}

String getSerial(){
  byte y = Serial.available(); //check if a character has arrived
  if(y != 0)
  {
    byte m = Serial.readBytesUntil('\n', serialData, 30); //receive charcaters until Newline is detected
    serialData[m] = '\0'; //insert null-character at end of character array - char myData[]
    Serial.println(serialData);  //show the received string
    //------extract 100 from Value = 100 ---------------------------
    memset(serialData, 0x30, 8); //replace first 8 characters of myData[] array by ASCII codes of 0s
    //int z = atoi(serialData);   //use atoi() (ASCII to Integer) function; z = 0x64 = 100
    float z = atof(serialData);   //use atoi() (ASCII to Integer) function; z = 0x64 = 100
    Serial.println(z*100, DEC);  //Serial Monitor shows: 100
    gyroXerror = z;
    //---------------------------------------------------------------
    memset(serialData, 0x00, 30);     //reset the whole arry to 0s. 
  }  

}





//


void setupMPU() {
  uint8_t val;
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE  // activacion de bus I2C a 400 Khz
  Wire.begin();
  Wire.setClock(400000);
#elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
  Fastwire::setup(400, true);
#endif
  
  //Serial.begin(115200);     // inicializacion de monitor serie a 115200 bps
  while (!Serial);      // espera a enumeracion en caso de modelos con USB nativo
  Serial.println(F("Inicio:"));   // muestra texto estatico
#ifdef OFFSETS                // si existen OFFSETS
  Serial.println(F("Usando Offsets predefinidos"));     // texto estatico
  mpu.SetAddress(MPU6050_ADDRESS_AD0_LOW).load_DMP_Image(OFFSETS);  // inicializacion de sensor

#else                   // sin no existen OFFSETS
  Serial.println(F(" No se establecieron Offsets, haremos unos nuevos.\n" // muestra texto estatico
                   " Colocar el sensor en un superficie plana y esperar unos segundos\n"
                   " Colocar los nuevos Offsets en #define OFFSETS\n"
                   " para saltar la calibracion inicial \n"
                   " \t\tPresionar cualquier tecla y ENTER"));
  while (Serial.available() && Serial.read());    // lectura de monitor serie
  while (!Serial.available());        // si no hay espera              
  while (Serial.available() && Serial.read());    // lecyura de monitor serie
  mpu.SetAddress(MPU6050_ADDRESS_AD0_LOW).CalibrateMPU().load_DMP_Image();  // inicializacion de sensor
#endif
  mpu.on_FIFO(mostrar_valores);   // llamado a funcion mostrar_valores si memoria FIFO tiene valores
}


//

*/


void setup() {
  Serial.begin(115200);
  initWiFi();
  initSPIFFS();
  //initMPU();
  //setupMPU();

  Serial.println("Enter data in this style <valor = 0.07>  ");
  Serial.println();

  pinMode(portA, INPUT);
  pinMode(portB, INPUT); //INPUT_PULLUP  

  attachInterrupt(digitalPinToInterrupt(portA), A_COUNT_DW, CHANGE); //RISING
  attachInterrupt(digitalPinToInterrupt(portB), B_COUNT_DW, CHANGE);

  setup_server();
}

void setup_server() {
  // Handle Web Server
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", "text/html");
  });

  server.serveStatic("/", SPIFFS, "/");

  server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request){
    gyroX=0;
    gyroY=0;
    gyroZ=0;
    request->send(200, "text/plain", "OK");
  });

  server.on("/resetX", HTTP_GET, [](AsyncWebServerRequest *request){
    gyroX=0;
    request->send(200, "text/plain", "OK");
  });

  server.on("/resetY", HTTP_GET, [](AsyncWebServerRequest *request){
    gyroY=0;
    request->send(200, "text/plain", "OK");
  });

  server.on("/resetZ", HTTP_GET, [](AsyncWebServerRequest *request){
    gyroZ=0;
    request->send(200, "text/plain", "OK");
  });

  // Handle Web Server Events
  events.onConnect([](AsyncEventSourceClient *client){
    if(client->lastId()){
      Serial.printf("Client reconnected! Last message ID that it got is: %u\n", client->lastId());
    }
    // send event with message "hello!", id current millis
    // and set reconnect delay to 1 second
    client->send("hello!", NULL, millis(), 10000);
  });
  server.addHandler(&events);

  server.begin();
}

void loop() {
 // mpu.dmp_read_fifo();    // funcion que evalua si existen datos nuevos en el sensor y llama
       // a funcion mostrar_valores si es el caso
 // getSerial();

  if ((millis() - lastTime) > gyroDelay) {
    // Send Events to the Web Server with the Sensor Readings
    events.send(getPasosReadings().c_str(),"pasos_reading", millis());
    count = 0;
    lastTime = millis();
  }

  /*
  if ((millis() - lastTime) > gyroDelay) {
    // Send Events to the Web Server with the Sensor Readings
    events.send(getGyroReadings().c_str(),"gyro_readings",millis());
    lastTime = millis();
  }
  if ((millis() - lastTimeAcc) > accelerometerDelay) {
    // Send Events to the Web Server with the Sensor Readings
    events.send(getAccReadings().c_str(),"accelerometer_readings",millis());
    lastTimeAcc = millis();
  }
  if ((millis() - lastTimeTemperature) > temperatureDelay) {
    // Send Events to the Web Server with the Sensor Readings
    events.send(getTemperature().c_str(),"temperature_reading",millis());
    lastTimeTemperature = millis();
  }
  */
}











/*
  Capitulo 65 de Arduino desde cero en Español.
  Visualizacion por monitor serie de las lecturas del MPU6050 para yaw, pitch y roll.
  Requiere librerias I2cdev y Simple_MPU6050

  Codigo basado en el programa de ejemplo incluido en la libreria Simple_MPU6050

  https://www.youtube.com/c/BitwiseAr
  Autor: bitwiseAr  

*/
