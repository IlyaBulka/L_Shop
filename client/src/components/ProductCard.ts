import type { Product } from '../interfaces/product.js';

export const ProductCard = (product: Product): string => {
    const categoriesHtml = product.categories
        .map(cat => `<span class="product-card__category">${cat}</span>`)
        .join('');

    return `
        <article class="product-card fade-in">
            ${product.discount ? `<div class="product-card__badge">-${product.discount}%</div>` : ''}
            
            <img src="${product.images.preview}" alt="${product.title}" class="product-card__image">
            
            <div class="product-card__content">
                <h3 class="product-card__title" data-title>${product.title}</h3>
                
                <div class="product-card__price">
                    <span data-price>${product.price}</span> ₽
                </div>

                <div class="product-card__categories">
                    ${categoriesHtml}
                </div>

                <div class="product-card__delivery">
                    <span class="product-card__delivery-icon">${product.isAvailable ? '✅' : '⏳'}</span>
                    <span>${product.isAvailable ? 'В наличии' : 'Под заказ'}</span>
                </div>

                <div class="product-card__actions">
                    <button class="product-card__add-to-cart" data-id="${product.id}" ${!product.isAvailable ? 'disabled' : ''}>
                        Добавить
                    </button>
                </div>
            </div>
        </article>
    `;
};