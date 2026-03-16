/**
 * Валидация email и телефона (без any, строгая типизация).
 * Для тестов и формы оформления заказа (data-delivery).
 */

/** Проверка email: локальная часть @ домен. Без any. */
export function validateEmail(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false;
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!/^[a-zA-Z0-9._+-]+$/.test(local)) return false;
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) return false;
  return true;
}

/** Проверка телефона: цифры, опционально + в начале, длина 10–15. Без any. */
export function validatePhone(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}
