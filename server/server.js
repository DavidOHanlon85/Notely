// const express = require("express");
// const app = express();
// const cors = require("cors");

// // Options to allow requests from frontend
// const corsOptions = {
//     origin: ["http://localhost:5173"]
// };

// // Accepting requests from React frontend
// app.use(cors(corsOptions));

// app.get("/api", (req, res) => {
//     res.json({fruits: ["apple", "orange", "banana"]});
// });

// app.listen(8080, () => {
//     console.log("Server started on port 8080");
// });

const dotenv = require('dotenv').config({ path: './config.env'}); // dotenv module loaded - loaded before the app object is created to allow access to env vars within the project without needing to be further required
const app = require('./app');

// Load the reminder scheduler (runs in background)
require('./reminderScheduler');


// App object used to bind the server to HTTP requests on the specified port using the app object's listen() method.
app.listen(process.env.PORT, (err) => {
    if (err) 
        return console.log(err)

    console.log(`Express listening on port ${process.env.PORT}`);
});