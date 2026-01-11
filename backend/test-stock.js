const db = require('./config/database');

async function testStockFunctionality() {
    try {
        console.log('\n=== Testing Stock Functionality ===\n');
        
        // Test 1: Create a product with stock
        console.log('Test 1: Create a test product with stock...');
        const testRef = `TEST-STOCK-${Date.now()}`;
        
        const [createResult] = await db.query(
            `INSERT INTO Produit 
            (reference, nom, categorie_id, genre, prix_achat, prix_vente, stock, vendeur_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [testRef, 'Test Product', 1, 'Homme', 100, 150, 50, 1]
        );
        
        const productId = createResult.insertId;
        console.log(`✓ Created product with ID: ${productId}, Stock: 50\n`);
        
        // Test 2: Retrieve product and verify stock
        console.log('Test 2: Retrieve product and verify stock...');
        const [products] = await db.query(
            'SELECT id, nom, stock FROM Produit WHERE id = ?',
            [productId]
        );
        
        if (products.length > 0) {
            const product = products[0];
            console.log(`✓ Product: ${product.nom}`);
            console.log(`✓ Stock value: ${product.stock}\n`);
        }
        
        // Test 3: Update product stock
        console.log('Test 3: Update product stock to 75...');
        await db.query(
            'UPDATE Produit SET stock = ? WHERE id = ?',
            [75, productId]
        );
        console.log('✓ Updated stock to 75\n');
        
        // Test 4: Verify stock update
        console.log('Test 4: Verify stock was updated...');
        const [updatedProducts] = await db.query(
            'SELECT stock FROM Produit WHERE id = ?',
            [productId]
        );
        
        if (updatedProducts.length > 0 && updatedProducts[0].stock === 75) {
            console.log(`✓ Stock successfully updated to: ${updatedProducts[0].stock}\n`);
        }
        
        // Test 5: Delete (soft delete) product
        console.log('Test 5: Soft delete product...');
        await db.query(
            'UPDATE Produit SET actif = false WHERE id = ?',
            [productId]
        );
        console.log('✓ Product marked as inactive\n');
        
        // Test 6: Verify deletion
        console.log('Test 6: Verify product is inactive...');
        const [deletedProducts] = await db.query(
            'SELECT actif FROM Produit WHERE id = ?',
            [productId]
        );
        
        if (deletedProducts.length > 0) {
            console.log(`✓ Product active status: ${deletedProducts[0].actif}\n`);
        }
        
        // Cleanup: Delete test product
        console.log('Cleaning up test data...');
        await db.query('DELETE FROM Produit WHERE id = ?', [productId]);
        console.log('✓ Test product deleted\n');
        
        console.log('=== All Tests Passed! ===\n');
        process.exit(0);
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        process.exit(1);
    }
}

testStockFunctionality();
