import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import cookieParser from "cookie-parser";
import router from "./router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(serverDir, "..");
const execFileAsync = promisify(execFile);

const app = express();
const PORT = 3000;

const clientPublicPath = path.join(projectRoot, "client", "public");
const clientSrcPath = path.join(projectRoot, "client", "src");
const clientEntryPath = path.join(clientPublicPath, "main.js");

app.use(express.json());
app.use(cookieParser());
app.use("/src", express.static(clientSrcPath));

app.use(router);

app.use(express.static(clientPublicPath));

app.get("/", (_req, res) => {
  res.sendFile(path.join(clientPublicPath, "index.html"));
});

async function ensureClientBuild(): Promise<void> {
  try {
    await fs.access(clientEntryPath);
  } catch {
    console.log("Client bundle не найден. Собираю client/public...");
    try {
      await execFileAsync("npm", ["run", "build"], {
        cwd: path.join(projectRoot, "client"),
      });
    } catch (error) {
      const e = error as { stdout?: string; stderr?: string };
      if (e.stdout) console.error(e.stdout);
      if (e.stderr) console.error(e.stderr);
      throw new Error("Не удалось собрать клиент. Выполните `npm install` в /client и повторите запуск.");
    }
  }
}

async function startServer(): Promise<void> {
  await ensureClientBuild();
  app.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
    console.log(`API товаров: http://localhost:${PORT}/api/products`);
    console.log(`POST /api/order — оформление заказа`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});