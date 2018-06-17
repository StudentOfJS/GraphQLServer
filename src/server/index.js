import { ApolloServer } from 'apollo-server'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import favicon from 'serve-favicon'
import path from 'path'
import session from 'express-session'
import uuid from 'uuid'
import { redirectToHTTPS } from 'express-http-to-https'
import MongoStore from 'connect-mongo'
import { Employee, Survey, Company, Result, User, Image } from './models'
import resolvers from './resolvers'
import typeDefs from './schema'
const { NODE_ENV, MONGO_URI } = process.env



const MongoDBStoreWithSession = MongoStore(session)
mongoose.Promise = global.Promise
const options = {
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
}
mongoose.connect(
  MONGO_URI,
  options
)
mongoose.connection
  .once('open', () => console.log('Connected to MongoLab instance'))
  .on('error', error => console.log('Error connecting to MongoLab:', error))

const store = new MongoDBStoreWithSession({
  mongooseConnection: mongoose.connection,
  ttl: 7 * 24 * 60 * 60 // 7 days
})

const app = express()

app.disable('x-powered-by')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
)

app.use(
  session({
    genid: () => {
      return uuid.v4()
    },
    secret: 'SESSION_SECRET',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    },
    store
  })
)


app.use(express.static('build'))
app.use(express.static(path.join(__dirname, '../build')))
app.use(favicon(path.resolve(__dirname, 'favicon.ico')))
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/]))

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    return {
      models: {
        Employee,
        Survey,
        Company,
        Result,
        User,
        Image
      },
      req,
      session: req.session,
      url: req.url
    }
  }
})

server.applyMiddleware({ app })

export default app
