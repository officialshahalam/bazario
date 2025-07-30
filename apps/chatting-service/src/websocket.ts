import { kafka } from "@packages/libs/kafka";
import redis from "@packages/libs/radis";
import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

type IncommingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });
  await producer.connect();
  console.log("Kafka Producer connected!");
  wss.on("connection", (ws: WebSocket) => {
    console.log("New Websocket connection!");
    let registeredUserId: string | null = null;
    ws.on("message", async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();
        //register the user on first plain message
        if (!registeredUserId && !messageStr.startsWith("{")) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);
          console.log(`registered web socket for userId:${registeredUserId}`);
          const isSeller = registeredUserId.startsWith("seller_");
          const redisKey = isSeller
            ? `online:seller:${registeredUserId.replace("seller_", "")}`
            : `online:user:${registeredUserId}`;
          await redis.set(redisKey, "1");
          await redis.expire(redisKey, 300);
          return;
        }
        const data: IncommingMessage = JSON.parse(messageStr);
        if (data?.type === "MARK_AS_SEEN" && registeredUserId) {
          const seenKey = `${registeredUserId}_${data?.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
        }
        const {
          conversationId,
          fromUserId,
          toUserId,
          messageBody,
          senderType,
        } = data;
        if (!data || !toUserId || !messageBody || !conversationId) {
          console.warn("Invalid message formate", data);
          return;
        }
        const now = new Date().toISOString();
        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const recieverKey =
          senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`;

        //update unseen count dynamically
        const unseenKey = `${recieverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        // send new message to reciever
        const recieverSocket = connectedUsers.get(recieverKey);
        if (recieverSocket && recieverSocket.readyState === WebSocket.OPEN) {
          recieverSocket.send(messageEvent);

          // also notify unseen count
          recieverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );

          console.log(`Delivered message + unseen count to ${recieverKey}`);
        } else {
          console.log(`User ${recieverKey} is offline. Message queued`);
        }
        //echo to sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to sender ${senderKey}`);
        }

        // push to kafka consumer
        await producer.send({
          topic: "chat.new_message",
          messages: [
            {
              key: conversationId,
              value: JSON.stringify(messagePayload),
            },
          ],
        });
        console.log(`message quied to kafka: ${conversationId}`);
      } catch (error) {
        console.log(`Error processing websocket: ${error}`);
      }
    });
    ws.on("close", async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        console.log(`Disconnected user ${registeredUserId}`);

        const isSeller = registeredUserId.replace("seller_", "");
        const redisKey = isSeller
          ? `online:seller:${registeredUserId.replace("seller_", "")}`
          : `online:user:${registeredUserId}`;
        await redis.del(redisKey);
      }
    });
    ws.on("error", (err) => {
      console.error(`Websocker error:`, err);
    });
  });
  console.log("Websocket server is ready");
}
