import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { OrderRequestBody } from "../types/order.js";
import type { User } from "../interfaces/user.js";
import type { Basket } from "../interfaces/basket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersPath = path.resolve(__dirname, "../../database/users.json");
const basketsPath = path.resolve(__dirname, "../../database/baskets.json");

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
    const users: User[] = JSON.parse(data);
    const userExists = users.some((u) => String(u.id) === String(userId));
    if (!userExists) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    let baskets: Basket[] = [];
    try {
      const basketsData = await fs.readFile(basketsPath, "utf-8");
      baskets = JSON.parse(basketsData);
    } catch {
      baskets = [];
    }

    const basketIndex = baskets.findIndex((b) => String(b.userId) === String(userId));
    if (basketIndex === -1) {
      baskets.push({ id: String(Date.now()), userId, basket: [] });
    } else {
      const existingBasket = baskets[basketIndex];
      if (existingBasket) existingBasket.basket = [];
    }
    await fs.writeFile(basketsPath, JSON.stringify(baskets, null, 2), "utf-8");

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
