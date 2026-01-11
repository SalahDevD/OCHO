# CLIENT CHECKOUT TESTING GUIDE

## Overview
This guide tests the complete client checkout workflow with proper client profile matching and order creation.

## Changes Made

### Backend (authController.js)
- Modified `/register` endpoint to automatically create a Client record when a user registers with Client role
- Automatically fills in client name, email, and optional fields from registration form

### Backend (clientController.js)
- Added new `/clients/me/profile` endpoint for diagnostic purposes
- Returns which client record was found (by email, by name, or first available)
- Includes detailed logging for debugging

### Frontend (client-shop.js)
- Enhanced `loadClients()` with detailed logging of loaded clients
- Improved `checkout()` function with multi-level client matching:
  1. selectedClientId from modal (for non-clients)
  2. Email exact match (for Client role)
  3. Case-insensitive name match (if email fails)
  4. First available client fallback
- Added detailed console logging at each matching step

## Test Scenarios

### Scenario 1: New Client Registration & Direct Checkout
**Objective:** Test that new client registration creates a Client record and enables direct checkout

**Steps:**
1. Navigate to registration page
2. Fill form with:
   - Name: "Test Client"
   - Email: "testclient@example.com"
   - Password: "TestPassword123"
   - Select "Client" role
3. Click Register
4. Open browser console (F12)
5. Login with the new client account
6. Add products to cart
7. Click Checkout button
8. **Expected Result:**
   - Console should show "Found X clients from database"
   - Console should show "Looking for client for user: testclient@example.com"
   - Console should show "✓ Client matched by email: {id, nom, email, ...}"
   - Order should be created successfully
   - Should redirect to order confirmation page

### Scenario 2: Existing Client Checkout
**Objective:** Test that existing clients without Client record can now checkout

**Steps:**
1. Login with existing client account (email: taha@ocho.ma)
2. Open browser console (F12)
3. Add products to cart
4. Click Checkout button
5. **Expected Result:**
   - Console should show "Found X clients from database"
   - Console should show "📋 Loaded X clients from database"
   - Console should show "Looking for client for user: taha@ocho.ma"
   - Should find the matching client (by email or name)
   - Order should be created successfully

### Scenario 3: Employee Creating Order for Client (Modal)
**Objective:** Test that employees can create orders with client selection modal

**Steps:**
1. Login with employee/vendor account
2. Add products to cart
3. Click Checkout button
4. **Expected Result:**
   - Client selection modal should appear
   - Modal should list all available clients
   - Should allow selecting a client from dropdown
   - After selection, order should be created for selected client

### Scenario 4: Client Profile Diagnostic
**Objective:** Test diagnostic endpoint to verify client record matching

**Steps:**
1. Login with a client account
2. Open browser console (F12)
3. Run: `apiRequest('/clients/me/profile').then(r => console.log(r))`
4. **Expected Result:**
   - Should return the matching client record
   - Should indicate how it was found (email, name, or first_available)
   - If no client found, should show detailed debug info

## Console Logging Outputs to Verify

When checkout is triggered as a Client, look for these console messages:

```
🔍 Looking for client for user: email@example.com
📋 Available clients: 5

✓ Client matched by email: {id: 1, nom: "Test", email: "email@example.com", ...}
✓ Final client ID: 1

Checkout data: {client_id: 1, articles: [...]}
```

Or if email doesn't match:

```
🔍 Looking for client for user: email@example.com
📋 Available clients: 5
✗ No email match found

✓ Client matched by name: {id: 1, nom: "Test", email: "different@example.com", ...}
✓ Final client ID: 1
```

Or as fallback:

```
🔍 Looking for client for user: email@example.com
📋 Available clients: 5
✗ No email match found
✗ No name match found

⚠ Using first available client: {id: 1, ...}
```

## Database Verification

To verify client records were created properly:

```sql
-- Check all Client users
SELECT u.id, u.nom, u.email, r.nom as role
FROM Utilisateur u
JOIN Role r ON u.role_id = r.id
WHERE r.nom = 'Client';

-- Check Client table
SELECT id, nom, email, actif
FROM Client;

-- Verify matching records
SELECT u.email as utilisateur_email, c.email as client_email, c.id as client_id
FROM Utilisateur u
LEFT JOIN Client c ON u.email = c.email
WHERE u.role_id = (SELECT id FROM Role WHERE nom = 'Client');
```

## Troubleshooting

### Error: "Aucun profil client trouvé"
- Check database: `SELECT COUNT(*) FROM Client WHERE actif = TRUE;`
- Run migration: `node migrate-users-to-clients.js`
- Verify email addresses match in Utilisateur and Client tables
- Check browser console for detailed matching attempts

### Order Created But Wrong Client
- Check console output for which matching strategy was used
- If using fallback, verify client email/name in database
- Consider updating Client record with correct email

### Modal Not Appearing for Employees
- Verify user role is not "Client" (Client users skip modal)
- Check browser console for any JS errors
- Verify modal HTML is present in client-shop.html

## Files Modified

### Backend:
- `backend/controllers/authController.js` - Auto-create Client on registration
- `backend/controllers/clientController.js` - Added getMyProfile diagnostic endpoint
- `backend/routes/clientRoutes.js` - Added /me/profile route
- `backend/migrate-users-to-clients.js` - Migration utility (new)

### Frontend:
- `frontend/js/client-shop.js` - Enhanced logging and client matching
- `frontend/js/checkout.js` (if exists) - Verify checkout button calls openClientModal()

## Success Criteria

✅ All 4 scenarios complete without errors
✅ Console shows proper client matching logic
✅ Orders are created with correct client_id
✅ Client users skip modal (direct checkout)
✅ Employee users see and can use client selection modal
✅ Client records are created on registration for new Client users
✅ Existing Client users can checkout (even if Client record didn't exist previously)
