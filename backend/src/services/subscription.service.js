const pool = require("../db/postgres");
const redisClient = require("../cache/redis");

exports.getSubscriptionsByEvent = async (eventType) => {
  const cacheKey = `subscriptions:${eventType}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const result = await pool.query(
    `SELECT * FROM webhook_subscriptions
     WHERE event_type = $1 AND is_active = true`,
    [eventType]
  );

  await redisClient.setEx(
    cacheKey,
    300, // 5 minutes
    JSON.stringify(result.rows)
  );

  return result.rows;
};
