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

export const CREATE_RESULT = gql`
  mutation createResult(
    $email: String,
    $mobile: String,
    $participant: String,
    $manager: String,
    $group: String,
    $companyName: String,
    $surveyName: String,
    $p1: Int,
    $p2: Int,
    $p3: Int,
    $p4: Int,
    $p5: Int,
    $p6: Int,
  ){
    createResult(
    email: $email,
    mobile: $mobile,
    participant: $participant,
    manager: $manager,
    group: $group,
    companyName: $companyName,
    surveyName: $surveyName,
    p1: $p1,
    p2: $p2,
    p3: $p3,
    p4: $p4,
    p5: $p5,
    p6: $p6
    ){
      path
      message
    }
  }
`

export const PASSWORD_RESET = gql`
  mutation passwordReset($resetId: String!, $password:String!){
    passwordReset(resetId: $resetId, password:$password){
      path
      message
    }
  }
`

export const FORGOT_PASSWORD = gql`
  mutation forgotPassword($email:String!){
    forgotPassword(email: $email){
      path
      message
    }
  }
`