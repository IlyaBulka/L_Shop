import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import type { Product } from '../interfaces/product.js';

const DB_PATH = path.resolve('server/database/products.json');

export const getProducts = async (req: Request, res: Response) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        let products: Product[] = JSON.parse(data);

        const { search, sort, category, available } = req.query;

        // поиск по имени/описанию
        if (typeof search === 'string' && search.trim() !== '') {
            const query = search.toLowerCase();
            products = products.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query)
            );
        }

        // Фильтрация по категориям 
        if (typeof category === 'string') {
            products = products.filter(p => p.categories.includes(category));
        }

        // Фильтрация по доступности
        if (available === 'true') {
            products = products.filter(p => p.isAvailable);
        }

        // Сортировка по цене
        if (sort === 'asc') products.sort((a, b) => a.price - b.price);
        if (sort === 'desc') products.sort((a, b) => b.price - a.price);

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера при загрузке продуктов' });
    }
};