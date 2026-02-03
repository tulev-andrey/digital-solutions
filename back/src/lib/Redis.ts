import { createClient } from 'redis'
import { redisConfig } from '../config'
console.log('REDIS_HOST:', process.env.REDIS_HOST)
console.log('REDIS_PORT:', process.env.REDIS_PORT)
export const redis = createClient({
  url: redisConfig.url
})

redis.connect()
