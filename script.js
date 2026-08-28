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
        imageUrl: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=600&auto=format&fit=crop",
        variants: {
            sizes: ["S", "M"],
            colors: [
                { name: "Beige", hex: "#f5f5dc" },
                { name: "Azul Marino", hex: "#000080" }
            ]
        }
    }
];

// Cargar Carrito desde LocalStorage
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
let selectedVariants = {};

const container = document.getElementById('products-container');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const searchInput = document.getElementById('search-input');
const shippingSelect = document.getElementById('shipping-select');

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
                <img src="${product.imageUrl}" alt="${product.name}">
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
        alert("Por favor selecciona una talla y un color.");
        return;
    }

    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        size: variant.size,
        color: variant.color
    };

    cart.push(cartItem);
    saveCart();
    updateCartUI();
    showToast(`¡${product.name} agregada al carrito! ✨`);
}

function updateCartUI() {
    if (!cartCount || !cartItemsContainer || !cartTotalPrice) return;
    
    cartCount.innerText = cart.length;
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">El carrito está vacío</p>';
        cartTotalPrice.innerText = 'S/ 0.00';
        return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Talla: ${item.size} | Color: ${item.color}</p>
                <p><strong>S/ ${item.price.toFixed(2)}</strong></p>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})">&times;</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    const shippingCost = parseFloat(shippingSelect ? shippingSelect.value : 0);
    const total = subtotal + shippingCost;

    cartTotalPrice.innerText = `S/ ${total.toFixed(2)}`;
}

if (shippingSelect) {
    shippingSelect.addEventListener('change', updateCartUI);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

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

const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// MODAL GUÍA DE TALLAS
const sizeModal = document.getElementById('size-modal');
const sizeGuideBtn = document.getElementById('size-guide-btn');
const closeSizeModal = document.getElementById('close-size-modal');

if (sizeGuideBtn) sizeGuideBtn.addEventListener('click', () => sizeModal.classList.add('open'));
if (closeSizeModal) closeSizeModal.addEventListener('click', () => sizeModal.classList.remove('open'));

// CHECKOUT WHATSAPP
const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        let message = "¡Hola AURA Boutique! ✨ Quiero realizar el siguiente pedido:\n\n";
        let subtotal = 0;

        cart.forEach((item, i) => {
            message += `${i + 1}. *${item.name}*\n   - Talla: ${item.size}\n   - Color: ${item.color}\n   - Precio: S/ ${item.price.toFixed(2)}\n\n`;
            subtotal += item.price;
        });

        const shippingCost = parseFloat(shippingSelect ? shippingSelect.value : 0);
        const shippingText = shippingSelect.options[shippingSelect.selectedIndex].text;
        const total = subtotal + shippingCost;

        message += `*Método de envío:* ${shippingText}\n`;
        message += `*Total a pagar: S/ ${total.toFixed(2)}*`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
    });
}

// Carga Inicial
renderProducts();
updateCartUI();