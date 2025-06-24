const express = require("express");
const app = express();
const cors = require("cors");

// Options to allow requests from frontend
const corsOptions = {
    origin: ["http://localhost:5173"]
};

// Accepting requests from React frontend
app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json({fruits: ["apple", "orange", "banana"]});
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});
