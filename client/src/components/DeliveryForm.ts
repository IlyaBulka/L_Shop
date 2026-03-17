/**
 * Компонент: форма оформления заказа (доставка).
 * data-delivery на форме — для тестов по ТЗ.
 */
export function DeliveryForm(): string {
  return `
    <form class="form registration-form" data-delivery id="delivery-form">
      <h2 class="section-title registration-form__title">Оформление доставки</h2>
      <div class="form__group">
        <label class="form__label" for="delivery-address">Адрес доставки</label>
        <input
          class="form__input"
          type="text"
          id="delivery-address"
          name="address"
          placeholder="Город, улица, дом"
          autocomplete="street-address"
          required
        />
        <span class="form__error" id="delivery-address-error" aria-live="polite"></span>
      </div>
      <button type="submit" class="btn btn--primary btn--large">Оформить заказ</button>
    </form>
  `;
}
