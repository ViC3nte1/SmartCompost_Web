
---

# Technical Specification: Smart Compost Monitoring (Hybrid Architecture)

## 1. Ringkasan Eksekutif

Sistem ini bertujuan untuk memantau parameter lingkungan pengomposan (Suhu, Kelembapan, Gas Amonia) dan mengendalikan aktuator (Kipas, Motor Mixer) secara nirkabel.

Sistem menggunakan arsitektur **Hybrid IoT**:

* **Data Transport:** Menggunakan **Internet (Cloud MQTT)** sebagai jembatan komunikasi.
* **User Interface:** Menggunakan **Local Web Server (Laptop)** untuk visualisasi data dan panel kendali.

## 2. Arsitektur Sistem

Aliran data terjadi dalam pola "Jembatan Cloud":

1. **Edge Node (ESP32):** Terhubung ke Hotspot HP  Kirim data ke Cloud Broker.
2. **Cloud Broker (EMQX):** Menerima data dari ESP32 dan menahannya sementara.
3. **Local Server (Laptop):** Terhubung ke Internet  Mengambil data dari Cloud Broker  Menampilkan di Browser Laptop.

## 3. Spesifikasi Teknis

### A. Hardware (Edge Side)

* **MCU:** ESP32 DevKit V1.
* **Network:** WiFi 2.4GHz (Tethering via HP).
* **Sensors:** DHT22 (Pin 5), MQ135 (Pin 34).
* **Actuators:** Relay Kipas (Pin 14), Driver Motor PWM (Pin 19).

### B. Cloud Services (The Bridge)

* **Provider:** EMQX Public Broker (`broker.emqx.io`).
* **Protocol:** MQTT v3.1.1 (TCP).
* **Port:** 1883.
* **QoS:** Level 0 (At most once - Cukup untuk monitoring).

### C. Software Stack (Laptop Side)

* **OS:** Windows 10/11 atau Linux.
* **Runtime:** Python 3.9+.
* **Backend Framework:** **Flask** (Micro-web framework).
* **MQTT Client:** Library **Paho-MQTT**.
* **Frontend:** HTML5, Bootstrap 5, **Chart.js** (Visualisasi Real-time).

## 4. Protokol Data (Interface Contract)

Agar ESP32 dan Laptop bisa saling mengerti, format data disepakati sebagai berikut:

### 1. Topik MQTT

* **Data Sensor (Subscribe oleh Laptop):** `project/smart_compost/data`
* **Status Sistem (Subscribe oleh Laptop):** `project/smart_compost/status`

### 2. Payload JSON (Format Data)

Data dikirim setiap 2 detik dari ESP32:

```json
{
  "temp": 34.5,
  "hum": 61.2,
  "gas": 480,
  "fan": 1,
  "motor": 255
}

```

## 5. Implementasi Backend (Python Logic)

Pada laptop, kita akan menjalankan script Python tunggal (`app.py`) yang melakukan dua tugas secara paralel (Multithreading):

1. **Thread A (MQTT Listener):**
* Konek ke `broker.emqx.io`.
* Mendengarkan topik `project/smart_compost/data`.
* Saat data masuk  Simpan ke variabel global `current_data`.


2. **Thread B (Web Server):**
* Menjalankan Flask Server di `http://localhost:5000`.
* Menyediakan endpoint API `/data` yang memberikan isi `current_data` ke browser.



## 6. Persiapan Lingkungan (Setup Guide)

Sebelum menjalankan sistem, Fajar perlu menginstal dependensi berikut di laptop:

**1. Install Python & Library**
Buka Command Prompt (CMD) atau Terminal, lalu ketik:

```bash
pip install flask paho-mqtt

```

**2. Struktur Folder**
Buat folder baru bernama `compost_project`, lalu buat struktur seperti ini:

```text
compost_project/
├── app.py              <-- Script Python Utama
└── templates/
    └── index.html      <-- Tampilan Website (HTML)

```

## 7. Kode Implementasi (Copy-Paste Ready)

Berikut adalah kode yang perlu kamu masukkan ke file di Laptop.

### File 1: `app.py`

```python
from flask import Flask, render_template, jsonify
import paho.mqtt.client as mqtt
import json
import threading

app = Flask(__name__)

# --- KONFIGURASI MQTT ---
MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC = "project/smart_compost/data"

# Variabel Global (Penampung Data Sementara)
# Data ini akan di-update oleh MQTT dan dibaca oleh Website
sensor_data = {
    "temp": 0, "hum": 0, "gas": 0, 
    "fan": 0, "motor": 0
}

# --- FUNGSI MQTT ---
def on_connect(client, userdata, flags, rc):
    print("Terhubung ke Broker MQTT!")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    global sensor_data
    try:
        # Decode JSON dari ESP32
        payload = msg.payload.decode()
        print(f"Data Masuk: {payload}")
        data = json.loads(payload)
        
        # Update variabel global
        sensor_data = data
    except Exception as e:
        print(f"Error parsing JSON: {e}")

def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    print("Menghubungkan ke MQTT Broker...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()

# --- FUNGSI WEB SERVER (FLASK) ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    # Website akan memanggil ini setiap detik untuk minta data terbaru
    return jsonify(sensor_data)

if __name__ == '__main__':
    # 1. Jalankan MQTT di Thread terpisah (Background)
    mqtt_thread = threading.Thread(target=start_mqtt)
    mqtt_thread.daemon = True
    mqtt_thread.start()

    # 2. Jalankan Web Server
    print("Web Server berjalan di http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)

```

### File 2: `templates/index.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Compost Monitor</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        .card-value { font-size: 2.5rem; font-weight: bold; }
        .status-on { color: green; font-weight: bold; }
        .status-off { color: red; font-weight: bold; }
    </style>
</head>
<body class="bg-light">

<div class="container py-5">
    <h1 class="text-center mb-4">🌿 Monitoring Kompos Cerdas</h1>

    <div class="row text-center mb-4">
        <div class="col-md-4">
            <div class="card p-3 shadow-sm">
                <h5>Suhu (°C)</h5>
                <div id="val-temp" class="card-value text-danger">--</div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card p-3 shadow-sm">
                <h5>Kelembapan (%)</h5>
                <div id="val-hum" class="card-value text-primary">--</div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card p-3 shadow-sm">
                <h5>Gas Amonia (PPM)</h5>
                <div id="val-gas" class="card-value text-warning">--</div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="alert alert-secondary text-center">
                <h4>Kipas Pendingin</h4>
                <span id="status-fan" class="status-off">MATI</span>
            </div>
        </div>
        <div class="col-md-6">
            <div class="alert alert-secondary text-center">
                <h4>Motor Pengaduk</h4>
                <span id="status-motor" class="status-off">MATI</span>
                <br><small>Speed: <span id="val-motor">0</span></small>
            </div>
        </div>
    </div>
</div>

<script>
    // Fungsi untuk mengambil data dari Python setiap 1 detik
    function updateData() {
        $.getJSON('/api/data', function(data) {
            // Update Angka
            $('#val-temp').text(data.temp);
            $('#val-hum').text(data.hum);
            $('#val-gas').text(data.gas);
            $('#val-motor').text(data.motor);

            // Update Status Kipas
            if(data.fan == 1 || data.fan == true) {
                $('#status-fan').text("MENYALA").removeClass('status-off').addClass('status-on');
            } else {
                $('#status-fan').text("MATI").removeClass('status-on').addClass('status-off');
            }

            // Update Status Motor
            if(data.motor > 0) {
                $('#status-motor').text("MENYALA").removeClass('status-off').addClass('status-on');
            } else {
                $('#status-motor').text("MATI").removeClass('status-on').addClass('status-off');
            }
        });
    }

    // Jalankan updateData setiap 1000ms (1 detik)
    setInterval(updateData, 1000);
</script>

</body>
</html>

```
---