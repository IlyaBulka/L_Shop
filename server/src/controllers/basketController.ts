import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';

import type { Product } from '../interfaces/product.js';
import type { Basket, BasketProduct } from '../interfaces/basket.js';

// Типизируем саму базу данных корзин — это массив объектов Basket
type BasketsDb = Basket[];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database/baskets.json');
const productsPath = path.resolve(__dirname, '../../database/products.json');

// Чтение БД
const readDb = (): BasketsDb => {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as BasketsDb;
};

// Запись в БД
const writeDb = (data: BasketsDb): void => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const ensureSession = (req: Request, res: Response): string => {
    const existing = (req.cookies?.sessionId as string | undefined) ?? undefined;
    if (existing && existing.trim()) return existing;

    const guestId = `guest_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    res.cookie('sessionId', guestId, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return guestId;
};

const readProducts = (): Product[] => {
    try {
        return JSON.parse(fs.readFileSync(productsPath, 'utf-8')) as Product[];
    } catch {
        return [];
    }
};

export const getBasket = (req: Request, res: Response): void => {
    try {
        const userId = ensureSession(req, res);
        const allBaskets = readDb();
        const userBasket = allBaskets.find(b => String(b.userId) === String(userId));

        if (!userBasket) {
            const created: Basket = { id: Date.now().toString(), userId, basket: [] };
            allBaskets.push(created);
            writeDb(allBaskets);
            res.json(created);
            return;
        }

        res.json(userBasket);
    } catch (error: unknown) {
        res.status(500).json({ error: "Database error" });
    }
};

export const addToBasket = (req: Request, res: Response): void => {
    try {
        const userId = ensureSession(req, res);

        const body = req.body as
            | (Partial<Product> & { delta?: number })
            | { id?: string | number; delta?: number }
            | unknown;

        const rawId =
            typeof body === 'object' && body !== null && 'id' in body
                ? (body as { id?: string | number }).id
                : undefined;
        const rawDelta =
            typeof body === 'object' && body !== null && 'delta' in body
                ? (body as { delta?: number }).delta
                : undefined;

        const delta = typeof rawDelta === 'number' && Number.isFinite(rawDelta) ? rawDelta : 1;
        const incomingId =
            rawId !== undefined && rawId !== null ? String(rawId) : undefined;

        let incomingProduct: Product | undefined;
        // Если прилетел объект продукта целиком — используем его
        if (typeof body === 'object' && body !== null && 'title' in body && 'price' in body) {
            incomingProduct = body as Product;
        } else if (incomingId) {
            // Если прилетел только id — подтягиваем товар из базы
            const products = readProducts();
            incomingProduct = products.find(p => String(p.id) === incomingId);
        }

        if (!incomingProduct) {
            res.status(400).json({ error: "Не удалось определить товар для корзины" });
            return;
        }

        const allBaskets = readDb();
        
        // Находим корзину пользователя
        let userBasket = allBaskets.find(b => String(b.userId) === String(userId));

        if (!userBasket) {
            // Если корзины нет, создаем новую
            userBasket = {
                id: Date.now().toString(),
                userId,
                basket: []
            };
            allBaskets.push(userBasket);
        }

        // Ищем товар внутри массива basket.basket (BasketProduct[])
        const existingItem = userBasket.basket.find(
            (item: BasketProduct) => String(item.products.id) === String(incomingProduct.id)
        );

        if (existingItem) {
            existingItem.count += delta;
            if (existingItem.count <= 0) {
                userBasket.basket = userBasket.basket.filter(i => String(i.products.id) !== String(incomingProduct.id));
            }
        } else {
            if (delta > 0) {
                // Создаем новый BasketProduct
                const newItem: BasketProduct = {
                    count: delta,
                    products: incomingProduct
                };
                userBasket.basket.push(newItem);
            }
        }

        writeDb(allBaskets);
        res.status(201).json(userBasket);
    } catch (error: unknown) {
        res.status(500).json({ error: "Failed to update basket" });
    }
};