// Loading evnironmental variables here
if (process.env.NODE_ENV !== 'production') {
	console.log('loading dev environments')
	require('dotenv').config()
}
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const dbConnection = require('./db') // loads our connection to the mongo database
const passport = require('./passport')
const app = express()
const PORT = process.env.PORT || 8080

// ===== Middleware ====
app.use(morgan('dev'))
app.use(
	bodyParser.urlencoded({
		extended: false
	})
)
app.use(bodyParser.json())
app.use(
	session({
		secret: process.env.APP_SECRET || 'mergen-shmergen',
		store: new MongoStore({ mongooseConnection: dbConnection }),
		resave: false,
		saveUninitialized: false
	})
)


// ===== Passport ====
app.use(passport.initialize())
app.use(passport.session()) // will call the deserializeUser

app.use( (req, res, next) => {
	console.log('req.session', req.session);

	return next();
});


// ===== testing middleware =====
// app.use(function(req, res, next) {
// 	console.log('===== passport user =======')
// 	console.log(req.session)
// 	console.log(req.user)
// 	console.log('===== END =======')
// 	next()
// })
// testing
// app.get(
// 	'/auth/google/callback',
// 	(req, res, next) => {
// 		console.log(`req.user: ${req.user}`)
// 		console.log('======= /auth/google/callback was called! =====')
// 		next()
// 	},
// 	passport.authenticate('google', { failureRedirect: '/login' }),
// 	(req, res) => {
// 		res.redirect('/')
// 	}
// )

// ==== if its production environment!
if (process.env.NODE_ENV === 'production') {
	const path = require('path')
	console.log('YOU ARE IN THE PRODUCTION ENV')
	app.use(express.static(path.join(__dirname, "client", "build")))
	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'static/index.html'))
	})

	app.get('/*', (req, res) => {
		res.sendFile(path.join(__dirname, 'static/index.html'))
	})
}

/* Express app ROUTING */
app.use('/auth', require('./controllers'));
require("./controllers/defenseController")(app);
require("./controllers/attemptController")(app);
require("./controllers/quarterbackController")(app);
require("./controllers/userController")(app);
require("./controllers/apiRoutes")(app);

// ====== Error handler ====
app.use(function(err, req, res, next) {
	console.log('====== ERROR =======')
	console.error(err.stack)
	res.status(500)
})

// ==== Starting Server =====
app.listen(PORT, () => {
	console.log(`App listening on PORT: ${PORT}`)
})
