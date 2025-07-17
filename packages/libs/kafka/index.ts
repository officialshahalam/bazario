import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "bazario",
  brokers: ["localhost:9092"],
});

