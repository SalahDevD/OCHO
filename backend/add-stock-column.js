const db = require('./config/database');

// Add stock column to Produit table
async function addStockColumn() {
    try {
        console.log('Starting migration: Add stock column to Produit table...');
        
        // Check if the column already exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Produit' AND COLUMN_NAME = 'stock'
        `);
        
        if (columns.length > 0) {
            console.log('✓ Stock column already exists in Produit table');
            return;
        }
        
        // Add the stock column
        await db.query(`
            ALTER TABLE Produit ADD COLUMN stock INT DEFAULT 0
        `);
        console.log('✓ Added stock column to Produit table');
        
        // Add index on stock
        await db.query(`
            CREATE INDEX idx_produit_stock ON Produit(stock)
        `);
        console.log('✓ Added index on stock column');
        
        console.log('✓ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    }
}

addStockColumn();
