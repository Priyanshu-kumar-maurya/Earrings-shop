// Profile tabs functionality
const menuItems = document.querySelectorAll('.profile-menu-items li');
const tabs = document.querySelectorAll('.profile-tab');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab');
        
        // Update active menu item
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Show selected tab
        tabs.forEach(tab => {
            if (tab.id === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    });
});

// Personal Information Form
document.getElementById('personal-info-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value
    };

    // Here you would typically make an API call to update user info
    console.log('Updating personal info:', formData);
    alert('Personal information updated successfully!');
});

// Address Management
const addAddressBtn = document.querySelector('.add-address-btn');
const addressForm = document.getElementById('address-form');
const addressesList = document.querySelector('.addresses-list');

addAddressBtn.addEventListener('click', () => {
    addressForm.style.display = 'block';
    addAddressBtn.style.display = 'none';
});

document.querySelector('.cancel-button').addEventListener('click', () => {
    addressForm.style.display = 'none';
    addAddressBtn.style.display = 'block';
    addressForm.reset();
});

// Save address
document.getElementById('address-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const addressData = {
        label: document.getElementById('addressLabel').value,
        name: document.getElementById('addressName').value,
        phone: document.getElementById('addressPhone').value,
        pincode: document.getElementById('pincode').value,
        street: document.getElementById('streetAddress').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        landmark: document.getElementById('landmark').value
    };

    // Add address to the list
    const addressCard = document.createElement('div');
    addressCard.className = 'address-card';
    addressCard.innerHTML = `
        <div class="address-label">${addressData.label}</div>
        <div class="address-details">
            <p><strong>${addressData.name}</strong></p>
            <p>${addressData.street}</p>
            <p>${addressData.city}, ${addressData.state} - ${addressData.pincode}</p>
            <p>Phone: ${addressData.phone}</p>
            ${addressData.landmark ? `<p>Landmark: ${addressData.landmark}</p>` : ''}
        </div>
        <div class="address-actions">
            <button class="edit-address">Edit</button>
            <button class="delete-address">Delete</button>
        </div>
    `;

    addressesList.appendChild(addressCard);
    
    // Reset and hide form
    addressForm.reset();
    addressForm.style.display = 'none';
    addAddressBtn.style.display = 'block';
});

// Settings Form
document.getElementById('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value,
        confirmNewPassword: document.getElementById('confirmNewPassword').value,
        orderUpdates: document.getElementById('orderUpdates').checked,
        promotions: document.getElementById('promotions').checked
    };

    // Validate new password
    if (settings.newPassword !== settings.confirmNewPassword) {
        alert('New passwords do not match!');
        return;
    }

    // Here you would typically make an API call to update settings
    console.log('Updating settings:', settings);
    alert('Settings updated successfully!');
});