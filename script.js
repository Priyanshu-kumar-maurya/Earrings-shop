/**
 * Aura Jewels & Elegant Earrings — Core Interactive Application Logic
 * Modern, Vanilla JavaScript with Zero External Heavy Dependencies
 * Features:
 *  - Dark / Light Luxury Obsidian Theme Switcher with localStorage persistence
 *  - Slide-out Cart Drawer with dynamic live subtotal & festive 20% discount
 *  - Quick View Modal with quantity steppers and specification inspection
 *  - Unified UPI Payment Modal (QR Code scan, one-click UPI copy, GPay direct launcher)
 *  - WhatsApp Concierge Order Confirmation payload builder
 *  - Live Search drawer with instantaneous keyword matching
 *  - Category tab filtering & multi-criteria product sorting (price, alphabetical)
 *  - Wishlist toggle system with persistent memory
 *  - Interactive FAQ Accordion, Mobile Drawer, and Toast notifications
 *
 * Designed & Engineered by Priyanshu Kumar Maurya
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. Constants & Configuration
    // -------------------------------------------------------------------------
    const CONFIG = {
        UPI_ID: 'ky187768@okicici',
        UPI_NAME: 'Aura Jewels',
        WHATSAPP_NUMBER: '918576943716',
        PROMO_CODE: 'ROYAL20',
        PROMO_DISCOUNT_PERCENT: 0.20,
        STORAGE_KEYS: {
            CART: 'aura_cart_v2',
            WISHLIST: 'aura_wishlist_v2',
            THEME: 'aura_theme_pref'
        }
    };

    // -------------------------------------------------------------------------
    // 2. Global State
    // -------------------------------------------------------------------------
    let cart = [];
    let wishlist = [];
    let activeCheckout = null; // Stores currently selected single item or full cart
    let activeQuickViewProduct = null;

    // -------------------------------------------------------------------------
    // 3. Helper Functions & Toast Notifications
    // -------------------------------------------------------------------------
    function getStoredJSON(key, fallback = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            console.warn('LocalStorage access warning:', e);
            return fallback;
        }
    }

    function setStoredJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage save warning:', e);
        }
    }

    function formatCurrency(amount) {
        return '₹' + Math.max(0, Math.round(amount)).toLocaleString('en-IN');
    }

    function parsePrice(text) {
        if (!text) return 0;
        const clean = text.toString().replace(/[^0-9]/g, '');
        return clean ? parseInt(clean, 10) : 0;
    }

    /**
     * Display a modern luxury toast message
     * @param {string} message - Notification text
     * @param {'success'|'info'|'warning'|'gold'} type - Toast aesthetic style
     * @param {string} iconClass - FontAwesome icon class
     */
    function showToast(message, type = 'gold', iconClass = 'fas fa-gem') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon"><i class="${iconClass}"></i></div>
            <div class="toast-content">${message}</div>
            <button class="toast-close-btn" aria-label="Close notification">&times;</button>
        `;

        container.appendChild(toast);

        // Animate entrance
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        const closeBtn = toast.querySelector('.toast-close-btn');
        const dismiss = () => {
            toast.classList.remove('visible');
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', dismiss);
        setTimeout(dismiss, 3800);
    }

    // -------------------------------------------------------------------------
    // 4. Theme Toggle (Obsidian Dark / Pearl Ivory Light)
    // -------------------------------------------------------------------------
    function initTheme() {
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'dark';

        document.documentElement.setAttribute('data-theme', savedTheme);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);

                showToast(
                    newTheme === 'dark' ? 'Obsidian Royal Night mode enabled' : 'Pearl Ivory Daylight mode enabled',
                    'gold',
                    newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'
                );
            });
        }
    }

    // -------------------------------------------------------------------------
    // 5. Navigation & Mobile Drawer
    // -------------------------------------------------------------------------
    function initNavigation() {
        const header = document.getElementById('main-header');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileDrawer = document.getElementById('mobileDrawer');
        const closeMobileDrawer = document.getElementById('closeMobileDrawer');
        const menuToggleBtn = document.getElementById('menuToggleBtn');
        const profileMenu = document.getElementById('profileMenu');

        // Sticky Navbar Glass Blur
        window.addEventListener('scroll', () => {
            if (!header) return;
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Mobile drawer toggle
        if (mobileMenuBtn && mobileDrawer) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileDrawer.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        }

        const closeDrawer = () => {
            if (mobileDrawer) {
                mobileDrawer.classList.remove('open');
                document.body.style.overflow = '';
            }
        };

        if (closeMobileDrawer) closeMobileDrawer.addEventListener('click', closeDrawer);

        // Close mobile drawer when clicking a link
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeDrawer);
        });

        // User Profile Dropdown
        if (menuToggleBtn && profileMenu) {
            menuToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = profileMenu.style.display === 'block';
                profileMenu.style.display = isOpen ? 'none' : 'block';
            });

            document.addEventListener('click', (e) => {
                if (!menuToggleBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                    profileMenu.style.display = 'none';
                }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 6. Live Search Drawer
    // -------------------------------------------------------------------------
    function initLiveSearch() {
        const searchToggleBtn = document.getElementById('searchToggleBtn');
        const searchBarDrawer = document.getElementById('searchBarDrawer');
        const closeSearchDrawer = document.getElementById('closeSearchDrawer');
        const searchInput = document.getElementById('search-input');

        if (!searchToggleBtn || !searchBarDrawer) return;

        searchToggleBtn.addEventListener('click', () => {
            searchBarDrawer.classList.toggle('open');
            if (searchBarDrawer.classList.contains('open') && searchInput) {
                searchInput.focus();
            }
        });

        if (closeSearchDrawer) {
            closeSearchDrawer.addEventListener('click', () => {
                searchBarDrawer.classList.remove('open');
                if (searchInput) {
                    searchInput.value = '';
                    filterAndSortProducts();
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                filterAndSortProducts();
            });
        }
    }

    // -------------------------------------------------------------------------
    // 7. Category Filters & Sorting
    // -------------------------------------------------------------------------
    function initFiltersAndSorting() {
        const filterChips = document.querySelectorAll('.filter-chip');
        const sortSelect = document.getElementById('priceSortSelect');

        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                filterAndSortProducts();
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                filterAndSortProducts();
            });
        }
    }

    function filterAndSortProducts() {
        const activeChip = document.querySelector('.filter-chip.active');
        const activeFilter = activeChip ? activeChip.dataset.filter.toLowerCase() : 'all';
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const sortSelect = document.getElementById('priceSortSelect');
        const sortVal = sortSelect ? sortSelect.value : 'featured';
        const resultsCount = document.getElementById('resultsCount');
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll('.product-card'));
        let visibleCount = 0;

        cards.forEach(card => {
            const name = (card.dataset.name || '').toLowerCase();
            const material = (card.dataset.material || '').toLowerCase();
            const style = (card.dataset.style || '').toLowerCase();
            const price = card.dataset.price || '';

            // Category match
            let matchesCategory = false;
            if (activeFilter === 'all') {
                matchesCategory = true;
            } else if (activeFilter === 'traditional' && (style.includes('traditional') || name.includes('kundan') || name.includes('jhumka') || material.includes('kundan'))) {
                matchesCategory = true;
            } else if (activeFilter === 'modern' && (style.includes('modern') || name.includes('crystal') || material.includes('crystal'))) {
                matchesCategory = true;
            } else if (activeFilter === 'elegant' && (style.includes('elegant') || name.includes('pearl') || material.includes('pearl'))) {
                matchesCategory = true;
            } else if (activeFilter === 'royal' && (style.includes('royal') || name.includes('emerald') || material.includes('emerald'))) {
                matchesCategory = true;
            } else if (activeFilter === 'contemporary' && (style.includes('contemporary') || style.includes('classic') || name.includes('hoop') || name.includes('stud'))) {
                matchesCategory = true;
            } else if (style.includes(activeFilter)) {
                matchesCategory = true;
            }

            // Search query match
            let matchesSearch = true;
            if (query) {
                matchesSearch = name.includes(query) || material.includes(query) || style.includes(query) || price.includes(query);
            }

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Sorting
        cards.sort((a, b) => {
            const priceA = parsePrice(a.dataset.price);
            const priceB = parsePrice(b.dataset.price);
            const nameA = (a.dataset.name || '').toLowerCase();
            const nameB = (b.dataset.name || '').toLowerCase();
            const idA = parseInt(a.dataset.id || '0', 10);
            const idB = parseInt(b.dataset.id || '0', 10);

            if (sortVal === 'price-asc') {
                return priceA - priceB;
            } else if (sortVal === 'price-desc') {
                return priceB - priceA;
            } else if (sortVal === 'name-asc') {
                return nameA.localeCompare(nameB);
            } else {
                return idA - idB; // Default natural order
            }
        });

        // Re-append sorted cards
        cards.forEach(card => grid.appendChild(card));

        if (resultsCount) {
            resultsCount.textContent = `Showing ${visibleCount} of ${cards.length} curated designs`;
        }
    }

    // -------------------------------------------------------------------------
    // 8. Wishlist Management
    // -------------------------------------------------------------------------
    function initWishlist() {
        wishlist = getStoredJSON(CONFIG.STORAGE_KEYS.WISHLIST, []);
        updateWishlistCounters();

        document.querySelectorAll('.product-card').forEach(card => {
            const id = card.dataset.id;
            const btn = card.querySelector('.wishlist-icon');
            if (!btn) return;

            // Mark active if in wishlist
            if (wishlist.includes(id)) {
                btn.classList.add('active');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            }

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleWishlist(id, card.dataset.name || 'Earrings', btn);
            });
        });
    }

    function toggleWishlist(id, name, buttonEl) {
        const index = wishlist.indexOf(id);
        const icon = buttonEl.querySelector('i');

        if (index > -1) {
            wishlist.splice(index, 1);
            buttonEl.classList.remove('active');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            showToast(`Removed "${name}" from Wishlist`, 'info', 'far fa-heart');
        } else {
            wishlist.push(id);
            buttonEl.classList.add('active');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
            showToast(`Saved "${name}" to Wishlist ✨`, 'gold', 'fas fa-heart');
        }

        setStoredJSON(CONFIG.STORAGE_KEYS.WISHLIST, wishlist);
        updateWishlistCounters();
    }

    function updateWishlistCounters() {
        const count = wishlist.length;
        document.querySelectorAll('.wishlist-count, .dropdown-wishlist-count').forEach(el => {
            el.textContent = count;
        });
    }

    // -------------------------------------------------------------------------
    // 9. Shopping Bag & Cart Drawer
    // -------------------------------------------------------------------------
    function initCart() {
        cart = getStoredJSON(CONFIG.STORAGE_KEYS.CART, []);
        renderCart();

        // Drawer openers
        const openCartDrawerBtn = document.getElementById('openCartDrawerBtn');
        const closeCartDrawer = document.getElementById('closeCartDrawer');
        const cartBackdrop = document.getElementById('cartBackdrop');
        const drawerCheckoutBtn = document.getElementById('drawerCheckoutBtn');

        if (openCartDrawerBtn) {
            openCartDrawerBtn.addEventListener('click', () => openCart());
        }

        if (closeCartDrawer) {
            closeCartDrawer.addEventListener('click', () => closeCart());
        }

        if (cartBackdrop) {
            cartBackdrop.addEventListener('click', () => closeCart());
        }

        if (drawerCheckoutBtn) {
            drawerCheckoutBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    showToast('Your shopping bag is empty. Please add items first.', 'warning', 'fas fa-shopping-bag');
                    return;
                }
                closeCart();
                openCartCheckout();
            });
        }

        // Add to Cart from Product Cards
        document.querySelectorAll('.product-card').forEach(card => {
            const addBtn = card.querySelector('.add-to-cart');
            const buyBtn = card.querySelector('.buy-now');
            const quickViewBtn = card.querySelector('.quick-view-overlay-btn');

            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    addProductCardToCart(card, 1);
                });
            }

            if (buyBtn) {
                buyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openSingleItemPayment(card);
                });
            }

            if (quickViewBtn) {
                quickViewBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openQuickView(card);
                });
            }
        });

        // Hero Spotlight Quick Buy button
        const heroBuyBtn = document.querySelector('.quick-buy-hero');
        if (heroBuyBtn) {
            heroBuyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const productName = heroBuyBtn.dataset.product || 'Emerald Royal Danglers';
                const productPrice = heroBuyBtn.dataset.price || '₹209';
                const productImage = heroBuyBtn.dataset.image || 'image copy 10.png';

                openPaymentModal({
                    title: productName,
                    image: productImage,
                    amount: parsePrice(productPrice),
                    itemsDesc: `1x ${productName} (${productPrice})`
                });
            });
        }
    }

    function openCart() {
        const drawer = document.getElementById('cartDrawer');
        const backdrop = document.getElementById('cartBackdrop');
        if (drawer) drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        const drawer = document.getElementById('cartDrawer');
        const backdrop = document.getElementById('cartBackdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    function addProductCardToCart(card, qty = 1) {
        const id = card.dataset.id;
        const name = card.dataset.name || card.querySelector('.product-title')?.textContent.trim();
        const price = parsePrice(card.dataset.price || card.querySelector('.price')?.textContent);
        const originalPrice = parsePrice(card.querySelector('.original-price')?.textContent) || price;
        const image = card.querySelector('.product-thumb img')?.getAttribute('src') || 'image.png';

        addToCart({ id, name, price, originalPrice, image }, qty);
    }

    function addToCart(product, quantity = 1) {
        const existingIndex = cart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                quantity: quantity
            });
        }

        setStoredJSON(CONFIG.STORAGE_KEYS.CART, cart);
        renderCart();
        openCart();
        showToast(`Added "${product.name}" to Shopping Bag! 🛍️`, 'gold', 'fas fa-cart-plus');
    }

    function updateCartQuantity(id, change) {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
            showToast(`Removed item from bag.`, 'info', 'fas fa-trash-alt');
        }

        setStoredJSON(CONFIG.STORAGE_KEYS.CART, cart);
        renderCart();
    }

    function removeCartItem(id) {
        cart = cart.filter(i => i.id !== id);
        setStoredJSON(CONFIG.STORAGE_KEYS.CART, cart);
        renderCart();
        showToast('Item removed from shopping bag.', 'info', 'fas fa-trash-alt');
    }

    function renderCart() {
        const list = document.getElementById('cartItemsList');
        const cartCountBadges = document.querySelectorAll('.cart-count, #drawerCartCount');
        const subtotalEl = document.getElementById('cartSubtotal');
        const grandTotalEl = document.getElementById('cartGrandTotal');

        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountBadges.forEach(badge => badge.textContent = totalItems);

        if (!list) return;

        if (cart.length === 0) {
            list.innerHTML = `
                <div class="empty-cart-state">
                    <i class="fas fa-shopping-bag empty-bag-icon"></i>
                    <p>Your shopping bag is empty.</p>
                    <a href="#products" class="btn btn-gold btn-sm" id="shopNowCartBtn">Explore Earrings</a>
                </div>
            `;
            const shopNowBtn = document.getElementById('shopNowCartBtn');
            if (shopNowBtn) {
                shopNowBtn.addEventListener('click', () => closeCart());
            }
            if (subtotalEl) subtotalEl.textContent = '₹0';
            if (grandTotalEl) grandTotalEl.textContent = '₹0';
            return;
        }

        let subtotal = 0;
        let html = '';

        cart.forEach(item => {
            const lineTotal = item.price * item.quantity;
            subtotal += lineTotal;

            html += `
                <div class="cart-item-row" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price-unit">${formatCurrency(item.price)} each</div>
                        <div class="cart-item-stepper">
                            <button type="button" class="btn-step btn-minus" data-id="${item.id}">-</button>
                            <span class="step-qty">${item.quantity}</span>
                            <button type="button" class="btn-step btn-plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-right">
                        <strong class="cart-line-total">${formatCurrency(lineTotal)}</strong>
                        <button type="button" class="btn-remove-item" data-id="${item.id}" title="Remove item">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;

        // Attach event listeners to stepper buttons
        list.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', () => updateCartQuantity(btn.dataset.id, -1));
        });

        list.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', () => updateCartQuantity(btn.dataset.id, 1));
        });

        list.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', () => removeCartItem(btn.dataset.id));
        });

        // 20% Festive Promo Discount calculation
        const discount = subtotal * CONFIG.PROMO_DISCOUNT_PERCENT;
        const grandTotal = Math.max(0, subtotal - discount);

        if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
        if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

        const discountLine = document.querySelector('.cart-summary-line.discount-line span.text-emerald');
        if (discountLine) {
            discountLine.textContent = `-${formatCurrency(discount)}`;
        }
    }

    // -------------------------------------------------------------------------
    // 10. Quick View Modal
    // -------------------------------------------------------------------------
    function initQuickViewModal() {
        const modal = document.getElementById('product-modal');
        const closeBtn = document.getElementById('closeProductModal');
        const qtyMinus = document.getElementById('modalQtyMinus');
        const qtyPlus = document.getElementById('modalQtyPlus');
        const qtyInput = document.getElementById('modalQtyInput');
        const addToCartBtn = document.getElementById('modalAddToCartBtn');
        const buyNowBtn = document.getElementById('modalBuyNowBtn');

        if (!modal) return;

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
        });

        if (qtyMinus && qtyInput) {
            qtyMinus.addEventListener('click', () => {
                let val = parseInt(qtyInput.value, 10) || 1;
                if (val > 1) qtyInput.value = val - 1;
            });
        }

        if (qtyPlus && qtyInput) {
            qtyPlus.addEventListener('click', () => {
                let val = parseInt(qtyInput.value, 10) || 1;
                if (val < 10) qtyInput.value = val + 1;
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                if (!activeQuickViewProduct) return;
                const qty = parseInt(qtyInput.value, 10) || 1;
                addToCart(activeQuickViewProduct, qty);
                closeModal();
            });
        }

        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                if (!activeQuickViewProduct) return;
                const qty = parseInt(qtyInput.value, 10) || 1;
                closeModal();

                openPaymentModal({
                    title: activeQuickViewProduct.name,
                    image: activeQuickViewProduct.image,
                    amount: activeQuickViewProduct.price * qty,
                    itemsDesc: `${qty}x ${activeQuickViewProduct.name} (₹${activeQuickViewProduct.price} each)`
                });
            });
        }
    }

    function openQuickView(card) {
        const modal = document.getElementById('product-modal');
        if (!modal) return;

        const id = card.dataset.id;
        const name = card.dataset.name || card.querySelector('.product-title')?.textContent.trim();
        const price = parsePrice(card.dataset.price || card.querySelector('.price')?.textContent);
        const originalPrice = parsePrice(card.querySelector('.original-price')?.textContent) || price;
        const image = card.querySelector('.product-thumb img')?.getAttribute('src') || 'image.png';
        const material = card.dataset.material || 'Hallmarked 925 Silver';
        const size = card.dataset.size || 'Standard Size';
        const style = card.dataset.style || 'Contemporary';

        activeQuickViewProduct = { id, name, price, originalPrice, image, material, size, style };

        document.getElementById('modal-product-image').src = image;
        document.getElementById('modal-product-name').textContent = name;
        document.getElementById('modal-product-price').textContent = formatCurrency(price);
        document.getElementById('modal-material').textContent = material;
        document.getElementById('modal-size').textContent = size;
        document.getElementById('modal-style').textContent = style;
        document.getElementById('modal-style-tag').textContent = `${style.toUpperCase()} COUTURE`;

        const qtyInput = document.getElementById('modalQtyInput');
        if (qtyInput) qtyInput.value = 1;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // -------------------------------------------------------------------------
    // 11. Unified UPI Payment & Checkout Modal
    // -------------------------------------------------------------------------
    function initPaymentModal() {
        const modal = document.getElementById('payment-modal');
        const closeBtn = document.getElementById('closePaymentModal');
        const copyUpiBtn = document.getElementById('copyUpiBtn');
        const openGPayAppBtn = document.getElementById('openGPayAppBtn');
        const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        const shippingToggleBtn = document.getElementById('shippingToggleBtn');
        const shippingFormFields = document.getElementById('shippingFormFields');

        if (!modal) return;

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
        });

        // Toggle shipping address accordion
        if (shippingToggleBtn && shippingFormFields) {
            shippingToggleBtn.addEventListener('click', () => {
                shippingFormFields.classList.toggle('open');
                const chevron = shippingToggleBtn.querySelector('.fa-chevron-down');
                if (chevron) {
                    chevron.style.transform = shippingFormFields.classList.contains('open') ? 'rotate(180deg)' : '';
                }
            });
        }

        // Copy UPI ID button
        if (copyUpiBtn) {
            copyUpiBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(CONFIG.UPI_ID);
                    copyUpiBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyUpiBtn.classList.add('copied');
                    showToast(`UPI ID "${CONFIG.UPI_ID}" copied to clipboard!`, 'success', 'fas fa-check-circle');

                    setTimeout(() => {
                        copyUpiBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                        copyUpiBtn.classList.remove('copied');
                    }, 2500);
                } catch (err) {
                    showToast(`UPI ID: ${CONFIG.UPI_ID}`, 'info', 'fas fa-info-circle');
                }
            });
        }

        // Google Pay / UPI App Direct Intent Launch
        if (openGPayAppBtn) {
            openGPayAppBtn.addEventListener('click', () => {
                if (!activeCheckout) return;
                const upiUri = `upi://pay?pa=${encodeURIComponent(CONFIG.UPI_ID)}&pn=${encodeURIComponent(CONFIG.UPI_NAME)}&am=${activeCheckout.amount}&cu=INR&tn=${encodeURIComponent('Aura Jewels Order')}`;
                window.location.href = upiUri;
                showToast('Launching installed UPI application...', 'gold', 'fas fa-mobile-alt');
            });
        }

        // Direct WhatsApp Confirmation Button
        if (whatsappOrderBtn) {
            whatsappOrderBtn.addEventListener('click', () => {
                launchWhatsAppOrder(false);
            });
        }

        // "I Have Paid / Confirm Order" button
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', () => {
                launchWhatsAppOrder(true);
            });
        }
    }

    function openSingleItemPayment(card) {
        const name = card.dataset.name || card.querySelector('.product-title')?.textContent.trim();
        const price = parsePrice(card.dataset.price || card.querySelector('.price')?.textContent);
        const image = card.querySelector('.product-thumb img')?.getAttribute('src') || 'image.png';

        openPaymentModal({
            title: name,
            image: image,
            amount: price,
            itemsDesc: `1x ${name} (${formatCurrency(price)})`,
            isCartOrder: false
        });
    }

    function openCartCheckout() {
        if (cart.length === 0) return;

        let subtotal = 0;
        const itemsSummary = cart.map(item => {
            const line = item.price * item.quantity;
            subtotal += line;
            return `${item.quantity}x ${item.name} (${formatCurrency(line)})`;
        }).join('\n - ');

        const discount = subtotal * CONFIG.PROMO_DISCOUNT_PERCENT;
        const grandTotal = Math.max(0, subtotal - discount);

        openPaymentModal({
            title: `Aura Jewels Collection (${cart.reduce((a, b) => a + b.quantity, 0)} Items)`,
            image: cart[0].image,
            amount: grandTotal,
            itemsDesc: `- ${itemsSummary}\n(Festive Code ROYAL20 applied: -${formatCurrency(discount)})`,
            isCartOrder: true
        });
    }

    function openPaymentModal(checkoutData) {
        activeCheckout = checkoutData;

        const modal = document.getElementById('payment-modal');
        if (!modal) return;

        const imgEl = document.getElementById('paymentProductImage');
        const nameEl = document.getElementById('paymentProductName');
        const priceEl = document.getElementById('paymentProductPrice');
        const qrImg = document.getElementById('merchant-qr');
        const upiCode = document.getElementById('merchantUpiCode');

        if (imgEl) imgEl.src = checkoutData.image;
        if (nameEl) nameEl.textContent = checkoutData.title;
        if (priceEl) priceEl.textContent = formatCurrency(checkoutData.amount);
        if (qrImg) qrImg.src = 'QR code.jpg';
        if (upiCode) upiCode.textContent = CONFIG.UPI_ID;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function launchWhatsAppOrder(hasPaid = false) {
        if (!activeCheckout) return;

        const custName = document.getElementById('custName')?.value.trim() || 'Valued Patron';
        const custPhone = document.getElementById('custPhone')?.value.trim() || 'Not specified';
        const custAddress = document.getElementById('custAddress')?.value.trim() || 'Standard Courier Delivery';

        const statusText = hasPaid ? '✅ PAYMENT COMPLETED (Awaiting Verification)' : '🕒 INQUIRY / PENDING PAYMENT';

        const text =
`👑 *AURA JEWELS — HAUTE JOAILLERIE ORDER* 👑
----------------------------------------
*Status:* ${statusText}
*Payable Amount:* ${formatCurrency(activeCheckout.amount)}
*Verified Merchant UPI:* ${CONFIG.UPI_ID}

📦 *ORDER DETAILS:*
${activeCheckout.itemsDesc}

👤 *PATRON DETAILS:*
*Name:* ${custName}
*WhatsApp:* ${custPhone}
*Delivery Address:* ${custAddress}

Thank you for choosing Aura Jewels! Please confirm dispatch and share the tracking receipt.`;

        const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

        if (hasPaid) {
            showToast('Order confirmed! Opening WhatsApp concierge desk for your receipt...', 'success', 'fas fa-check-circle');

            // If it was a cart checkout, clear cart
            if (activeCheckout.isCartOrder) {
                cart = [];
                setStoredJSON(CONFIG.STORAGE_KEYS.CART, cart);
                renderCart();
            }

            // Close modal after brief pause
            setTimeout(() => {
                const modal = document.getElementById('payment-modal');
                if (modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
                window.open(waUrl, '_blank');
            }, 800);
        } else {
            window.open(waUrl, '_blank');
        }
    }

    // -------------------------------------------------------------------------
    // 12. FAQ Accordion & Contact Form
    // -------------------------------------------------------------------------
    function initFAQAndContact() {
        // FAQ Accordion
        document.querySelectorAll('.faq-item').forEach(item => {
            const questionBtn = item.querySelector('.faq-question');
            if (!questionBtn) return;

            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close other items
                document.querySelectorAll('.faq-item').forEach(other => {
                    other.classList.remove('active');
                });

                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });

        // Contact Form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('contactName')?.value.trim() || 'Patron';

                showToast(`Thank you, ${name}! Our personal jewellery consultant will connect with you within 2 hours. ✨`, 'gold', 'fas fa-paper-plane');
                contactForm.reset();
            });
        }
    }

    // -------------------------------------------------------------------------
    // 13. Hero 3D Card Hover Perspective Effect
    // -------------------------------------------------------------------------
    function initHeroCardPerspective() {
        const heroCard = document.querySelector('.hero-floating-card');
        if (!heroCard || window.innerWidth < 1024) return;

        heroCard.addEventListener('mousemove', (e) => {
            const rect = heroCard.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotX = -(y / rect.height) * 12;
            const rotY = (x / rect.width) * 12;

            heroCard.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
        });

        heroCard.addEventListener('mouseleave', () => {
            heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    }

    // -------------------------------------------------------------------------
    // 14. Document Ready Bootstrap
    // -------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNavigation();
        initLiveSearch();
        initFiltersAndSorting();
        initWishlist();
        initCart();
        initQuickViewModal();
        initPaymentModal();
        initFAQAndContact();
        initHeroCardPerspective();
    });

})();