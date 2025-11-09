// Menu Toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const profileMenu = document.getElementById('profileMenu');
    let isMenuOpen = false;

    // Handle menu button click
    if (menuToggleBtn && profileMenu) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            profileMenu.style.display = isMenuOpen ? 'block' : 'none';
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && profileMenu && !menuToggleBtn.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.style.display = 'none';
            isMenuOpen = false;
        }
    });

    // Close menu when clicking a menu item
    const menuItems = document.querySelectorAll('.profile-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            profileMenu.style.display = 'none';
            isMenuOpen = false;
        });
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Modal functionality
const modal = document.getElementById('product-modal');
const closeModal = document.querySelector('.close-modal');
const buyNowButtons = document.querySelectorAll('.buy-now');
const orderForm = document.querySelector('.order-form');

function openModal(product) {
    // Update modal content with product details
    document.getElementById('modal-product-image').src = product.querySelector('img').src;
    document.getElementById('modal-product-name').textContent = product.querySelector('h3').textContent;
    document.getElementById('modal-product-price').textContent = product.querySelector('.price').textContent;
    document.getElementById('modal-material').textContent = product.dataset.material;
    document.getElementById('modal-size').textContent = product.dataset.size;
    document.getElementById('modal-style').textContent = product.dataset.style;

    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModalHandler() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    orderForm.reset(); // Reset form when modal is closed
}

// Close modals when clicking the close button or outside
document.addEventListener('DOMContentLoaded', () => {
    // Product modal close
    if (closeModal) {
        closeModal.addEventListener('click', closeModalHandler);
    }
    
    // Payment modal close
    const closePaymentModal = document.getElementById('closePaymentModal');
    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', () => {
            const paymentModal = document.getElementById('payment-modal');
            if (paymentModal) {
                paymentModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                resetPaymentForms();
            }
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
        const paymentModal = document.getElementById('payment-modal');
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            resetPaymentForms();
        }
    });
});

// Handle Buy Now button clicks
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Buy Now clicked');

            const product = button.closest('.product-card');
            if (!product) return;

            const productData = {
                name: product.querySelector('h3').textContent,
                price: product.querySelector('.price').textContent,
                image: product.querySelector('img').src
            };

            // Update payment modal with product details
            const paymentModal = document.getElementById('payment-modal');
            
            if (paymentModal) {
                // Set merchant UPI details
                const merchantUpiId = "ky187768@okicici"; // ICICI Bank UPI ID
                const merchantQrCode = "QR code.jpg"; // Your QR code image
                
                // Update payment modal content
                const paymentProductImage = document.getElementById('payment-product-image');
                const paymentProductName = document.getElementById('payment-product-name');
                const paymentProductPrice = document.getElementById('payment-product-price');
                const merchantUpiDisplay = document.getElementById('merchant-upi');
                const merchantQrDisplay = document.getElementById('merchant-qr');
                
                if (paymentProductImage) paymentProductImage.src = productData.image;
                if (paymentProductName) paymentProductName.textContent = productData.name;
                if (paymentProductPrice) paymentProductPrice.textContent = productData.price;
                if (merchantUpiDisplay) merchantUpiDisplay.textContent = merchantUpiId;
                if (merchantQrDisplay) merchantQrDisplay.src = merchantQrCode;
                
                // Show payment modal
                paymentModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                // Handle UPI app opening
                const openUpiButton = document.getElementById('openUpiApp');
                if (openUpiButton) {
                    openUpiButton.onclick = () => {
                        const amount = productData.price.replace('₹', '').replace(',', '');
                        // Create both Google Pay and general UPI URLs
                        const googlePayUrl = `googlepay://upi/pay?pa=${merchantUpiId}&pn=Elegant%20Earrings&am=${amount}&cu=INR`;
                        const upiUrl = `upi://pay?pa=${merchantUpiId}&pn=Elegant%20Earrings&am=${amount}&cu=INR`;
                        
                        // Try to open Google Pay first
                        window.location.href = googlePayUrl;
                        
                        // If Google Pay doesn't open within 1 second, try general UPI URL
                        setTimeout(() => {
                            window.location.href = upiUrl;
                        }, 1000);
                        
                        window.addEventListener('focus', function checkPaymentStatus() {
                            window.removeEventListener('focus', checkPaymentStatus);
                            showOrderConfirmation(productData);
                        });
                    };
                }

                // Handle cancel payment
                const cancelPaymentBtn = document.getElementById('cancelPayment');
                if (cancelPaymentBtn) {
                    cancelPaymentBtn.onclick = () => {
                        paymentModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    };
                }
            }

            // Function to show order confirmation
            function showOrderConfirmation(productData) {
                const confirmationModal = document.createElement('div');
                confirmationModal.className = 'modal';
                confirmationModal.innerHTML = `
                    <div class="modal-content">
                        <h2>Order Confirmed! 🎉</h2>
                        <div class="confirmation-details">
                            <p>Thank you for your order!</p>
                            <div class="order-summary">
                                <h3>Order Details:</h3>
                                <p>Product: ${productData.name}</p>
                                <p>Amount: ${productData.price}</p>
                            </div>
                            <div class="success-message">
                                <i class="fas fa-check-circle"></i>
                                <p>Payment received successfully!</p>
                            </div>
                        </div>
                        <button id="closeConfirmation" class="primary-button">Close</button>
                    </div>
                `;
                
                document.body.appendChild(confirmationModal);
                confirmationModal.style.display = 'block';
                
                // Close payment modal
                paymentModal.style.display = 'none';
                
                // Handle closing confirmation
                document.getElementById('closeConfirmation').onclick = () => {
                    confirmationModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    setTimeout(() => {
                        confirmationModal.remove();
                    }, 300);
                };

                // Send confirmation notification
                if ('Notification' in window) {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('Order Confirmed!', {
                                body: `Thank you for ordering ${productData.name}. Your payment of ${productData.price} has been received.`,
                                icon: productData.image
                            });
                        }
                    });
                }
            }
            const paymentProductImage = document.getElementById('paymentProductImage');
            const paymentProductName = document.getElementById('paymentProductName');
            const paymentProductPrice = document.getElementById('paymentProductPrice');

            if (paymentProductImage) paymentProductImage.src = productData.image;
            if (paymentProductName) paymentProductName.textContent = productData.name;
            if (paymentProductPrice) paymentProductPrice.textContent = productData.price;

            // Update payment amounts in all forms
            const amount = productData.price;
            document.getElementById('upiAmount').textContent = amount;
            document.getElementById('cardAmount').textContent = amount;
            document.getElementById('codAmount').textContent = 
                '₹' + (parseInt(amount.replace('₹', '').replace(',', '')) + 50).toLocaleString();

            // Show payment modal
            if (paymentModal) {
                paymentModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
});

// Handle order form submission
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect form data
    const orderData = {
        productName: document.getElementById('modal-product-name').textContent,
        price: document.getElementById('modal-product-price').textContent,
        quantity: document.getElementById('quantity').value,
        customerName: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('delivery-address').value,
        paymentMethod: document.getElementById('payment-method').value
    };

    // Show order confirmation
    showNotification('Order placed successfully! We will contact you soon.');
    closeModalHandler();
});

// Cart functionality
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartIcon = document.querySelector('.cart');
const cartItems = document.querySelector('.cart-items');
const cartCountElement = document.querySelector('.cart-count');
const checkoutButton = document.querySelector('.checkout-button');
const totalAmount = document.querySelector('.total-amount');
let cart = [];

// Open cart when clicking cart icon
cartIcon.addEventListener('click', () => {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

// Close cart modal
closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Close cart when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Check login status and manage UI
function checkLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getUserInfo() {
    return {
        name: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || '',
        profilePic: localStorage.getItem('userProfilePic') || 'https://via.placeholder.com/32'
    };
}

function updateUIForLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const profileMenu = document.getElementById('profileMenu');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const paymentModal = document.getElementById('payment-modal');

    // Defensive checks
    if (!loginBtn || !profileMenu) return;

    const loggedIn = checkLoginStatus();

    if (loggedIn) {
        // Hide login button, show profile menu
        loginBtn.style.display = 'none';
        profileMenu.style.display = 'block';
        document.documentElement.classList.add('logged-in');

        // Update user info
        const userInfo = getUserInfo();
        if (userNameDisplay) userNameDisplay.textContent = userInfo.name;
        const pic = document.querySelector('.profile-pic');
        if (pic) pic.src = userInfo.profilePic;

        // Ensure profile menu can be closed by clicking outside
        document.addEventListener('click', function profileOutsideClick(e) {
            // keep the listener, but do nothing if elements missing
            if (!profileMenu || !loginBtn) return;
            if (!profileMenu.contains(e.target) && !loginBtn.contains(e.target)) {
                profileMenu.style.display = 'none';
            }
        });
    } else {
        // Show login button, hide profile area
        loginBtn.style.display = 'flex';
        profileMenu.style.display = 'none';
        document.documentElement.classList.remove('logged-in');

        // Avoid adding multiple listeners
        if (!loginBtn.dataset.listenerAttached) {
            loginBtn.addEventListener('click', (ev) => {
                // If payment modal is open, save state
                if (paymentModal && paymentModal.style.display === 'block') {
                    const productImage = document.getElementById('paymentProductImage')?.src || '';
                    const productName = document.getElementById('paymentProductName')?.textContent || '';
                    const productPrice = document.getElementById('paymentProductPrice')?.textContent || '';
                    localStorage.setItem('pendingPayment', JSON.stringify({ image: productImage, name: productName, price: productPrice }));
                }
                // normal navigation to login page
                // allow default navigation by not preventing default
            });
            loginBtn.dataset.listenerAttached = 'true';
        }
    }
}

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfilePic');
    document.documentElement.classList.remove('logged-in');
    window.location.reload();
});

// Call this when page loads
updateUIForLogin();

// Check for pending payment after login
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#payment' && checkLoginStatus()) {
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (pendingPayment) {
            try {
                const { image, name, price } = JSON.parse(pendingPayment);
                const paymentModal = document.getElementById('payment-modal');
                
                // Update payment modal with product details
                document.getElementById('paymentProductImage').src = image;
                document.getElementById('paymentProductName').textContent = name;
                document.getElementById('paymentProductPrice').textContent = price;

                // Update payment amounts
                const amount = price;
                document.getElementById('upiAmount').textContent = amount;
                document.getElementById('cardAmount').textContent = amount;
                document.getElementById('codAmount').textContent = 
                    '₹' + (parseInt(amount.replace('₹', '').replace(',', '')) + 50).toLocaleString();

                // Show payment modal
                if (paymentModal) {
                    paymentModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
                
                // Clear the pending payment
                localStorage.removeItem('pendingPayment');
                window.location.hash = '';
            } catch (err) {
                console.error('Error restoring pending payment:', err);
            }
        }
    }
});

// Payment Modal HTML
const paymentModalHTML = `
    <div id="payment-modal" class="modal">
        <div class="modal-content payment-modal">
            <span class="close-modal" id="closePaymentModal">&times;</span>
            <h2>Select Payment Method</h2>
            <div class="product-summary">
                <img id="paymentProductImage" alt="Product" class="payment-product-image">
                <div class="product-details">
                    <h3 id="paymentProductName"></h3>
                    <p id="paymentProductPrice"></p>
                </div>
            </div>
            <div class="payment-options">
                <div class="payment-option">
                    <input type="radio" id="upi" name="payment" value="upi">
                    <label for="upi">
                        <i class="fas fa-mobile-alt"></i>
                        UPI Payment
                        <span class="amount" id="upiAmount"></span>
                    </label>
                </div>
                <div class="payment-option">
                    <input type="radio" id="card" name="payment" value="card">
                    <label for="card">
                        <i class="fas fa-credit-card"></i>
                        Credit/Debit Card
                        <span class="amount" id="cardAmount"></span>
                    </label>
                </div>
                <div class="payment-option">
                    <input type="radio" id="cod" name="payment" value="cod">
                    <label for="cod">
                        <i class="fas fa-money-bill-wave"></i>
                        Cash on Delivery
                        <span class="amount" id="codAmount"></span>
                    </label>
                </div>
            </div>
            <div class="payment-forms">
                <form id="upi-form" class="payment-form" onsubmit="event.preventDefault(); processPayment('upi')">
                    <div class="form-group">
                        <input type="text" id="upiId" pattern="[a-zA-Z0-9\\.\\-]{2,256}@[a-zA-Z][a-zA-Z]{2,64}" required placeholder="Enter UPI ID (e.g., name@upi)">
                    </div>
                    <button type="submit" class="pay-now-btn">Pay Now</button>
                </form>
                <form id="card-form" class="payment-form" onsubmit="event.preventDefault(); processPayment('card')">
                    <div class="form-group">
                        <input type="text" id="cardNumber" pattern="[0-9]{16}" required placeholder="Card Number" maxlength="16">
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <input type="text" id="expiryDate" pattern="(0[1-9]|1[0-2])\\/([0-9]{2})" required placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="form-group half">
                            <input type="text" id="cvv" pattern="[0-9]{3,4}" required placeholder="CVV" maxlength="4">
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="text" id="cardHolderName" required placeholder="Card Holder Name">
                    </div>
                    <button type="submit" class="pay-now-btn">Pay Now</button>
                </form>
                <form id="cod-form" class="payment-form" onsubmit="event.preventDefault(); processPayment('cod')">
                    <p class="cod-note">Additional ₹50 charge will be added for Cash on Delivery</p>
                    <div class="form-group">
                        <input type="text" id="deliveryAddress" required placeholder="Delivery Address">
                    </div>
                    <div class="form-group">
                        <input type="tel" id="phoneNumber" pattern="[0-9]{10}" required placeholder="Phone Number" maxlength="10">
                    </div>
                    <button type="submit" class="pay-now-btn">Place Order</button>
                </form>
            </div>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', paymentModalHTML);
// Add payment modal to body only if it's not already present in the static HTML
if (!document.getElementById('payment-modal')) {
    document.body.insertAdjacentHTML('beforeend', paymentModalHTML);
}

// Buy Now functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded');
    
    document.querySelectorAll('.buy-now').forEach(button => {
        console.log('Buy now button found');
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Buy now clicked');
            
            if (!checkLoginStatus()) {
                // Redirect to login if not logged in
                window.location.href = 'login.html';
                return;
            }

            const product = button.closest('.product-card');
            const productData = {
                name: product.querySelector('h3').textContent,
                price: product.querySelector('.price').textContent,
                image: product.querySelector('img').src
            };

            // Update payment modal with product details
            document.getElementById('paymentProductImage').src = productData.image;
            document.getElementById('paymentProductName').textContent = productData.name;
            document.getElementById('paymentProductPrice').textContent = productData.price;

            // Update payment amounts in all forms
            const amount = productData.price;
            document.getElementById('upiAmount').textContent = amount;
            document.getElementById('cardAmount').textContent = amount;
            document.getElementById('codAmount').textContent = 
                '₹' + (parseInt(amount.replace('₹', '').replace(',', '')) + 50).toLocaleString();

            // Show payment modal
            const paymentModal = document.getElementById('payment-modal');
            paymentModal.style.display = 'block';

            // Close payment modal
            const closePaymentModal = document.getElementById('closePaymentModal');
            if (closePaymentModal) {
                closePaymentModal.onclick = () => {
                    paymentModal.style.display = 'none';
                    resetPaymentForms();
                };
            }

            // Close on outside click
            window.onclick = (e) => {
                if (e.target === paymentModal) {
                    paymentModal.style.display = 'none';
                    resetPaymentForms();
                }
            };
        });
    });
});

// Handle payment method selection
const paymentOptions = document.querySelectorAll('input[name="payment"]');
const paymentForms = document.querySelectorAll('.payment-form');

paymentOptions.forEach(option => {
    option.addEventListener('change', () => {
        paymentForms.forEach(form => {
            form.style.display = 'none';
        });
        const selectedForm = document.getElementById(`${option.value}-form`);
        selectedForm.style.display = 'block';
        selectedForm.style.animation = 'slideUp 0.3s ease-out';
    });
});

// Process payment
function processPayment(method) {
    // Here you would typically handle the payment processing
    // For demo, we'll just show a success message
    const paymentModal = document.getElementById('payment-modal');
    
    // Show loading state
    const button = event.target;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;

    // Simulate payment processing
    setTimeout(() => {
        showNotification('Payment successful! Your order has been placed.');
        paymentModal.style.display = 'none';
        resetPaymentForms();
    }, 2000);
}

// Reset payment forms
function resetPaymentForms() {
    paymentOptions.forEach(option => option.checked = false);
    paymentForms.forEach(form => {
        form.style.display = 'none';
        form.reset();
    });
    const buttons = document.querySelectorAll('.pay-now-btn');
    buttons.forEach(button => {
        button.innerHTML = 'Pay Now <span></span>';
        button.disabled = false;
    });
}

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const product = button.closest('.product-card');
        const productData = {
            id: Math.random().toString(36).substr(2, 9),
            name: product.querySelector('h3').textContent,
            price: product.querySelector('.price').textContent,
            image: product.querySelector('img').src,
            quantity: 1
        };

        addToCart(productData);
        
        // Animation for button
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);

        showNotification(`${productData.name} added to cart!`);
    });
});

function addToCart(product) {
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(product);
    }
    
    updateCart();
}

function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Enable/disable checkout button
    checkoutButton.disabled = totalItems === 0;
    
    // Update cart items display
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" ${item.quantity === 1 ? 'disabled' : ''}>-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus">+</button>
                    <button class="remove-item">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Update total amount
    const total = cart.reduce((sum, item) => {
        const price = parseInt(item.price.replace('₹', '').replace(',', ''));
        return sum + (price * item.quantity);
    }, 0);
    totalAmount.textContent = `₹${total.toLocaleString()}`;
    
    // Add event listeners to quantity buttons
    addQuantityListeners();
}

function addQuantityListeners() {
    // Increase quantity
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            const item = cart.find(item => item.id === itemId);
            item.quantity++;
            updateCart();
        });
    });
    
    // Decrease quantity
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            const item = cart.find(item => item.id === itemId);
            if (item.quantity > 1) {
                item.quantity--;
                updateCart();
            }
        });
    });
    
    // Remove item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.closest('.cart-item').dataset.id;
            cart = cart.filter(item => item.id !== itemId);
            updateCart();
            showNotification('Item removed from cart');
        });
    });
}

// Checkout functionality
checkoutButton.addEventListener('click', () => {
    // Here you can add checkout logic
    showNotification('Proceeding to checkout...');
    setTimeout(() => {
        cart = [];
        updateCart();
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        showNotification('Thank you for your purchase!');
    }, 1000);
});

// Notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#ff4081';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '5px';
    notification.style.animation = 'slideIn 0.5s ease-out';
    
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Show success message
    showNotification('Message sent successfully!');
    
    // Reset form
    contactForm.reset();
});

// Search functionality
const searchInput = document.getElementById('search-input');
const searchButton = document.querySelector('.search-button');
const productGrid = document.querySelector('.product-grid');

// Create a no results message element
const noResults = document.createElement('div');
noResults.className = 'no-results';
noResults.textContent = 'No products found';
productGrid.parentElement.appendChild(noResults);

function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const products = document.querySelectorAll('.product-card');
    let hasResults = false;

    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        const isMatch = productName.includes(searchTerm);
        
        // Animate product cards based on search
        if (isMatch) {
            product.style.display = 'block';
            product.style.animation = 'fadeIn 0.5s ease-out';
            hasResults = true;
        } else {
            product.style.display = 'none';
        }
    });

    // Show/hide no results message
    noResults.style.display = hasResults ? 'none' : 'block';
}

// Search on button click
searchButton.addEventListener('click', searchProducts);

// Search on enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

// Live search as user types
searchInput.addEventListener('input', () => {
    if (searchInput.value.length >= 2) {
        searchProducts();
    } else if (searchInput.value.length === 0) {
        // Show all products when search is cleared
        document.querySelectorAll('.product-card').forEach(product => {
            product.style.display = 'block';
            product.style.animation = 'fadeIn 0.5s ease-out';
        });
        noResults.style.display = 'none';
    }
});

// Animate products on scroll
const productCards = document.querySelectorAll('.product-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

productCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});