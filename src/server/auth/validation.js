import * as yup from 'yup'

const emailNotLongEnough = 'email must be at least 3 characters'
const emailTooLong = 'email must be less than 255 characters'
const invalidEmail = 'email must be a valid email'
const passwordNotLongEnough = 'password must be at least 3 characters'
const passwordTooLong = 'password must be less than 255 characters'

const registerPasswordValidation = yup
  .string()
  .min(3, passwordNotLongEnough)
  .max(255)

const registerEmailValidation = yup
  .string()
  .min(3, emailNotLongEnough)
  .max(255)
  .email(invalidEmail)

export const userValidation = yup.object().shape({
  resetId: yup.bool(),
  reset: yup.string(),
  email: registerEmailValidation,
  password: registerPasswordValidation
})

export const formatYupError = err => {
  const errors = err.inner.map(e => ({
    path: e.path,
    message: e.message
  }))
  return errors
}
