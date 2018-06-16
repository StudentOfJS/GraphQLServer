import gql from 'graphql-tag'

export const CREATE_EMPLOYEE = gql`
  mutation createEmployee(
  $companyName: String!,
  $surveyName:String,
  $firstName: String!,
  $lastName: String!,
  $email:String!,
  $mobile: String!,
  $manager:String,
  $groupMembership: [String],
  $dashboardAccess:Boolean!,
  $firstTime: Boolean
){
  createEmployee(
    companyName: $companyName,
    surveyName:$surveyName,
    firstName: $firstName,
    lastName: $lastName,
    email: $email,
    mobile:$mobile,
    manager:$manager,
    groupMembership:$groupMembership,
    dashboardAccess: $dashboardAccess,
    firstTime: $firstTime
  ){
    path
    message
  }
}
`

export const CREATE_USER = gql`
  mutation signupWithoutConfirmation(
    $email:String!,
    $password: String!
  ){
    signupWithoutConfirmation(
      email: $email,
      password: $password){
      path
      message
    }
  }
`

export const LOGIN_USER = gql`
  mutation login(
    $email:String!,
    $password: String!
  ){
    login(
      email: $email,
      password: $password){
        companyName
        firstName
        lastName
        email
        mobile
        manager
        groupMembership
        dashboardAccess
        surveyName
        surveyOwed
        firstTime
        errors{
          path
          message
        }
    }
  }
`

export const CREATE_COMPANY = gql`
  mutation createCompany($companyName: String!, $groups: [String]){
    createCompany(companyName: $companyName, groups:$groups){
      path
      message
    }
  }
`
