import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { OrderRequestBody, UserWithBasket } from "../types/order.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersPath = path.resolve(__dirname, "../../database/users.json");

export async function createOrder(req: Request, res: Response): Promise<void> {
  const body = req.body as OrderRequestBody;
  const { userId, phone, email, address, productIds } = body;

  if (userId === undefined || userId === null) {
    res.status(400).json({ error: "Не указан пользователь (userId)" });
    return;
  }
  if (typeof phone !== "string" || !phone.trim()) {
    res.status(400).json({ error: "Укажите телефон" });
    return;
  }

  try {
    const data = await fs.readFile(usersPath, "utf-8");
    const users: UserWithBasket[] = JSON.parse(data);
    const index = users.findIndex((u) => String(u.id) === String(userId));
    if (index === -1) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }
    users[index].basket = [];
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2), "utf-8");
    res.status(200).json({
      success: true,
      message: "Заказ оформлен, корзина очищена",
      order: { userId, phone, email, address, productIds },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при оформлении заказа" });
  }
}
