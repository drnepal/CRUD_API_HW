/////////////////////////////////////
//// Import Dependencies         ////  // Are also call routes by Some
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
// Subdocuments are not mongoose models. That means they don't have their own collection, and they don't come with the same model methods that we're used to(they have some their own built in.)
// This also means, that a subdoc is never going to be viewed without it's parent document. We'll never see a comment without seeing the movie it was commented on first.

// This also means, that when we make a subdocument, we must MUST refer to the parent so that mongoose knows where in mongodb to store this subdocument

// POST -> `/comments/<someMovieId>`
// only loggedin users can post comments
// bc we have to refer to a movie, we'll do that in the simplest way via the route
router.post('/:movieId', (req, res) => {
    // first we get the movieId and save to a variable
    const movieId = req.params.movieId
    // then we'll protect this route against non-logged in users
    console.log('this is the session\n', req.session)
    if (req.session.loggedIn) {
        // if logged in, make the logged in user the author of the comment
        // this is exactly like how we added the owner to our movies
        req.body.author = req.session.userId
        // saves the req.body to a variable for easy reference later
        const theComment = req.body
        // find a specific movie
        Movie.findById(movieId)
            .then(movie => {
                // create the comment(with a req.body)
                movie.comments.push(theComment)
                // save the movie
                return movie.save()
            })
            // respond with a 201 and the movie itself
            .then(movie => {
                res.status(201).json({ movie: movie })
            })
            // catch and handle any errors
            .catch(err => {
                console.log(err)
                res.status(400).json(err)
            })
    } else {
        res.sendStatus(401) //send a 401-unauthorized
    }
})

// DELETE -> `/comments/delete/<somemovieId>/<someCommentId>`
// make sure only the author of the comment can delete the comment
router.delete('/delete/:movieId/:commId', (req, res) => {
    // isolate the ids and save to variables so we don't have to keep typing req.params
    // const movieId = req.params.movieId
    // const commId = req.params.commId
    const { moveiId, commId } = req.params
    // get the movie
    movie.findById(movieId)
        .then(movie => {
            // get the comment, we'll use the built in subdoc method called .id()
            const theComment = movie.comments.id(commId)
            console.log('this is the comment to be deleted: \n', theComment)
            // then we want to make sure the user is loggedIn, and that they are the author of the comment
            if (req.session.loggedIn) {
                // if they are the author, allow them to delete
                if (theComment.author == req.session.userId) {
                    // we can use another built in method - remove()
                    theComment.remove()
                    movie.save()
                    res.sendStatus(204) //send 204 no content
                } else {
                    // otherwise send a 401 - unauthorized status
                    res.sendStatus(401)
                }
            } else {
                // otherwise send a 401 - unauthorized status
                res.sendStatus(401)
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
})


//////////////////////////////
//// Export Router        ////
//////////////////////////////
module.exports = router