import { ProductCard } from "./components/ProductCard.js";
import { BasketModal } from "./components/BasketModal.js";
import { createAuthForm } from "./components/AuthForm.js";
import { DeliveryForm } from "./components/DeliveryForm.js";
import type { Product } from "./interfaces/product.js";

// DOM Элементы
const productsGrid = document.getElementById("products");
const sections = {
    catalog: document.getElementById("catalog-section"),
    basket: document.getElementById("basket-section"),
    delivery: document.getElementById("delivery-section"),
    account: document.getElementById("account-section")
};

const authRoot = document.getElementById("auth-form-root");
const deliveryRoot = document.getElementById("delivery-page-root");

// Инициализация компонентов
const basket = new BasketModal();

/**
 * Переключает видимость секций в зависимости от хэша
 */
function router() {
    const hash = window.location.hash || "#";

    // Скрываем все секции
    Object.values(sections).forEach(s => s?.classList.add("hidden"));

    if (hash === "#") {
        sections.catalog?.classList.remove("hidden");
        loadProducts();
    } 
    else if (hash === "#basket") {
        sections.basket?.classList.remove("hidden");
        basket.init(); // Загружаем данные корзины и рендерим
    } 
    else if (hash === "#delivery") {
        sections.delivery?.classList.remove("hidden");
        if (deliveryRoot) {
            deliveryRoot.innerHTML = DeliveryForm();
        }
    } 
    else if (hash === "#account") {
        sections.account?.classList.remove("hidden");
        if (authRoot && authRoot.innerHTML === "") {
            authRoot.appendChild(createAuthForm());
        }
    }
}

/**
 * Загрузка товаров с сервера
 */
async function loadProducts() {
    if (!productsGrid) return;

    try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Ошибка загрузки");
        
        const products: Product[] = await response.json();
        
        // Рендерим карточки, используя твой компонент
        productsGrid.innerHTML = products.map(p => ProductCard(p)).join("");
    } catch (error) {
        productsGrid.innerHTML = `<p class="error">Не удалось загрузить товары. Попробуйте позже.</p>`;
        console.error(error);
    }
}

/**
 * Глобальный обработчик кликов для кнопок "Добавить"
 */
document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains("product-card__add-to-cart")) {
        const productId = target.dataset.id;
        if (!productId) return;

        try {
            const response = await fetch("/api/basket/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: productId })
            });

            if (response.ok) {
                showNotification("Товар добавлен в корзину!");
            }
        } catch (err) {
            console.error("Ошибка добавления:", err);
        }
    }
});

/**
 * Показ простых уведомлений
 */
function showNotification(text: string) {
    const container = document.getElementById("notification-container");
    if (container) {
        container.textContent = text;
        container.classList.add("show");
        setTimeout(() => container.classList.remove("show"), 3000);
    }
}

// Слушатели событий
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);

// Экспорт для отладки (если нужно)
export { router };