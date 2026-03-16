import type { Address } from "../interfaces/product.js";
import type { User } from "../interfaces/user.js";

export interface OrderRequestBody {
  userId: number | string;
  phone: string;
  email?: string;
  address?: string | Address;
  productIds?: (number | string)[];
}
