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