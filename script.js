// ==========================================
// 1. BASE DE DATOS CON RUTAS REALES
// ==========================================
// Usamos la ruta exacta detectada: imagenes/polos/nombre_foto.jpg
const products = [
  {
    id: 1,
    name: "Polo Camisero",
    category: "Polos",
    price: 65.00,
    sizes: ["S", "M", "L"],
    colors: ["Vino", "Negro", "Blanco"],
    image: "polocamisero.jpg"
  },
  {
    id: 2,
    name: "Casaca Denim Classic",
    category: "Casacas",
    price: 120.00,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Azul", "Negro"],
    image: "imagenes/polos/casaca.jpg" // Si tienes fotos en otras subcarpetas, cambia 'polos' por el nombre correspondiente
  },
  {
    id: 3,
    name: "Pantalón Cargo",
    category: "Pantalones",
    price: 95.00,
    sizes: ["M", "L", "XL"],
    colors: ["Beige", "Verde", "Negro"],
    image: "imagenes/polos/pantalon.jpg"
  },
  {
    id: 4,
    name: "Polera Hooded",
    category: "Poleras",
    price: 110.00,
    sizes: ["S", "M", "L"],
    colors: ["Gris", "Negro"],
    image: "imagenes/polos/polera.jpg"
  }
];

let cart = [];
const PHONE_NUMBER = "51999999999"; // Reemplaza con tu número de WhatsApp
const FALLBACK_IMAGE = "https://via.placeholder.com/300x200?text=Imagen+No+Encontrada";

// ==========================================
// 2. PERSISTENCIA EN LOCALSTORAGE
// ==========================================
function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('shopping_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function saveCartToLocalStorage() {
  localStorage.setItem('shopping_cart', JSON.stringify(cart));
}

// ==========================================
// 3. RENDERIZADO DEL CATÁLOGO
// ==========================================
function displayProducts(productsToRender) {
  const grid = document.getElementById('product-grid');
  
  if (productsToRender.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No se encontraron prendas que coincidan con tu búsqueda.</p>`;
    return;
  }

  grid.innerHTML = productsToRender.map(product => {
    const sizeOptions = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
    const colorOptions = product.colors.map(c => `<option value="${c}">${c}</option>`).join('');

    return `
      <div class="product-card">
        <img 
          src="${product.image}" 
          alt="${product.name}"
          onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
        >
        <h3>${product.name}</h3>
        <p class="price">S/ ${product.price.toFixed(2)}</p>
        
        <div class="product-options">
          <select id="size-${product.id}">${sizeOptions}</select>
          <select id="color-${product.id}">${colorOptions}</select>
        </div>

        <button class="add-btn" onclick="addToCart(${product.id})">Agregar al carrito</button>
      </div>
    `;
  }).join('');
}

function filterProducts() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const selectedCategory = document.getElementById('category-select').value;

  const filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = (selectedCategory === "todas") || (product.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  displayProducts(filtered);
}

// ==========================================
// 4. GESTIÓN DEL CARRITO
// ==========================================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const selectedSize = document.getElementById(`size-${productId}`).value;
  const selectedColor = document.getElementById(`color-${productId}`).value;

  const existingItem = cart.find(item => 
    item.id === productId && 
    item.selectedSize === selectedSize && 
    item.selectedColor === selectedColor
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const cartItem = {
      ...product,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      quantity: 1,
      cartItemId: Date.now()
    };
    cart.push(cartItem);
  }

  saveCartToLocalStorage();
  updateCartUI();
}

function changeQuantity(cartItemId, delta) {
  const item = cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.cartItemId !== cartItemId);
  }

  saveCartToLocalStorage();
  updateCartUI();
}

function clearCart() {
  if (cart.length === 0) {
    alert("El carrito ya está vacío.");
    return;
  }

  if (confirm("¿Estás seguro de que deseas vaciar todo el carrito?")) {
    cart = [];
    saveCartToLocalStorage();
    updateCartUI();
  }
}

function updateCartUI() {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').innerText = totalItemsCount;
  
  const cartList = document.getElementById('cart-items');
  
  if (cart.length === 0) {
    cartList.innerHTML = '<li>El carrito está vacío.</li>';
  } else {
    cartList.innerHTML = cart.map(item => `
      <li style="margin-bottom: 10px;">
        <strong>${item.name}</strong><br>
        Talla: ${item.selectedSize} | Color: ${item.selectedColor}<br>
        Precio unitario: S/ ${item.price.toFixed(2)}<br>
        
        <div class="quantity-controls">
          <span>Cantidad:</span>
          <button class="qty-btn" onclick="changeQuantity(${item.cartItemId}, -1)">-</button>
          <span class="qty-number">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity(${item.cartItemId}, 1)">+</button>
          <span style="margin-left: auto; font-weight: bold;">Subtotal: S/ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
      </li>
    `).join('');
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('cart-total').innerText = total.toFixed(2);
}

function toggleCart() {
  document.getElementById('cart-modal').classList.toggle('hidden');
}

// ==========================================
// 5. ENVIAR A WHATSAPP
// ==========================================
function sendWhatsAppOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Tu carrito está vacío. Agrega algunos productos antes de realizar el pedido.");
    return;
  }

  const name = document.getElementById('customer-name').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  const notes = document.getElementById('customer-notes').value.trim();
  const paymentMethod = document.getElementById('payment-method').value;

  let message = `*NUEVO PEDIDO - MODA URBANA*\n\n`;
  message += `👤 *Cliente:* ${name}\n`;
  message += `📍 *Dirección:* ${address}\n`;
  if (notes) {
    message += `📝 *Referencia:* ${notes}\n`;
  }
  message += `💳 *Método de Pago:* ${paymentMethod}\n`;

  message += `\n*Detalle de la compra:*\n`;
  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    message += `${index + 1}. ${item.name} [x${item.quantity}] (Talla: ${item.selectedSize}, Color: ${item.selectedColor}) - Subtotal: S/ ${subtotal.toFixed(2)}\n`;
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  message += `\n💰 *Total a pagar:* S/ ${total.toFixed(2)}`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
}

// ==========================================
// 6. INICIALIZACIÓN
// ==========================================
function initApp() {
  loadCartFromLocalStorage();
  displayProducts(products);
  updateCartUI();
}

initApp();