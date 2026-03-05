export interface User {
  id: number | string;
  name: string;
  password: string;
  email?: string;
  phone?: string;
}