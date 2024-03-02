import express from 'express';
import * as ctrl from '../controllers/mainController.js';
import * as auth from '../controllers/authController.js';

const router = express.Router();

// Define routes
router.get('/login', auth.login);
router.post('/login', auth.verifyLogin);
router.get('/register', auth.register);
router.post('/register', auth.verifyRegister);
router.get('/logout', auth.logout);

router.get('/', auth.isAuthenticated, ctrl.home);
router.get('/login-page', ctrl.loginPage);
router.get('/logout', auth.logout);
router.get('/user-page', ctrl.userPage);
router.get('/filter-products', auth.isAuthenticated, ctrl.filterProducts);
router.get('/cart', auth.isAuthenticated, ctrl.cart)
router.post('/addToCart', auth.isAuthenticated, ctrl.addToCart);



            
export default router;
