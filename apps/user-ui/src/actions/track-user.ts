"use server";

import { kafka } from "packages/libs/kafka";

const producer = kafka.producer();

export const sendKafkaEvent = async (eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
}) => {
  try {
    await producer.connect();
    await producer.send({
      topic:"users-events",
      messages:[{value:JSON.stringify(eventData)}]
    });

  } catch (error) {
    console.log("Error while send kafka event",error);
  }
  finally{
    await producer.disconnect();
  }
};
