# Stock Management - Quick Start Guide

## What Was Added?

A stock field has been added to the product management system, allowing you to track inventory quantities for each product directly.

## How to Use

### Adding a Product with Stock

1. Go to **Gestion des Produits** page
2. Click **+ Nouveau Produit** button
3. Fill in the form fields:
   - Référence (Product Reference)
   - Nom (Product Name)
   - Catégorie (Category)
   - Genre (Gender/Type)
   - Prix Achat (Purchase Price)
   - Prix Vente (Sale Price)
   - Seuil Minimum (Minimum Threshold)
   - **Stock** ← NEW: Enter the quantity in stock
   - Description (optional)
4. Click **Enregistrer** (Save)

### Modifying Product Stock

1. Click the **✏️ Edit** button next to a product
2. The form will load with all current product data
3. Change the **Stock** value to the new quantity
4. Click **Enregistrer** (Save)
5. The database is updated immediately

### Viewing Product Stock

1. Click the **👁️ View** button next to a product
2. In the details modal, you'll see:
   - **Stock**: The current stock quantity
   - **Variantes**: Size/color variants with their quantities

### Deleting a Product

1. Click the **🗑️ Delete** button next to a product
2. Confirm the deletion when prompted
3. The product is marked as inactive (soft delete)
4. Stock information is preserved for historical reference

## Key Features

✅ **Real-time Updates** - Stock changes are saved to the database immediately
✅ **Numeric Validation** - Only accepts non-negative numbers
✅ **Default Value** - New products start with stock = 0
✅ **Data Persistence** - All changes are stored in the database
✅ **Display Integration** - Stock values are shown in product lists and details

## Database Information

- **Table**: `Produit`
- **Column**: `stock` (INT, Default: 0)
- **Index**: Created on stock column for optimal query performance

## API Details

All product endpoints now handle the stock field:

```javascript
// Create product with stock
POST /products
{
  "reference": "REF-001",
  "nom": "Product Name",
  "categorie_id": 1,
  "genre": "Homme",
  "prix_achat": 100,
  "prix_vente": 150,
  "stock": 50  // ← Stock quantity
}

// Update stock
PUT /products/:id
{
  "stock": 75  // ← New stock quantity
}
```

## Testing

To verify the stock functionality works correctly:

```bash
cd backend
node test-stock.js
```

This will run a complete test suite:
- Creating products with stock
- Retrieving stock values
- Updating stock quantities
- Soft deleting products
- Verifying database persistence

## Troubleshooting

**Q: Stock field doesn't appear in the form?**
A: Clear your browser cache and reload the page, or use Ctrl+Shift+Delete for a hard refresh.

**Q: Changes to stock aren't saving?**
A: Make sure the backend server is running:
   ```bash
   cd backend && node server.js
   ```

**Q: Can't create a product with stock?**
A: Ensure all required fields are filled (Reference, Name, Category, Genre, Prices).

## Migration History

- **Migration Date**: [Current Session]
- **Migration Script**: `add-stock-column.js`
- **Status**: ✅ Completed Successfully
- **Backward Compatibility**: ✅ Yes - Existing products have stock = 0

## File References

- Frontend Form: [frontend/pages/products.html](frontend/pages/products.html)
- Frontend Logic: [frontend/js/products.js](frontend/js/products.js)
- Backend Controller: [backend/controllers/productController.js](backend/controllers/productController.js)
- Migration Script: [backend/add-stock-column.js](backend/add-stock-column.js)
- Verification Tool: [backend/verify-stock.js](backend/verify-stock.js)
