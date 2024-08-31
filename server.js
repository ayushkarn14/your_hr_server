// Import required libraries
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
var cors = require('cors')
const port = 3000;

// Set up MySQL connection
const pool = mysql.createPool({
    host: 'sql12.freemysqlhosting.net:3306',
    user: 'sql12728799',
    password: 'mVlatq6lki',
    database: '	sql12728799'

    // host: 'localhost',
    // user: 'root',
    // password: 'password',
    // database: 'your_hr'
});

// Promisify for Node.js async/await.
const promisePool = pool.promise();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors())
// Define the POST route for form submissions
app.post('/submit', upload.single('pdf_file'), async (req, res) => {
    const { name, email, job_type, password } = req.body;
    const pdf_file = req.file ? req.file.buffer : null;

    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required.');
    }

    try {
        // Insert form data into the database
        const [result] = await promisePool.query(
            'INSERT INTO user_data (name, email, job_type, password, pdf_file) VALUES (?, ?, ?, ?, ?)',
            [name, email, job_type, password, pdf_file]
        );

        res.status(201).json({ id: result.insertId, message: 'Data successfully saved.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/user', async (req, res) => {
    const { email } = req.body;
    console.log("Email ", email);
    if (!email) {
        return res.status(400).send('Email is required.');
    }

    try {
        // Query the database to find user by email
        const [rows] = await promisePool.query(
            'SELECT id, name, email, job_type, password, pdf_file FROM user_data WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).send('User not found.');
        }

        // Return the user details
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
