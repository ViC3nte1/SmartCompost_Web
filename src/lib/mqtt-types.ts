export interface SensorData {
  temp: number;
  hum: number;
  gas: number;
  fan: number;
  motor: number;
  timestamp?: Date;
}

export interface ControlCommand {
  fan: number;
  motor: number;
}

export interface MqttSettings {
  brokerUrl: string;
  port: number;
  subscribeTopic: string;
  publishTopic: string;
}

export interface ThresholdSettings {
  tempMax: number;
  gasMax: number;
  humMin: number;
  humMax: number;
}

export interface AppSettings {
  mqtt: MqttSettings;
  thresholds: ThresholdSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  mqtt: {
    brokerUrl: "broker.emqx.io",
    port: 8083,
    subscribeTopic: "project/smart_compost/data",
    publishTopic: "project/smart_compost/control",
  },
  thresholds: {
    tempMax: 33,
    gasMax: 500,
    humMin: 40,
    humMax: 80,
  },
};

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";
