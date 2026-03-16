import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { createOrder } from "./controllers/orderController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(serverDir, "..");

const app = express();
const PORT = 3000;

const productsPath = path.join(serverDir, "database", "products.json");
const clientPublicPath = path.join(projectRoot, "client", "public");
const clientSrcPath = path.join(projectRoot, "client", "src");

app.use(express.json());
app.use("/src", express.static(clientSrcPath));

app.get("/api/products", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const data = await fs.readFile(productsPath, "utf-8");
    let products = JSON.parse(data);
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p: { title?: string; description?: string }) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не удалось загрузить товары" });
  }
});

app.post("/api/order", createOrder);

app.use(express.static(clientPublicPath));

app.get("/", (_req, res) => {
  res.sendFile(path.join(clientPublicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}`);
  console.log(`API товаров: http://localhost:${PORT}/api/products`);
  console.log(`POST /api/order — оформление заказа`);
});
