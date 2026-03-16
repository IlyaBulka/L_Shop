import { getProducts } from './api/product.js';
import { ProductCard } from './components/ProductCard.js';
import type { Product } from './interfaces/product.js';

export const renderCatalog = async (searchTerm: string = '') => {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = '<div class="loader">Ищем котиков...</div>';

    const products = await getProducts({ search: searchTerm });

    app.innerHTML = `
        <div class="products-grid">
            ${products.length > 0 
                ? products.map(p => ProductCard(p)).join('') 
                : '<p class="text-center">Котики по вашему запросу не нашлись :(</p>'}
        </div>
    `;
};
// Инизацлизация
renderCatalog();