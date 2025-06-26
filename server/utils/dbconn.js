const mysql = require('mysql2');

// createPool() method of mysql object is invoked to create a connection to the database using the credientals provided
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,       // Enable waiting if connections exceed limit
    connectionLimit: 10,            // Maximum connections in the pool
    queueLimit: 0,                  // Unlimited queued queries
});


// Test the connection by executing a simple query
db.getConnection((err, connection) => { 
    if (err) {
        console.error('Error connecting to the database:', err.message);
        throw err;
    }

    console.log(`Database connection successful!`);
    connection.release(); // Release the connection back to the pool
});

//Creating a locally defined module that can be used within other project file - 
module.exports = db.promise();