import fs from 'fs';
import path from 'path';
import type {User} from '../interfaces/user.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database/users.json');

export const readUsers = (): User[] => {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
};

export const writeUsers = (users: User[]): void => {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};