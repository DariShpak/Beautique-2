// Sample products data
let products = [
  {
    id: 1,
    sku: "AXY-AIS-30",
    name: "Artichoke Intensive Skin Barrier",
    brand: "AXIS-Y",
    category: "face-care",
    price: 34.95,
    volume: "30ml",
    stock_quantity: 12,
    status: "active",
    featured: 1,
    image: "https://via.placeholder.com/200",
    description: "Advanced skin barrier repair serum...",
    expert_review: "Our team tested this for 2 months..."
  },
  {
    id: 2,
    sku: "HDT-BL-300",
    name: "Calm Body Lotion",
    brand: "Hadat Cosmetics",
    category: "body-care",
    price: 53.0,
    volume: "300ml",
    stock_quantity: 8,
    status: "active",
    featured: 0,
    image: "https://via.placeholder.com/200",
    description: "Nourishing body lotion with hemp oil...",
    expert_review: "Perfect for daily use..."
  }
]

let editingProductId = null

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  renderProductsTable()
  setupEventListeners()
})

function setupEventListeners() {
  // Search functionality
  document
    .getElementById("searchProducts")
    .addEventListener("input", filterProducts)

  // Form submission
  document
    .getElementById("productForm")
    .addEventListener("submit", handleFormSubmit)

  // Image preview
  document
    .getElementById("productImage")
    .addEventListener("change", handleImagePreview)
}

function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody")

  if (products.length === 0) {
    tbody.innerHTML = `
          <tr>
              <td colspan="6" class="empty-state">
                  <h3>No products yet</h3>
                  <p>Click "Add Product" to create your first product</p>
              </td>
          </tr>
      `
    return
  }

  tbody.innerHTML = products
    .map(
      (product) => `
      <tr class="product-row" onclick="editProduct(${
        product.id
      })" data-product-id="${product.id}">
          <td>
              <img src="${product.image}" alt="${
        product.name
      }" class="product-image-small">
          </td>
          <td>
              <div class="product-info">
                  <div class="product-name">${product.name}</div>
                  <div class="product-brand">${product.brand}</div>
                  <div class="product-sku">${product.sku}</div>
              </div>
          </td>
          <td>€${product.price}</td>
          <td>${product.stock_quantity || 0}</td>
          <td>
              <span class="status-badge ${
                product.status === "active"
                  ? "status-active"
                  : "status-inactive"
              }">
                  ${product.status}
              </span>
          </td>
          <td>
              <div class="product-actions">
                  <button class="btn-small btn-edit" onclick="event.stopPropagation(); editProduct(${
                    product.id
                  })">Edit</button>
                  <button class="btn-small btn-delete" onclick="event.stopPropagation(); deleteProduct(${
                    product.id
                  })">Delete</button>
              </div>
          </td>
      </tr>
  `
    )
    .join("")
}

function filterProducts() {
  const query = document.getElementById("searchProducts").value.toLowerCase()
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
  )

  // Temporarily update products for rendering
  const originalProducts = [...products]
  products = filteredProducts
  renderProductsTable()
  products = originalProducts
}

function addNewProduct() {
  resetForm()
  editingProductId = null
  document.getElementById("formTitle").textContent = "Add New Product"
  document.getElementById("formMode").textContent = "Add Mode"
  document.getElementById("formMode").className = "form-mode-indicator"
  document.getElementById("submitBtn").textContent = "Add Product"

  // Clear selected row
  document.querySelectorAll(".product-row").forEach((row) => {
    row.classList.remove("selected")
  })
}

function editProduct(productId) {
  const product = products.find((p) => p.id === productId)
  if (!product) return

  editingProductId = productId

  // Update form header
  document.getElementById("formTitle").textContent = "Edit Product"
  document.getElementById("formMode").textContent = "Edit Mode"
  document.getElementById("formMode").className =
    "form-mode-indicator edit-mode"
  document.getElementById("submitBtn").textContent = "Update Product"

  // Fill form with product data
  document.getElementById("productId").value = product.id
  document.getElementById("sku").value = product.sku
  document.getElementById("productName").value = product.name
  document.getElementById("brand").value = product.brand
  document.getElementById("category").value = product.category
  document.getElementById("price").value = product.price
  document.getElementById("volume").value = product.volume || ""
  document.getElementById("stockQuantity").value = product.stock_quantity || ""
  document.getElementById("status").value = product.status
  document.getElementById("featured").value = product.featured
  document.getElementById("description").value = product.description || ""
  document.getElementById("expertReview").value = product.expert_review || ""

  // Show current image
  if (product.image) {
    document.getElementById("currentImage").src = product.image
    document.getElementById("currentImagePreview").style.display = "block"
    document.getElementById("uploadPrompt").style.display = "none"
  }

  // Highlight selected row
  document.querySelectorAll(".product-row").forEach((row) => {
    row.classList.remove("selected")
  })
  document
    .querySelector(`[data-product-id="${productId}"]`)
    .classList.add("selected")
}

function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter((p) => p.id !== productId)
    renderProductsTable()

    // If we were editing this product, reset form
    if (editingProductId === productId) {
      addNewProduct()
    }

    alert("Product deleted successfully!")
  }
}

function handleFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(document.getElementById("productForm"))
  const productData = Object.fromEntries(formData.entries())

  if (editingProductId) {
    // Update existing product
    const productIndex = products.findIndex((p) => p.id === editingProductId)
    if (productIndex !== -1) {
      products[productIndex] = {
        ...products[productIndex],
        ...productData,
        id: editingProductId
      }
      alert("Product updated successfully!")
    }
  } else {
    // Add new product
    const newProduct = {
      ...productData,
      id: Date.now(), // Simple ID generation
      image: "https://via.placeholder.com/200" // Placeholder image
    }
    products.push(newProduct)
    alert("Product added successfully!")
  }

  renderProductsTable()
  resetForm()
}

function handleImagePreview(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = function (e) {
      document.getElementById("currentImage").src = e.target.result
      document.getElementById("currentImagePreview").style.display = "block"
      document.getElementById("uploadPrompt").style.display = "none"
    }
    reader.readAsDataURL(file)
  }
}

function resetForm() {
  document.getElementById("productForm").reset()
  document.getElementById("productId").value = ""
  document.getElementById("currentImagePreview").style.display = "none"
  document.getElementById("uploadPrompt").style.display = "block"
  editingProductId = null

  // Reset to add mode
  document.getElementById("formTitle").textContent = "Add New Product"
  document.getElementById("formMode").textContent = "Add Mode"
  document.getElementById("formMode").className = "form-mode-indicator"
  document.getElementById("submitBtn").textContent = "Add Product"
}
