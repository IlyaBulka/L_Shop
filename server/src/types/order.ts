import type { Address } from "../interfaces/product.js";
import type { User } from "../interfaces/user.js";
import type { BasketProduct } from "../interfaces/basket.js";

export type UserWithBasket = User & { basket: BasketProduct[] };

export interface OrderRequestBody {
  userId: number | string;
  phone: string;
  email?: string;
  address?: string | Address;
  productIds?: (number | string)[];
}
