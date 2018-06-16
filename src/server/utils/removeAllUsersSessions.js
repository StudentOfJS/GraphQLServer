import { redisSessionPrefix, userSessionIdPrefix } from '../constants'

export const removeAllUsersSessions = async (userId, redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  )
  const promises = sessionIds.map(sessId =>
    redis.del(`${redisSessionPrefix}${sessId}`)
  )
  await Promise.all(promises)
}
