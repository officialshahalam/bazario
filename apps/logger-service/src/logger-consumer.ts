import { kafka } from "@packages/libs/kafka";

import { clients } from "./main";

const consumer = kafka.consumer({ groupId: "log-events-group" });

const logQueue: string[] = [];

//websocket processing function for logs
const processLog = () => {
  if (logQueue.length === 0) return;
  console.log(`processing ${logQueue.length} logs in batch`);
  const logs = [...logQueue];
  logQueue.length = 0;
  clients.forEach((client) => {
    logs.forEach((log) => {
      client.send(log);
    });
  });
};

setInterval(processLog, 3000);

//consume log message from kafka

export const consumeKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const log = message.value.toString();
      logQueue.push(log);
    },
  });
};

// start ksfks consumer
consumeKafkaMessages().catch(console.error);
