import assert from 'assert'
import bcrypt from 'bcryptjs'
import { userValidation, formatYupError } from '../auth/validation'
import uuid from 'uuid'
import createError from '../utils/createError'
import { sendEmail } from '../auth/sendEmail'
import { storeFS } from '../utils/imageUpload'
import { GraphQLUpload } from '../schema/GraphQLUpload'
import csvUpload from '../utils/csvUpload'


export default {
  Upload: GraphQLUpload,
  Query: {
    getImages: async (_, { companyName }, { models: { File } }) => {
      const images = await File.find({ companyName }).exec()
      if (images) {
        return images.map(image => ({ pathname: image.path }))
      }
      return { errors: createError('image', 'images not found') }
    },
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
    imageUpload: async (_, { companyName, footer, logoLarge, logoSmall, file }, { models: { File } }) => {
      const { stream, filename, mimetype, encoding } = await file
      const { path } = await storeFS({ stream, filename })
      const exists = await File.findOne({ companyName })
      if (exists) {
        const updated = await File.findOneAndUpdate({ companyName, footer, logoLarge, logoSmall }, { filename, mimetype, encoding, path })
        if (!updated) { return createError('image', 'upload failed') }
        return null
      }
      const newImage = await new File({ companyName, footer, logoLarge, logoSmall, filename, mimetype, encoding, path }).save()
      if (!newImage) { return createError('image', 'upload failed') }
      return null
    },
    uploadEmployeesFromCsv: async (_, { companyName, file }, { models: { Employee } }) => {
      const { stream } = await file
      try {
        const { filePath } = await csvUpload({ stream, companyName })
        const data = require(filePath)
        const success = await Employee.insertMany(data, err => assert.equal(null, err)).exec()
        if (!success) { return createError('csv', 'upload failed') }
        return null
      } catch (error) {
        return createError('csv', 'upload failed')
      }
    },
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
      const exists = await User.findOne({ email }).exec()
      if (exists) { return createError('email', 'user already exists') }
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
      const exists = await Company.findOne({ companyName }).exec()
      if (!exists) { return createError('company', `company doesn't exist`) }
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
      const exists = await Company.findOneAndRemove({ companyName }).exec()
      return exists ? null : createError('company', 'company not found')
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
      const exists = await Employee.findByIdAndUpdate(args.id, { ...args }).exec()
      if (exists) { return null }
      return createError(
        'employee',
        `Employee not found`
      )
    },
    removeEmployee: async (_, { id }, { models: { Employee, User } }) => {
      const employeeExists = await Employee.findByIdAndRemove(id).exec()
      if (!employeeExists) { return createError('employee', `employee not found`) }
      const userExists = await User.findByIdAndRemove(id).exec()
      if (!userExists) { return createError('employee', `employee removed, wasn't registered user`) }
      return null
    },
    createSurvey: async (_, args, { models: { Survey } }) => {
      const exists = await Survey.findOne({
        surveyName: args.surveyName,
        companyName: args.companyName
      }).exec()
      if (exists) { return createError('survey', 'survey already exists') }
      const added = await new Survey({ ...args }).save()
      if (added) { return null }
      return createError('survey', 'check survey fields')
    },
    editSurvey: async (_, args, { models: { Survey } }) => {
      const query = { surveyName: args.surveyName, companyName: args.companyName }
      const exists = await Survey.findOneAndUpdate(query, { ...args }).exec()
      if (exists) { return null }
      return createError('survey', `Survey not found`)
    },
    removeSurvey: async (_, { surveyName, companyName }, { models: { Survey } }) => {
      const existed = await Survey.findOneAndRemove({ surveyName, companyName }).exec()
      if (existed) { return null }
      return createError('survey', `Survey not found`)
    },
    createResult: async (_, args, { models: { Result } }) => {
      const date = new Date().getTime()
      const submitted = await new Result({ date, ...args }).save()
      if (submitted) { return null }
      return createError(
        'result',
        `Cannot submit survey, check answers and try again`
      )
    },
    passwordReset: async (_, { resetId, password }, { models: { User } }) => {
      const saltRounds = 10
      const hashedPassword = await bcrypt.hashSync(password, saltRounds)
      const updated = await User.findOneAndUpdate(
        { resetId },
        {
          password: hashedPassword,
          forgotPasswordLocked: false,
          confirmed: true,
          resetId: ''
        }
      ).exec()
      if (updated) { return null }
      return createError('password', 'email does not exist')
    },
    forgotPassword: async (_, { email }, { models: { User }, url }) => {
      const resetId = uuid.v4()
      const updated = await User.findOneAndUpdate(
        { email },
        {
          resetId,
          forgotPasswordLocked: true
        }
      ).exec()
      if (!updated) { return createError('email', 'email not found') }
      const sentEmail = await sendEmail({ email, url, resetId })
      if (!sentEmail) { return createError('email', 'forgot password send email failed') }
      return null
    }
  }
}
