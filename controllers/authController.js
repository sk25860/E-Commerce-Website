import Customer from '../Models/Customer.js';
import passport from 'passport';

export const login = (req, res) => {
  res.render('home');
}

export const verifyLogin = 
  passport.authenticate('local', { successRedirect: '/'});

export const register = (req, res) => {
  res.render('register');
}

export const verifyRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new Customer({ username, password });
    await user.save();
    res.redirect('/');
  } catch (error) {
    res.send(error.message);
  }
};

export const logout = (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    // Redirect or respond after successful logout
    res.redirect('/');
  });
}                        

// Middleware to check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};