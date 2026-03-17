import { ProductCard } from "./components/ProductCard.js";
import { BasketModal } from "./components/BasketModal.js";
import { createAuthForm } from "./components/AuthForm.js";
import { DeliveryForm } from "./components/DeliveryForm.js";
import type { Product } from "./interfaces/product.js";
import { renderDeliveryPage } from "./pages/delivery.js";

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

type AuthState = { loggedIn: boolean; name: string | null };
const auth: AuthState = { loggedIn: false, name: null };
(window as unknown as { __auth?: AuthState }).__auth = auth;

async function refreshAuth(): Promise<void> {
    try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) {
            auth.loggedIn = false;
            auth.name = null;
            localStorage.removeItem("userName");
            return;
        }
        const data = (await res.json()) as { name?: string };
        auth.loggedIn = true;
        auth.name = typeof data.name === "string" ? data.name : null;
        if (auth.name) localStorage.setItem("userName", auth.name);
    } catch {
        auth.loggedIn = false;
        auth.name = null;
    }
}
(window as unknown as { __refreshAuth?: () => Promise<void> }).__refreshAuth = refreshAuth;

function renderAccountSection(): void {
    if (!sections.account) return;
    if (!authRoot) return;

    if (!auth.loggedIn) {
        authRoot.innerHTML = "";
        authRoot.appendChild(createAuthForm());
        return;
    }

    const name = auth.name ?? localStorage.getItem("userName") ?? "Пользователь";
    authRoot.innerHTML = `
        <div class="profile-card slide-in-up" data-profile>
            <h2 class="section-title">Профиль</h2>
            <p class="mb-3">Вы вошли как <strong>${name}</strong></p>
            <div class="profile-card__row">
                <a class="btn btn--outline" href="#delivery">Перейти к доставке</a>
                <button class="btn btn--secondary" type="button" data-logout>Выйти</button>
            </div>
        </div>
    `;

    const btn = authRoot.querySelector<HTMLButtonElement>("[data-logout]");
    btn?.addEventListener("click", async () => {
        await fetch("/api/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
        auth.loggedIn = false;
        auth.name = null;
        localStorage.removeItem("userName");
        window.location.hash = "#account";
        renderAccountSection();
    });
}

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
        if (!auth.loggedIn) {
            const container = document.querySelector(".cart-page");
            if (container) {
                container.innerHTML = `
                    <div class="notice-card slide-in-up">
                        <h2 class="section-title">Нужно войти</h2>
                        <p class="mb-3">Чтобы пользоваться корзиной, войдите в аккаунт.</p>
                        <a class="btn btn--secondary" href="#account">Перейти к входу</a>
                    </div>
                `;
            }
        } else {
            basket.init(); // Загружаем данные корзины и рендерим
        }
    } 
    else if (hash === "#delivery") {
        sections.delivery?.classList.remove("hidden");
        renderDeliveryPage();
    } 
    else if (hash === "#account") {
        sections.account?.classList.remove("hidden");
        renderAccountSection();
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

        if (!auth.loggedIn) {
            window.location.hash = "#account";
            return;
        }

        try {
            const response = await fetch("/api/basket/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: productId, delta: 1 })
            });

            if (response.ok) {
                showNotification("Товар добавлен в корзину!");
                window.location.hash = "#delivery";
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
window.addEventListener("DOMContentLoaded", async () => {
    await refreshAuth();
    router();
});

// Экспорт для отладки (если нужно)
export { router };