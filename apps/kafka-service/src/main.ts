import { kafka } from "@packages/libs/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafka.consumer({ groupId: "user-event-group" });
const admin = kafka.admin();

(async function () {
  try {
    await admin.connect();
    const result = await admin.createTopics({
      topics: [
        { topic: "users-events", numPartitions: 6 },
        { topic: "chat.new_message", numPartitions: 6 },
      ],
    });
    if (result) {
      console.log("Topic Created:");
    } else {
      console.log("Topic is not created");
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    await admin.disconnect();
  }
})();

(async () => {
  await admin.connect();

  const topics = await admin.listTopics();
  console.log("Topics:", topics);

  await admin.disconnect();
})();

const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) return;
  const events = [...eventQueue];
  eventQueue.length = 0;
  for (const event of events) {
    if (event.action === "shop-visit") {
      //update shop analytics
    }
    const validActions = [
      "add_to_cart",
      "remove_from_cart",
      "add_to_wishlist",
      "remove_from_wishlist",
      "product_view",
    ];
    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }
    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log("Error processing event: ", error);
    }
  }
};

setInterval(processQueue, 3000);

export const consumeKafkaMessage = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "users-events", fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
};

consumeKafkaMessage().catch((e) => console.log(e));
