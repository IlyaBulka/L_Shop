import type { OrderPayload } from "../types/order.js";

const API_ORIGIN = "";

export async function submitOrder(payload: OrderPayload): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_ORIGIN}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) {
    return { success: false, error: data.error ?? "Ошибка оформления заказа" };
  }
  const msg = data.message;
  return msg !== undefined ? { success: true, message: msg } : { success: true };
}
