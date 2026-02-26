// Premium Sticky Header Logic
const header = document.getElementById('main-header');
const announcementBar = document.querySelector('.announcement-bar');
const announcementHeight = announcementBar ? announcementBar.offsetHeight : 0;

function handleScroll() {
    if (window.scrollY > announcementHeight) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll);
handleScroll();

// Dynamic Auth Modal Injection (Ensures login works on all pages)
if (!document.getElementById('auth-modal')) {
    const authModalHTML = `
    <div id="auth-modal" class="modal">
        <div class="modal-content">
            <span id="close-auth" class="close-btn">&times;</span>
            <div id="login-form-container">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group"><label>Email</label><input type="email" id="login-email" required></div>
                    <div class="form-group"><label>Password</label><input type="password" id="login-password" required></div>
                    <button type="submit" class="btn">Login</button>
                    <p class="form-switch">Don't have an account? <a href="javascript:void(0)" id="switch-to-register">Register here</a></p>
                </form>
            </div>
            <div id="register-form-container" style="display: none;">
                <h2>Register</h2>
                <form id="register-form">
                    <div class="form-group"><label>Full Name</label><input type="text" id="reg-name" required></div>
                    <div class="form-group"><label>Email</label><input type="email" id="reg-email" required></div>
                    <div class="form-group"><label>Password</label><input type="password" id="reg-password" required></div>
                    <button type="submit" class="btn">Create Account</button>
                    <p class="form-switch">Already have an account? <a href="javascript:void(0)" id="switch-to-login">Login here</a></p>
                </form>
            </div>
            <div id="forgot-form-container" style="display: none;">
                <h2>Reset Password</h2>
                <form id="forgot-form">
                    <p>Enter your email to receive a password reset link.</p>
                    <div class="form-group"><label>Email</label><input type="email" id="forgot-email" required></div>
                    <button type="submit" class="btn">Send Link</button>
                    <p class="form-switch"><a href="javascript:void(0)" id="back-to-login">Back to Login</a></p>
                </form>
            </div>
            <div id="profile-form-container" style="display: none;">
                <div class="modal-header-profile">
                    <h2>My Profile</h2>
                    <button id="logout-customer" class="logout-link">Logout</button>
                </div>
                <form id="profile-form">
                    <div class="form-group"><label>Display Name</label><input type="text" id="profile-name" placeholder="Your Name"></div>
                    <div class="form-group"><label>Skin Type</label><select id="profile-skin-type"><option value="normal">Normal</option><option value="dry">Dry</option><option value="oily">Oily</option><option value="sensitive">Sensitive</option></select></div>
                    <div class="form-group"><label>Hair Type</label><select id="profile-hair-type"><option value="straight">Straight</option><option value="wavy">Wavy</option><option value="curly">Curly</option><option value="dry">Dry Scalp</option></select></div>
                    <div class="form-group"><label>Bio / Concerns</label><textarea id="profile-bio" placeholder="e.g. Dry skin and acne..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 12px; font-family: inherit; height: 80px;"></textarea></div>
                    <button type="submit" class="btn" style="width: 100%;">Update Profile</button>
                </form>
                <div class="profile-history-section">
                    <h3><i class="fa-solid fa-box-open" style="color: #8b6e4e;"></i> Order History</h3>
                    <div id="customer-order-history" style="max-height: 150px; overflow-y: auto;"></div>
                </div>
                <div class="profile-history-section">
                    <h3><i class="fa-solid fa-video" style="color: #8b6e4e;"></i> Consultations</h3>
                    <div id="customer-consultation-history" style="max-height: 150px; overflow-y: auto;"></div>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', authModalHTML);
}
if (!document.getElementById('drawer-overlay')) {
    document.body.insertAdjacentHTML('beforeend', '<div id="drawer-overlay" class="drawer-overlay"></div>');
}

// --- TOAST NOTIFICATION ---
function showToast(message, icon = 'fa-check-circle') {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}


// --- CART LOGIC ---
let cart = JSON.parse(localStorage.getItem('glowcare_cart')) || [];

function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalCount);
}

function saveCart() {
    localStorage.setItem('glowcare_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
        }
    }
}

function renderCart() {
    const cartItemsList = document.getElementById('cart-items');
    const totalAmountEl = document.getElementById('cart-total-amount');

    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart-msg">Your cart is currently empty.</p>';
        totalAmountEl.textContent = 'Rs. 0.00';
        return;
    }

    let total = 0;
    cartItemsList.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="price">Rs. ${item.price.toFixed(2)}</p>
                    <div class="cart-qty">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
            </div>
        `;
    }).join('');

    totalAmountEl.textContent = `Rs. ${total.toFixed(2)}`;
}

// Drawer Controls
const cartIcon = document.getElementById('cart-icon');
const closeCart = document.getElementById('close-cart');
const cartDrawer = document.getElementById('cart-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');

function openCart() {
    cartDrawer.classList.add('active');
    if (drawerOverlay) drawerOverlay.classList.add('active');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('active');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
}

if (cartIcon) cartIcon.addEventListener('click', openCart);
if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeCartDrawer);

// Product Quick Add Functionality
function initQuickAdd() {
    document.querySelectorAll('.product-card').forEach(card => {
        // Skip if already has listener
        if (card.dataset.listener === 'true') return;

        const addBtn = card.querySelector('.quick-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const product = {
                    id: card.dataset.id,
                    name: card.dataset.name,
                    price: parseFloat(card.dataset.price),
                    image: card.querySelector('.product-image').src
                };
                addToCart(product);
                showToast(`${product.name} added to cart! ✨`);
            });
            card.dataset.listener = 'true';
        }
    });
}

// Render products added by Agents
function renderDynamicProducts() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    // Identify category from page title
    const pageTitle = document.querySelector('.section-title h2')?.textContent.toLowerCase() || "";
    let category = '';
    if (pageTitle.includes('skin')) category = 'skincare';
    if (pageTitle.includes('hair')) category = 'haircare';

    // Only add to collection pages, not the home page
    if (!category) return;

    const addedProducts = JSON.parse(localStorage.getItem('glowcare_added_products')) || [];
    const filtered = addedProducts.filter(p => p.category === category);

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = p.id;
        card.dataset.name = p.name;
        card.dataset.price = p.price;
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x400?text=Organic+Product'">
                <div class="quick-add">Quick Add +</div>
            </div>
            <div class="product-info">
                <span class="badge-agent" style="background:var(--accent-color); color:white; padding:2px 8px; border-radius:4px; font-size:0.7rem; position:absolute; top:20px; left:20px; font-weight:700; letter-spacing:1px;">AGENT CHOICE</span>
                <h3>${p.name}</h3>
                <p class="price">Rs. ${p.price}.00</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Initialize all UI components
renderDynamicProducts();
initQuickAdd();

// --- SEARCH LOGIC ---
const searchToggle = document.querySelector('.fa-magnifying-glass').parentElement;
const searchOverlay = document.getElementById('search-overlay');
const closeSearch = document.getElementById('close-search');
const searchForm = document.getElementById('search-form');

function openSearch() {
    searchOverlay.classList.add('active');
    document.getElementById('search-input').focus();
}

function closeSearchOverlay() {
    searchOverlay.classList.remove('active');
}

if (searchToggle) searchToggle.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
});
if (closeSearch) closeSearch.addEventListener('click', closeSearchOverlay);

if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('search-input').value;
        alert('Searching for: ' + query + '\n(Search feature will be connected to product database soon!)');
        closeSearchOverlay();
    });
}

// --- AUTH MODAL LOGIC ---
const userIcon = document.getElementById('user-icon');
let authModal = document.getElementById('auth-modal');
let modalOverlay = document.getElementById('drawer-overlay');
let closeAuth = document.getElementById('close-auth');

let loginContainer = document.getElementById('login-form-container');
let registerContainer = document.getElementById('register-form-container');
let forgotContainer = document.getElementById('forgot-form-container');
let profileContainer = document.getElementById('profile-form-container');

// Re-check for elements in case they were injected
function initAuth() {
    authModal = document.getElementById('auth-modal');
    closeAuth = document.getElementById('close-auth');
    loginContainer = document.getElementById('login-form-container');
    registerContainer = document.getElementById('register-form-container');
    forgotContainer = document.getElementById('forgot-form-container');
    profileContainer = document.getElementById('profile-form-container');

    if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);
}
initAuth();

function openAuth() {
    initAuth(); // Refresh references before opening
    const customerEmail = localStorage.getItem('glowcare_customer_email');
    if (customerEmail) {
        // Show Profile if logged in
        if (loginContainer) loginContainer.style.display = 'none';
        if (registerContainer) registerContainer.style.display = 'none';
        if (forgotContainer) forgotContainer.style.display = 'none';
        if (profileContainer) profileContainer.style.display = 'block';

        // Load saved data
        const profileData = JSON.parse(localStorage.getItem('profile_' + customerEmail)) || {};
        const pName = document.getElementById('profile-name');
        const pSkin = document.getElementById('profile-skin-type');
        const pHair = document.getElementById('profile-hair-type');
        const pBio = document.getElementById('profile-bio');

        if (pName) pName.value = profileData.name || '';
        if (pSkin) pSkin.value = profileData.skinType || 'normal';
        if (pHair) pHair.value = profileData.hairType || 'straight';
        if (pBio) pBio.value = profileData.bio || '';

        // Load Order History
        const allOrders = JSON.parse(localStorage.getItem('glowcare_orders')) || [];
        const customerOrders = allOrders.filter(o => o.email === customerEmail);
        const orderHistoryEl = document.getElementById('customer-order-history');
        if (orderHistoryEl) {
            orderHistoryEl.innerHTML = customerOrders.length > 0 ? customerOrders.map(order => `
                <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px; margin-bottom: 10px; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: 600;">
                        <span>Order #${order.id}</span>
                        <span style="color: #8b6e4e;">${order.status}</span>
                    </div>
                    <div style="margin-top: 5px; opacity: 0.7;">${order.date}</div>
                    <div style="margin-top: 5px;">Total: Rs. ${order.total.toFixed(2)}</div>
                </div>
            `).join('') : '<p style="font-size: 0.9rem; opacity: 0.6; text-align: center;">No orders yet.</p>';
        }

        // Load Consultation Records
        const allConsultations = JSON.parse(localStorage.getItem('glowcare_consultations')) || [];
        const customerConsultations = allConsultations.filter(c => c.customerEmail === customerEmail);
        const consultHistoryEl = document.getElementById('customer-consultation-history');
        if (consultHistoryEl) {
            consultHistoryEl.innerHTML = customerConsultations.length > 0 ? customerConsultations.map(c => `
                <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px; margin-bottom: 10px; font-size: 0.85rem;">
                    <div style="font-weight: 600;">Specialist: ${c.doctorName}</div>
                    <div style="margin-top: 5px; opacity: 0.7;">Date: ${c.date}</div>
                    <div style="margin-top: 5px; color: #8b6e4e;">Duration: ${c.duration} mins</div>
                </div>
            `).join('') : '<p style="font-size: 0.9rem; opacity: 0.6; text-align: center;">No doctor sessions record.</p>';
        }
    } else {
        // Show Login if not logged in
        if (profileContainer) profileContainer.style.display = 'none';
        if (loginContainer) loginContainer.style.display = 'block';
    }

    if (authModal) authModal.classList.add('active');
    if (modalOverlay) modalOverlay.classList.add('active');
}

function closeAuthModal() {
    if (authModal) authModal.classList.remove('active');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

if (userIcon) userIcon.addEventListener('click', openAuth);
if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);

// --- CHECKOUT MODAL LOGIC ---
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');

function openCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'fa-triangle-exclamation');
        return;
    }
    closeCartDrawer();

    // Pre-fill if logged in
    const email = localStorage.getItem('glowcare_customer_email');
    if (email) {
        if (document.getElementById('ship-email')) document.getElementById('ship-email').value = email;
        const profile = JSON.parse(localStorage.getItem('profile_' + email)) || {};
        if (profile.name && document.getElementById('ship-name')) {
            document.getElementById('ship-name').value = profile.name;
        }
    }

    if (checkoutModal) checkoutModal.classList.add('active');
    if (modalOverlay) modalOverlay.classList.add('active');
}

function closeCheckoutModal() {
    if (checkoutModal) checkoutModal.classList.remove('active');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

if (closeCheckout) closeCheckout.addEventListener('click', closeCheckoutModal);

// Global Overlay Click Listener
if (modalOverlay) {
    modalOverlay.addEventListener('click', () => {
        closeAuthModal();
        closeCheckoutModal();
    });
}

// Event Delegation for All Dynamic Buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('checkout-btn')) {
        openCheckout();
    }
    if (e.target.id === 'switch-to-register') {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    }
    if (e.target.id === 'switch-to-login' || e.target.id === 'back-to-login') {
        registerContainer.style.display = 'none';
        forgotContainer.style.display = 'none';
        profileContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    }
    if (e.target.id === 'switch-to-forgot') {
        loginContainer.style.display = 'none';
        forgotContainer.style.display = 'block';
    }
    if (e.target.id === 'logout-customer') {
        localStorage.removeItem('glowcare_customer_email');
        alert('Logged out successfully!');
        location.reload();
    }
});

// Consolidated Form Submissions using Event Delegation
document.addEventListener('submit', (e) => {
    const target = e.target;

    // Login Form
    if (target.id === 'login-form') {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const blockedIds = JSON.parse(localStorage.getItem('glowcare_blocked_ids')) || [];

        if (blockedIds.includes(email)) {
            alert('ACCESS REVOKED: Your account has been suspended.');
            return;
        }

        localStorage.setItem('glowcare_customer_email', email);
        showToast('Successfully Logged In! ✨');
        openAuth();
    }

    // Register Form
    if (target.id === 'register-form') {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        localStorage.setItem('glowcare_customer_email', email);
        showToast('Successfully Registered! 🎉');
        openAuth();
    }

    // Profile Form
    if (target.id === 'profile-form') {
        e.preventDefault();
        const email = localStorage.getItem('glowcare_customer_email');
        if (!email) return;

        const profileData = {
            name: document.getElementById('profile-name').value,
            skinType: document.getElementById('profile-skin-type').value,
            hairType: document.getElementById('profile-hair-type').value,
            bio: document.getElementById('profile-bio')?.value || ''
        };

        localStorage.setItem('profile_' + email, JSON.stringify(profileData));
        showToast('Profile updated successfully! ✨');
        closeAuthModal();
    }

    // Checkout Form
    if (target.id === 'checkout-form') {
        e.preventDefault();
        const orderId = 'GC-' + Math.floor(1000 + Math.random() * 9000);
        const orderData = {
            id: orderId,
            name: document.getElementById('ship-name').value,
            email: document.getElementById('ship-email').value,
            address: document.getElementById('ship-address').value,
            phone: document.getElementById('ship-phone').value,
            payment: document.getElementById('payment-method').value,
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Processing',
            date: new Date().toLocaleString()
        };

        let orders = JSON.parse(localStorage.getItem('glowcare_orders')) || [];
        orders.unshift(orderData);
        localStorage.setItem('glowcare_orders', JSON.stringify(orders));

        document.getElementById('checkout-form-container').style.display = 'none';
        document.getElementById('checkout-success').style.display = 'block';
        document.getElementById('order-id').textContent = '#' + orderId;

        cart = [];
        saveCart();
    }
});

// Helper to record consultations
function recordConsultation(doctorName, durationMins) {
    const customerEmail = localStorage.getItem('glowcare_customer_email');
    if (!customerEmail) return;

    const session = {
        doctorName: doctorName,
        customerEmail: customerEmail,
        duration: durationMins,
        date: new Date().toLocaleString()
    };

    let history = JSON.parse(localStorage.getItem('glowcare_consultations')) || [];
    history.unshift(session);
    localStorage.setItem('glowcare_consultations', JSON.stringify(history));
}



// Payment Method Toggle
document.getElementById('payment-method')?.addEventListener('change', (e) => {
    const cardDetails = document.getElementById('card-details');
    if (cardDetails) {
        cardDetails.style.display = e.target.value === 'card' ? 'block' : 'none';
    }
});

// Initial Load
updateCartCount();
renderCart();

// Newsletter
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        if (input.value) {
            input.value = '';
            input.placeholder = 'Subscribed!';
            setTimeout(() => { input.placeholder = 'Your email address'; }, 3000);
        }
    });
}

// Smooth Scroll
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - header.offsetHeight,
                behavior: 'smooth'
            });
        }
    });
});

// --- GLOWY AI CHATBOT LOGIC ---
const glowyWidget = document.getElementById('glowy-chatbot');
const glowyTrigger = document.getElementById('glowy-trigger');
const closeGlowy = document.getElementById('close-glowy');
const glowyForm = document.getElementById('glowy-form');
const glowyBody = document.getElementById('glowy-body');
const glowyInput = document.getElementById('glowy-input');

// Toggle Chatbot
glowyTrigger?.addEventListener('click', () => {
    glowyWidget.classList.toggle('active');
    glowyTrigger.style.display = 'none';
});

closeGlowy?.addEventListener('click', () => {
    glowyWidget.classList.remove('active');
    glowyTrigger.style.display = 'flex';
});

// Movable (Draggable) Functionality
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const glowyHeader = document.getElementById('glowy-header');

glowyHeader?.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === glowyHeader || glowyHeader.contains(e.target)) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        setTranslate(currentX, currentY, glowyWidget);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

// AI Logic & Knowledge Base
const SKINCARE_KNOWLEDGE = {
    "acne": {
        ans: "Acne and breakouts are often caused by clogged pores and excess oil. For this, we recommend deep cleansing with natural anti-bacterials.",
        prod: "Face Wash",
        link: "#skincare"
    },
    "pimple": {
        ans: "Dealing with pimples? It's best to avoid touching them and use a gentle, organic cleanser that balances your skin's pH levels.",
        prod: "Face Wash",
        link: "#skincare"
    },
    "dry": {
        ans: "Dry skin needs intense hydration! Our cold-pressed oils and superfood extracts provide deep nourishment and lock in moisture all day.",
        prod: "Face Cream",
        link: "#skincare"
    },
    "moistur": {
        ans: "Hydration is key! A good organic moisturizer helps maintain the skin barrier and keeps it supple.",
        prod: "Face Moisturizer",
        link: "#skincare"
    },
    "hair": {
        ans: "Hair health starts from the scalp. Our ancient herbal infusions help reduce hair fall and promote thick, lustrous growth.",
        prod: "Hair Oil",
        link: "#haircare"
    },
    "dandruff": {
        ans: "Flaky scalp? Our herbal oil with tea tree and neem properties helps soothe the scalp and clear dandruff naturally.",
        prod: "Dandruff Free Oil",
        link: "#haircare"
    },
    "glow": {
        ans: "To get that natural radiance, your skin needs antioxidants like Vitamin C. Our brightening serum is packed with these superfoods.",
        prod: "Face Serum",
        link: "#skincare"
    },
    "bright": {
        ans: "For a brighter, more even skin tone, we combine traditional wisdom with modern organic science.",
        prod: "Face Serum",
        link: "#skincare"
    },
    "oily": {
        ans: "Oily skin requires balanced hydration so your skin doesn't over-produce sebum. A lightweight cleanser is perfect.",
        prod: "Face Wash",
        link: "#skincare"
    },
    "dark spot": {
        ans: "Dark spots and pigmentation can be lightened with focused ingredients like Saffron and Vitamin C.",
        prod: "Face Cream",
        link: "#skincare"
    }
};

glowyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = glowyInput.value.trim().toLowerCase();
    if (!query) return;

    // User Message
    appendMessage(glowyInput.value.trim(), 'user');
    glowyInput.value = '';

    // Bot Response Logic
    setTimeout(() => {
        let response = "That's an interesting question! For specific concerns like that, focusing on an organic routine is best. Would you like to see our most popular superfood products?";
        let productTag = "";

        // Check for matches in knowledge base
        let matchFound = false;
        for (const [key, value] of Object.entries(SKINCARE_KNOWLEDGE)) {
            if (query.includes(key)) {
                response = value.ans;
                productTag = `<a href="${value.link}" class="product-ref">Recommeded: ${value.prod}</a>`;
                matchFound = true;
                break;
            }
        }

        // Generic greetings
        if (!matchFound) {
            if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
                response = "Hello! I'm Glowy. Ask me anything about your skin or hair routine, and I'll help you find the perfect organic solution! ✨";
            } else if (query.includes("thank")) {
                response = "You're very welcome! Stay regular with your routine for the best results. Don't forget to drink plenty of water! 💧";
            }
        }

        appendMessage(response + productTag, 'bot');
    }, 600);
});

function appendMessage(text, side) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('glowy-msg', side);
    msgDiv.innerHTML = text;
    glowyBody.appendChild(msgDiv);
    glowyBody.scrollTop = glowyBody.scrollHeight;
}

// --- UNIQUE FEATURE: SKIN RHYTHM RITUAL LOGIC ---
const ritualModal = document.getElementById('ritual-modal');
const openRitualBtn = document.getElementById('open-ritual');
const closeRitualBtn = document.getElementById('close-ritual-btn');
const startRitualBtn = document.getElementById('start-ritual-timer');

let selectedRitualType = 'morning';
let ritualTimer;

const ritualSteps = {
    morning: [
        { title: "Cleansing Breath", desc: "Wash your face with cold water. Breathe in freshness.", tip: "Pat dry with a clean, soft towel.", dur: 20 },
        { title: "Vitamin Boost", desc: "Apply 2-3 drops of Vitamin C serum.", tip: "Use upwards circular motions.", dur: 30 },
        { title: "Awaken Eyes", desc: "Gently tap eye cream around your sockets.", tip: "Use your ring finger for gentlest touch.", dur: 25 },
        { title: "Moisturize & Protect", desc: "Lock in hydration for the day ahead.", tip: "Don't forget your neck and ears!", dur: 30 }
    ],
    night: [
        { title: "Deep Purity", desc: "Double cleanse to remove the day's toxins.", tip: "Massaging for 30 seconds improves circulation.", dur: 30 },
        { title: "Repair Phase", desc: "Apply your retinol or night recovery oil.", tip: "Consistency is key for cell turnover.", dur: 30 },
        { title: "Soul Soothe", desc: "Five deep breaths while moisturizer absorbs.", tip: "Close your eyes and visualize healing.", dur: 30 },
        { title: "Night Seal", desc: "Apply lip balm and silk eye mask if available.", tip: "Sleep is the best skincare step.", dur: 20 }
    ],
    hair: [
        { title: "Detangle & Relax", desc: "Gently brush your hair to release the day's tension.", tip: "Work from ends upwards to minimize breakage.", dur: 30 },
        { title: "Scalp Stimulation", desc: "Massage 4-5 drops of Vitality Hair Oil into the roots.", tip: "Use your fingertips in slow, circular motions.", dur: 40 },
        { title: "Zen Absorption", desc: "Close your eyes and let the ancient herbs penetrate.", tip: "Visualize roots getting stronger and thicker.", dur: 30 },
        { title: "Silk Wrap", desc: "Wrap hair in a silk scarf or use a silk pillowcase.", tip: "Protection is the key to morning shine.", dur: 20 }
    ]
};

function selectRitual(type) {
    selectedRitualType = type;
    document.querySelectorAll('.ritual-opt').forEach(opt => opt.classList.remove('active'));
    document.querySelector('.ritual-opt.' + type).classList.add('active');
}

openRitualBtn?.addEventListener('click', () => ritualModal.classList.add('active'));
closeRitualBtn?.addEventListener('click', () => {
    ritualModal.classList.remove('active');
    clearInterval(ritualTimer);
});

startRitualBtn?.addEventListener('click', () => {
    document.getElementById('ritual-setup').classList.remove('active');
    document.getElementById('ritual-active').classList.add('active');
    runRitual(selectedRitualType);
});

async function runRitual(type) {
    const steps = ritualSteps[type];
    const circle = document.getElementById('ritual-circle');
    const timeDisplay = document.getElementById('ritual-time');

    for (const step of steps) {
        document.getElementById('ritual-step-title').textContent = step.title;
        document.getElementById('ritual-step-desc').textContent = step.desc;
        document.getElementById('ritual-tip').textContent = step.tip;

        let timeLeft = step.dur;
        const total = step.dur;

        await new Promise(resolve => {
            ritualTimer = setInterval(() => {
                timeLeft--;

                // Update countdown
                const mins = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                // Update Circle
                const offset = 283 - (timeLeft / total) * 283;
                circle.style.strokeDashoffset = offset;

                if (timeLeft <= 0) {
                    clearInterval(ritualTimer);
                    resolve();
                }
            }, 1000);
        });
    }

    document.getElementById('ritual-active').classList.remove('active');
    document.getElementById('ritual-complete').classList.add('active');
}

// --- UNIQUE FEATURE: CIRCADIAN SKIN-SYNC LOGIC ---
const skinsyncModal = document.getElementById('skinsync-modal');
const openSkinsyncBtn = document.getElementById('open-skinsync');
const closeSkinsyncBtn = document.getElementById('close-skinsync-btn');
const hourHand = document.getElementById('hour-hand');

const CIRCADIAN_INSIGHTS = {
    late_night: {
        range: [0, 4],
        state: "DNA Repair & Regeneration Peak",
        insight: "Your cells are dividing at their highest rate. This is when the skin barrier is most permeable, allowing treatments to sink deep into the dermis.",
        match: "Hair Oil",
        image: "images/hair-oil.png"
    },
    early_morning: {
        range: [5, 8],
        state: "Antioxidant Demand Surge",
        insight: "Skin pH is at its lowest and the barrier is vulnerable. Your priority now is defense against the upcoming environmental stressors.",
        match: "Face Serum",
        image: "images/face-serum.png"
    },
    mid_day: {
        range: [9, 16],
        state: "Sebum Production Peak",
        insight: "Oil production is highest now to protect against UV and pollution. Your skin is in 'Defense Mode' rather than 'Repair Mode'.",
        match: "Face Wash",
        image: "images/face-wash.png"
    },
    evening: {
        range: [17, 21],
        state: "TEWL (Water Loss) Escalation",
        insight: "Transepidermal Water Loss increases as the day ends. Your skin starts losing its moisture barrier as temperature rises.",
        match: "Face Cream",
        image: "images/face-cream.png"
    },
    night: {
        range: [22, 23],
        state: "Blood Flow Acceleration",
        insight: "Blood flow to the skin increases, facilitating the removal of toxins and delivery of nutrients from your topical organic superfoods.",
        match: "Face Serum & Face Cream",
        image: "images/hero-bg-forest.jpg"
    }
};

// Climate & Environmental State
let currentClimate = "Sunny";
let currentTemp = 28;

// --- ADVANCED SKIN-SYNC LOGIC (Bio-Type Integration) ---
let currentSyncType = 'normal';

const BIO_MODIFIERS = {
    normal: { score: 92, prefix: "Balanced Rhythm: " },
    dry: { score: 78, prefix: "Hydration Deficiency: " },
    sensitive: { score: 65, prefix: "Reactive Sensitivity: " }
};

function setSyncType(type) {
    currentSyncType = type;
    document.querySelectorAll('.bio-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(type)) btn.classList.add('active');
    });

    // Update Score UI
    const scoreData = BIO_MODIFIERS[type];
    const fill = document.getElementById('sync-score-fill');
    const val = document.getElementById('sync-score-val');

    if (fill) fill.style.width = scoreData.score + '%';
    if (val) val.textContent = scoreData.score + '% Aligned (' + type.charAt(0).toUpperCase() + type.slice(1) + ')';

    updateSkinSync(); // Refresh insights
}

async function updateClimate() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current_weather=true');
        const data = await res.json();
        currentTemp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;

        if (code === 0) currentClimate = "Clear Sky (Hot)";
        else if (code <= 3) currentClimate = "Partly Cloudy";
        else if (code >= 51) currentClimate = "Rainy/Humid";
        else currentClimate = "Cloudy/Stable";

        const climateEl = document.getElementById('skin-climate-state');
        if (climateEl) climateEl.textContent = `${currentClimate} (${currentTemp}°C)`;
    } catch (e) {
        const hour = new Date().getHours();
        if (hour > 6 && hour < 18) {
            currentClimate = "Sunny/Active";
            currentTemp = 30;
        } else {
            currentClimate = "Cool/Night";
            currentTemp = 22;
        }
        const climateEl = document.getElementById('skin-climate-state');
        if (climateEl) climateEl.textContent = `${currentClimate} (Local Est.)`;
    }
}

// Single, Refined updateSkinSync logic with digital clock and smooth rotation
function updateSkinSync() {
    const now = new Date();
    const hour = now.getHours();
    const mins = now.getMinutes();
    const secs = now.getSeconds();

    // Digital Clock - Always Update if present
    const clockEl = document.getElementById('skinsync-clock');
    if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString();
    }

    // Rotate Hand (360 degrees / 24 hours = 15 degrees per hour)
    const rotation = (hour * 15) + (mins * 0.25) + (secs * 0.00416);
    const hand = document.getElementById('hour-hand');
    if (hand) hand.style.transform = `rotate(${rotation}deg)`;

    // Only update UI text if modal is active to save pref
    if (!skinsyncModal.classList.contains('active')) return;

    // Find current phase
    let currentPhase;
    for (const phase in CIRCADIAN_INSIGHTS) {
        const p = CIRCADIAN_INSIGHTS[phase];
        if (hour >= p.range[0] && hour <= p.range[1]) {
            currentPhase = { ...p };
            break;
        }
    }

    if (currentPhase) {
        // Apply Bio-Type Modifier to Insight
        const bioMod = BIO_MODIFIERS[currentSyncType];
        let refinedInsight = bioMod.prefix + currentPhase.insight;

        if (currentSyncType === 'dry') {
            refinedInsight += " Your dry type requires 2x the standard hydration lock during this phase.";
        } else if (currentSyncType === 'sensitive') {
            refinedInsight += " Caution: Barrier reactivity is higher for your type during this biological window.";
        }

        // Climate-Based Product Adjustment
        let climateMatch = currentPhase.match;
        let climateReason = `Optimized for ${now.toLocaleTimeString()} biological rhythm.`;

        if (currentClimate.includes("Hot") || currentClimate.includes("Clear") || (hour > 8 && hour < 17 && currentTemp > 25)) {
            climateMatch = "Face Wash + Sunscreen";
            climateReason = "SUNNY/HEAT ALERT: Prioritize sebum control and UV protection.";
        } else if (currentClimate.includes("Rainy") || currentTemp < 22) {
            climateMatch = "Face Cream (Deep Nutrients)";
            climateReason = "COOL/HUMID ALERT: Skin requires moisture barrier reinforcement.";
        }

        const bioStateEl = document.getElementById('skin-bio-state');
        const bioInsightEl = document.getElementById('skin-bio-insight');
        const matchEl = document.getElementById('skinsync-match');

        if (bioStateEl) bioStateEl.textContent = currentPhase.state;
        if (bioInsightEl) bioInsightEl.textContent = refinedInsight;
        if (matchEl) {
            matchEl.innerHTML = `
                <div style="font-weight:700; color:#d4af37;">${climateMatch}</div>
                <div style="font-size:0.8rem; opacity:0.6;">${climateReason}</div>
            `;
        }
    }
}

openSkinsyncBtn?.addEventListener('click', () => {
    skinsyncModal.classList.add('active');
    updateClimate();
    updateSkinSync();
});

closeSkinsyncBtn?.addEventListener('click', () => {
    skinsyncModal.classList.remove('active');
});

// Update every second globally
updateSkinSync(); // Initial call
setInterval(updateSkinSync, 1000);

// Update climate every 10 mins
updateClimate(); // Initial call
setInterval(updateClimate, 600000);

