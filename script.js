const products = [
  {
    id: 1,
    name: "Falda Asimétrica",
    price: 85.00,
    category: "faldas",
    image: "polocamisero.jpg",
    badge: "NUEVO",
    sizes: ["S", "M", "L"],
    colors: ["Negro", "Vino", "Blanco"]
  },
  {
    id: 2,
    name: "Blusa con detalles",
    price: 65.00,
    category: "blusas",
    image: "polocamisero.jpg",
    badge: "MÁS VENDIDO",
    sizes: ["S", "M"],
    colors: ["Marfil", "Azul Marino"]
  }
];

let cart = [];
let selectedOptions = {};

// Cargar catálogo en pantalla
function renderCatalog(items) {
  const container = document.getElementById("catalog-container");
  container.innerHTML = "";

  items.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    let badgeHTML = product.badge ? `<span class="badge">${product.badge}</span>` : "";

    let sizesHTML = product.sizes.map(size => 
      `<button class="size-btn" onclick="selectOption(${product.id}, 'size', '${size}', this)">${size}</button>`
    ).join("");

    let colorsHTML = product.colors.map(color => 
      `<button class="color-btn" onclick="selectOption(${product.id}, 'color', '${color}', this)">${color}</button>`
    ).join("");

    card.innerHTML = `
      ${badgeHTML}
      <img src="${product.image}" alt="${product.name}">
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">S/ ${product.price.toFixed(2)}</p>
      
      <div class="options-group">
        <label>TALLA</label>
        <div>${sizesHTML}</div>
      </div>
      
      <div class="options-group">
        <label>COLOR</label>
        <div>${colorsHTML}</div>
      </div>

      <button class="add-cart-btn" onclick="addToCart(${product.id})">Agregar al Carrito</button>
    `;
    container.appendChild(card);
  });
}

// Selección de opción de talla y color
function selectOption(productId, type, value, element) {
  if (!selectedOptions[productId]) {
    selectedOptions[productId] = {};
  }
  selectedOptions[productId][type] = value;

  const parent = element.parentElement;
  const buttons = parent.querySelectorAll("button");
  buttons.forEach(btn => btn.classList.remove("selected"));
  element.classList.add("selected");
}

// Agregar productos al carrito
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const options = selectedOptions[productId] || {};

  if (!options.size || !options.color) {
    alert("Por favor selecciona una talla y un color antes de agregar al carrito.");
    return;
  }

  const cartItem = {
    ...product,
    selectedSize: options.size,
    selectedColor: options.color,
    cartId: Date.now()
  };

  cart.push(cartItem);
  updateCartUI();
}

// Actualizar interfaz del carrito
function updateCartUI() {
  document.getElementById("cart-count").innerText = cart.length;
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price;
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p><small>Talla: ${item.selectedSize} | Color: ${item.selectedColor}</small></p>
        <p><strong>S/ ${item.price.toFixed(2)}</strong></p>
      </div>
      <button class="close-btn" onclick="removeFromCart(${index})">&times;</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  const shippingCost = parseFloat(document.getElementById("shipping-method").value) || 0;
  const total = subtotal + shippingCost;
  document.getElementById("cart-total-price").innerText = `S/ ${total.toFixed(2)}`;
}

// Eliminar elemento del carrito
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// Control del Modal Carrito
document.getElementById("cart-btn").addEventListener("click", () => {
  document.getElementById("cart-modal").classList.remove("hidden");
});

document.getElementById("close-cart-btn").addEventListener("click", () => {
  document.getElementById("cart-modal").classList.add("hidden");
});

document.getElementById("shipping-method").addEventListener("change", updateCartUI);

// Enviar pedido por WhatsApp
document.getElementById("whatsapp-btn").addEventListener("click", () => {
  const name = document.getElementById("client-name").value.trim();
  const address = document.getElementById("client-address").value.trim();

  if (cart.length === 0) {
    alert("El carrito está vacío.");
    return;
  }
  if (!name || !address) {
    alert("Por favor completa tu nombre y dirección de entrega.");
    return;
  }

  let text = `¡Hola AURA Boutique! Quiero realizar el siguiente pedido:\n\n`;
  cart.forEach(item => {
    text += `• 1x ${item.name} (Talla: ${item.selectedSize}, Color: ${item.selectedColor}) - S/ ${item.price.toFixed(2)}\n`;
  });

  const shippingSelect = document.getElementById("shipping-method");
  const shippingText = shippingSelect.options[shippingSelect.selectedIndex].text;
  const totalText = document.getElementById("cart-total-price").innerText;

  text += `\nMétodo de Envío: ${shippingText}\n`;
  text += `Total a pagar: ${totalText}\n\n`;
  text += `Datos del Cliente:\n`;
  text += `Nombre: ${name}\n`;
  text += `Dirección: ${address}`;

  const phone = "51987654321"; // Reemplazar con el número de teléfono real
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
});

// Cargar catálogo inicial
renderCatalog(products);