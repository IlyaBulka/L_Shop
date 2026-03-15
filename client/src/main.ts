import type { Product } from "./interfaces/product.js";
import { renderDeliveryPage } from "./pages/delivery.js";

const productsEl = document.getElementById("products");
const deliveryRoot = document.getElementById("delivery-page-root");
const appContent = document.getElementById("app-content");
const deliverySection = document.getElementById("delivery-section");

function renderProductCard(p: Product): string {
  const preview = p.images?.preview ?? "";
  const title = p.title ?? "";
  const price = String(p.price ?? 0);
  const categories = Array.isArray(p.categories) ? p.categories : [];
  return `
    <article class="product-card">
      ${preview ? `<img class="product-card__image" src="/${preview}" alt="" />` : ""}
      <div class="product-card__content">
        <h3 class="product-card__title" data-title>${escapeHtml(title)}</h3>
        <p class="product-card__price" data-price>${escapeHtml(price)} ₽</p>
        <p>${escapeHtml(p.description ?? "")}</p>
        ${categories.length ? `<div class="product-card__categories">${categories.map((c) => `<span class="product-card__category">${escapeHtml(c)}</span>`).join("")}</div>` : ""}
      </div>
    </article>
  `;
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function showDelivery(): void {
  if (deliverySection) deliverySection.classList.remove("hidden");
  if (appContent) appContent.classList.add("hidden");
  renderDeliveryPage();
}

function showMain(): void {
  if (appContent) appContent.classList.remove("hidden");
  if (deliverySection) deliverySection.classList.add("hidden");
}

function onHashChange(): void {
  if (window.location.hash === "#delivery") showDelivery();
  else showMain();
}

function init(): void {
  if (productsEl) {
    fetch("/api/products")
      .then((r) => r.json())
      .then((items: Product[]) => {
        productsEl.innerHTML = items.map(renderProductCard).join("");
      })
      .catch((e) => {
        productsEl.innerHTML = "<p>Не удалось загрузить товары: " + escapeHtml(String(e.message)) + "</p>";
      });
  }

  if (deliveryRoot) {
    deliveryRoot.innerHTML = "";
    window.addEventListener("hashchange", onHashChange);
    if (window.location.hash === "#delivery") showDelivery();
    else showMain();
  }
}

init();
