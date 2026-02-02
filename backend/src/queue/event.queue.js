import { Queue } from "bullmq";
import redisConfig from "../config/redis.config.js";

const eventQueue = new Queue("event-delivery", redisConfig);

export default eventQueue;
