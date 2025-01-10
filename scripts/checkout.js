import { cart, removeFromCart } from "../data/cart.js";
import { products } from "../data/products.js";
import { formatCurrency } from "./utils/money.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { deliveryOptions } from "../data/deliveryOptions.js";

let cartHTML = "";

cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  let matchingProduct;
  products.forEach((product) => {
    if (productId === product.id) {
      matchingProduct = product;
    }
  });

  cartHTML += `
        <div class="cart-item-container js-cart-item-container-${
          matchingProduct.id
        }">
            <div class="delivery-date">Delivery date: Tuesday, June 21</div>

                <div class="cart-item-details-grid">
                <img
                    class="product-image"
                    src="${matchingProduct.image}"
                />

                <div class="cart-item-details">
                    <div class="product-name">
                    ${matchingProduct.name}
                    </div>
                    <div class="product-price">$${formatCurrency(
                      matchingProduct.priceCents
                    )}</div>
                    <div class="product-quantity">
                    <span> Quantity: <span class="quantity-label">${
                      cartItem.quantity
                    }</span> </span>
                    <span class="update-quantity-link link-primary">
                        Update
                    </span>
                    <span class="delete-quantity-link link-primary js-delete-quantity-link" data-product-id="${
                      matchingProduct.id
                    }">
                        Delete
                    </span>
                    </div>
                </div>

                <div class="delivery-options">
                    <div class="delivery-options-title">
                    Choose a delivery option:
                    </div>
                    ${deliveryOptionsHTML(matchingProduct)}
                    
                    
                </div>
            </div>
        </div>
    `;
});

function deliveryOptionsHTML(matchingProduct) {
  let deliveryHTML = "";
  deliveryOptions.forEach((deliveryOption, index) => {
    const toDay = dayjs();
    const deliveryDate = toDay.add(deliveryOption.deliveryDays, "days");
    const dateString = deliveryDate.format("dddd, MMMM D");
    const priceString =
      deliveryOption.priceCents === 0
        ? "FREE Shipping"
        : `$${formatCurrency(deliveryOption.priceCents)} - Shipping`;

    const savedDeliveryDate =
      JSON.parse(localStorage.getItem("deliveryDates")) || {};
    const isChecked =
      savedDeliveryDate[matchingProduct.id] === dateString || index === 0;

    deliveryHTML += `
      <div class="delivery-option">
          <input type="radio" 
              class="delivery-option-input js-delivery-option-input" 
              name="delivery-option-${matchingProduct.id}" 
              data-delivery-date="${dateString}"
              ${isChecked ? "checked" : ""}
          />
          <div>
              <div class="delivery-option-date">${dateString}</div>
              <div class="delivery-option-price">${priceString}</div>
          </div>
      </div>
      `;
  });
  return deliveryHTML;
}

document.querySelector(".order-summary").innerHTML = cartHTML;

cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  const savedDeliveryDates =
    JSON.parse(localStorage.getItem("deliveryDates")) || {};
  const firstDeliveryDate = document.querySelector(
    `input[name="delivery-option-${productId}"]:checked`
  ).dataset.deliveryDate;

  const deliveryDate = savedDeliveryDates[productId] || firstDeliveryDate;

  const deliveryDateElement = document.querySelector(
    `.js-cart-item-container-${productId} .delivery-date`
  );

  deliveryDateElement.textContent = `Delivery date: ${deliveryDate}`;
});

document.querySelectorAll(".js-delete-quantity-link").forEach((link) => {
  link.addEventListener("click", () => {
    const productId = link.dataset.productId;
    removeFromCart(productId);

    const savedDeliveryDates =
      JSON.parse(localStorage.getItem("deliveryDates")) || {};
    delete savedDeliveryDates[productId];
    localStorage.setItem("deliveryDates", JSON.stringify(savedDeliveryDates));

    document.querySelector(`.js-cart-item-container-${productId}`).remove();
  });
});

document.querySelectorAll(".js-delivery-option-input").forEach((radio) => {
  radio.addEventListener("change", (event) => {
    const selectedDate = event.target.dataset.deliveryDate;
    const productId = event.target.name.split("delivery-option-")[1];

    const deliveryDateElement = document.querySelector(
      `.js-cart-item-container-${productId} .delivery-date`
    );

    deliveryDateElement.textContent = `Delivery date: ${selectedDate}`;

    const savedDeliveryDates =
      JSON.parse(localStorage.getItem("deliveryDates")) || {};
    savedDeliveryDates[productId] = selectedDate;
    localStorage.setItem("deliveryDates", JSON.stringify(savedDeliveryDates));
  });
});
