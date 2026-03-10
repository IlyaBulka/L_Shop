import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// Добавили type сюда:
import type { Product } from '../interfaces/product.js';
import type { BasketProduct } from '../interfaces/basket.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database/users.json');

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDb = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export const getBasket = (req: any, res: any) => {
    try {
        const data = readDb();
        res.json(data.users[0].basket);
    } catch (e) {
        res.status(500).json({ error: "Database error" });
    }
};

export const addToBasket = (req: any, res: any) => {
    const product: Product = req.body;
    const data = readDb();
    const user = data.users[0];

    const basketArray = user.basket.basket;
    const existingItem = basketArray.find((item: BasketProduct) => item.products.id === product.id);

    if (existingItem) {
        existingItem.count += 1;
    } else {
        basketArray.push({ count: 1, products: product });
    }

    writeDb(data);
    res.status(201).json(user.basket);
};