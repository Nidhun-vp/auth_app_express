const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/',((req,res)=>{
    res.send("Welcome auth")
    }))
// Login route
router.get('/login',((req,res)=>{
    res.render('login')
    }))

    router.get('/register', (req, res) => {
        res.render('register');
      });
// POST /auth/register - Handle user registration
router.post('/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;
  
    // Validation
    if (password !== confirmPassword) {
      return res.status(400).render('register', { error: 'Passwords do not match.' });
    }
  
    // Check if username already exists
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    req.db.query(checkQuery, [username], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).render('error', { message: 'Internal Server Error' });
      }
  
      if (results.length > 0) {
        return res.status(400).render('register', { error: 'Username already exists.' });
      }
  
      // Hash password
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  
      // Insert user into database
      const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
      req.db.query(insertQuery, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).render('error', { message: 'Internal Server Error' });
        }
  
        // Store user details in session
        req.session.user = { id: result.insertId, username: username };
  
        // Redirect to dashboard
        res.redirect('/auth/dashboard');
      });
    });
  });

router.post('/login', (req, res) => {
    console.log(req.body)
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  req.db.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).render('error', { message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).render('login', { error: 'Invalid username or password.' });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (isMatch) {
      req.session.user = { id: user.id, username: user.username };
      return res.redirect('/auth/dashboard');
    } else {
      return res.status(401).render('login', { error: 'Invalid username or password.' });
    }
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', { message: 'Could not log out.' });
    }
    res.redirect('/auth/login');
  });
});

// Dashboard route (protected)
router.get('/dashboard', (req, res) => {
  if (req.session.user) {
    return res.render('dashboard', { username: req.session.user.username });
  }
  res.redirect('/auth/login');
});

router.post('/user-info', (req, res) => {
    if (req.session.user) {
      const user = req.session.user; // Access user information from session
      console.log(user);
      res.render('user-info', { user }); // Render the user-info.pug with user details
    } else {
      res.redirect('/auth/login'); // Redirect to login if no session user
    }
  });
module.exports = router;
