# 🧪 COMPLETE CHECKOUT & VENDOR FLOW - TESTING GUIDE

This guide will help you test all the new checkout and vendor features step-by-step.

---

## 📋 PREREQUISITE SETUP

### 1. Database Status
✅ The database should already have:
- `Vendeur` role in Rôle table (ID: 5)
- `vendeur_id` column in Produit table
- Test vendor accounts created

### 2. Backend Server
- Ensure the backend is running on `http://localhost:3000`
- All existing API endpoints should be functional

### 3. Frontend Server
- Serve frontend files from a local server
- Example: `http://localhost:8000`

---

## 🧑‍💻 TEST ACCOUNT CREDENTIALS

### Client Account
```
Email: client@ocho.ma
Password: Admin@123
Role: Client
```

### Vendor Account #1
```
Email: ahmed.seller@ocho.ma
Password: Admin@123
Role: Vendeur
Products: Any products with vendeur_id = 3
```

### Vendor Account #2
```
Email: layla.boutique@ocho.ma
Password: Admin@123
Role: Vendeur
Products: Any products with vendeur_id = 4
```

### Admin Account
```
Email: admin@ocho.ma
Password: Admin@123
Role: Administrateur
```

---

## 🛒 TEST SCENARIO 1: COMPLETE CLIENT CHECKOUT FLOW

### Step 1: Login as Client
1. Open browser to frontend home page
2. Click "Connexion"
3. Enter: `client@ocho.ma` / `Admin@123`
4. Click Login
5. **Expected:** Should see client dashboard with "Boutique" link

### Step 2: Browse Products
1. Click "Boutique" in navigation
2. Verify products load from API
3. Try search functionality
4. Try category filter
5. Try genre filter
6. **Expected:** Product grid displays correctly with all filters working

### Step 3: Add Products to Cart
1. Click on a product card to see details
2. Verify product details modal opens
3. See if product has variants (size, color options)
4. Change quantity
5. Click "Ajouter" button
6. Click ℹ️ button to view details
7. Close modal and add 2-3 different products to cart
8. **Expected:** 
   - Cart sidebar shows updated count
   - Each item displays in cart with quantity
   - Remove button works

### Step 4: Navigate to Checkout
1. Click "Commander" button
2. **Expected:** Should redirect to `checkout.html`
3. Order summary should display:
   - All items added
   - Correct quantities
   - Correct prices
   - Subtotal calculation
   - Shipping cost (50 DH)
   - Tax calculation (20%)
   - Total amount

### Step 5: Fill Delivery Address
1. Enter full name: `Test Client`
2. Enter phone: `+212612345678`
3. Enter email: `test@example.com`
4. Enter address: `123 Rue Example`
5. Enter city: `Casablanca`
6. Enter zip code: `20000`
7. Select country: `Maroc`
8. **Expected:** All fields accept input correctly

### Step 6: Select Payment Method - CARD
1. Click on "Carte Bancaire" option
2. **Expected:** Payment option highlights, card details fields appear
3. Enter card details:
   - Card holder: `Test User`
   - Card number: `4242 4242 4242 4242` (format should auto-add spaces)
   - Expiry: `12/25` (format should auto-add slash)
   - CVV: `123` (should only allow numbers)
4. Click "Confirmer la Commande"
5. **Expected:** 
   - Validation passes
   - Order created successfully
   - Redirects to `order-confirmation.html`

### Step 7: View Order Confirmation
1. Page displays success message: "✅ Commande Confirmée!"
2. Verify displayed information:
   - Order number: `#123` (or actual ID)
   - Order date: Today's date
   - Order status: "Confirmée ✓" in green
   - Delivery address: Shows entered address
   - Payment method: "💳 Carte Bancaire"
   - Items list: Shows all products with quantities and prices
   - Total amount: Matches checkout total
3. **Expected:** All order details display correctly

### Step 8: View Order History
1. Click "Voir mes commandes" button
2. Should redirect to `commandes.html`
3. See the newly created order in the table
4. Order reference should match confirmation page
5. Click 👁️ button to view details
6. **Expected:** 
   - Order appears in list
   - All details match confirmation page
   - Can view full order details

### Step 9: Return to Shopping
1. Click "Continuer les achats" button
2. **Expected:** Returns to `client-shop.html` with empty cart

---

## 🛒 TEST SCENARIO 2: PAYMENT METHODS

### PayPal Option
1. In checkout page, click "PayPal"
2. **Expected:** 
   - PayPal option highlights
   - Card details hidden
   - PayPal description shown
3. Fill address and submit
4. **Expected:** Order created with `methode_paiement: "paypal"`

### Bank Transfer Option
1. In checkout page, click "Virement Bancaire"
2. **Expected:** 
   - Bank transfer option highlights
   - Card details hidden
   - Bank transfer description shown
3. Fill address and submit
4. **Expected:** Order created with `methode_paiement: "bank"`

### Installment Option
1. In checkout page, click "Paiement Échelonné (3x)"
2. **Expected:** 
   - Installment option highlights
   - Card details hidden
   - Installment description shown (3x payments)
3. Fill address and submit
4. **Expected:** Order created with `methode_paiement: "installment"`

---

## 🛒 TEST SCENARIO 3: VALIDATION

### Test Invalid Address - Empty Fields
1. Go through checkout without filling required fields
2. Click "Confirmer la Commande"
3. **Expected:** Alert: "Veuillez remplir tous les champs requis"

### Test Invalid Email
1. Fill all fields but enter invalid email: `notanemail`
2. Click "Confirmer la Commande"
3. **Expected:** Alert: "Veuillez entrer une adresse email valide"

### Test Invalid Phone
1. Fill all fields but enter invalid phone: `12` (too short)
2. Click "Confirmer la Commande"
3. **Expected:** Alert: "Veuillez entrer un numéro de téléphone valide"

### Test Invalid Card Number
1. Select card payment
2. Enter card number: `1234567890123456` (16 digits but not valid format)
3. Click "Confirmer la Commande"
4. **Expected:** Alert: "Le numéro de carte doit contenir 16 à 19 chiffres" (validation passes, but in production would fail with payment gateway)

### Test Invalid Card Format
1. Select card payment
2. Enter expiry: `13/25` (invalid month)
3. Click "Confirmer la Commande"
4. **Expected:** 
   - Card number auto-formats spaces
   - Expiry auto-formats slash
   - CVV only allows numbers

---

## 👨‍💼 TEST SCENARIO 4: VENDOR ORDER FILTERING

### Step 1: Setup (Admin)
1. Login as admin
2. Go to Products page
3. Note which products have which vendor_id
4. Create/assign some products to vendor 1
5. Create/assign other products to vendor 2

### Step 2: Test Vendor 1 Orders
1. Logout and login as vendor 1: `ahmed.seller@ocho.ma` / `Admin@123`
2. Go to "Commandes" (orders)
3. **Expected:**
   - Navigation shows "Mes Produits" instead of generic "Produits"
   - Order list is loading
   - Vendor sees only orders containing their products

### Step 3: Create Test Order
1. Logout and login as client
2. Go to shop
3. Find and add products from vendor 1 to cart
4. Complete checkout
5. **Expected:** New order created

### Step 4: Verify Vendor 1 Sees Order
1. Logout and login as vendor 1
2. Go to "Commandes"
3. **Expected:** The new order should appear in vendor's order list

### Step 5: Verify Vendor 2 Doesn't See Order
1. Logout and login as vendor 2
2. Go to "Commandes"
3. **Expected:** The order should NOT appear (different products)

### Step 6: Create Order with Both Vendors
1. Logout and login as client
2. Add products from vendor 1 AND vendor 2 to cart
3. Complete checkout
4. **Expected:** Order created

### Step 7: Both Vendors See Combined Order
1. Login as vendor 1, go to "Commandes"
2. **Expected:** See the combined order
3. Login as vendor 2, go to "Commandes"
4. **Expected:** Also see the same order (has their products)

---

## 🔐 TEST SCENARIO 5: PAYMENT DATA HANDLING

### Check Session Storage
1. After successful order:
   - Open browser DevTools (F12)
   - Go to Application → Session Storage
2. **Expected:** Should see:
   ```javascript
   {
     last_payment: {
       orderId: 123,
       method: "card",
       amount: 1250.50,
       timestamp: "2024-01-15T14:30:00Z",
       lastFourDigits: "4242"  // Only for card
     },
     delivery_address: {
       address: "...",
       city: "...",
       zipcode: "...",
       country: "..."
     }
   }
   ```

### Verify Cart Cleared
1. Check session storage for `checkout_cart`
2. **Expected:** Should be empty/removed after successful order

---

## 🔗 TEST SCENARIO 6: API INTEGRATION

### Monitor Network Calls
1. Open DevTools → Network tab
2. Complete a full checkout
3. **Expected:** Should see:
   - `GET /products` - Load products
   - `POST /commandes` - Create order
   - `GET /commandes` - Load order history

### Check API Response
1. After POST to `/commandes`, check response
2. **Expected:** Response should contain:
   ```json
   {
     success: true,
     commande: {
       id: 123,
       reference: "CMD-2024-001",
       total: 1250.50,
       ...
     }
   }
   ```

---

## ✅ EXPECTED RESULTS SUMMARY

| Test | Expected Result |
|------|-----------------|
| Login | ✅ Redirects to dashboard |
| Browse products | ✅ All products load and display |
| Add to cart | ✅ Cart updates in real-time |
| Checkout redirect | ✅ Navigates to checkout.html with cart |
| Address form | ✅ All fields accept input |
| Payment selection | ✅ Shows/hides appropriate fields |
| Card formatting | ✅ Auto-formats number, date, CVV |
| Form validation | ✅ Shows appropriate error messages |
| Order creation | ✅ API call succeeds, order created |
| Confirmation page | ✅ Shows all order details |
| Order history | ✅ Order appears in commandes.html |
| Vendor filtering | ✅ Vendors see only their orders |
| Session storage | ✅ Payment data saved securely |

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Cart is empty" at checkout
**Solution:** Ensure `sessionStorage.setItem('checkout_cart', ...)` is called in client-shop.js before redirect

### Issue: Orders not appearing in vendor view
**Solution:** Verify `vendeur_id` is set correctly in database for products

### Issue: Payment method selection not working
**Solution:** Check that `selectPaymentMethod()` function in checkout.js is being called

### Issue: Card formatting not working
**Solution:** Verify JavaScript event listeners are attached to input elements

### Issue: Confirmation page shows "-" for all fields
**Solution:** Verify `last_payment` and `delivery_address` are being saved to sessionStorage

### Issue: Form validation bypassed
**Solution:** Ensure `validateForm()` and `validateCardData()` return false to prevent submission

---

## 📝 TEST REPORT TEMPLATE

```
TEST DATE: ____________________
TESTER: ______________________
ENVIRONMENT: __________________

RESULTS:
[ ] Login works
[ ] Product browsing works
[ ] Cart functionality works
[ ] Checkout redirect works
[ ] Address form works
[ ] Payment method selection works
[ ] Card validation works
[ ] Order creation succeeds
[ ] Confirmation page displays correctly
[ ] Order appears in history
[ ] Vendor filtering works

ISSUES FOUND:
1. ________________________________
2. ________________________________
3. ________________________________

NOTES:
_________________________________
_________________________________
_________________________________

SIGN-OFF: ____________________
```

---

## 🎯 FINAL CHECKLIST

Before considering Phase 2 complete:

- [ ] Client can complete full checkout flow
- [ ] All 4 payment methods work
- [ ] Form validation prevents invalid submissions
- [ ] Orders are created successfully
- [ ] Confirmation page displays all details
- [ ] Order appears in order history
- [ ] Vendor filtering works correctly
- [ ] Session storage is used appropriately
- [ ] Navigation shows correct links per role
- [ ] No console errors during flow
- [ ] All UI elements are styled correctly
- [ ] Responsive design works on mobile

---

**Next Step:** Once all tests pass, proceed to payment gateway integration for production!
