import { gql } from 'apollo-server'
export default gql`

  type Error {
    path: String!
    message: String!
  }

  type Pages {
    p1: String
    p2: String
    p3: String
    p4: String
    p5: String
    p6: String
  }

  type LoggedInUser {
    loggedInUser: User
    errors: [Error]
  }

  type User {
    _id: ID
    resetId: String
    confirmed: Boolean
    forgotPasswordLocked: Boolean
    email: String
    password: String
  }
  type Employee {
    _id: ID
    companyName: String
    firstName: String
    lastName: String
    email: String
    mobile: String
    manager: String
    groupMembership: [String]
    dashboardAccess: Boolean
    surveyName: String
    surveyOwed: Boolean
    firstTime: Boolean
    errors: [Error]
  }

  type Employees {
    employees: [Employee!]
    errors: [Error]
  }

  type Survey {
    surveyName: String
    companyName: String
    introPage1: String
    introPage2: String
    subHeading: Pages
    start: Pages
    end: Pages
    errors: [Error]
    }

  type Surveys {
    surveys: [Survey!]
    errors: [String]
  }

  type Company {
    companyName: String
    groups: [String!]
    errors: [Error]
  }


  type Result {
    email: String
    mobile: String
    participant: String
    manager: String
    group: String
    companyName: String
    surveyName: String
    date: String
    p1: Int
    p2: Int
    p3: Int
    p4: Int
    p5: Int
    p6: Int
  }

  type Results {
    results: [Result!]
    errors: [Error]
  }

  input PagesInput {
    p1: String
    p2: String
    p3: String
    p4: String
    p5: String
    p6: String
  }

  type Query {

    getEmployees(companyName: String!): Employees

    getEmployee(id: String!):  Employee

    getCompanies: [Company]

    getCompany(companyName: String!): Company

    getSurveys(companyName: String!): Surveys

    getSurvey(companyName: String!, surveyName: String!): Survey

    getResults(
      companyName: String!
      email: String
      startDate: String
      endDate: String
      surveyName: String
    ): Results

    getLoggedIn: LoggedInUser!
  }


  type Mutation {

    createCompany(companyName: String! groups: [String]) : [Error!]

    editCompany(companyName: String! groups: [String]) : [Error!]

    removeCompany(companyName: String!) : [Error!]

    signup(email: String!, password: String!) : Employee

    signupWithoutConfirmation(email: String!, password: String!) : [Error!]

    login(email: String!, password: String!) : Employee

    logout(email: String) : [Error!]

    passwordReset(resetId: String! password: String!) : [Error!]

    forgotPassword(email: String!) : [Error!]

    createEmployee(
      companyName: String!
      firstName: String!
      lastName: String!
      email: String!
      mobile: String!
      manager: String
      groupMembership: [String]
      dashboardAccess: Boolean!
      surveyName: String
      surveyOwed: Boolean
      firstTime: Boolean
    ): [Error!]

    removeEmployee(id: String!): [Error!]

  editEmployee(
    id: String!
    firstName: String
    lastName: String
    email: String
    mobile: String
    manager: String
    groupMembership: [String]
    dashboardAccess: Boolean
    surveyName: String
    surveyOwed: Boolean
    firstTime: Boolean
  ): [Error!]

  createSurvey(
    surveyName: String!
    companyName: String!
    introPage1: String!
    introPage2: String!
    subHeading: PagesInput!
    start: PagesInput!
    end: PagesInput!
  ) : [Error!]

  editSurvey(
    surveyName: String!
    companyName: String!
    introPage1: String
    introPage2: String
    subHeading: PagesInput
    start: PagesInput
    end: PagesInput
  ) : [Error!]

  removeSurvey(surveyName: String! companyName: String!) : [Error!]

  createResult(
    email: String
    mobile: String
    participant: String
    manager: String
    group: String
    companyName: String
    surveyName: String
    p1: Int
    p2: Int
    p3: Int
    p4: Int
    p5: Int
    p6: Int
  ) : [Error!]
}
`
