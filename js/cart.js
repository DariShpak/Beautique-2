// cart.js - Universal cart functionality for beautique.

// Cart data management
let cartItems = JSON.parse(localStorage.getItem("beautique_cart")) || []

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeCart()
})

function initializeCart() {
  // Add event listeners to all cart buttons
  const cartButtons = document.querySelectorAll(".open-cart-btn")
  cartButtons.forEach((button) => {
    button.addEventListener("click", openCart)
  })

  // Add event listeners to all "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll(
    ".add-to-cart, .btn-add-to-cart, [data-add-to-cart]"
  )
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", handleAddToCart)
  })

  // Close cart event listeners
  const cartOverlay = document.getElementById("cartOverlay")
  const cartClose = document.querySelector(".cart-close")

  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart)
  }

  if (cartClose) {
    cartClose.addEventListener("click", closeCart)
  }

  // Escape key to close cart
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCart()
    }
  })

  // Prevent closing when clicking inside modal
  const cartModal = document.getElementById("cartModal")
  if (cartModal) {
    cartModal.addEventListener("click", function (e) {
      e.stopPropagation()
    })
  }

  // Initial render
  updateCartUI()
}

function openCart() {
  const cartOverlay = document.getElementById("cartOverlay")
  const cartModal = document.getElementById("cartModal")

  if (cartOverlay && cartModal) {
    cartOverlay.classList.add("active")
    cartModal.classList.add("active")
    document.body.style.overflow = "hidden"

    // Render cart items when opening
    renderCartItems()
    updateSubtotal()
  }
}

function closeCart() {
  const cartOverlay = document.getElementById("cartOverlay")
  const cartModal = document.getElementById("cartModal")

  if (cartOverlay && cartModal) {
    cartOverlay.classList.remove("active")
    cartModal.classList.remove("active")
    document.body.style.overflow = ""
  }
}

function handleAddToCart(e) {
  e.preventDefault()

  // Get product data from button attributes or parent element
  const button = e.target
  const productCard =
    button.closest("[data-product-id]") || button.closest(".product-card")

  let productData = {}

  if (productCard) {
    // Extract data from product card
    productData = {
      id: productCard.dataset.productId || Date.now(),
      sku: productCard.dataset.sku || "",
      name:
        productCard.querySelector(".product-title, .product-name")
          ?.textContent || "Unknown Product",
      brand: productCard.querySelector(".product-brand")?.textContent || "",
      price:
        parseFloat(
          productCard
            .querySelector(".product-price")
            ?.textContent.replace(/[€$,]/g, "")
        ) || 0,
      image:
        productCard.querySelector("img")?.src ||
        "https://via.placeholder.com/150"
    }
  } else {
    // Fallback: get data from button attributes
    productData = {
      id: button.dataset.productId || Date.now(),
      sku: button.dataset.sku || "",
      name: button.dataset.productName || "Unknown Product",
      brand: button.dataset.brand || "",
      price: parseFloat(button.dataset.price) || 0,
      image: button.dataset.image || "https://via.placeholder.com/150"
    }
  }

  addItemToCart(productData)

  // Show feedback
  showCartFeedback(button)
}

function addItemToCart(productData) {
  const existingItem = cartItems.find((item) => item.id == productData.id)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cartItems.push({
      ...productData,
      quantity: 1
    })
  }

  saveCartToStorage()
  updateCartUI()
}

function updateQuantity(itemId, newQuantity) {
  newQuantity = parseInt(newQuantity)

  if (newQuantity < 1 || newQuantity > 10) return

  const itemIndex = cartItems.findIndex((item) => item.id == itemId)
  if (itemIndex !== -1) {
    cartItems[itemIndex].quantity = newQuantity
    saveCartToStorage()
    renderCartItems()
    updateSubtotal()
    updateCartCounter()
  }
}

function removeItem(itemId) {
  if (confirm("Remove this item from cart?")) {
    cartItems = cartItems.filter((item) => item.id != itemId)
    saveCartToStorage()
    renderCartItems()
    updateSubtotal()
    updateCartCounter()
  }
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById("cartItems")
  if (!cartItemsContainer) return

  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
            </div>
        `

    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) {
      checkoutBtn.disabled = true
    }
    return
  }

  const checkoutBtn = document.getElementById("checkoutBtn")
  if (checkoutBtn) {
    checkoutBtn.disabled = false
  }

  cartItemsContainer.innerHTML = cartItems
    .map(
      (item) => `
        <div class="cart-item" data-item-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-brand">${item.brand}</p>
                <p class="cart-item-price">€${item.price.toFixed(2)}</p>
                <div class="cart-item-controls">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, ${item.quantity - 1})" ${
        item.quantity <= 1 ? "disabled" : ""
      }>−</button>
                        <input type="number" class="quantity-input" value="${
                          item.quantity
                        }" min="1" max="10" onchange="updateQuantity(${
        item.id
      }, this.value)">
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, ${item.quantity + 1})" ${
        item.quantity >= 10 ? "disabled" : ""
      }>+</button>
                    </div>
                    <button class="remove-item" onclick="removeItem(${
                      item.id
                    })">Remove</button>
                </div>
            </div>
        </div>
    `
    )
    .join("")
}

function updateSubtotal() {
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const subtotalElement = document.getElementById("subtotalAmount")
  if (subtotalElement) {
    subtotalElement.textContent = `€${subtotal.toFixed(2)}`
  }
}

function updateCartCounter() {
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Update all cart buttons on the page
  const cartButtons = document.querySelectorAll(".open-cart-btn")
  cartButtons.forEach((button) => {
    if (totalItems === 0) {
      button.textContent = "Cart"
    } else {
      // You can customize the text format here
      button.textContent = `Cart (${totalItems})`

      // Or add a separate counter element
      const counter = button.querySelector(".cart-counter")
      if (counter) {
        counter.textContent = totalItems
        counter.style.display = totalItems > 0 ? "inline" : "none"
      }
    }
  })
}

function updateCartUI() {
  updateCartCounter()
  renderCartItems()
  updateSubtotal()
}

function saveCartToStorage() {
  localStorage.setItem("beautique_cart", JSON.stringify(cartItems))
}

function clearCart() {
  if (confirm("Clear all items from cart?")) {
    cartItems = []
    saveCartToStorage()
    updateCartUI()
  }
}

function goToCheckout() {
  if (cartItems.length === 0) {
    alert("Your cart is empty")
    return
  }

  // Save cart data for checkout page
  localStorage.setItem(
    "beautique_checkout_data",
    JSON.stringify({
      items: cartItems,
      subtotal: cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
      timestamp: Date.now()
    })
  )

  // Redirect to checkout
  window.location.href = "checkout.html"
}

function showCartFeedback(button) {
  // Visual feedback when item added to cart
  const originalText = button.textContent
  button.textContent = "Added!"
  button.style.background = "#4CAF50"

  setTimeout(() => {
    button.textContent = originalText
    button.style.background = ""
  }, 1000)
}

// Utility functions
function getCartTotal() {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
}

function getCartItemCount() {
  return cartItems.reduce((total, item) => total + item.quantity, 0)
}

function getCartItem(itemId) {
  return cartItems.find((item) => item.id == itemId)
}

// Export functions for external use
window.beautique_cart = {
  openCart,
  closeCart,
  addItemToCart,
  removeItem,
  updateQuantity,
  clearCart,
  getCartTotal,
  getCartItemCount,
  getCartItem
}
