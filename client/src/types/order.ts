export interface OrderPayload {
  userId: number | string;
  phone: string;
  email?: string;
  address?: string;
  productIds?: (number | string)[];
}
