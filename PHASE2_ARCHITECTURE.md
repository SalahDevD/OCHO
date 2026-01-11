# 🏗️ OCHO MARKETPLACE - PHASE 2 ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    OCHO MARKETPLACE SYSTEM                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   FRONTEND (Vue)     │         │   BACKEND (Node.js)  │
│                      │         │                      │
│  ├─ client-shop.html │◄────────►  /products          │
│  ├─ checkout.html    │         │  /commandes         │
│  ├─ seller-*.html    │         │  /dashboard/*       │
│  ├─ commandes.html   │         │                      │
│  └─ *.js (logic)     │         │  ├─ MySQL Database  │
│                      │         │  │  ├─ Utilisateur  │
└──────────────────────┘         │  │  ├─ Produit      │
                                 │  │  └─ Commande     │
                                 │  │                  │
                                 │  └─ Controllers     │
                                 │     └─ Middleware   │
                                 │                      │
                                 └──────────────────────┘
```

---

## Module Structure

### Frontend Organization

```
frontend/
├── pages/
│   ├── index.html               (Login page)
│   ├── register.html            (Registration)
│   ├── dashboard.html           (Main dashboard)
│   ├── client-shop.html         ⭐ (Client shopping)
│   ├── checkout.html            ⭐ (Payment processing)
│   ├── order-confirmation.html  ⭐ (Order confirmation)
│   ├── commandes.html           (Order history - shared)
│   ├── seller-dashboard.html    ⭐ (Vendor dashboard)
│   ├── seller-products.html     ⭐ (Product CRUD)
│   ├── products.html            (Admin products)
│   ├── users.html               (User management)
│   └── clients.html             (Client management)
│
├── js/
│   ├── auth.js                  (Authentication helpers)
│   ├── api.js                   (API request handler)
│   ├── client-shop.js           ⭐ (Shopping logic - MODIFIED)
│   ├── checkout.js              ⭐ (Payment logic - NEW)
│   ├── commandes.js             (Order management - MODIFIED)
│   ├── seller-dashboard.js      ⭐ (Vendor dashboard logic)
│   ├── seller-products.js       ⭐ (Product management)
│   ├── products.js              (Admin product management)
│   ├── dashboard.js             (Dashboard logic)
│   └── *.js                     (Other page logic)
│
└── css/
    ├── style.css                (Global styles)
    └── dashboard.css            (Dashboard styles)
```

⭐ = Phase 2 implementation

---

## Data Flow Architecture

### 1. CLIENT SHOPPING FLOW

```
User Login
    │
    ▼
client-shop.html
    │
    ├─► Load Products (GET /products)
    ├─► Load Categories (GET /products/categories/all)
    │
    ▼
Browse & Filter
    │
    ├─► Search
    ├─► Category Filter
    └─► Genre Filter
    │
    ▼
Product Details Modal
    │
    ├─► Fetch Details (GET /products/{id})
    └─► Show Variants (size, color)
    │
    ▼
Add to Cart
    │
    ├─► Store in Memory (cart array)
    ├─► Update Cart UI
    └─► Save to sessionStorage (backup)
    │
    ▼
CHECKOUT BUTTON
    │
    ├─► Save cart to sessionStorage
    └─► Redirect to checkout.html
    │
    ▼
checkout.html
    │
    ├─► Load Cart from sessionStorage
    ├─► Calculate: Subtotal + Tax (20%) + Shipping (50 DH)
    │
    ▼
Fill Delivery Address
    │
    ├─► Name, Phone, Email, Address, City, Zip, Country
    │
    ▼
Select Payment Method
    │
    ├─► Card (with CVV, number, expiry)
    ├─► PayPal
    ├─► Bank Transfer
    └─► 3x Installment
    │
    ▼
Submit Checkout
    │
    ├─► Validate Address Form
    ├─► Validate Card Data (if applicable)
    ├─► POST /commandes
    │   │
    │   └─► Create Order with articles
    │
    ▼
Order Created Successfully
    │
    ├─► Save Payment Details to sessionStorage
    ├─► Save Delivery Address to sessionStorage
    └─► Clear checkout_cart from sessionStorage
    │
    ▼
order-confirmation.html
    │
    ├─► Load order details from sessionStorage
    ├─► Display confirmation
    │
    ▼
View Order History
    │
    └─► commandes.html (filtered by client_id)
```

### 2. VENDOR ORDER MANAGEMENT FLOW

```
Vendor Login
    │
    ▼
seller-dashboard.html
    │
    ├─► GET /products (to get vendor's products)
    ├─► GET /commandes (to load all orders)
    │
    ▼
filterOrdersForVendor()
    │
    ├─► Get vendor's product IDs
    ├─► For each order:
    │   └─► Get order details
    │   └─► Check if order contains vendor's products
    │   └─► Include if match found
    │
    ▼
Display Vendor Orders
    │
    ├─► Calculate total revenue
    ├─► Count total orders
    ├─► Show recent products
    └─► Show recent orders
    │
    ▼
Click on Order
    │
    └─► View full order details
        ├─► Order number, date, status
        ├─► Articles with vendor's products highlighted
        └─► Delivery information
```

### 3. PRODUCT MANAGEMENT FLOW

```
Vendor Login
    │
    ▼
seller-products.html
    │
    ├─► Load vendor's products (GET /products)
    │   └─► Filter by vendeur_id = user.id
    │
    ▼
Search & Filter
    │
    ├─► Search by name/reference
    │
    ▼
Add Product
    │
    ├─► Open Modal
    ├─► Fill: Reference, Name, Category, Price, etc.
    ├─► POST /products (with vendeur_id = user.id)
    │
    ▼
Edit Product
    │
    ├─► Click Edit on product
    ├─► Open Modal with current data
    ├─► Modify fields
    ├─► PUT /products/:id
    │
    ▼
Delete Product
    │
    ├─► Confirm deletion
    ├─► DELETE /products/:id
    │
    ▼
Refresh Product List
```

---

## Database Schema (Phase 2 Relevant)

```sql
┌─────────────────────────────────────────────────────┐
│                    UTILISATEUR                      │
├─────────────────────────────────────────────────────┤
│ id (PK)                                             │
│ nom                                                 │
│ email (UNIQUE)                                      │
│ password (hashed)                                   │
│ role_id (FK) → Rôle(id)                             │
│ statut                                              │
│ date_creation                                       │
└─────────────────────────────────────────────────────┘
           ▲         ▲                ▲
           │         │                │
    [Admin/Client]  [Vendeur]    [Client]
           │         │                │
           │         └────┬───────────┘
           │              │
           │         ┌─────────────────┐
           │         │      PRODUIT    │
           │         ├─────────────────┤
           │         │ id (PK)         │
           │         │ nom             │
           │         │ reference       │
           │         │ prix_vente      │
           │         │ vendeur_id (FK) ◄──────┘ Nouveau!
           │         │ categorie_id    │
           │         │ stock_total     │
           │         │ date_creation   │
           │         └─────────────────┘
           │              ▲
           │              │
           │         ┌──────────────┐
           │         │  VARIANTE    │
           │         ├──────────────┤
           │         │ id (PK)      │
           │         │ produit_id   │
           │         │ taille       │
           │         │ couleur      │
           │         └──────────────┘
           │
      ┌────────────────────────────┐
      │      COMMANDE              │
      ├────────────────────────────┤
      │ id (PK)                    │
      │ reference                  │
      │ client_id (FK) ────────────┴──┘
      │ date_commande              │
      │ statut                     │
      │ total                      │
      │ adresse_livraison          │
      │ telephone                  │
      │ email                      │
      └────────────────────────────┘
           ▲
           │
      ┌────────────────────────────┐
      │   LIGNE_COMMANDE           │
      ├────────────────────────────┤
      │ id (PK)                    │
      │ commande_id (FK)           │
      │ produit_id (FK)            │
      │ variante_id (FK)           │
      │ quantite                   │
      │ prix_unitaire              │
      └────────────────────────────┘
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│              CLIENT SHOPPING COMPONENTS                 │
└─────────────────────────────────────────────────────────┘

client-shop.html
    │
    ├─► Product Grid
    │   ├─ loadProducts() ────► API.GET /products
    │   ├─ displayProducts()
    │   └─ filterProducts()
    │
    ├─► Product Details Modal
    │   ├─ showProductDetail(id) ────► API.GET /products/{id}
    │   ├─ selectVariant()
    │   └─ closeDetailModal()
    │
    ├─► Shopping Cart
    │   ├─ addToCart(id)
    │   ├─ removeFromCart(index)
    │   ├─ updateCart()
    │   └─ Cart UI (Sidebar)
    │
    └─► Checkout Button
        └─ checkout() ────► Navigate to checkout.html


┌─────────────────────────────────────────────────────────┐
│             CHECKOUT COMPONENTS                         │
└─────────────────────────────────────────────────────────┘

checkout.html + checkout.js
    │
    ├─► Order Summary
    │   ├─ getCartFromStorage()
    │   ├─ displayOrderSummary()
    │   └─ Calculate: subtotal, tax, shipping, total
    │
    ├─► Delivery Address Form
    │   ├─ Inputs: name, phone, email, address, city, zip
    │   └─ validateForm()
    │
    ├─► Payment Method Selection
    │   ├─ selectPaymentMethod(method)
    │   ├─ Show/Hide conditional fields
    │   └─ Card Details Form (if card selected)
    │
    └─► Complete Checkout
        ├─ validateForm()
        ├─ validateCardData()
        ├─ completeCheckout()
        │   └─► API.POST /commandes
        │
        ├─ Save to sessionStorage:
        │   ├─ last_payment
        │   └─ delivery_address
        │
        └─ Navigate to order-confirmation.html


┌─────────────────────────────────────────────────────────┐
│          VENDOR COMPONENTS                              │
└─────────────────────────────────────────────────────────┘

seller-dashboard.html + seller-dashboard.js
    │
    ├─► Statistics
    │   ├─ loadSellerStats()
    │   ├─ Products count
    │   ├─ Total revenue
    │   ├─ Orders received
    │   └─ Average rating
    │
    ├─► Recent Products
    │   └─ Display vendor's products
    │
    └─► Recent Orders
        └─ Orders containing vendor's products


seller-products.html + seller-products.js
    │
    ├─► Product List
    │   └─ Display vendor's products
    │
    ├─► Add Product
    │   └─ openAddModal() ────► API.POST /products
    │
    ├─► Edit Product
    │   └─ editProduct(id) ────► API.PUT /products/{id}
    │
    └─► Delete Product
        └─ deleteProduct(id) ────► API.DELETE /products/{id}


commandes.html + commandes.js (Shared)
    │
    ├─► For Clients:
    │   └─ Display all their orders
    │
    ├─► For Vendors:
    │   ├─ filterOrdersForVendor()
    │   │   ├─► GET /products (get vendor's products)
    │   │   ├─► GET /commandes (get all orders)
    │   │   ├─► For each order:
    │   │   │   ├─► GET /commandes/{id} (details)
    │   │   │   └─► Check if order has vendor's products
    │   │   │
    │   │   └─ Display only matching orders
    │
    ├─► Order Details
    │   └─ showOrderDetails()
    │
    └─► Order Status
        └─ updateOrderStatus() (for authorized users)
```

---

## Session Storage Architecture

```
DURING SHOPPING:
┌──────────────────────────────────────────┐
│         sessionStorage                   │
├──────────────────────────────────────────┤
│ checkout_cart: [                         │
│   {                                      │
│     id: 1,                               │
│     nom: "Product A",                    │
│     prix_vente: 250,                     │
│     quantity: 2,                         │
│     variante_id: null                    │
│   },                                     │
│   ...                                    │
│ ]                                        │
└──────────────────────────────────────────┘


AFTER SUCCESSFUL ORDER:
┌──────────────────────────────────────────┐
│         sessionStorage                   │
├──────────────────────────────────────────┤
│ last_payment: {                          │
│   orderId: 123,                          │
│   method: "card",                        │
│   amount: 1250.50,                       │
│   timestamp: "2024-01-15T...",           │
│   lastFourDigits: "4242"  (card only)    │
│ }                                        │
│                                          │
│ delivery_address: {                      │
│   address: "123 Rue...",                 │
│   city: "Casablanca",                    │
│   zipcode: "20000",                      │
│   country: "Maroc"                       │
│ }                                        │
│                                          │
│ checkout_cart: [] (cleared)              │
└──────────────────────────────────────────┘
```

---

## API Request/Response Flow

### Order Creation Request
```javascript
POST /commandes
{
  "client_id": 1,
  "articles": [
    {
      "produit_id": 10,
      "variante_id": null,
      "quantite": 2,
      "prix_unitaire": 250
    }
  ],
  "notes": "Commande depuis la boutique...",
  "adresse_livraison": "123 Rue..., Casablanca 20000, Maroc",
  "telephone": "+212612345678",
  "email": "client@example.com",
  "methode_paiement": "card",
  "montant_total": 1250.50
}

RESPONSE:
{
  "success": true,
  "commande": {
    "id": 123,
    "reference": "CMD-2024-001",
    "client_id": 1,
    "date_commande": "2024-01-15T14:30:00Z",
    "total": 1250.50,
    "statut": "Créée"
  }
}
```

---

## State Management

### client-shop.js
```javascript
Global Variables:
├─ user              // Current user object
├─ allProducts       // All available products
├─ categories        // All categories
├─ cart              // Current shopping cart array
└─ currentDetailProduct // Currently viewed product
```

### checkout.js
```javascript
Global Variables:
├─ user              // Current user object
├─ cart              // Cart from sessionStorage
├─ shippingCost      // Fixed 50 DH
└─ taxRate           // Fixed 20%
```

### commandes.js
```javascript
Global Variables:
├─ user              // Current user object
├─ allCommandes      // All orders (or filtered for vendors)
└─ vendorProducts    // Vendor's product IDs (for filtering)
```

---

## Error Handling Flow

```
User Action
    │
    ▼
Try {
    │
    ├─► API Call / Validation
    │   │
    │   ├─ Error Scenario A
    │   │   └─► Catch block
    │   │       └─► Log error
    │   │       └─► Show alert to user
    │   │
    │   └─ Success
    │       └─► Update UI
    │       └─► Navigate if needed
    │
} Catch (error) {
    │
    └─► Handle Error
        ├─► Console.error()
        ├─► User alert message
        └─► Revert any state changes
}
```

---

## Security Boundaries

```
FRONTEND (Not Secure):
├─ User authentication token (JWT)
├─ Cart data in sessionStorage
├─ Payment method selection
└─ Order details display

↓ OVER HTTPS ONLY ↓

BACKEND (Secure):
├─ Token verification
├─ Database transactions
├─ Payment gateway integration
└─ Sensitive data handling

↓ DATABASE (Encrypted) ↓

STORED:
├─ Hashed passwords
├─ Order history
├─ Transaction logs
└─ Payment receipts (reference only, not full data)
```

---

## Performance Considerations

### Optimization Points
1. **Image Lazy Loading** - Products grid loads on demand
2. **API Caching** - Products list cached in memory
3. **SessionStorage Usage** - Reduces API calls during checkout
4. **Debounced Filtering** - Search and filter don't trigger on every keystroke
5. **Lazy Loading Categories** - Only loaded once

### Potential Bottlenecks
1. **Vendor Order Filtering** - Currently queries each order individually
   - Solution: Backend endpoint `/commandes/vendor/:id`
2. **Large Product Lists** - Pagination not yet implemented
   - Solution: Add pagination to /products endpoint
3. **Image Assets** - Not yet optimized
   - Solution: Use CDN with image compression

---

## Browser Storage Strategy

```
Persistent:
├─ localStorage
│   └─ User preferences (NOT used yet)
│
Temporary (Session):
├─ sessionStorage
│   ├─ checkout_cart (cleared after order)
│   ├─ last_payment (displayed once)
│   └─ delivery_address (displayed once)
│
In-Memory:
├─ JavaScript variables
│   ├─ cart array
│   ├─ products array
│   └─ currentUser object
│
Server-Side:
├─ JWT token (in header)
├─ Database sessions
└─ Order history (permanent)
```

---

## Scalability Map

### For 1000+ Daily Users
```
CURRENT (OK for testing):
└─ Single backend server
   └─ Single database

NEEDED (Production):
├─ Load Balancer
│   └─ Multiple backend servers
├─ Database Replication
├─ Caching Layer (Redis)
├─ CDN for static assets
└─ Payment gateway redundancy
```

---

## Conclusion

The Phase 2 architecture provides:
- ✅ Complete client shopping experience
- ✅ Secure payment processing interface
- ✅ Vendor order management system
- ✅ Modular component design
- ✅ Clean API integration patterns
- ✅ Session-based data management

Ready for: User testing, QA, and payment gateway integration

---

*Architecture Document - OCHO Marketplace Phase 2*
*Generated: 2024*
