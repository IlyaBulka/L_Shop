import type { Product } from '../interfaces/product.js';
 
export const getProducts = async (params: Record<string, string> = {}): Promise<Product[]> => {
    const query = new URLSearchParams(params).toString();
    const url = `/api/products${query ? `?${query}` : ''}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }
        const data: Product[] = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error);
        return [];
    }
};