import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "webvirtus",
  brokers: [process.env.KAFKA_BROKERS!],
});
