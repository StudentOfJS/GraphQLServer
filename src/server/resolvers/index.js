import bcrypt from 'bcryptjs'
import { userValidation, formatYupError } from '../auth/validation'
import uuid from 'uuid'
import createError from '../utils/createError'
import { sendEmail } from '../auth/sendEmail'

export default {
  Query: {
    getCompanies: async (_, __, { models: { Company } }) => {
      const companies = await Company.find().exec()
      return companies[0] !== null ? companies : { errors: createError('company', 'no companies found') }
    },
    getCompany: async (_, { companyName }, { models: { Company } }) => {
      const company = await Company.findOne({ companyName }).exec()
      if (company === null) {
        return { errors: createError('company', 'company not found') }
      }
      return company
    },
    getEmployee: async (_, { id }, { models: { Employee } }) => {
      const employee = await Employee.findById(id).exec()
      return employee ? employee : { errors: createError('id', `employee doesn't exist`) }
    },
    getEmployees: async (_, { companyName }, { models: { Employee } }) => {
      const employees = await Employee.find({ companyName }).exec()
      return employees.employees ? { employees } : { errors: createError('employees', 'no employees found') }
    },
    getSurveys: async (_, { companyName }, { models: { Survey } }) => {
      const surveys = await Survey.find({ companyName }).exec()
      return surveys.surveys ? surveys : { errors: createError('surveys', 'no surveys found') }
    },
    getSurvey: async (_, { companyName, surveyName }, { models: { Survey } }) => {
      const survey = await Survey.findOne({ companyName, surveyName }).exec()
      return survey ? survey : { errors: createError('surveys', 'survey not found') }
    },
    getResults: async (_, args, { models: { Result } }) => {
      // @todo sanity check dates
      if (args.startDate && args.endDate) {
        const date = {
          $gte: args.startDate,
          $lte: args.endDate
        }
        const results = await Result.find({
          ...args,
          date
        }).exec()
        return results.results ? results : { errors: createError('results', 'no results found') }
      }
      const results = await Result.find({ ...args }).exec()
      return results.results ? results : { errors: createError('results', 'no results found') }
    },
    getLoggedIn: async (_, __, { session, models: { Employee } }) => {
      // checks session for logged in user
      if (session && session.userId) {
        const loggedInUser = await Employee.findById(session.userId).exec()
        if (loggedInUser) { return { loggedInUser } }
        delete session.userId
        const error = await session.destroy(err => err)
        if (error) { return { errors: createError('login status', 'contact administrator') } }
        return { errors: createError('login status', 'refresh browser') }
      }
      return { errors: createError('login status', 'login required') }
    }
  },
  Mutation: {
    logout: async (_, { email }, { req }) => {
      if (email && req.sessionID) {
        await req.session.destroy()
        return null
      }
      return createError('login status', 'not authenticated')
    },
    // signup users without sending confirmation email and assosciated confirmation login
    // administrator only
    signupWithoutConfirmation: async (_, { email, password }, { models: { User, Employee } }) => {
      try {
        await userValidation.validate(
          { email, password },
          { abortEarly: false }
        )
      } catch (error) {
        return formatYupError(error)
      }
      try {
        await User.findOne({ email }).exec()
        return createError('email', 'user already exists')
      } catch (error) {
        try {
          const employee = await Employee.findOne({ email }).exec()
          await new User({
            _id: employee._id,
            resetId: '',
            confirmed: true,
            forgotPasswordLocked: false,
            email,
            password
          }).save()
        } catch (error) {
          return createError(
            'employee',
            'contact your administrator to arrange access'
          )
        }
      }
      return null
    },
    signup: async (_, { email, password }, { models: { User, Employee }, url }) => {
      const resetId = uuid.v4()
      try {
        await userValidation.validate(
          { email, password },
          { abortEarly: false }
        )
      } catch (error) {
        return { errors: formatYupError(error) }
      }
      try {
        await User.findOne({ email }).exec()
        return { errors: createError('email', 'invalid credentials') }
      } catch (error) {
        try {
          const employee = await Employee.findOne({ email }).exec()
          await new User({
            _id: employee._id,
            resetId,
            confirmed: false,
            forgotPasswordLocked: false,
            email,
            password
          }).save()
        } catch (error) {
          return {
            errors: createError(
              'employee',
              'contact your administrator to arrange access'
            )
          }
        }
        try {
          await sendEmail({ email, url, resetId })
        } catch (error) {
          return { errors: createError('email', 'could not send, new user email') }
        }
      }
      try {
        const employee = await Employee.findOne({ email }).exec()
        return employee
      } catch (error) {
        return { errors: createError('email', 'signup failed, try again') }
      }
    },
    login: async (_, { email, password }, { models: { User, Employee }, session }) => {
      let forgotPassword;
      try {
        // check user exists
        const user = await User.findOne({ email }).exec()
        if (!user) {
          return { errors: createError('authentication', 'invalid login') }
        }
        // check user account has been confirmed
        if (!user.confirmed) {
          return { errors: createError('email', 'confirm email first') }
        }
        // check for user forgetting password
        if (user.forgotPasswordLocked) {
          forgotPassword = createError('email', 'check email for reset code or try again')
        }
        // compare passwords
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
          return { errors: createError('authentication', 'invalid login') }
        }
        // login successful
        // add user id to session
        session.userId = user._id
        await session.save()

        // find employee details
        try {
          const employee = await Employee.findOne({ email }).exec()
          if (forgotPassword) {
            employee.errors = forgotPassword
            return employee
          }
          return employee
        } catch (error) {
          return { errors: createError('authorization', 'authenticated but not authorized, contact administrator') }
        }
      } catch (error) {
        return { errors: createError('authentication', 'invalid login') }
      }
    },
    createCompany: async (_, { companyName, groups }, { models: { Company } }) => {
      const exists = await Company.findOne({ companyName }).exec()
      if (exists) { return createError('company', 'company exists') }
      try {
        await new Company({
          companyName,
          groups
        }).save()
      } catch (error) {
        return createError('company', 'invalid or missing options')
      }
      return null
    },
    editCompany: async (_, { companyName, groups }, { models: { Company } }) => {
      try {
        await Company.findOneAndUpdate(
          { companyName },
          { groups }
        ).exec()
        return null
      } catch (error) {
        return createError('company', 'invalid or missing options')
      }
    },
    removeCompany: async (_, { companyName }, { models: { Company } }) => {
      try {
        await Company.findOneAndRemove({ companyName }).exec()
        return null
      } catch (error) {
        return createError('company', 'company not found')
      }
    },
    createEmployee: async (_, args, { models: { Employee } }) => {
      const exists = await Employee.findOne({ email: args.email }).exec()
      if (exists) { return createError('employee', 'employee exists') }
      try {
        const firstTime = true
        const _id = uuid.v4()
        await new Employee({ ...args, firstTime, _id }).save()
        return null
      } catch (error) {
        return createError(
          'employee',
          `Cannot save user to database due to ${error}`
        )
      }
    },
    editEmployee: async (_, args, { models: { Employee } }) => {
      try {
        await Employee.findByIdAndUpdate(args.id, { ...args }).exec()
        return null
      } catch (error) {
        return createError(
          'employee',
          `Cannot save changes to database due to ${error}`
        )
      }
    },
    removeEmployee: async (_, { id }, { models: { Employee, User } }) => {
      try {
        await Employee.findByIdAndRemove(id).exec()
      } catch (error) {
        return createError('employee', `employee not found`)
      }
      try {
        await User.findByIdAndRemove(id).exec()
        return null
      } catch (error) {
        return createError('employee', `employee not registered user`)
      }
    },
    createSurvey: async (_, args, { models: { Survey } }) => {
      const exists = await Survey.findOne({
        surveyName: args.surveyName,
        companyName: args.companyName
      })
      if (exists) { return createError('survey', 'survey already exists') }
      try {
        await new Survey(args).save()
        return null
      } catch (error) {
        return createError('survey', 'check survey fields')
      }
    },
    editSurvey: async (_, args, { models: { Survey } }) => {
      const query = { surveyName: args.surveyName, companyName: args.companyName }
      try {
        await Survey.findOneAndUpdate(query, args).exec()
        return null
      } catch (error) {
        return createError('survey', `Survey not found`)
      }
    },
    removeSurvey: async (_, { surveyName, companyName }, { models: { Survey } }) => {
      try {
        await Survey.findOneAndRemove({ surveyName, companyName }).exec()
        return null
      } catch (error) {
        return createError('survey', `Survey not found`)
      }
    },
    createResult: async (_, args, { models: { Result } }) => {
      try {
        const date = Date.now()
        await new Result({ date, ...args }).save()
        return null
      } catch (error) {
        return createError(
          'result',
          `Cannot submit survey, check answers and try again`
        )
      }
    },
    passwordReset: async (_, { resetId, password }, { models: { User } }) => {
      try {
        await User.findOne({ resetId }).exec()
      } catch (error) {
        return createError('password', 'reset link expired')
      }
      try {
        await User.findOneAndUpdate(
          { resetId },
          {
            password,
            forgotPasswordLocked: false,
            confirmed: true,
            resetId: ''
          }
        ).exec()
        return null
      } catch (error) {
        return createError('password', 'email does not exist')
      }
    },
    forgotPassword: async (_, { email }, { models: { User }, url }) => {
      const resetId = uuid.v4()
      try {
        User.findOneAndUpdate(
          { email },
          {
            resetId,
            forgotPasswordLocked: true
          }
        ).exec()
      } catch (error) {
        return createError('email', 'email not found')
      }
      try {
        await sendEmail({ email, url, resetId })
        return null
      } catch (error) {
        return createError('email', 'forgot password send email failed')
      }
    }
  }
}
