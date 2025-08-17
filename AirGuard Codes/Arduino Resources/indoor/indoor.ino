#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WiFi credentials
const char* ssid = "realme 7";
const char* password = "heimerdinger08";

// Server URL for indoor data
const char* serverUrl = "https://airguard.lol/dashboard.php?endpoint=indoor";

// DHT11 settings
#define DHTPIN 2  // GPIO pin for DHT11
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// MQ135 settings
#define MQ135_PIN 34  // Analog pin for MQ135

// LED settings
#define LED_PIN 13  // GPIO pin for LED

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(LED_PIN, OUTPUT);  // Set LED pin as output
  digitalWrite(LED_PIN, LOW);  // Turn off LED initially

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int airQuality = analogRead(MQ135_PIN); // Read air quality from MQ135

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Check air quality and control LED
    if (airQuality > 1000) {
      digitalWrite(LED_PIN, HIGH);  // Turn on LED
    } else {
      digitalWrite(LED_PIN, LOW);   // Turn off LED
    }

    // Prepare JSON payload
    String payload = "{\"temperature\":" + String(temperature, 2) +
                     ",\"humidity\":" + String(humidity, 2) +
                     ",\"air_quality\":" + String(airQuality) + "}";

    // Send data to the server
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(payload);
    Serial.println(payload);
    if (httpResponseCode > 0) {
      Serial.println("Indoor data sent successfully!");
    } else {
      Serial.print("Error sending indoor data: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi disconnected!");
  }

  delay(5000); // Send data every 5 seconds
}