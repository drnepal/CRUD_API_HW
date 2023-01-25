/////////////////////////////////////
//// Import Dependencies         ////
/////////////////////////////////////
const express = require('express') // import the express framework
const morgan = require('morgan') // import the morgan request logger
require('dotenv').config() // Load my ENV file's variables
const path = require('path') // import path module
const MovieRouter = require('./controllers/movieControllers')
const UserRouter = require('./controllers/userControllers')
const CommentRouter = require('./controllers/commentControllers')
const middleware = require('./utils/middleware')

/////////////////////////////////////
//// Create our Express App Object //
/////////////////////////////////////



// in short, we need to update our app object and tell it to use that package, as stated by the documentation. 
const app = require('liquid-express-views')(express())
// what liquid-express-views really does for us, is make it easy to path to our .liquid files(which will serve our html). This package says to look inside the 'views' folder for files with the .liquid name.

/////////////////////////////////////
//// Middleware                  ////
/////////////////////////////////////
// middleware runs before all the routes.
// every request is processed through our middleware before mongoose can do anything with it
// our middleware is now processed by a function in the utils directory. This middleware function takes one argument, app, and processes requests through our middleware
middleware(app)


/////////////////////////////////////
//// Routes                      ////
/////////////////////////////////////
// HOME route
app.get('/', (req, res) => {
    // destructure our user info
    const { username, loggedIn, userId } = req.session
    res.render('home.liquid', { username, loggedIn, userId })
})

// This is now where we register our routes, this is how server.js knows to send the correc response. 
// app.use, when we register a route, needs two arguments
// the first arg is the base URL, second arg is the file to use.
app.use('/movies', MovieRouter)/////////////// has to be same as above constants
app.use('/comments', CommentRouter)
app.use('/users', UserRouter)

// this renders our error page
// gets the error from a url req query
app.get('/error', (req, res) => {
    const error = req.query.error || 'This page does not exist'
    // const { username, loggedIn, userId } = req.session
    // instead of destructuring this time, we show we can also
    // use the spread operator, which says "use all the parts of req.session" when you type ...req.session
    res.render('error.liquid', { error, ...req.session })
})

// this catchall route will redirect a user to the error page
app.all('*', (req, res) => {
    res.redirect('/error')
})

/////////////////////////////////////
//// Server Listener             ////
/////////////////////////////////////
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`SERVER Running Smoothly: ${PORT}`))

// END