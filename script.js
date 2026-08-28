const PHONE_NUMBER = "51987654321"; 

const productsData = [
    {
        id: 1,
        name: "Falda Asimétrica",
        category: "faldas",
        price: 85.00,
        badge: "Nuevo",
        imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=600&auto=format&fit=crop", 
        variants: {
            sizes: ["S", "M", "L"],
            colors: [
                { name: "Negro", hex: "#000000" },
                { name: "Vino", hex: "#4a0414" },
                { name: "Blanco", hex: "#ffffff" }
            ]
        }
    },
    {
        id: 2,
        name: "Blusa con detalles",
        category: "blusas",
        price: 65.00,
        badge: "Más Vendido",
        imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=600&auto=format&fit=crop",
        variants: {
            sizes: ["S", "M"],
            colors: [
                { name: "Beige", hex: "#f5f5dc" },
                { name: "Azul Marino", hex: "#000080" }
            ]
        }
    }
];

let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
let selectedVariants = {};

// Elementos del DOM
const container = document.getElementById('products-container');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const searchInput = document.getElementById('search-input');
const shippingSelect = document.getElementById('shipping-select');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');

function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function renderProducts(productList = productsData) {
    if (!container) return;
    container.innerHTML = '';

    if (productList.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; margin-top: 30px;">No se encontraron prendas que coincidan con tu búsqueda.</p>';
        return;
    }

    productList.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const badgeHTML = product.badge 
            ? `<span class="badge ${product.badge.toLowerCase() === 'nuevo' ? 'nuevo' : ''}">${product.badge}</span>` 
            : '';

        const sizeOptionsHTML = product.variants.sizes.map(size =>
            `<button class="size-btn" data-product-id="${product.id}" data-size="${size}">${size}</button>`
        ).join('');

        const colorOptionsHTML = product.variants.colors.map(color =>
            `<button class="color-btn" style="background-color: ${color.hex}" data-product-id="${product.id}" data-color="${color.name}" title="${color.name}"></button>`
        ).join('');

        card.innerHTML = `
            <div class="product-image-container">
                ${badgeHTML}
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">S/ ${product.price.toFixed(2)}</p>
            <div class="variants-container">
                <div class="variant-section">
                    <p class="variant-title">Talla</p>
                    <div class="size-options">${sizeOptionsHTML}</div>
                </div>
                <div class="variant-section">
                    <p class="variant-title">Color</p>
                    <div class="color-options">${colorOptionsHTML}</div>
                </div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Agregar al Carrito</button>
        `;
        container.appendChild(card);
    });
}

// Selección de Variantes
if (container) {
    container.addEventListener('click', function(e) {
        const target = e.target;
        if (target.classList.contains('size-btn')) {
            const productId = target.dataset.productId;
            target.parentElement.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
            target.classList.add('selected');
            
            if (!selectedVariants[productId]) selectedVariants[productId] = {};
            selectedVariants[productId].size = target.dataset.size;
        }

        if (target.classList.contains('color-btn')) {
            const productId = target.dataset.productId;
            target.parentElement.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
            target.classList.add('selected');

            if (!selectedVariants[productId]) selectedVariants[productId] = {};
            selectedVariants[productId].color = target.dataset.color;
        }
    });
}

function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    const variant = selectedVariants[productId];

    if (!variant || !variant.size || !variant.color) {
        showToast("⚠️ Por favor selecciona una talla y un color.");
        return;
    }

    const itemKey = `${productId}-${variant.size}-${variant.color}`;
    const existingIndex = cart.findIndex(item => item.itemKey === itemKey);

    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({
            itemKey,
            id: product.id,
            name: product.name,
            price: product.price,
            size: variant.size,
            color: variant.color,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`✨ ¡${product.name} agregada al carrito!`);
}

function updateCartUI() {
    if (!cartCount || !cartItemsContainer || !cartTotalPrice) return;
    
    // Normalización de seguridad para datos antiguos guardados en localStorage
    cart = cart.map(item => ({
        ...item,
        quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1,
        price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0
    }));

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">El carrito está vacío</p>';
    } else {
        cart.forEach((item, index) => {
            const itemQuantity = item.quantity || 1;
            const itemPrice = item.price || 0;
            const itemTotal = itemPrice * itemQuantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Talla: ${item.size} | Color: ${item.color}</p>
                    <p>Cant: ${itemQuantity} x S/ ${itemPrice.toFixed(2)} = <strong>S/ ${itemTotal.toFixed(2)}</strong></p>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${index})" title="Eliminar producto">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const shippingCost = parseFloat(shippingSelect ? shippingSelect.value : 0) || 0;
    const total = cart.length > 0 ? (subtotal + shippingCost) : 0;

    cartTotalPrice.innerText = `S/ ${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

if (shippingSelect) {
    shippingSelect.addEventListener('change', updateCartUI);
}

// Control de Apertura/Cierre de Carrito
function openCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    }
}

function closeCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    }
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Filtros y Búsqueda
function filterProducts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeCategoryBtn = document.querySelector('.category-btn.active');
    const activeCategory = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'todos';

    const filtered = productsData.filter(product => {
        const matchesCategory = activeCategory === 'todos' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
}

if (searchInput) searchInput.addEventListener('input', filterProducts);

const categoriesContainer = document.getElementById('categories-container');
if (categoriesContainer) {
    categoriesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts();
        }
    });
}

// Modal Guía de Tallas
const sizeModal = document.getElementById('size-modal');
const sizeGuideBtn = document.getElementById('size-guide-btn');
const closeSizeModal = document.getElementById('close-size-modal');

if (sizeGuideBtn && sizeModal) {
    sizeGuideBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sizeModal.classList.add('open');
    });
}

if (closeSizeModal && sizeModal) {
    closeSizeModal.addEventListener('click', () => {
        sizeModal.classList.remove('open');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === sizeModal) {
        sizeModal.classList.remove('open');
    }
});

// Checkout con WhatsApp
const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("🛒 El carrito está vacío.");
            return;
        }

        const customerName = document.getElementById('customer-name').value.trim();
        const customerAddress = document.getElementById('customer-address').value.trim();

        if (!customerName || !customerAddress) {
            showToast("⚠️ Ingresa tu nombre y dirección de entrega.");
            return;
        }

        let message = `¡Hola AURA Boutique! ✨ Quiero realizar el siguiente pedido:\n\n`;
        message += `👤 *Cliente:* ${customerName}\n`;
        message += `📍 *Dirección:* ${customerAddress}\n\n`;
        message += `*Detalle de prendas:*\n`;

        let subtotal = 0;
        cart.forEach((item, i) => {
            const itemQuantity = item.quantity || 1;
            const itemPrice = item.price || 0;
            const itemTotal = itemPrice * itemQuantity;
            message += `${i + 1}. *${item.name}*\n   - Talla: ${item.size}\n   - Color: ${item.color}\n   - Cantidad: ${itemQuantity}\n   - Subtotal: S/ ${itemTotal.toFixed(2)}\n\n`;
            subtotal += itemTotal;
        });

        const shippingCost = parseFloat(shippingSelect ? shippingSelect.value : 0) || 0;
        const shippingText = shippingSelect.options[shippingSelect.selectedIndex].text;
        const total = subtotal + shippingCost;

        message += `*Envío:* ${shippingText}\n`;
        message += `*TOTAL A PAGAR: S/ ${total.toFixed(2)}*`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
    });
}

// Carga Inicial
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});