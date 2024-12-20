const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth.js'); // Import auth routes

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session
app.use(
  session({
    secret: 'onteam', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set true in production with HTTPS
  })
);

// Database connection middleware
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'auth_db',
});

app.use((req, res, next) => {
  req.db = db; // Make the database connection available in routes
  next();
});

// Set static files and Pug as the view engine
app.use(express.static('views'));
app.set('view engine', 'pug');
app.set('views', './views');

// Auth routes
app.use('/auth', authRoutes); // Use the auth routes
app.get('/',((req,res)=>{
res.send("Welcome")
}))

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

