# Client Shop Dashboard - Technical Documentation

## Architecture Overview

### Component Structure
```
Client Shop System
├── Frontend (pages/client-shop.html)
│   ├── HTML Template
│   ├── Inline CSS (900+ lines)
│   └── Script References
├── Shopping Logic (js/client-shop.js)
│   ├── Product Management
│   ├── Cart Management
│   ├── Order Creation
│   └── UI Updates
└── Backend Integration
    ├── GET /products
    ├── GET /products/:id
    ├── GET /products/categories/all
    └── POST /commandes
```

## File Structure

### client-shop.html
**Purpose:** Main shopping interface UI

**Key Sections:**
1. **Sidebar Navigation** - Role-based menu links
2. **Header** - Page title and user info
3. **Filters Section** - Search and category filters
4. **Main Content**
   - Products Grid (responsive layout)
   - Shopping Cart Sidebar (sticky position)
5. **Product Detail Modal** - Full product information
6. **CSS Styling** - Complete styling (not dependent on external SCSS)

**CSS Classes:**
- `.shop-container` - Main 2-column layout
- `.products-section` - Auto-fill grid
- `.product-card` - Individual product display
- `.cart-sidebar` - Sticky cart panel
- `.modal-overlay` - Product details modal
- `.variant-option` - Size/color selection

### client-shop.js
**Purpose:** Complete shopping functionality

**Global Variables:**
```javascript
let allProducts = [];      // Cached product list
let categories = [];       // Available categories
let cart = [];            // Shopping cart items
let currentDetailProduct = null; // Product being viewed
```

**Function Categories:**

#### Product Loading & Display
```javascript
loadProducts()          // Fetch from /products endpoint
loadCategories()        // Fetch from /products/categories/all
displayProducts(items)  // Render product cards
filterProducts()        // Apply search and filters
```

#### Cart Management
```javascript
addToCart(productId)        // Add product with quantity
removeFromCart(index)       // Remove from cart
updateCart()               // Update UI and totals
checkout()                 // Create order
```

#### Product Details
```javascript
showProductDetail(id)       // Open detail modal
displayProductDetail(prod)  // Render product info
selectVariant(type, val)   // Select size/color
addFromDetail()            // Add from detail view
```

#### UI Management
```javascript
openDetailModal()    // Show product details
closeDetailModal()   // Hide product details
showNotification()   // Display toast messages
```

## API Integration

### Endpoints Used

#### 1. GET /products
**Purpose:** Fetch all available products
**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "reference": "REF001",
      "nom": "T-Shirt Premium",
      "categorie_id": 1,
      "categorie_nom": "Chemises",
      "genre": "Homme",
      "prix_vente": 299.99,
      "stock_total": 45,
      "nombre_variantes": 3,
      "saison": "Été"
    }
  ]
}
```

#### 2. GET /products/:id
**Purpose:** Get detailed product info with variants
**Response:**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "reference": "REF001",
    "nom": "T-Shirt Premium",
    "prix_vente": 299.99,
    "stock_total": 45,
    "variantes": [
      {
        "id": 1,
        "taille": "S",
        "couleur": "Bleu",
        "quantite": 15
      },
      {
        "id": 2,
        "taille": "M",
        "couleur": "Bleu",
        "quantite": 20
      }
    ]
  }
}
```

#### 3. GET /products/categories/all
**Purpose:** Fetch all product categories
**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "nom": "Chemises",
      "description": "Chemises et T-Shirts"
    }
  ]
}
```

#### 4. POST /commandes
**Purpose:** Create a new order
**Request Body:**
```json
{
  "client_id": 5,
  "articles": [
    {
      "produit_id": 1,
      "variante_id": 1,
      "quantite": 2,
      "prix_unitaire": 299.99
    }
  ],
  "notes": "Commande depuis la boutique en ligne"
}
```

**Response:**
```json
{
  "success": true,
  "commande": {
    "id": 42,
    "reference": "CMD1234567890",
    "client_id": 5,
    "total": 599.98,
    "date_commande": "2026-01-11T10:30:00Z",
    "statut": "En attente"
  }
}
```

## Authentication

**Method:** Token-based (JWT)
**Storage:** localStorage
**Token Access:** `getUser()` function from auth.js
**User Properties:**
```javascript
{
  id: number,
  nom: string,
  email: string,
  role: string  // "Client", "Administrateur", "Magasinier"
}
```

## Cart Data Structure

**In-Memory Cart:**
```javascript
cart = [
  {
    id: 1,                  // Product ID
    reference: "REF001",
    nom: "T-Shirt Premium",
    prix_vente: 299.99,
    quantity: 2,
    categorie_nom: "Chemises"
  }
]
```

**Checkout Payload:**
```javascript
{
  client_id: user.id,
  articles: [
    {
      produit_id: 1,
      variante_id: null,  // Optional
      quantite: 2,
      prix_unitaire: 299.99
    }
  ],
  notes: "Commande depuis la boutique en ligne"
}
```

## Event Flow

### Product Loading Flow
```
DOMContentLoaded
  ↓
loadProducts() → /products endpoint
  ↓
displayProducts() → Render cards
  ↓
User sees products
```

### Add to Cart Flow
```
User clicks "Ajouter"
  ↓
addToCart(productId)
  ↓
Validate stock
  ↓
Check if exists in cart
  ↓
Add/Merge item
  ↓
updateCart() → Re-render UI
  ↓
showNotification()
```

### Checkout Flow
```
User clicks "Passer la commande"
  ↓
checkout()
  ↓
Prepare articles from cart
  ↓
POST /commandes
  ↓
Success → Clear cart, redirect
Error → Show alert
```

## Error Handling

### Try-Catch Blocks
All async functions wrapped in try-catch:
```javascript
try {
  const result = await apiRequest('/products');
  // Process result
} catch (error) {
  console.error('Error:', error);
  showNotification('Error message');
}
```

### User Validations
1. **Stock Validation** - Prevent buying more than available
2. **Quantity Validation** - Must be > 0
3. **Authentication Check** - Redirect if not logged in
4. **Cart State** - Check cart not empty before checkout

### Error Messages
- "Quantité invalide" - User entered 0 or negative
- "Stock insuffisant" - Requested more than available
- "Erreur lors du chargement" - API connection issue
- "Erreur lors de la création de la commande" - Server error

## Styling System

### Color Scheme
- Primary: `#667eea` (Purple/Blue)
- Secondary: `#764ba2` (Purple)
- Success: `#4caf50` (Green)
- Danger: `#ff5252` (Red)
- Background: `#f5f5f5` (Light gray)
- Border: `#e0e0e0` (Medium gray)

### Responsive Design

**Large Screens (>1200px)**
```
2-column layout (products + cart)
```

**Medium Screens (768px-1200px)**
```
Single column
Cart below products
```

**Mobile (<768px)**
```
Smaller product cards
Full-width layout
Hamburger menu potential
```

### Animation Classes
```css
@keyframes slideIn    /* Toast appear */
@keyframes slideOut   /* Toast disappear */
```

## Performance Considerations

1. **Product Caching** - Store products in memory to avoid re-fetching
2. **Event Delegation** - Minimize event listeners
3. **DOM Updates** - Only update necessary elements
4. **Modal Efficiency** - Reuse modal for all products
5. **Filter Optimization** - Client-side filtering (fast)

## Dependencies

**Required Files:**
- `auth.js` - Authentication functions
- `api.js` - API request utilities
- `dashboard.css` - Base styling

**Functions Used:**
```javascript
// From auth.js
isAuthenticated()
getUser()
logout()

// From api.js
apiRequest(endpoint, options)
formatPrice(amount)
```

## Browser Compatibility

**Tested & Compatible:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used:**
- CSS Grid (100% support)
- Fetch API (modern)
- localStorage (standard)
- Array methods (ES6)
- Template literals (ES6)

## Security Considerations

1. **Token Validation** - Backend validates JWT
2. **Input Sanitization** - User inputs validated before sending
3. **HTTPS** - All API calls use HTTPS (in production)
4. **CORS** - Handled by backend
5. **SQL Injection** - Not applicable (no direct queries)

## Future Enhancements

### Phase 2 (UI Improvements)
- [ ] Product image upload support
- [ ] Star ratings and reviews
- [ ] Related products section
- [ ] Recently viewed products

### Phase 3 (Features)
- [ ] Wishlist functionality
- [ ] Save favorites
- [ ] Quick reorder from history
- [ ] Gift cards

### Phase 4 (Commerce)
- [ ] Discount codes
- [ ] Bulk pricing
- [ ] Subscription products
- [ ] Payment gateway integration

## Testing Checklist

- [ ] Products load on page load
- [ ] Filtering works correctly
- [ ] Add to cart with valid quantity
- [ ] Add to cart with invalid quantity (shows error)
- [ ] Remove from cart updates totals
- [ ] Product detail modal opens/closes
- [ ] Checkout creates order
- [ ] Out of stock products show warning
- [ ] Responsive design works on mobile
- [ ] Cart updates in real-time

## Debugging Tips

**Check Product Loading:**
```javascript
console.log(allProducts)  // See all products
console.log(cart)          // See cart contents
```

**Check API Calls:**
```
Open DevTools → Network tab
Filter by XHR
Check request/response
```

**Check Authentication:**
```javascript
console.log(getUser())     // See current user
```

**Common Issues:**
1. Products not loading → Check API endpoint
2. Cart not updating → Check updateCart() call
3. Checkout failing → Check client_id in payload
4. Modal not closing → Check event listener binding
