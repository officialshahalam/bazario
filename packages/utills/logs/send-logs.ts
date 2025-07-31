import { kafka } from "../../libs/kafka/index";

const producer = kafka.producer();

export async function sendLog({
  type = "info",
  message,
  source = "unknown-service",
}: {
  type?: "success" | "error" | "warning" | "info" | "debug";
  message: string;
  source?: string;
}) {
  const logPayload = {
    type,
    message,
    timestamp: new Date().toISOString(),
    source,
  };

  await producer.connect();
  await producer.send({
    topic: "logs",
    messages: [{ value: JSON.stringify(logPayload) }],
  });
  await producer.disconnect();
}
