
import { Router } from 'express';
import { getProducts } from './controllers/productController.js';
import { getBasket, addToBasket } from './controllers/basketController.js';

const router = Router();

router.get('/api/products', getProducts);

router.get('/basket', getBasket);
router.post('/basket/add', addToBasket);

export default router;