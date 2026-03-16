import { DeliveryForm } from "../components/DeliveryForm.js";
import { validateEmail, validatePhone } from "../utils/validation.js";
import { submitOrder } from "../api/order.js";
import type { OrderPayload } from "../types/order.js";

/** Получить ID товаров в корзине для заказа. Стык с разработчиком 3: можно переопределить через window.__getBasketProductIds */
function getBasketProductIds(): (number | string)[] {
  const w = window as unknown as { __getBasketProductIds?: () => (number | string)[] };
  if (typeof w.__getBasketProductIds === "function") {
    return w.__getBasketProductIds();
  }
  try {
    const raw = localStorage.getItem("basketProductIds");
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((id): id is number | string => typeof id === "number" || typeof id === "string") : [];
    }
  } catch {
    // ignore
  }
  return [];
}

/** Получить текущий userId. Стык с разработчиком 1: логин сохраняет userId в localStorage */
function getCurrentUserId(): string | number | null {
  const raw = localStorage.getItem("userId");
  if (raw === null) return null;
  const n = Number(raw);
  if (!Number.isNaN(n)) return n;
  return raw;
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
    const phoneInput = form.querySelector<HTMLInputElement>("#delivery-phone");
    const emailInput = form.querySelector<HTMLInputElement>("#delivery-email");
    const addressInput = form.querySelector<HTMLInputElement>("#delivery-address");

    const phone = phoneInput?.value.trim() ?? "";
    const email = (emailInput?.value ?? "").trim();
    const address = (addressInput?.value ?? "").trim();

    showFieldError("delivery-phone", "");
    showFieldError("delivery-email", "");

    let valid = true;
    if (!validatePhone(phone)) {
      showFieldError("delivery-phone", "Введите корректный телефон (10–15 цифр)");
      valid = false;
    }
    if (email.length > 0 && !validateEmail(email)) {
      showFieldError("delivery-email", "Введите корректный email");
      valid = false;
    }
    if (!valid) return;

    const userId = getCurrentUserId();
    if (userId === null) {
      showFieldError("delivery-phone", "Сначала войдите в аккаунт");
      return;
    }

    const productIds = getBasketProductIds();
    const payload: OrderPayload = { userId, phone };
    if (address) payload.address = address;
    if (email) payload.email = email;
    if (productIds.length > 0) payload.productIds = productIds;

    const result = await submitOrder(payload);
    if (result.success) {
      const w = window as unknown as { __onOrderSuccess?: () => void };
      if (typeof w.__onOrderSuccess === "function") w.__onOrderSuccess();
      try {
        localStorage.removeItem("basketProductIds");
      } catch {
        // ignore
      }
      alert(result.message ?? "Заказ оформлен. Корзина очищена.");
      form.reset();
    } else {
      showFieldError("delivery-phone", result.error ?? "Ошибка отправки заказа");
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
  root.innerHTML = DeliveryForm();
  bindDeliveryForm(root);
}
