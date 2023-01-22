// requiring in express to use in the file
const express = require('express')
// creating the app so we can us the app methods
const app = express()
// Magic numbers by convention are capitlized and set into seperate varibles
const PORT = 3000

// .get - is the http method we are listening for
// `/` - is the path we are declaring for this route, so if there is a `GET` request to `/` this callback function will run
// req - the request object coming in from client, passed to us from .get
// res - the response object we are sending back
app.get('/', (req, res) => {
    // using the `res` .send method to send some HTML to the client
    res.send('<h1>why hello there</h1>')
})

// using the .listen method to set up a server to listen for request coming in
// PORT - the port number we are listening on
app.listen(PORT, () => {
    // just a console log so show we are listening
    console.log(`Port is listening on ${PORT}`)
})
