import { Router } from 'express';
import { getBasket, addToBasket } from './controllers/basketController.js';

const router: Router = Router(); // Добавили явную типизацию, если нужно

router.get('/basket', getBasket);
router.post('/basket/add', addToBasket);

export default router;