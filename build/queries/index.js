import gql from 'graphql-tag'

export const GET_IMAGES = gql`
  query getImages($companyName: String!){
    getImages(companyName:$companyName){
      images{
        pathname
      }
      errors{
        path
        message
      }
    }
  }
`

export const GET_EMPLOYEE = gql`
  query getEmployee($id: String!) {
    getEmployee(id: $id){
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

export const GET_EMPLOYEES = gql`
  query getEmployees($companyName: String!){
  getEmployees(companyName: $companyName){
    employees{
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
    }
    errors{
      path
      message
    }
  }
}
`

export const GET_COMPANY = gql`
  query getCompany($companyName: String!){
  getCompany(companyName: $companyName){
    companyName
    groups
    errors{
      path
      message
    }
  }
}
`

export const GET_COMPANIES = gql`
  query {
    getCompanies{
      companyName
      groups
    }
  }
`

export const GET_SURVEY = gql`
query getSurvey($surveyName:String!, $companyName: String!){
  getSurvey(surveyName: $surveyName, companyName: $companyName){
      surveyName
      introPage1
      introPage2
      subHeading{
        p1
        p2
        p3
        p4
        p5
        p6
      }
      start{
        p1
        p2
        p3
        p4
        p5
        p6
      }
      end {
        p1
        p2
        p3
        p4
        p5
        p6
      }
      errors{
        path
        message
      }    
    }
  }
`

export const GET_SURVEYS = gql`
  query getSurveys($companyName: String!){
  getSurveys(companyName: $companyName){
    surveys {
          surveyName
    introPage1
    introPage2
    subHeading{
      p1
      p2
      p3
      p4
      p5
      p6
    }
    start{
      p1
      p2
      p3
      p4
      p5
      p6
    }
    end {
      p1
      p2
      p3
      p4
      p5
      p6
    }
    }
    errors{
      path
      message
    }
  }
}
`
export const GET_LOGGED_IN = gql`
  query {
    getLoggedIn{
      errors{
        path
        message
      }
      loggedInUser{
        email
      }
    }
  }
`

export const GET_RESULTS = gql`
  query getResults(
    $companyName: String!,
    $email: String,
    $startDate: String,
    $endDate: String,
    $surveyName: String
  ){
    getResults(
      companyName: $companyName,
      email: $email,
      startDate:$startDate,
      endDate: $endDate,
      surveyName:$surveyName
    ){
      results{
        email
        mobile
        participant
        manager
        group
        companyName
        surveyName
        date
        p1
        p2
        p3
        p4
        p5
        p6
      }
      errors{
        path
        message
      }
    }
  }
`