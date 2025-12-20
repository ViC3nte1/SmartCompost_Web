import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

const Settings = () => {
  const { settings, updateMqttSettings, updateThresholds, resetToDefaults } = useSettings();
  
  const [mqttForm, setMqttForm] = useState(settings.mqtt);
  const [thresholdForm, setThresholdForm] = useState(settings.thresholds);

  const handleSaveMqtt = () => {
    updateMqttSettings(mqttForm);
    toast.success("Pengaturan MQTT berhasil disimpan");
  };

  const handleSaveThresholds = () => {
    updateThresholds(thresholdForm);
    toast.success("Pengaturan Threshold berhasil disimpan");
  };

  const handleReset = () => {
    resetToDefaults();
    setMqttForm({
      brokerUrl: "broker.emqx.io",
      port: 8083,
      subscribeTopic: "project/smart_compost/data",
      publishTopic: "project/smart_compost/control",
    });
    setThresholdForm({
      tempMax: 33,
      gasMax: 500,
      humMin: 40,
      humMax: 80,
    });
    toast.success("Pengaturan dikembalikan ke default");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
                <p className="text-sm text-muted-foreground">
                  Konfigurasi MQTT dan Threshold
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset ke Default
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
        {/* MQTT Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10">🔌</span>
              Konfigurasi MQTT
            </CardTitle>
            <CardDescription>
              Pengaturan koneksi ke broker MQTT untuk komunikasi dengan ESP32
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brokerUrl">URL Broker</Label>
                <Input
                  id="brokerUrl"
                  value={mqttForm.brokerUrl}
                  onChange={(e) =>
                    setMqttForm({ ...mqttForm, brokerUrl: e.target.value })
                  }
                  placeholder="broker.emqx.io"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port WebSocket</Label>
                <Input
                  id="port"
                  type="number"
                  value={mqttForm.port}
                  onChange={(e) =>
                    setMqttForm({ ...mqttForm, port: parseInt(e.target.value) || 8083 })
                  }
                  placeholder="8083"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscribeTopic">Topik Subscribe (Terima Data)</Label>
              <Input
                id="subscribeTopic"
                value={mqttForm.subscribeTopic}
                onChange={(e) =>
                  setMqttForm({ ...mqttForm, subscribeTopic: e.target.value })
                }
                placeholder="project/smart_compost/data"
              />
              <p className="text-xs text-muted-foreground">
                Topik untuk menerima data sensor dari ESP32
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishTopic">Topik Publish (Kirim Kontrol)</Label>
              <Input
                id="publishTopic"
                value={mqttForm.publishTopic}
                onChange={(e) =>
                  setMqttForm({ ...mqttForm, publishTopic: e.target.value })
                }
                placeholder="project/smart_compost/control"
              />
              <p className="text-xs text-muted-foreground">
                Topik untuk mengirim perintah ke ESP32
              </p>
            </div>

            <Button onClick={handleSaveMqtt} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Simpan Pengaturan MQTT
            </Button>
          </CardContent>
        </Card>

        {/* Threshold Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-warning/10">⚠️</span>
              Batas Peringatan (Threshold)
            </CardTitle>
            <CardDescription>
              Atur nilai batas untuk trigger peringatan otomatis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tempMax">Batas Suhu Maksimum (°C)</Label>
                <Input
                  id="tempMax"
                  type="number"
                  value={thresholdForm.tempMax}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      tempMax: parseFloat(e.target.value) || 33,
                    })
                  }
                  placeholder="33"
                />
                <p className="text-xs text-muted-foreground">
                  Peringatan jika suhu melebihi nilai ini
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gasMax">Batas Gas Amonia (PPM)</Label>
                <Input
                  id="gasMax"
                  type="number"
                  value={thresholdForm.gasMax}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      gasMax: parseInt(e.target.value) || 500,
                    })
                  }
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground">
                  Peringatan jika gas melebihi nilai ini
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="humMin">Kelembapan Minimum (%)</Label>
                <Input
                  id="humMin"
                  type="number"
                  value={thresholdForm.humMin}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      humMin: parseInt(e.target.value) || 40,
                    })
                  }
                  placeholder="40"
                />
                <p className="text-xs text-muted-foreground">
                  Peringatan jika kelembapan di bawah nilai ini
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="humMax">Kelembapan Maksimum (%)</Label>
                <Input
                  id="humMax"
                  type="number"
                  value={thresholdForm.humMax}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      humMax: parseInt(e.target.value) || 80,
                    })
                  }
                  placeholder="80"
                />
                <p className="text-xs text-muted-foreground">
                  Peringatan jika kelembapan melebihi nilai ini
                </p>
              </div>
            </div>

            <Button onClick={handleSaveThresholds} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Simpan Pengaturan Threshold
            </Button>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <h3 className="font-semibold text-foreground mb-2">📋 Format Data ESP32</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Pastikan ESP32 Anda mengirim data dengan format JSON berikut:
            </p>
            <pre className="bg-card p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(
                { temp: 32.5, hum: 60.0, gas: 450, fan: 1, motor: 255 },
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
