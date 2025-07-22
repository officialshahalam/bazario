import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "bazario",
  brokers: ["kafka:9092"], // now resolves to kafka:9092 inside the network
});
