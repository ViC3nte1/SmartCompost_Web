import { useState, useEffect, useCallback, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import { SensorData, ControlCommand, ConnectionStatus, MqttSettings } from "@/lib/mqtt-types";

interface UseMqttOptions {
  settings: MqttSettings;
  onMessage?: (data: SensorData) => void;
}

export const useMqtt = ({ settings, onMessage }: UseMqttOptions) => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastData, setLastData] = useState<SensorData | null>(null);
  const clientRef = useRef<MqttClient | null>(null);

  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
    }

    setStatus("connecting");

    const url = `ws://${settings.brokerUrl}:${settings.port}/mqtt`;
    console.log("Connecting to MQTT broker:", url);

    const client = mqtt.connect(url, {
      clientId: `smart_compost_${Math.random().toString(16).substring(2, 10)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      console.log("MQTT Connected!");
      setStatus("connected");
      client.subscribe(settings.subscribeTopic, (err) => {
        if (err) {
          console.error("Subscribe error:", err);
        } else {
          console.log("Subscribed to:", settings.subscribeTopic);
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString()) as SensorData;
        data.timestamp = new Date();
        console.log("Received data:", data);
        setLastData(data);
        onMessage?.(data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    client.on("error", (error) => {
      console.error("MQTT Error:", error);
      setStatus("error");
    });

    client.on("close", () => {
      console.log("MQTT Disconnected");
      setStatus("disconnected");
    });

    client.on("reconnect", () => {
      console.log("MQTT Reconnecting...");
      setStatus("connecting");
    });
  }, [settings, onMessage]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setStatus("disconnected");
    }
  }, []);

  const publishControl = useCallback(
    (command: ControlCommand) => {
      if (clientRef.current && status === "connected") {
        const payload = JSON.stringify(command);
        console.log("Publishing control:", payload, "to", settings.publishTopic);
        clientRef.current.publish(settings.publishTopic, payload);
      } else {
        console.warn("Cannot publish: not connected");
      }
    },
    [settings.publishTopic, status]
  );

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, []);

  return {
    status,
    lastData,
    connect,
    disconnect,
    publishControl,
  };
};
