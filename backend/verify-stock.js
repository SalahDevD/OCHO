const db = require('./config/database');

async function verifyStockColumn() {
    try {
        console.log('Verifying stock column in Produit table...\n');
        
        // Get table structure
        const [columns] = await db.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Produit' AND TABLE_SCHEMA = 'ocho_db'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('Produit Table Columns:');
        console.log('=====================');
        columns.forEach(col => {
            console.log(`${col.COLUMN_NAME.padEnd(20)} | ${col.COLUMN_TYPE.padEnd(20)} | Nullable: ${col.IS_NULLABLE} | Default: ${col.COLUMN_DEFAULT}`);
        });
        
        // Check if stock column exists
        const hasStock = columns.some(col => col.COLUMN_NAME === 'stock');
        console.log(`\n✓ Stock column exists: ${hasStock ? 'YES' : 'NO'}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

verifyStockColumn();
