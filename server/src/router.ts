import { Router } from 'express';
import { getProducts } from './controllers/productController.js';
import { getBasket, addToBasket } from './controllers/basketController.js';
import { login, register, me, logout } from './controllers/authController.js';
import { createOrder } from './controllers/orderController.js';

const router = Router();

// Auth
router.post('/api/register', register);
router.post('/api/login', login);
router.post('/api/logout', logout);
router.get('/api/me', me);

router.get('/api/products', getProducts);

router.get('/api/basket', getBasket);
router.post('/api/basket/add', addToBasket);

router.post('/api/order', createOrder);

export default router;