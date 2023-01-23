//////////////////////////////////////////////////////////////
//// Our schema and model for the movie resource          ////
//////////////////////////////////////////////////////////////
// This is the old mongoose import
// const mongoose = require('mongoose') // import mongoose
// now we want our mongoose object to relate to our db
// so we're going to bring in the mongoose connection from our utils
const mongoose = require('../utils/connection')
// import our commentSchema, to use as a subdocument
const commentSchema = require('./comment')

// we'll destructure the Schema and model functions from mongoose
const { Schema, model } = mongoose

// movies schema
const movieSchema = new Schema({
    name: {
        type: String
    },
    genre: {
        type: String
    },
    isPgRated: {
        type: Boolean
    },
    owner: {
        // this is where we set up an objectId reference
        // by declaring that as the type
        type: Schema.Types.ObjectId,
        // this line tells us which model to look at
        ref: 'User'
    },
    comments: [commentSchema]
}, { timestamps: true })

// make the movie model
// the model method takes two arguments
// the first is what we call our model
// the second is the schema used to build the model
const Movie = model('Movie', movieSchema)

//////////////////////////
//// Export our Model ////
//////////////////////////
module.exports = Movie