const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const Schema = mongoose.Schema

export const Company = mongoose.model('Company', {
  companyName: String,
  groups: [String]
})

const UserSchema = new Schema({
  _id: String,
  resetId: String,
  confirmed: Boolean,
  forgotPasswordLocked: Boolean,
  password: String,
  email: String
})

UserSchema.pre('save', function save(next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch)
  })
}

export const User = mongoose.model('user', UserSchema)

export const Employee = mongoose.model('Employee', {
  _id: String,
  companyName: String,
  firstName: String,
  lastName: String,
  email: String,
  mobile: String,
  manager: String,
  groupMembership: [String],
  dashboardAccess: Boolean,
  surveyName: String,
  surveyOwed: Boolean,
  firstTime: Boolean,
  isDeleted: Boolean
})

export const Survey = mongoose.model('Survey', {
  surveyName: String,
  companyName: String,
  introPage1: String,
  introPage2: String,
  subHeading: {
    p1: String,
    p2: String,
    p3: String,
    p4: String,
    p5: String,
    p6: String
  },
  start: {
    p1: String,
    p2: String,
    p3: String,
    p4: String,
    p5: String,
    p6: String
  },
  end: {
    p1: String,
    p2: String,
    p3: String,
    p4: String,
    p5: String,
    p6: String
  }
})

export const Result = mongoose.model('Results', {
  email: String,
  participant: String,
  manager: String,
  group: String,
  companyName: String,
  surveyName: String,
  date: Number,
  p1: Number,
  p2: Number,
  p3: Number,
  p4: Number,
  p5: Number,
  p6: Number
})

const FileSchema = new Schema({
  companyName: String,
  footer: Boolean,
  logoLarge: Boolean,
  logoSmall: Boolean,
  csv: Boolean,
  path: String,
  filename: String,
  mimetype: String,
  encoding: String,
})
export const Image = mongoose.model('File', FileSchema)