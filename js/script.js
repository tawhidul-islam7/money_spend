// Initial data - products with names, prices, and image URLs
const products = [
    {
        id: 1,
        name: "Big Mac",
        price: 2,
        image: "https://neal.fun/spend/images/big-mac.jpg"
    },
    {
        id: 2,
        name: "Cup of Coffee",
        price: 4,
        image: "https://neal.fun/spend/images/coffee.jpg"
    },
    // More products...
];

// Variables to track state
let totalMoney = 100000000000; // $100 billion
let cartItems = [];

// Initialize the page
function initializePage() {
    renderProducts();
    updateMoneyCounter();
}

// Render all products to the grid
function renderProducts() {
    const productsGrid = document.getElementById("products-grid");
    productsGrid.innerHTML = "";
    
    products.forEach(product => {
        // Create product card
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    
    // Add product image, name, price, and controls
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${formatPrice(product.price)}</p>
        <div class="product-controls">
            <button class="sell-btn" onclick="sellItem(${product.id})" disabled>Sell</button>
            <input type="number" id="quantity-${product.id}" value="0" min="0" class="quantity-input" onchange="updateQuantity(${product.id}, this.value)">
            <button class="buy-btn" onclick="buyItem(${product.id})">Buy</button>
        </div>
    `;
    
    return card;
}

// Buy an item
function buyItem(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const currentQuantity = parseInt(quantityInput.value) || 0;
    
    // Check if there's enough money
    if (totalMoney >= product.price) {
        quantityInput.value = currentQuantity + 1;
        totalMoney -= product.price;
        
        // Update cart
        const existingItem = cartItems.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        // Enable sell button
        document.querySelector(`#quantity-${productId}`).previousElementSibling.disabled = false;
        
        // Update UI
        updateMoneyCounter();
        updateReceipt();
    }
}

// Sell an item
function sellItem(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const currentQuantity = parseInt(quantityInput.value) || 0;
    
    if (currentQuantity > 0) {
        const product = products.find(p => p.id === productId);
        quantityInput.value = currentQuantity - 1;
        totalMoney += product.price;
        
        // Update cart
        const existingItem = cartItems.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity -= 1;
            if (existingItem.quantity === 0) {
                cartItems = cartItems.filter(item => item.id !== productId);
                document.querySelector(`#quantity-${productId}`).previousElementSibling.disabled = true;
            }
        }
        
        // Update UI
        updateMoneyCounter();
        updateReceipt();
    }
}

// Update quantity directly
function updateQuantity(productId, newQuantity) {
    const product = products.find(p => p.id === productId);
    const newQuantityNum = parseInt(newQuantity) || 0;
    const existingItem = cartItems.find(item => item.id === productId);
    const oldQuantity = existingItem ? existingItem.quantity : 0;
    
    if (newQuantityNum !== oldQuantity) {
        const costDifference = product.price * (newQuantityNum - oldQuantity);
        
        // Check if there's enough money if buying more
        if (costDifference > 0 && costDifference > totalMoney) {
            alert("You don't have enough money!");
            document.getElementById(`quantity-${productId}`).value = oldQuantity;
            return;
        }
        
        // Update money
        totalMoney -= costDifference;
        
        // Update cart
        if (newQuantityNum > 0) {
            if (existingItem) {
                existingItem.quantity = newQuantityNum;
            } else {
                cartItems.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    quantity: newQuantityNum
                });
            }
            document.querySelector(`#quantity-${productId}`).previousElementSibling.disabled = false;
        } else {
            cartItems = cartItems.filter(item => item.id !== productId);
            document.querySelector(`#quantity-${productId}`).previousElementSibling.disabled = true;
        }
        
        // Update UI
        updateMoneyCounter();
        updateReceipt();
    }
}

// Update money counter display
function updateMoneyCounter() {
    const moneyCounter = document.getElementById("money-counter");
    moneyCounter.textContent = formatMoney(totalMoney);
}

// Update receipt display
function updateReceipt() {
    const receiptItems = document.getElementById("receipt-items");
    const receiptTotal = document.getElementById("receipt-total");
    
    // Clear current receipt
    receiptItems.innerHTML = "";
    
    if (cartItems.length === 0) {
        receiptItems.innerHTML = "<p class='empty-receipt'>You haven't bought anything yet.</p>";
        receiptTotal.innerHTML = "";
        return;
    }
    
    // Add items to receipt
    cartItems.forEach(item => {
        const itemRow = document.createElement("div");
        itemRow.className = "receipt-item";
        itemRow.innerHTML = `
            <span class="item-name">${item.name} × ${item.quantity}</span>
            <span class="item-total">$${formatPrice(item.price * item.quantity)}</span>
        `;
        receiptItems.appendChild(itemRow);
    });
    
    // Calculate total
    const totalSpent = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update total display
    receiptTotal.innerHTML = `
        <div class="receipt-divider"></div>
        <div class="total-row">
            <span class="total-label">TOTAL:</span>
            <span class="total-amount">$${formatPrice(totalSpent)}</span>
        </div>
    `;
    
    // Show receipt section
    document.getElementById("receipt-section").style.display = "block";
}

// Format money with commas
function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format price (for individual items)
function formatPrice(price) {
    return new Intl.NumberFormat('en-US').format(price);
}

// Initialize on page load
window.onload = initializePage;