import type { Basket, BasketProduct } from '../interfaces/basket.js';

export class BasketModal {
    private basketData: Basket | null = null;

    async init() {
        try {
            const res = await fetch('/api/basket');
            this.basketData = await res.json();
            this.render();
        } catch (error) {
            console.error("Ошибка при загрузке корзины:", error);
        }
    }

    render() {
        if (!this.basketData) return;
        const container = document.querySelector('.cart-page');
        if (!container) return;

        container.innerHTML = `
            <h2 class="section-title">Ваша корзина</h2>
            ${this.basketData.basket.map(item => `
                <div class="cart-item" data-id="${item.products.id}">
                    <img src="${item.products.images.preview}" class="cart-item__image" alt="">
                    <div class="cart-item__info">
                        <h3 data-title="basket">${item.products.title}</h3>
                        <p class="cart-item__price">${item.products.price} руб.</p>
                    </div>
                    <div class="cart-item__quantity">
                        <button class="cart-item__quantity-btn btn-minus" data-id="${item.products.id}">-</button>
                        <span class="cart-item__quantity-value">${item.count}</span>
                        <button class="cart-item__quantity-btn btn-plus" data-id="${item.products.id}">+</button>
                    </div>
                    <div class="cart-item__total">
                        ${item.products.price * item.count} руб.
                    </div>
                </div>
            `).join('')}
            <div class="cart-summary">
                <div class="cart-summary__row">
                    <span>Итого:</span>
                    <span class="cart-summary__total">${this.calculateTotal()} руб.</span>
                </div>
            </div>
        `;
        this.addListeners(container); // Передаем контейнер внутрь
    }

    private calculateTotal(): number {
        return this.basketData?.basket.reduce((sum, item) => sum + (item.products.price * item.count), 0) || 0;
    }

    private addListeners(container: Element) {
        // Кнопка ПЛЮС
        container.querySelectorAll('.btn-plus').forEach((btn) => {
            btn.addEventListener('click', (e: Event) => {
                const target = e.target as HTMLButtonElement;
                const id = target.dataset.id;
                if (id) this.updateOnServer(id, 1);
            });
        });

        // Кнопка МИНУС
        container.querySelectorAll('.btn-minus').forEach((btn) => {
            btn.addEventListener('click', (e: Event) => {
                const target = e.target as HTMLButtonElement;
                const id = target.dataset.id;
                if (id) this.updateOnServer(id, -1);
            });
        });
    }

    private async updateOnServer(id: string | number, delta: number) {
        await fetch('/api/basket/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, delta })
        });
        await this.init();
    }
}