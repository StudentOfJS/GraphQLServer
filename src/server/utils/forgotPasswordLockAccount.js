import { removeAllUsersSessions } from './removeAllUsersSessions'
import { User } from '../models'

export const forgotPasswordLockAccount = async (userId, redis) => {
  await User.update({ id: userId }, { forgotPasswordLocked: true })
  await removeAllUsersSessions(userId, redis)
}
