import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_DATABASE_URL!);

redis.on("connect", () => {
  console.log("Redis Connected successfully");
});

redis.on("error", (error) => {
  console.log("Error while connecting with redis", error);
});

export default redis;
