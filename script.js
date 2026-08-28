// Arreglo de productos apuntando a la imagen subida en el repositorio
const products = [
    {
        id: 1,
        title: "Polo Camisero Elegante",
        price: 75.00,
        category: "polos",
        badge: "DESTACADO",
        image: "polocamisero.jpg", // Usa el archivo subido
        sizes: ["S", "M", "L"],
        colors: ["Blanco", "Negro", "Beige"]
    }
];

let cart = [];

// Elementos del DOM
const productGrid = document.getElementById('product-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const checkoutForm = document.getElementById('checkout-form');

// Inicializar Tienda
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupFilters();
});

// Renderizar Productos
function renderProducts(items) {
    productGrid.innerHTML = '';
    
    if (items.length === 0) {
        productGrid.innerHTML = '<p>No se encontraron productos en esta categoría.</p>';
        return;
    }

    items.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        
        card.innerHTML = `
            ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">S/ ${product.price.toFixed(2)}</p>
                
                <div class="options-group">
                    <label>Talla:</label>
                    <div class="options-buttons" id="size-options-${product.id}">
                        ${product.sizes.map((size, index) => `
                            <button type="button" class="option-btn ${index === 0 ? 'selected' : ''}" data-type="size" data-val="${size}">${size}</button>
                        `).join('')}
                    </div>
                </div>

                <div class="options-group">
                    <label>Color:</label>
                    <div class="options-buttons" id="color-options-${product.id}">
                        ${product.colors.map((color, index) => `
                            <button type="button" class="option-btn ${index === 0 ? 'selected' : ''}" data-type="color" data-val="${color}">${color}</button>
                        `).join('')}
                    </div>
                </div>

                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Agregar al Carrito</button>
            </div>
        `;
        productGrid.appendChild(card);
    });

    setupOptionSelectors();
}

function setupOptionSelectors() {
    document.querySelectorAll('.options-buttons').forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                container.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const selectedSize = document.querySelector(`#size-options-${productId} .option-btn.selected`)?.dataset.val || product.sizes[0];
    const selectedColor = document.querySelector(`#color-options-${productId} .option-btn.selected`)?.dataset.val || product.colors[0];

    const cartItem = {
        ...product,
        selectedSize,
        selectedColor,
        cartId: `${product.id}-${selectedSize}-${selectedColor}`
    };

    cart.push(cartItem);
    updateCartUI();
    openCart();
}

function updateCartUI() {
    cartCountEl.textContent = cart.length;
    cartItemsContainer.innerHTML = '';

    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div>
                <strong>${item.title}</strong><br>
                <small>Talla: ${item.selectedSize} | Color: ${item.selectedColor}</small><br>
                <span>S/ ${item.price.toFixed(2)}</span>
            </div>
            <button class="close-btn" onclick="removeFromCart(${index})">&times;</button>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    const shippingCost = parseFloat(document.getElementById('shipping-method').value || 0);
    const total = subtotal + shippingCost;
    cartTotalPriceEl.textContent = `S/ ${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

cartToggleBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);

function openCart() {
    cartSidebar.classList.add('open');
}

function closeCart() {
    cartSidebar.classList.remove('open');
}

document.getElementById('shipping-method').addEventListener('change', updateCartUI);

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts();
        });
    });

    searchInput.addEventListener('input', filterProducts);
}

function filterProducts() {
    const category = document.querySelector('.filter-btn.active').dataset.category;
    const query = document.getElementById('search-input').value.toLowerCase();

    const filtered = products.filter(p => {
        const matchesCategory = category === 'todos' || p.category === category;
        const matchesSearch = p.title.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
}

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    const name = document.getElementById('client-name').value;
    const address = document.getElementById('client-address').value;
    const shippingSelect = document.getElementById('shipping-method');
    const shippingText = shippingSelect.options[shippingSelect.selectedIndex].text;
    const total = cartTotalPriceEl.textContent;

    let message = `Hola *AURA Boutique*, me gustaría realizar un pedido:\n\n`;
    message += `👤 *Nombre:* ${name}\n`;
    message += `📍 *Dirección:* ${address}\n`;
    message += `🚚 *Envío:* ${shippingText}\n\n`;
    message += `🛍️ *Productos:*\n`;

    cart.forEach((item, i) => {
        message += `${i + 1}. ${item.title} (Talla: ${item.selectedSize}, Color: ${item.selectedColor}) - S/ ${item.price.toFixed(2)}\n`;
    });

    message += `\n💰 *Total a Pagar:* ${total}`;

    const phone = "51987654321";
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
});
