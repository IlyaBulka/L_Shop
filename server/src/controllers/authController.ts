import type { Request, Response } from 'express';
import * as userService from '../services/userService.js';

export const login = (req: Request, res: Response) => {
    const { identifier, password, email, phone } = req.body as {
        identifier?: unknown;
        password?: unknown;
        email?: unknown;
        phone?: unknown;
    }; // identifier — это то, что ввел юзер (почта или телефон)

    const resolvedPassword = typeof password === 'string' ? password : '';
    const resolvedIdentifier =
        typeof identifier === 'string' ? identifier :
        typeof email === 'string' ? email :
        typeof phone === 'string' ? phone :
        '';

    const users = userService.readUsers();
    
    // Ищем юзера, у которого email ИЛИ телефон совпадает с введенным текстом
    const user = users.find(u => 
        (u.email === resolvedIdentifier || u.phone === resolvedIdentifier) && u.password === resolvedPassword
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

export const register = (req: Request, res: Response) => {
    const { name, password, email, phone } = req.body as {
        name?: unknown;
        password?: unknown;
        email?: unknown;
        phone?: unknown;
    };

    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ message: 'Укажите имя' });
    if (typeof password !== 'string' || !password.trim()) return res.status(400).json({ message: 'Укажите пароль' });

    const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim() : '';
    const normalizedPhone = typeof phone === 'string' && phone.trim() ? phone.trim() : '';

    if (!normalizedEmail) return res.status(400).json({ message: 'Укажите email' });
    if (!normalizedPhone) return res.status(400).json({ message: 'Укажите телефон' });

    const users = userService.readUsers();
    const exists = users.some(u =>
        u.email === normalizedEmail || u.phone === normalizedPhone
    );
    if (exists) return res.status(409).json({ message: 'Пользователь уже существует' });

    const id = `user_${Date.now()}`;
    const newUser = {
        id,
        name: name.trim(),
        password,
        email: normalizedEmail,
        phone: normalizedPhone,
    };
    users.push(newUser);
    userService.writeUsers(users);

    res.cookie('sessionId', id, { httpOnly: true, maxAge: 10 * 60 * 1000 });
    res.status(201).json({ name: newUser.name });
};

export const me = (req: Request, res: Response) => {
    const sessionId = req.cookies?.sessionId as string | undefined;
    if (!sessionId) return res.status(401).json({ message: 'Нет сессии' });
    const users = userService.readUsers();
    const user = users.find(u => String(u.id) === String(sessionId));
    if (!user) return res.status(401).json({ message: 'Сессия недействительна' });
    res.json({ name: user.name });
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('sessionId');
    res.json({ success: true });
};