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
  const { address } = body;

  const sessionId = (req.cookies?.sessionId as string | undefined) ?? undefined;
  if (!sessionId) {
    res.status(401).json({ error: "Сначала войдите в аккаунт" });
    return;
  }
  const userId = sessionId;

  if (address !== undefined && address !== null && typeof address !== "string") {
    res.status(400).json({ error: "Адрес должен быть строкой" });
    return;
  }
  const normalizedAddress = typeof address === "string" ? address.trim() : "";
  if (!normalizedAddress) {
    res.status(400).json({ error: "Укажите адрес доставки" });
    return;
  }

  try {
    const data = await fs.readFile(usersPath, "utf-8");
    const users: User[] = JSON.parse(data);
    const user = users.find((u) => String(u.id) === String(userId));
    if (!user) {
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
    const existingBasket = basketIndex === -1 ? undefined : baskets[basketIndex];
    const productIds =
      existingBasket?.basket?.map((i) => i.products.id) ?? [];

    if (basketIndex === -1) {
      baskets.push({ id: String(Date.now()), userId, basket: [] });
    } else if (existingBasket) {
      existingBasket.basket = [];
    }
    await fs.writeFile(basketsPath, JSON.stringify(baskets, null, 2), "utf-8");

    res.status(200).json({
      success: true,
      message: "Заказ оформлен, корзина очищена",
      order: { userId, phone: user.phone, email: user.email, address: normalizedAddress, productIds },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при оформлении заказа" });
  }
}
