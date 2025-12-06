/*************************************************************
 * DECOR HAVEN - FULL JAVASCRIPT FILE
 * Author - Terel Wallace
 * Handles:
 * - Registration
 * - Login
 * - Product Display
 * - Cart Page 
 * - Checkout 
 * - Invoice Generation
 * - Dashboard
 *************************************************************/

/* ============================================================
   STORAGE HELPERS
============================================================ */
const REGISTRATION_KEY = "RegistrationData";
const PRODUCTS_KEY = "AllProducts";
const CURRENT_USER_KEY = "CurrentUserTRN";
const ALL_INVOICES_KEY = "AllInvoices"; // Stores all invoices

/* ----------------- Helper Functions ----------------- */

// Get all users
function getAllUsers() {
    return JSON.parse(localStorage.getItem(REGISTRATION_KEY)) || [];
}

// Save all users
function saveAllUsers(users) {
    localStorage.setItem(REGISTRATION_KEY, JSON.stringify(users));
}

// Find user by TRN
function findUserByTRN(trn) {
    return getAllUsers().find(u => u.trn === trn);
}

// Get logged-in user
function getCurrentUser() {
    let trn = localStorage.getItem(CURRENT_USER_KEY);
    return trn ? findUserByTRN(trn) : null;
}

// Save current user TRN
function setCurrentUser(trn) {
    localStorage.setItem(CURRENT_USER_KEY, trn);
}

// Get all invoices
function getAllInvoices() {
    return JSON.parse(localStorage.getItem(ALL_INVOICES_KEY)) || [];
}

// Save all invoices
function saveAllInvoices(invoices) {
    localStorage.setItem(ALL_INVOICES_KEY, JSON.stringify(invoices));
}

// Helper to calculate age from DOB
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/* ============================================================
   REGISTRATION
============================================================ */
function registerUser() {
    let firstName = document.getElementById("fname").value.trim();
    let lastName = document.getElementById("lname").value.trim();
    let dob = document.getElementById("dob").value;
    let gender = document.querySelector("input[name='gender']:checked");
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let trn = document.getElementById("trn").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!gender) {
        alert("Please select a gender.");
        return;
    }

    // TRN validation
    if (!/^\d{3}-\d{3}-\d{3}$/.test(trn)) {
        alert("TRN must be 000-000-000 format.");
        return;
    }

    // Password
    if (password.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    // Age validation
    let age = calculateAge(dob);
    if (age < 18) {
        alert("You must be 18 or older.");
        return;
    }

    // Check TRN uniqueness
    if (findUserByTRN(trn)) {
        alert("TRN already exists.");
        return;
    }

    // Save user
    let users = getAllUsers();
    users.push({
        firstName,
        lastName,
        dob,
        gender: gender.value,
        phone,
        email,
        trn,
        password,
        cart: [],
        cartSummary: null,
        invoices: [] // Initialize invoices array
    });

    saveAllUsers(users);
    alert("Registration successful! You can now log in.");
    // Optional: Redirect to login page
}

function clearRegistrationForm() {
    document.getElementById("registerForm").reset();
}

/* ============================================================
   LOGIN
============================================================ */
let loginAttempts = 0;

function loginUser() {
    let trn = document.getElementById("loginTrn").value.trim();
    let password = document.getElementById("loginPassword").value.trim();

    let user = getAllUsers().find(u => u.trn === trn && u.password === password);

    if (user) {
        setCurrentUser(trn);
        loginAttempts = 0;
        window.location.href = "product.html";
    } else {
        loginAttempts++;

        if (loginAttempts >= 3) {
            alert("Account locked. Please contact support.");
            return;
        }

        alert("Incorrect TRN or password. Attempt " + loginAttempts + " of 3.");
    }
}

function clearLoginForm() {
    document.getElementById("loginForm").reset();
}

/* ============================================================
   PRODUCT LIST
============================================================ */
function initProducts() {
    let products = [
        {
            id: 1,
            name: "Majestic Spruce Tree",
            price: 199.99,
            image: "placeholder_tree.jpg"
        },
        {
            id: 2,
            name: "Classic Velvet Santa",
            price: 49.50,
            image: "placeholder_santa.jpg"
        },
        {
            id: 3,
            name: "Naughty or Nice Mug",
            price: 12.00,
            image: "placeholder_mug.jpg"
        },
        {
            id: 4,
            name: "Jingle Bell Crocs",
            price: 55.99,
            image: "placeholder_crocs.jpg"
        },
        {
            id: 5,
            name: "Cozy Reindeer Socks",
            price: 18.50,
            image: "placeholder_socks.jpg"
        },
        {
            id: 6,
            name: "Premium Plush Santa Hat",
            price: 9.99,
            image: "placeholder_hat.jpg"
        }
    ];

    // Only set if not already set, or you risk losing any potential changes
    if (!localStorage.getItem(PRODUCTS_KEY)) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    }
}

function getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
}

function displayProducts() {
    initProducts();
    let list = document.getElementById("productList");
    let products = getProducts();

    list.innerHTML = "";

    products.forEach(p => {
        list.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" class="product-img">
                <h3>${p.name}</h3>
                <p><strong>$${p.price.toFixed(2)}</strong></p>
                <button onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
        `;
    });
}

/* ============================================================
   CART FUNCTIONS 
============================================================ */
function addToCart(id) {
    let user = getCurrentUser();
    if (!user) {
        alert("Please login first.");
        window.location.href = "index.html"; // Redirect to login
        return;
    }

    let products = getProducts();
    let product = products.find(p => p.id === id);

    let users = getAllUsers();
    let index = users.findIndex(u => u.trn === user.trn);

    let existing = users[index].cart.find(i => i.id === id);

    if (existing) {
        existing.quantity++;
        existing.lineTotal = existing.quantity * existing.price;
    } else {
        users[index].cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            lineTotal: product.price
        });
    }

    saveAllUsers(users);
    alert(`Added ${product.name} to cart!`);
}

function displayCart() {
    let user = getCurrentUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Refresh user object to get latest cart data
    user = findUserByTRN(user.trn);

    let cart = user.cart;
    let table = document.getElementById("cartItems");
    let summary = document.getElementById("cartSummary");

    table.innerHTML = "";

    if (cart.length === 0) {
        table.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
        summary.innerHTML = "";
        return;
    }

    let subtotal = 0;

    cart.forEach((item, i) => {
        subtotal += item.lineTotal;

        table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" 
                        onchange="updateCartQuantity(${i}, this.value)">
                </td>
                <td>$${item.lineTotal.toFixed(2)}</td>
                <td><button onclick="removeCartItem(${i})">Remove</button></td>
            </tr>`;
    });

    let discount = subtotal > 5000 ? subtotal * 0.10 : 0;
    let taxRate = 0.15;
    let tax = (subtotal - discount) * taxRate;
    let total = subtotal - discount + tax;

    // Save tax rate and discount rate for invoice details
    let discountRate = subtotal > 5000 ? 10 : 0;
    
    summary.innerHTML = `
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Discount (${discountRate}%): $${discount.toFixed(2)}</p>
        <p>Tax (${(taxRate * 100).toFixed(0)}%): $${tax.toFixed(2)}</p>
        <h3>Total: $${total.toFixed(2)}</h3>
    `;

    let users = getAllUsers();
    let index = users.findIndex(u => u.trn === user.trn);

    users[index].cartSummary = { subtotal, discount, tax, total };
    saveAllUsers(users);
}

function updateCartQuantity(i, qty) {
    qty = parseInt(qty);
    if (qty < 1 || isNaN(qty)) {
        alert("Quantity must be at least 1.");
        // Reload cart to reset input field to current value
        displayCart(); 
        return;
    }

    let user = getCurrentUser();
    let users = getAllUsers();
    let index = users.findIndex(u => u.trn === user.trn);

    users[index].cart[i].quantity = qty;
    users[index].cart[i].lineTotal = qty * users[index].cart[i].price;

    saveAllUsers(users);
    displayCart();
}

function removeCartItem(i) {
    if (!confirm("Are you sure you want to remove this item?")) return;

    let user = getCurrentUser();
    let users = getAllUsers();
    let index = users.findIndex(u => u.trn === user.trn);

    users[index].cart.splice(i, 1);

    saveAllUsers(users);
    displayCart();
}

function clearAllCart() {
    if (!confirm("Are you sure you want to clear your entire cart?")) return;

    let user = getCurrentUser();
    let users = getAllUsers();
    let index = users.findIndex(u => u.trn === user.trn);

    users[index].cart = [];
    users[index].cartSummary = null;

    saveAllUsers(users);
    displayCart();
}

function goToCheckout() {
    let user = getCurrentUser();
    user = findUserByTRN(user.trn);
    if (!user || user.cart.length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }
    window.location.href = "checkout.html";
}

function closeCart() {
    window.location.href = "product.html";
}

/* ============================================================
   CHECKOUT FUNCTIONS 
============================================================ */
function displayCheckoutSummary() {
    let user = getCurrentUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    user = findUserByTRN(user.trn);

    if (!user.cartSummary) {
        document.getElementById("checkoutSummary").innerHTML = "<p>Cart summary not available. Go back to cart.</p>";
        // Redirect if summary is missing 
        setTimeout(() => window.location.href = "cart.html", 2000); 
        return;
    }

    let s = user.cartSummary;

    document.getElementById("checkoutSummary").innerHTML = `
        <p>Subtotal: $${s.subtotal.toFixed(2)}</p>
        <p>Discount: $${s.discount.toFixed(2)}</p>
        <p>Tax: $${s.tax.toFixed(2)}</p>
        <h3>Total To Pay: $${s.total.toFixed(2)}</h3>
    `;
}

// A) Invoice Generation:
function confirmCheckout() {
    let user = getCurrentUser();
    let users = getAllUsers();
    let index = users.findIndex(u => u.trn === user.trn);

    let shipName = document.getElementById("shipName").value.trim();
    let shipAddress = document.getElementById("shipAddress").value.trim();
    let amountPaid = parseFloat(document.getElementById("amountPaid").value);

    if (!shipName || !shipAddress || isNaN(amountPaid)) {
        alert("Complete all fields.");
        return;
    }

    let summary = users[index].cartSummary;

    if (amountPaid < summary.total) {
        alert("Insufficient payment. You must pay at least $" + summary.total.toFixed(2));
        return;
    }

    // --- Invoice Creation ---
    // Calculate final items with price and discount noted
    const finalItems = users[index].cart.map(item => {
        // Line discount is not applied per item, so we just include the original details
        // The total discount is already in summary.discount
        return {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.lineTotal,
            // Assuming no individual item discount, but structure is ready for it
            discount: 0 
        };
    });

    let invoice = {
        companyName: "Decor Haven", // Name of company
        invoiceNumber: "INV-" + (getAllInvoices().length + 1).toString().padStart(4, '0'), // Unique Invoice number
        date: new Date().toLocaleString(), // Date of invoice
        customer: users[index].firstName + " " + users[index].lastName,
        trn: users[index].trn,
        shippingName: shipName,
        shippingAddress: shipAddress, // Shipping information
        items: finalItems, // Purchased items
        subtotal: summary.subtotal, // Subtotal
        discount: summary.discount,
        tax: summary.tax, // Taxes
        total: summary.total, // Total cost
        amountPaid,
        changeDue: amountPaid - summary.total
    };

    // Store the invoice in AllInvoices (localStorage)
    let allInv = getAllInvoices();
    allInv.push(invoice);
    saveAllInvoices(allInv);

    // Append this invoice to the user’s array of invoices (RegisterData)
    users[index].invoices.push(invoice);
    saveAllUsers(users); // Save updated users data

    // Save for invoice.html display
    localStorage.setItem("LastInvoiceNumber", invoice.invoiceNumber);

    // Clear cart
    users[index].cart = [];
    users[index].cartSummary = null;
    saveAllUsers(users); // Save users after clearing cart

    // display a message
    alert("Checkout successful! Your invoice has been sent to your email (" + users[index].email + ") and will now be displayed.");
    window.location.href = "invoice.html";
}

function cancelCheckout() {
    window.location.href = "cart.html";
}

/* ============================================================
   INVOICE DISPLAY
============================================================ */
function displayLastInvoice() {
    let invoiceNum = localStorage.getItem("LastInvoiceNumber");
    let invoice = getAllInvoices().find(i => i.invoiceNumber === invoiceNum);

    if (!invoice) {
        document.getElementById("invoiceContainer").innerHTML = "<h2>No Recent Invoice Found</h2><p>Please complete a purchase to view an invoice.</p>";
        return;
    }

    let html = `
        <h1 style="text-align: center;">${invoice.companyName}</h1>
        <hr>
        <h2>Invoice ${invoice.invoiceNumber}</h2>
        <p><strong>Date:</strong> ${invoice.date}</p>
        <p><strong>Customer:</strong> ${invoice.customer}</p>
        <p><strong>TRN:</strong> ${invoice.trn}</p>
        <hr>
        <h3>Shipping Details</h3>
        <p><strong>To:</strong> ${invoice.shippingName}</p>
        <p><strong>Address:</strong> ${invoice.shippingAddress}</p>
        <hr>
    `;

    html += `<table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Line Total</th>
                    </tr>
                </thead>
                <tbody>`;

    invoice.items.forEach(item => {
        html += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.lineTotal.toFixed(2)}</td>
            </tr>`;
    });

    html += `
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                <td>$${invoice.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Discount:</strong></td>
                <td>-$${invoice.discount.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Tax:</strong></td>
                <td>$${invoice.tax.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>TOTAL:</strong></td>
                <td><strong>$${invoice.total.toFixed(2)}</strong></td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Amount Paid:</strong></td>
                <td>$${invoice.amountPaid.toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Change Due:</strong></td>
                <td>$${invoice.changeDue.toFixed(2)}</td>
            </tr>
        </tfoot>
        </table>
    `;

    document.getElementById("invoiceContainer").innerHTML = html;
}

/* ============================================================
   DASHBOARD
============================================================ */

// Additional Functionality: ShowUserFrequency() - Enhanced to include Age Groups
function ShowUserFrequency() {
    let users = getAllUsers();
    
    // --- Gender Frequency ---
    let genderCounts = { Male: 0, Female: 0, Other: 0 };
    users.forEach(u => {
        if (genderCounts.hasOwnProperty(u.gender)) {
            genderCounts[u.gender]++;
        }
    });

    let genderHtml = `
        <h3>Gender Frequency</h3>
        <p>Male: ${genderCounts.Male} <img src="thinbar.jpg" width="${genderCounts.Male * 40}"></p>
        <p>Female: ${genderCounts.Female} <img src="thinbar.jpg" width="${genderCounts.Female * 40}"></p>
        <p>Other: ${genderCounts.Other} <img src="thinbar.jpg" width="${genderCounts.Other * 40}"></p>
    `;
    document.getElementById("genderChart").innerHTML = genderHtml;

    // --- Age Group Frequency ---
    let ageGroupCounts = { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 };

    users.forEach(u => {
        const age = calculateAge(u.dob);
        if (age >= 18 && age <= 25) {
            ageGroupCounts['18-25']++;
        } else if (age >= 26 && age <= 35) {
            ageGroupCounts['26-35']++;
        } else if (age >= 36 && age <= 50) {
            ageGroupCounts['36-50']++;
        } else if (age > 50) {
            ageGroupCounts['50+']++;
        }
    });
    
    let ageHtml = `
        <h3>Age Group Frequency</h3>
        <p>18-25: ${ageGroupCounts['18-25']} <img src="thinbar.jpg" width="${ageGroupCounts['18-25'] * 40}"></p>
        <p>26-35: ${ageGroupCounts['26-35']} <img src="thinbar.jpg" width="${ageGroupCounts['26-35'] * 40}"></p>
        <p>36-50: ${ageGroupCounts['36-50']} <img src="thinbar.jpg" width="${ageGroupCounts['36-50'] * 40}"></p>
        <p>50+: ${ageGroupCounts['50+']} <img src="thinbar.jpg" width="${ageGroupCounts['50+'] * 40}"></p>
    `;
    document.getElementById("ageChart").innerHTML = ageHtml;
}

// display all and use console.log()
function ShowInvoices() {
    let trn = document.getElementById("searchTrn").value.trim();
    let invoices = getAllInvoices();
    let displayList = document.getElementById("invoiceList");
    
    // Clear previous search display
    displayList.innerHTML = ""; 
    
    // Log all invoices to the console before filtering
    console.log("--- ALL INVOICES IN LOCALSTORAGE (AllInvoices) ---");
    console.log(invoices); 
    
    let filteredInvoices = invoices;
    if (trn) {
        filteredInvoices = invoices.filter(i => i.trn === trn);
    }
    
    // Log the filtered invoices to the console as well
    console.log("--- FILTERED INVOICES BY TRN: " + (trn || "All") + " ---");
    console.log(filteredInvoices);

    let html = "";
    if (filteredInvoices.length === 0) {
        html = `<p>No invoices found for TRN: ${trn || 'All'}</p>`;
    } else {
        filteredInvoices.forEach(i => {
            html += `
                <div>
                    <p><strong>${i.invoiceNumber}</strong> (TRN: ${i.trn})</p>
                    <p>Customer: ${i.customer}</p>
                    <p>Total: $${i.total.toFixed(2)}</p>
                    <hr>
                </div>`;
        });
    }

    displayList.innerHTML = html;
}


// Used to use RegisterData and console.log()
function GetUserInvoices() {
    let trn = document.getElementById("userTrnInvoices").value.trim();
    let userInvoicesList = document.getElementById("userInvoiceList");
    
    // Clear previous search display
    userInvoicesList.innerHTML = "";

    if (!trn) {
        userInvoicesList.innerHTML = "<p>Please enter a TRN.</p>";
        return;
    }
    
    const user = findUserByTRN(trn);
    
    if (!user) {
        userInvoicesList.innerHTML = `<p>No user found with TRN: ${trn}</p>`;
        return;
    }

    // Access invoices from the user's object in RegisterData
    let invoices = user.invoices || []; 

    // Log the invoices from the user's object in RegisterData
    console.log("--- INVOICES FOR TRN: " + trn + " FROM RegisterData ---");
    console.log(invoices);

    let html = "";
    if (invoices.length === 0) {
        html = `<p>No invoices found for user with TRN: ${trn}</p>`;
    } else {
        invoices.forEach(i => {
            html += `
                <div>
                    <p><strong>${i.invoiceNumber}</strong></p>
                    <p>Date: ${i.date}</p>
                    <p>Total: $${i.total.toFixed(2)}</p>
                    <hr>
                </div>`;
        });
    }

    userInvoicesList.innerHTML = html;
}

/* ============================================================
   AUTO LOADING (runs based on page)
============================================================ */
window.onload = function () {

    if (document.getElementById("productList")) {
        displayProducts();
    }

    if (document.getElementById("cartItems")) {
        displayCart();
    }

    if (document.getElementById("checkoutSummary")) {
        displayCheckoutSummary();
    }

    if (document.getElementById("invoiceContainer")) {
        displayLastInvoice();
    }

    // Ensure all dashboard functions are called if the dashboard elements exist
    if (document.getElementById("genderChart") && document.getElementById("ageChart")) {
        ShowUserFrequency();
    }
    
    if (document.getElementById("invoiceList") && !document.getElementById("searchTrn").value) {
        // show all invoices on load if the search field is empty
        ShowInvoices(); 
    }
};
