/////////////////////////////////////
//// Import Dependencies         ////
/////////////////////////////////////
const mongoose = require('../utils/connection')
const Movie = require('./movie')


/////////////////////////////////////
//// Seed Script code            ////                
/////////////////////////////////////
// first, we'll save our db connection to a variable
const db = mongoose.connection

db.on('open', () => {
    // array of starter resources(movies)
    const startMovies = [
        { name: 'Titanic', genre: 'romance_love', isPgRated: true },
        { name: 'Avatar', genre: 'sci_fiction', isPgRated: true },
        { name: 'LOTR', genre: 'action', isPgRated: false },
        { name: 'Zurassic_Park', genre: 'fiction', isPgRated: false },
        { name: 'cowboy', genre: 'drama', isPgRated: true }
    ]
    // then we delete every movie in the database(all instances of this resource)
    // this will delete any movies that are not owned by a user
    Movie.deleteMany({ owner: null })
        .then(() => {
            // then we'll seed(create) our starter movies
            Movie.create(startMovies)
                // tell our app what to do with success and failures
                .then(data => {
                    console.log('here are the created movies: \n', data)
                    // once it's done, we close the connection
                    db.close()
                })
                .catch(err => {
                    console.log('The following error occurred: \n', err)
                    // always close the connection
                    db.close()
                })
        })
        .catch(err => {
            console.log(err)
            // always make sure to close the connection
            db.close()
        })
})