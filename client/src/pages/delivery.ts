import { DeliveryForm } from "../components/DeliveryForm.js";
import { submitOrder } from "../api/order.js";
import type { OrderPayload } from "../types/order.js";

function isLoggedIn(): boolean {
  const w = window as unknown as { __auth?: { loggedIn?: boolean } };
  return Boolean(w.__auth?.loggedIn);
}

function showFieldError(inputId: string, message: string): void {
  const input = document.getElementById(inputId);
  const errId = `${inputId}-error`;
  const errEl = document.getElementById(errId);
  if (input) input.classList.toggle("error", Boolean(message));
  if (errEl) errEl.textContent = message;
}

function bindDeliveryForm(container: HTMLElement): void {
  const form = container.querySelector<HTMLFormElement>("[data-delivery]");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addressInput = form.querySelector<HTMLInputElement>("#delivery-address");

    const address = (addressInput?.value ?? "").trim();

    showFieldError("delivery-address", "");

    if (!address) {
      showFieldError("delivery-address", "Укажите адрес доставки");
      return;
    }

    const payload: OrderPayload = { address };

    const result = await submitOrder(payload);
    if (result.success) {
      const w = window as unknown as { __onOrderSuccess?: () => void };
      if (typeof w.__onOrderSuccess === "function") w.__onOrderSuccess();
      container.innerHTML = `
        <div class="notice-card slide-in-up">
          <h2 class="section-title">Готово</h2>
          <p class="mb-3">Заказ оформлен. Корзина очищена.</p>
          <a class="btn btn--secondary" href="#">Вернуться в каталог</a>
        </div>
      `;
    } else {
      showFieldError("delivery-address", result.error ?? "Ошибка оформления заказа");
    }
  });
}

/**
 * Отрисовка страницы доставки и подвязка формы.
 * Контейнер должен содержать элемент с id="delivery-page-root".
 */
export function renderDeliveryPage(): void {
  const root = document.getElementById("delivery-page-root");
  if (!root) return;
  if (!isLoggedIn()) {
    root.innerHTML = `
      <div class="notice-card slide-in-up">
        <h2 class="section-title">Нужно войти</h2>
        <p class="mb-3">Чтобы оформить доставку, войдите в аккаунт.</p>
        <a class="btn btn--secondary" href="#account">Перейти к входу</a>
      </div>
    `;
    return;
  }

  root.innerHTML = DeliveryForm();
  bindDeliveryForm(root);
}
