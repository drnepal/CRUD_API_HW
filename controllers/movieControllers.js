/////////////////////////////////////
//// Import Dependencies         ////
/////////////////////////////////////
const express = require('express')
const Movie = require('../models/movie')

/////////////////////////////////////
//// Create Router               ////
/////////////////////////////////////
const router = express.Router()

//////////////////////////////
//// Routes               ////
//////////////////////////////

// INDEX route 
// Read -> finds and displays all movies
router.get('/', (req, res) => {
    const { username, loggedIn, userId } = req.session
    // find all the movies
    Movie.find({})
        // there's a built in function that runs before the rest of the promise chain
        // this function is called populate, and it's able to retrieve info from other documents in other collections
        .populate('owner', 'username')
        .populate('comments.author', '-password')
        // send json if successful
        .then(movies => { 
            // res.json({ movies: movies })
            // now that we have liquid installed, we're going to use render as a response for our controllers
            res.render('movies/index', { movies, username, loggedIn, userId })
        })
        // catch errors if they occur
        .catch(err => {
            console.log(err)
            // res.status(404).json(err)
            res.redirect(`/error?error=${err}`)
        })
})

// GET for the new page
// shows a form where a user can create a new movie
router.get('/new', (req, res) => {
    res.render('movies/new', { ...req.session })
})

// CREATE route
// Create -> receives a request body, and creates a new document in the database
router.post('/', (req, res) => {
    // console.log('this is req.body before owner: \n', req.body)
    // here, we'll have something called a request body
    // inside this function, that will be called req.body
    // we want to pass our req.body to the create method
    // we want to add an owner field to our movie
    // luckily for us, we saved the user's id on the session object, so it's really easy for us to access that data
    req.body.owner = req.session.userId

    // we need to do a little js magic, to get our checkbox turned into a boolean
    // here we use a ternary operator to change the on value to send as true
    // otherwise, make that field false
    req.body.readyToEat = req.body.readyToEat === 'on' ? true : false
    const newMovie = req.body
    console.log('this is req.body aka newMovie, after owner\n', newMovie)
    Movie.create(newMovie)
        // send a 201 status, along with the json response of the new movie
        .then(movie => {
            // in the API server version of our code we sent json and a success msg
            // res.status(201).json({ movie: movie.toObject() })
            // we could redirect to the 'mine' page
            // res.status(201).redirect('/movies/mine')
            // we could also redirect to the new movie's show page
            res.redirect(`/movies/${movie.id}`)
        })
        // send an error if one occurs
        .catch(err => {
            console.log(err)
            // res.status(404).json(err)
            res.redirect(`/error?error=${err}`)
        })
})

// GET route
// Index -> This is a user specific index route
// this will only show the logged in user's movies
router.get('/mine', (req, res) => {
    // find movies by ownership, using the req.session info
    Movie.find({ owner: req.session.userId })
        .populate('owner', 'username')
        .populate('comments.author', '-password')
        .then(movies => {
            // if found, display the movies
            // res.status(200).json({ movies: movies })
            res.render('movies/index', { movies, ...req.session })
        })
        .catch(err => {
            // otherwise throw an error
            console.log(err)
            // res.status(400).json(err)
            res.redirect(`/error?error=${err}`)
        })
})

// GET route for getting json for specific user movies
// Index -> This is a user specific index route
// this will only show the logged in user's movies
router.get('/json', (req, res) => {
    // find movies by ownership, using the req.session info
    Movie.find({ owner: req.session.userId })
        .populate('owner', 'username')
        .populate('comments.author', '-password')
        .then(movies => {
            // if found, display the movies
            res.status(200).json({ movies: movies })
            // res.render('movies/index', { movies, ...req.session })
        })
        .catch(err => {
            // otherwise throw an error
            console.log(err)
            res.status(400).json(err)
        })
})

// GET request -> edit route
// shows the form for updating a movie
router.get('/edit/:id', (req, res) => {
    // because we're editing a specific movie, we want to be able to access the movie's initial values. so we can use that info on the page.
    const movieId = req.params.id
    Movie.findById(movieId)
        .then(movie => {
            res.render('movies/edit', { movie, ...req.session })
        })
        .catch(err => {
            res.redirect(`/error?error=${err}`)
        })
})

// PUT route
// Update -> updates a specific movie(only if the movie's owner is updating)
router.put('/:id', (req, res) => {
    const id = req.params.id
    req.body.readyToEat = req.body.readyToEat === 'on' ? true : false
    Movie.findById(id)
        .then(movie => {
            // if the owner of the movie is the person who is logged in
            if (movie.owner == req.session.userId) {
                // send success message
                // res.sendStatus(204)
                // update and save the movie
                return movie.updateOne(req.body)
            } else {
                // otherwise send a 401 unauthorized status
                // res.sendStatus(401)
                res.redirect(`/error?error=You%20Are%20not%20allowed%20to%20edit%20this%20movie`)
            }
        })
        .then(() => {
            // console.log('the movie?', movie)
            res.redirect(`/movies/mine`)
        })
        .catch(err => {
            console.log(err)
            // res.status(400).json(err)
            res.redirect(`/error?error=${err}`)
        })
})

// DELETE route
// Delete -> delete a specific movie
router.delete('/:id', (req, res) => {
    const id = req.params.id
    Movie.findById(id)
        .then(movie => {
            // if the owner of the movie is the person who is logged in
            if (movie.owner == req.session.userId) {
                // send success message
                // res.sendStatus(204)
                // delete the movie
                return movie.deleteOne()
            } else {
                // otherwise send a 401 unauthorized status
                // res.sendStatus(401)
                res.redirect(`/error?error=You%20Are%20not%20allowed%20to%20delete%20this%20movie`)
            }
        })
        .then(() => {
            res.redirect('/movies/mine')
        })
        .catch(err => {
            console.log(err)
            // res.status(400).json(err)
            res.redirect(`/error?error=${err}`)
        })
})

// SHOW route
// Read -> finds and displays a single resource
router.get('/:id', (req, res) => {
    // get the id -> save to a variable
    const id = req.params.id
    // use a mongoose method to find using that id
    Movie.findById(id)
        .populate('comments.author', 'username')
        // send the movie as json upon success
        .then(movie => {
            // res.json({ movie: movie })
            res.render('movies/show.liquid', {movie, ...req.session})
        })
        // catch any errors
        .catch(err => {
            console.log(err)
            // res.status(404).json(err)
            res.redirect(`/error?error=${err}`)
        })
})


//////////////////////////////
//// Export Router        ////
//////////////////////////////
module.exports = router
