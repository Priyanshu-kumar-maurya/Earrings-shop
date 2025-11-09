// Toggle between login and register forms
const loginForm = document.querySelector('.auth-box');
const registerForm = document.querySelector('.register-box');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Check if user is already logged in
function checkLoginStatus() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html'; // Redirect to home if already logged in
        return true;
    }
    return false;
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    if (checkLoginStatus()) return;
});

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Form Submissions
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Store login information
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', email.split('@')[0]); // Use part before @ as name
    localStorage.setItem('userProfilePic', 'https://via.placeholder.com/32'); // Default profile pic

    // Show success message
    document.getElementById('loginForm').style.display = 'none';
    document.querySelector('.login-success').style.display = 'block';
    
    // Check if there's a pending payment
    const pendingPayment = localStorage.getItem('pendingPayment');
    
    // Redirect after 1 second
    setTimeout(() => {
        if (pendingPayment) {
            localStorage.removeItem('pendingPayment');
            window.location.href = 'index.html#payment';
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Store registration information
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', formData.email);
    localStorage.setItem('userName', formData.fullName);
    localStorage.setItem('userProfilePic', 'https://via.placeholder.com/32'); // Default profile pic
    
    // Show success message in the login form
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.querySelector('.login-success').style.display = 'block';
    
    // Check if there's a return URL
    const returnUrl = localStorage.getItem('returnToProduct');
    
    // Redirect after 1 second
    setTimeout(() => {
        if (returnUrl) {
            localStorage.removeItem('returnToProduct');
            window.location.href = returnUrl;
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
});

// Initialize Google Sign-in (if needed)
document.querySelector('.social-button.google')?.addEventListener('click', () => {
    alert('Google Sign-in will be implemented here');
});
