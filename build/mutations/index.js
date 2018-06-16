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

export const EDIT_EMPLOYEE = gql`
  mutation editEmployee(
    $id: String!,
    $surveyName:String,
    $firstName: String,
    $lastName: String,
    $email:String,
    $mobile: String,
    $manager:String,
    $groupMembership: [String],
    $dashboardAccess:Boolean!,
    $firstTime: Boolean
  ){
    editEmployee(
      id: $id
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

export const REMOVE_EMPLOYEE = gql`
  mutation removeEmployee($id: String!){
    removeEmployee(id: $id){
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

export const REMOVE_COMPANY = gql`
  mutation removeCompany($companyName: String!, $groups: [String]){
    removeCompany(companyName: $companyName, groups:$groups){
      path
      message
    }
  }
`
export const CREATE_SURVEY = gql`
  mutation createSurvey(
    $surveyName: String!,
    $companyName: String!,
    $introPage1: String!,
    $introPage2: String!,
    $subHeading: PagesInput,
    $start: PagesInput,
    $end: PagesInput
  ){
    createSurvey(
      surveyName: $surveyName,
      companyName: $companyName,
      subHeading:$subHeading,
      introPage1: $introPage1,
      introPage2: $introPage2,
      start: $start,
      end:$end
    ){
      path
      message
    }
  }
`

export const EDIT_SURVEY = gql`
  mutation editSurvey(
    $surveyName: String!,
    $companyName: String!,
    $introPage1: String,
    $introPage2: String,
    $subHeading: PagesInput,
    $start: PagesInput,
    $end: PagesInput
  ){
    editSurvey(
      surveyName: $surveyName,
      companyName: $companyName,
      subHeading:$subHeading,
      introPage1: $introPage1,
      introPage2: $introPage2,
      start: $start,
      end:$end
    ){
      path
      message
    }
  }
`

export const REMOVE_SURVEY = gql`
  mutation removeSurvey(
    $surveyName: String!,
    $companyName: String!
  ){
    removeSurvey(
      surveyName: $surveyName,
      companyName: $companyName
    ){
      path
      message
    }
  }
`