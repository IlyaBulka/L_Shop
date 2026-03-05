import type { Product } from "./product.js";

export interface BasketProduct {
  count: number;
  products: Product;
}

export interface Basket {
  id: number | string;
  userId: number | string;
  basket: BasketProduct[];
}