const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const router = require("./router/router")
const path = require("path")
const logger = require('morgan');
const {createServer} = require("http")
const {Server} = require("socket.io")
require("dotenv").config()

const app = express()
const server = createServer(app);
const io = new Server(server)

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

app.use(logger('dev'));
app.use(session({secret: "asdfghjkl1234567890", resave: true, saveUninitialized: false}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser());
app.use("/", router)

module.exports = {server,io};