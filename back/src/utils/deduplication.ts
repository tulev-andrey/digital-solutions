import { redis } from '../lib/Redis'
import { redisConfig } from '../config'

export async function isDuplicate(id: number) {
  const key = `dedup:${id}`

  const result = await redis.set(key, '1', {
    NX: true,
    EX: redisConfig.deduplicationTtlSec
  })

  return result === null
}
