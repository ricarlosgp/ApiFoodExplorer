const {Router} = require('express')

const usersRouter = require('./usersRouter.js')
const platesRouter = require("./platesRouter.js")
const ingredientsRouter = require("./ingredientsRoutes.js")
const authenticationRouter = require("./authenticationRoutes.js")

const routes = Router()

routes.use('/users', usersRouter)
routes.use("/plates", platesRouter)
routes.use("/ingredients", ingredientsRouter)
routes.use("/authentication", authenticationRouter)

module.exports = routes