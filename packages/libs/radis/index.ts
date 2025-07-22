import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis", // docker service name
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
});

redis.on("connect", () => {
  console.log("Redis Connected successfully");
});

redis.on("error", (error) => {
  console.log("Error while connecting with redis", error);
});

export default redis;
