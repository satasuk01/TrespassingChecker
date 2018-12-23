#include <Adafruit_GFX.h>
#include <ESP8266WiFi.h>
#include <MicroGear.h>

const char* ssid = "Sese De Machete";
const char* password = "0890044088";

#define APPID   "TrespassingChecker"
#define KEY     "70fGH7fm3cWmKjN"
#define SECRET  "rKfBbE2yvnJSUgIpbwLH0aveb"
#define ALIAS   "TChecker"

WiFiClient client;

int timer = 0;
MicroGear microgear(client);
const char* s = "Testing";
char c;

void onMsghandler(char *topic, uint8_t* msg, unsigned int msglen) {
  Serial.print("Incoming message --> ");
  msg[msglen] = '\0';
  Serial.println((char *)msg);
}

void onFoundgear(char *attribute, uint8_t* msg, unsigned int msglen) {
  Serial.print("Found new member --> ");
  for (int i = 0; i < msglen; i++)
    Serial.print((char)msg[i]);
  Serial.println();
}

void onLostgear(char *attribute, uint8_t* msg, unsigned int msglen) {
  Serial.print("Lost member --> ");
  for (int i = 0; i < msglen; i++)
    Serial.print((char)msg[i]);
  Serial.println();
}

/* When a microgear is connected, do this */
void onConnected(char *attribute, uint8_t* msg, unsigned int msglen) {
  Serial.println("Connected to NETPIE...");
  /* Set the alias of this microgear ALIAS */
  microgear.setAlias(ALIAS);
}

void setup() {
  // put your setup code here, to run once:
  microgear.on(MESSAGE, onMsghandler);
  microgear.on(PRESENT, onFoundgear);
  microgear.on(ABSENT, onLostgear);
  microgear.on(CONNECTED, onConnected);
  
  Serial.begin(115200);
  Serial.println("Starting...");
  //Start Setup WiFi
 
  WiFi.begin(ssid,password);
  while(WiFi.status() != WL_CONNECTED)
  {
    delay(250);
    Serial.print(".");
  }
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  //End Setup WiFi
  //Start Setup Microgear
  microgear.init(KEY,SECRET,ALIAS);
  microgear.connect(APPID);
}

void loop() {
  
  /* To check if the microgear is still connected */
  if (microgear.connected()) {
    Serial.println("connected");

    /* Call this method regularly otherwise the connection may be lost */
    microgear.loop();

    if (timer >= 1000) {
      if(Serial.available()) {
        String s = Serial.readString(); //read from uart
        String jsonData = "pass:"+s;
        jsonData += "";
        Serial.println("Publish...");
        Serial.println("String is " + s);
        microgear.chat("HTML_web",s);  
          microgear.writeFeed("PassLog",jsonData);
        Serial.println(jsonData);
      }
      /* Chat with the microgear named ALIAS which is myself */
      timer = 0;
    }
    else timer += 100;
  }
  else {
    Serial.println("connection lost, reconnect...");
    if (timer >= 5000) {
      microgear.connect(APPID);
      timer = 0;
    }
    else timer += 100;
  }
  delay(100);
}
