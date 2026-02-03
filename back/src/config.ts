import 'dotenv/config'

export const rabbitConfig = {
  url: `amqp://${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`,
  queueName: 'queue',
  prefetch: 100,
  batchIntervalMs: 10 * 1000
}

export const redisConfig = {
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  deduplicationTtlSec: 60 * 60 * 24
}
