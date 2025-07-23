import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "bazario",
  brokers: [`${process.env.KAFKA_BROKERS || "kafka"}:9092`],
});
