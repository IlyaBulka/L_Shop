import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';

import type { Product } from '../interfaces/product.js';
import type { Basket, BasketProduct } from '../interfaces/basket.js';

// Типизируем саму базу данных корзин — это массив объектов Basket
type BasketsDb = Basket[];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database/basket.json');

// Чтение БД
const readDb = (): BasketsDb => {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as BasketsDb;
};

// Запись в БД
const writeDb = (data: BasketsDb): void => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const getBasket = (req: Request, res: Response): void => {
    try {
        const allBaskets = readDb();
        // Ищем корзину конкретного пользователя (пока хардкодим ID "1")
        const userBasket = allBaskets.find(b => b.userId === "1" || b.userId === 1);

        if (!userBasket) {
            res.status(404).json({ error: "Basket not found" });
            return;
        }

        res.json(userBasket);
    } catch (error: unknown) {
        res.status(500).json({ error: "Database error" });
    }
};

export const addToBasket = (req: Request, res: Response): void => {
    try {
        const incomingProduct: Product = req.body;
        const allBaskets = readDb();
        
        // Находим корзину пользователя
        let userBasket = allBaskets.find(b => b.userId === "1" || b.userId === 1);

        if (!userBasket) {
            // Если корзины нет, создаем новую
            userBasket = {
                id: Date.now().toString(),
                userId: "1",
                basket: []
            };
            allBaskets.push(userBasket);
        }

        // Ищем товар внутри массива basket.basket (BasketProduct[])
        const existingItem = userBasket.basket.find(
            (item: BasketProduct) => item.products.id === incomingProduct.id
        );

        if (existingItem) {
            existingItem.count += 1;
        } else {
            // Создаем новый BasketProduct
            const newItem: BasketProduct = {
                count: 1,
                products: incomingProduct
            };
            userBasket.basket.push(newItem);
        }

        writeDb(allBaskets);
        res.status(201).json(userBasket);
    } catch (error: unknown) {
        res.status(500).json({ error: "Failed to update basket" });
    }
};