import type { Request, Response } from 'express';
import * as userService from '../services/userService.js';

export const login = (req: Request, res: Response) => {
    const { identifier, password } = req.body; // identifier — это то, что ввел юзер (почта или телефон)
    const users = userService.readUsers();
    
    // Ищем юзера, у которого email ИЛИ телефон совпадает с введенным текстом
    const user = users.find(u => 
        (u.email === identifier || u.phone === identifier) && u.password === password
    );

    if (!user) return res.status(401).json({ message: 'Неверные данные для входа' });

    // Ставим куку на 10 минут (600 000 мс) [cite: 45]
    // Она httpOnly, чтобы её не достали через JS [cite: 44]
    res.cookie('sessionId', user.id, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000 
    });

    res.json({ name: user.name }); // Возвращаем имя для фронта
};