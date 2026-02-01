const { Queue } = require("bullmq");
const redisConfig = require("../config/redis.config");

const eventQueue = new Queue("event-delivery", redisConfig);

module.exports = eventQueue;
