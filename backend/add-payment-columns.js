const db = require('./config/database');

async function addPaymentColumns() {
    try {
        console.log('🔄 Adding payment columns to Commande table...\n');

        // Ajouter les colonnes si elles n'existent pas
        await db.query(`
            ALTER TABLE Commande 
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP NULL,
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'
        `);

        console.log('✅ Payment columns added successfully!\n');

        // Vérifier la structure actuelle
        const [columns] = await db.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Commande' 
            AND TABLE_SCHEMA = DATABASE()
        `);

        console.log('📋 Commande table structure:');
        columns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });

    } catch (error) {
        console.error('❌ Migration error:', error.message);
    } finally {
        process.exit(0);
    }
}

addPaymentColumns();
