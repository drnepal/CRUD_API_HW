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
    // find all the movies
    Movie.find({})
        // there's a built in function that runs before the rest of the promise chain
        // this function is called populate, and it's able to retrieve info from other documents in other collections
        .populate('owner', 'username')
        .populate('comments.author', '-password')
        // send json if successful
        .then(movies => { res.json({ movies: movies })})
        // catch errors if they occur
        .catch(err => {
            console.log(err)
            res.status(404).json(err)
        })
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
    const newMovie = req.body
    // console.log('this is req.body aka newMovie, after owner', newMovei)
    Movie.create(newMovie)
        // send a 201 status, along with the json response of the new movie
        .then(movie => {
            res.status(201).json({ movie: movie.toObject() })
        })
        // send an error if one occurs
        .catch(err => {
            console.log(err)
            res.status(404).json(err)
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
            res.status(200).json({ movies: movies })
        })
        .catch(err => {
            // otherwise throw an error
            console.log(err)
            res.status(400).json(err)
        })
})

// PUT route
// Update -> updates a specific movie(only if the movie's owner is updating)
router.put('/:id', (req, res) => {
    const id = req.params.id
    Movie.findById(id)
        .then(movie => {
            // if the owner of the movie is the person who is logged in
            if (movie.owner == req.session.userId) {
                // send success message
                res.sendStatus(204)
                // update and save the movie
                return movie.updateOne(req.body)
            } else {
                // otherwise send a 401 unauthorized status
                res.sendStatus(401)
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
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
                res.sendStatus(204)
                // delete the movie
                return movie.deleteOne()
            } else {
                // otherwise send a 401 unauthorized status
                res.sendStatus(401)
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
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
            res.json({ movie: movie })
        })
        // catch any errors
        .catch(err => {
            console.log(err)
            res.status(404).json(err)
        })
})


//////////////////////////////
//// Export Router        ////
//////////////////////////////
module.exports = router