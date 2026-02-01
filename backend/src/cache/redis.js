const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.connect();

redisClient.on("connect", () => {
  console.log("Redis connected");
});

module.exports = redisClient;
